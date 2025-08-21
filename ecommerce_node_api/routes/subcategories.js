const express = require('express');
const SubCategory = require('../models/SubCategory');
const Category = require('../models/Category');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { uploadSingle, fileUrl } = require('../utils/uploader');

const router = express.Router();

router.post('/', requireAuth, requireAdmin, uploadSingle('image'), async (req, res) => {
  try {
    const { name, category } = req.body;
    if (!name || !category) return res.status(400).json({ error: 'name and category are required' });
    const cat = await Category.findById(category);
    if (!cat) return res.status(400).json({ error: 'Invalid category' });

    const created = await SubCategory.create({
      name,
      category,
      image: req.file ? fileUrl(req, req.file.filename) : ''
    });
    res.status(201).json(created);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'Subcategory already exists for this category' });
    res.status(500).json({ error: 'Failed to create subcategory' });
  }
});

router.put('/:id', requireAuth, requireAdmin, uploadSingle('image'), async (req, res) => {
  try {
    const updates = {};
    if (req.body.name) updates.name = req.body.name;
    if (req.body.category) {
      const cat = await Category.findById(req.body.category);
      if (!cat) return res.status(400).json({ error: 'Invalid category' });
      updates.category = req.body.category;
    }
    if (req.file) updates.image = fileUrl(req, req.file.filename);

    const updated = await SubCategory.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ error: 'Subcategory not found' });
    res.json(updated);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'Duplicate subcategory for this category' });
    res.status(500).json({ error: 'Failed to update subcategory' });
  }
});

// list/get/delete unchanged except response shape
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    const list = await SubCategory.find(filter).populate('category', 'name slug').sort({ name: 1 });
    res.json({ total: list.length, items: list });
  } catch {
    res.status(500).json({ error: 'Failed to fetch subcategories' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const item = await SubCategory.findById(req.params.id).populate('category', 'name slug');
    if (!item) return res.status(404).json({ error: 'Subcategory not found' });
    res.json(item);
  } catch {
    res.status(404).json({ error: 'Subcategory not found' });
  }
});

router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const deleted = await SubCategory.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Subcategory not found' });
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: 'Failed to delete subcategory' });
  }
});

module.exports = router;
