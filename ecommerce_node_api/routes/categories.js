const express = require('express');
const Category = require('../models/Category');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { uploadSingle, fileUrl } = require('../utils/uploader');

const router = express.Router();

// Create category (admin) — multipart
router.post('/', requireAuth, requireAdmin, uploadSingle('image'), async (req, res) => {
  try {
    const { name } = req.body;
    const image = req.file ? fileUrl(req, req.file.filename) : '';
    const created = await Category.create({ name, image });
    res.status(201).json(created);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'Category name already exists' });
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// Update category (admin) — multipart optional
router.put('/:id', requireAuth, requireAdmin, uploadSingle('image'), async (req, res) => {
  try {
    const updates = {};
    if (req.body.name) updates.name = req.body.name;
    if (req.file) updates.image = fileUrl(req, req.file.filename);

    const updated = await Category.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ error: 'Category not found' });
    res.json(updated);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'Category name already exists' });
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// List, get, delete remain the same...
router.get('/', async (req, res) => {
  try {
    const list = await Category.find().sort({ name: 1 });
    res.json({ total: list.length, items: list });
  } catch {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const c = await Category.findById(req.params.id);
    if (!c) return res.status(404).json({ error: 'Category not found' });
    res.json(c);
  } catch {
    res.status(404).json({ error: 'Category not found' });
  }
});

router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const deleted = await Category.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Category not found' });
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

module.exports = router;
