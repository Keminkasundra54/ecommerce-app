const express = require('express');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

/* Helpers */
function calcShipping(subtotal) { return subtotal >= 999 ? 0 : 49; }
function calcTax(subtotal) { return Math.round(subtotal * 0.18); }
async function transactionsSupported() {
  try {
    const hello = await mongoose.connection.db.admin().command({ hello: 1 });
    return Boolean(hello.setName); // setName exists => replica set
  } catch {
    return false;
  }
}

router.post('/checkout', requireAuth, async (req, res) => {
  const userId = req.user.id;
  const {
    items: rawItems,
    shippingAddress,
    billingAddress,
    payment = { provider: 'cod' },
    idempotencyKey,
    notes
  } = req.body || {};

  if (!Array.isArray(rawItems) || !rawItems.length) {
    return res.status(400).json({ error: 'Cart items required' });
  }
  if (!shippingAddress?.line1 || !shippingAddress?.city || !shippingAddress?.postalCode) {
    return res.status(400).json({ error: 'Shipping address incomplete' });
  }

  // Idempotency (works in both modes)
  if (idempotencyKey) {
    const existing = await Order.findOne({ idempotencyKey, user: userId });
    if (existing) return res.json(existing);
  }

  const useTx = await transactionsSupported();

  if (useTx) {
    // ---------- Transaction path ----------
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const productIds = rawItems.map(i => i.productId);
      const products = await Product.find({ _id: { $in: productIds }, active: true }).session(session);
      const map = new Map(products.map(p => [String(p._id), p]));

      const orderItems = [];
      let currency = 'INR';
      let subtotal = 0;

      for (const { productId, quantity } of rawItems) {
        const p = map.get(String(productId));
        if (!p) throw new Error(`Product not available: ${productId}`);
        const qty = Math.max(1, Number(quantity || 1));
        if (p.quantity < qty) throw new Error(`Insufficient stock for ${p.name}`);

        currency = p.priceCurrency || 'INR';
        const lineTotal = p.price * qty;
        subtotal += lineTotal;

        orderItems.push({
          product: p._id,
          name: p.name,
          sku: p.sku,
          image: p.images?.[0],
          price: p.price,
          priceCurrency: p.priceCurrency,
          priceUnit: p.priceUnit,
          quantity: qty,
          lineTotal,
          attributes: p.attributes || {}
        });
      }

      // decrement stock atomically in the tx
      for (const it of orderItems) {
        const ok = await Product.updateOne(
          { _id: it.product, quantity: { $gte: it.quantity } },
          { $inc: { quantity: -it.quantity } }
        ).session(session);
        if (ok.modifiedCount !== 1) throw new Error(`Stock update failed for ${it.name}`);
      }

      const shipping = calcShipping(subtotal);
      const tax = calcTax(subtotal);
      const discount = 0;
      const grandTotal = Math.max(0, subtotal + shipping + tax - discount);

      const [order] = await Order.create([{
        user: userId,
        items: orderItems,
        currency,
        subtotal, shipping, tax, discount, grandTotal,
        status: payment.provider === 'cod' ? 'pending' : 'pending',
        payment: { provider: payment.provider, method: payment.method || (payment.provider === 'cod' ? 'cod' : undefined), status: 'unpaid' },
        shippingAddress,
        billingAddress: billingAddress || shippingAddress,
        idempotencyKey,
        notes
      }], { session });

      await session.commitTransaction();
      session.endSession();
      return res.status(201).json(order);
    } catch (err) {
      try { await mongoose.connection?.transaction?.abortTransaction?.(); } catch {}
      // ensure session is closed
      try { await mongoose.connection?.transaction?.endSession?.(); } catch {}
      return res.status(500).json({ error: err.message || 'Checkout failed' });
    }
  } else {
    // ---------- Fallback path (no transaction) ----------
    try {
      const productIds = rawItems.map(i => i.productId);
      const products = await Product.find({ _id: { $in: productIds } });
      const map = new Map(products.map(p => [String(p._id), p]));

      const decremented = []; // keep track to roll back on failure
      const orderItems = [];
      let currency = 'INR';
      let subtotal = 0;

      for (const { productId, quantity } of rawItems) {
        const p = map.get(String(productId));
        if (!p) return res.status(400).json({ error: `Product not available: ${productId}` });
        const qty = Math.max(1, Number(quantity || 1));

        // atomic single-doc decrement; ensures no negative stock
        const updated = await Product.findOneAndUpdate(
          { _id: p._id, quantity: { $gte: qty } },
          { $inc: { quantity: -qty } },
          { new: true }
        );

        if (!updated) {
          // rollback any previous decrements
          await Promise.all(
            decremented.map(d =>
              Product.updateOne({ _id: d.productId }, { $inc: { quantity: d.qty } })
            )
          );
          return res.status(400).json({ error: `Insufficient stock for ${p.name}` });
        }

        decremented.push({ productId: p._id, qty });

        currency = p.priceCurrency || 'INR';
        const lineTotal = p.price * qty;
        subtotal += lineTotal;

        orderItems.push({
          product: p._id,
          name: p.name,
          sku: p.sku,
          image: p.images?.[0],
          price: p.price,
          priceCurrency: p.priceCurrency,
          priceUnit: p.priceUnit,
          quantity: qty,
          lineTotal,
          attributes: p.attributes || {}
        });
      }

      const shipping = calcShipping(subtotal);
      const tax = calcTax(subtotal);
      const discount = 0;
      const grandTotal = Math.max(0, subtotal + shipping + tax - discount);

      const order = await Order.create({
        user: userId,
        items: orderItems,
        currency,
        subtotal, shipping, tax, discount, grandTotal,
        status: payment.provider === 'cod' ? 'pending' : 'pending',
        payment: { provider: payment.provider, method: payment.method || (payment.provider === 'cod' ? 'cod' : undefined), status: 'unpaid' },
        shippingAddress,
        billingAddress: billingAddress || shippingAddress,
        idempotencyKey,
        notes
      });

      return res.status(201).json(order);
    } catch (err) {
      return res.status(500).json({ error: err.message || 'Checkout failed' });
    }
  }
});

// Get current user's orders
router.get('/mine', requireAuth, async (req, res) => {
  try {
    const list = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json({ total: list.length, items: list });
  } catch {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get single order (owner or admin)
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Not found' });
    if (String(order.user) !== String(req.user.id) && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    res.json(order);
  } catch {
    res.status(404).json({ error: 'Not found' });
  }
});

// ADMIN: list all orders
router.get('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { status, user, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (user) filter.user = user;
    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Order.countDocuments(filter)
    ]);
    res.json({ total, page: Number(page), pageSize: Number(limit), items });
  } catch {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// ADMIN: update order status / mark paid / shipped, etc.
router.patch('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { status, paymentStatus, trackingNumber, meta } = req.body || {};
    const updates = {};
    if (status) updates.status = status;
    if (paymentStatus) updates['payment.status'] = paymentStatus;
    if (trackingNumber) updates['payment.meta'] = { ...(meta || {}), trackingNumber };
    if (paymentStatus === 'paid') updates['payment.paidAt'] = new Date();

    const order = await Order.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true });
    if (!order) return res.status(404).json({ error: 'Not found' });
    res.json(order);
  } catch {
    res.status(500).json({ error: 'Failed to update order' });
  }
});

/* Helpers */
function calcShipping(subtotal, items) {
  // Example: free over ₹999
  if (subtotal >= 999) return 0;
  return 49;
}
function calcTax(subtotal, items) {
  // Example GST 18%
  return Math.round(subtotal * 0.18);
}

module.exports = router;
