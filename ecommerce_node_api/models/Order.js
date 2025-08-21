const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    sku: { type: String, required: true },
    image: { type: String },
    price: { type: Number, required: true }, // unit price at time of order
    priceCurrency: { type: String, required: true, uppercase: true, default: 'INR' },
    priceUnit: { type: String, required: true, default: 'piece' },
    quantity: { type: Number, required: true, min: 1 },
    lineTotal: { type: Number, required: true }, // price * quantity
    attributes: { type: mongoose.Schema.Types.Mixed, default: {} }, // frozen snapshot if you use attributes
  },
  { _id: false }
);

const AddressSchema = new mongoose.Schema(
  {
    name: String,
    phone: String,
    line1: String,
    line2: String,
    city: String,
    state: String,
    postalCode: String,
    country: { type: String, default: 'IN' },
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items: { type: [OrderItemSchema], required: true },
    currency: { type: String, required: true, uppercase: true, default: 'INR' },

    // totals snapshot
    subtotal: { type: Number, required: true },
    shipping: { type: Number, required: true, default: 0 },
    tax: { type: Number, required: true, default: 0 },
    discount: { type: Number, required: true, default: 0 },
    grandTotal: { type: Number, required: true },

    // status
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'cancelled', 'shipped', 'completed', 'refunded'],
      default: 'pending',
      index: true
    },
    payment: {
      provider: { type: String, default: 'cod' }, // 'cod' | 'razorpay' | 'stripe' etc.
      paymentIntentId: { type: String },
      method: { type: String }, // e.g., 'card', 'upi', 'cod'
      status: { type: String, default: 'unpaid' }, // 'unpaid' | 'requires_action' | 'paid' | 'refunded'
      paidAt: { type: Date },
      meta: { type: mongoose.Schema.Types.Mixed, default: {} },
    },

    shippingAddress: AddressSchema,
    billingAddress: AddressSchema,

    // idempotency to protect double-charge / double-order
    idempotencyKey: { type: String, index: true, sparse: true, unique: true },

    notes: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', OrderSchema);
