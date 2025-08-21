const express = require('express');
const Product = require('../models/Product');
const Category = require('../models/Category');
const SubCategory = require('../models/SubCategory');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { uploadMulti, fileUrl } = require('../utils/uploader');

const router = express.Router();

// Create product — multipart with multiple images
router.post('/', requireAuth, requireAdmin, uploadMulti('images', 10), async (req, res) => {
  try {
    const { name, sku, category, subCategory, quantity, description, price, priceCurrency, priceUnit, attributes, featured } = req.body;
    if (!name || !sku || !category || !subCategory || price === undefined)
      return res.status(400).json({ error: 'name, sku, category, subCategory, price are required' });

    const cat = await Category.findById(category);
    const sub = await SubCategory.findById(subCategory);
    if (!cat) return res.status(400).json({ error: 'Invalid category' });
    if (!sub) return res.status(400).json({ error: 'Invalid subCategory' });
    if (String(sub.category) !== String(cat._id)) return res.status(400).json({ error: 'subCategory does not belong to category' });

    const images = (req.files || []).map(f => fileUrl(req, f.filename));

    const created = await Product.create({
      name,
      sku,
      images,
      category,
      subCategory,
      quantity: Number(quantity) || 0,
      description: description || '',
      price: Number(price),
      priceCurrency: (priceCurrency || 'INR').toUpperCase(),
      priceUnit: priceUnit || 'piece',
      featured: featured === 'true' || featured === true || featured === '1',
      attributes: attributes ? JSON.parse(attributes) : {}
    });

    res.status(201).json(created);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'SKU already exists' });
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// PUT /api/products/:id  (admin)
router.put('/:id', requireAuth, requireAdmin, uploadMulti('images', 10), async (req, res) => {
  try {
    const { name, sku, category, subCategory, quantity, description, price, priceCurrency, priceUnit, attributes, active, featured } = req.body;
    const updates = {};

    if (name) updates.name = name;
    if (sku) updates.sku = sku;
    if (description !== undefined) updates.description = description;
    if (price !== undefined) updates.price = Number(price);
    if (priceCurrency) updates.priceCurrency = String(priceCurrency).toUpperCase();
    if (priceUnit) updates.priceUnit = priceUnit;
    if (attributes !== undefined) updates.attributes = attributes ? JSON.parse(attributes) : {};
    if (active !== undefined) updates.active = active === 'true' || active === true;
    if (featured !== undefined) {
      updates.featured = (featured === 'true' || featured === true || featured === '1');
    }
    if (quantity !== undefined) updates.quantity = Number(quantity);

    if (category) {
      const cat = await Category.findById(category);
      if (!cat) return res.status(400).json({ error: 'Invalid category' });
      updates.category = category;
    }
    if (subCategory) {
      const sub = await SubCategory.findById(subCategory);
      if (!sub) return res.status(400).json({ error: 'Invalid subCategory' });
      updates.subCategory = subCategory;
    }
    if (category && subCategory) {
      const sub = await SubCategory.findById(subCategory);
      if (String(sub.category) !== String(category)) return res.status(400).json({ error: 'subCategory does not belong to category' });
    }

    if (req.files?.length) {
      updates.images = req.files.map(f => fileUrl(req, f.filename));
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ error: 'Product not found' });
    res.json(updated);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'SKU already exists' });
    res.status(500).json({ error: 'Failed to update product' });
  }
});


// GET list/get/delete unchanged from earlier (keep your existing logic)
router.get('/', async (req, res) => {
  const { category, subCategory, featured, q, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (category) filter.category = category;
  if (subCategory) filter.subCategory = subCategory;
  if (featured === 'true') filter.featured = true;
  if (featured === 'false') filter.featured = false;
  if (q) filter.$text = { $search: q };

  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    Product.find(filter)
      .populate('category subCategory')
      .sort({ featured: -1, createdAt: -1 }) // feature first
      .skip(skip).limit(Number(limit)),
    Product.countDocuments(filter),
  ]);
  res.json({ total, page: Number(page), pageSize: Number(limit), items });
});

router.get('/:id', async (req, res) => {
  try {
    const item = await Product.findById(req.params.id)
      .populate('category', 'name slug')
      .populate('subCategory', 'name slug category');
    if (!item) return res.status(404).json({ error: 'Product not found' });
    res.json(item);
  } catch {
    res.status(404).json({ error: 'Product not found' });
  }
});

router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Product not found' });
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

module.exports = router;
