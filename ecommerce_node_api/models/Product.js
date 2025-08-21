const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, index: true },
    sku: { type: String, required: true, unique: true, trim: true, index: true },
    images: [{ type: String }],

    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    subCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'SubCategory', required: true, index: true },

    quantity: { type: Number, default: 0, min: 0 },

    // NEW fields
    description: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },                       // e.g. 199.99
    priceCurrency: { type: String, default: 'INR', trim: true, uppercase: true }, // e.g. INR, USD
    priceUnit: {
      type: String,
      enum: ['piece', 'pack', 'kg', 'g', 'litre', 'ml'],
      default: 'piece'
    },
    attributes: { type: mongoose.Schema.Types.Mixed, default: {} },        // arbitrary key/values (color, size, etc.)
    active: { type: Boolean, default: true },
    featured: { type: Boolean, default: false, index: true }
  },
  { timestamps: true }
);

// full-text search on name + description + sku
ProductSchema.index({ name: 'text', description: 'text', sku: 'text' });

module.exports = mongoose.model('Product', ProductSchema);
