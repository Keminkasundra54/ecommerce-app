const express = require('express');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// GET /api/users?q=&page=&limit=
router.get('/', requireAuth, requireAdmin, async (req, res) => {
  const { q, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (q) {
    filter.$or = [
      { name: new RegExp(q, 'i') },
      { email: new RegExp(q, 'i') },
    ];
  }
  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
    User.countDocuments(filter),
  ]);
  res.json({ total, page: Number(page), pageSize: Number(limit), items });
});

module.exports = router;
