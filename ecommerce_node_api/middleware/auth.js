const jwt = require('jsonwebtoken');
const User = require('../models/User');


async function requireAuth(req, res, next) {
try {
const auth = req.headers.authorization || '';
const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
if (!token) return res.status(401).json({ error: 'Missing Bearer token' });


const payload = jwt.verify(token, process.env.JWT_SECRET);
const user = await User.findById(payload.id).select('-password');
if (!user) return res.status(401).json({ error: 'Invalid token' });


req.user = user;
next();
} catch (err) {
return res.status(401).json({ error: 'Unauthorized' });
}
}


function requireAdmin(req, res, next) {
if (!req.user || req.user.role !== 'admin') {
return res.status(403).json({ error: 'Admin access required' });
}
next();
}


module.exports = { requireAuth, requireAdmin };