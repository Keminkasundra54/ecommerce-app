require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');

const connectDB = require('./config/db');

const authRoutes = require('./routes/auth');
const categoryRoutes = require('./routes/categories');
const subCategoryRoutes = require('./routes/subcategories');
const productRoutes = require('./routes/products');

const app = express();

// --- Paths ---
const UPLOAD_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const whitelist = [
  'http://localhost:3000', // Next.js
  'http://localhost:8081', // Metro dev server (some RN tooling sends this Origin)
];
app.use(cors({
  origin(origin, cb) {
    if (!origin) return cb(null, true);            // allow mobile apps / curl (no Origin)
    if (whitelist.includes(origin)) return cb(null, true);
    return cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // let others display your /uploads images
    crossOriginEmbedderPolicy: false,                       // dev-friendly; avoids COEP issues
    crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

// --- Serve uploads with explicit CORP header ---
app.use(
  '/uploads',
  express.static(UPLOAD_DIR, {
    setHeaders: (res) => {
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      // Optional: cache
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    },
  })
);

// DB + Routes
connectDB();
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/subcategories', subCategoryRoutes);
app.use('/api/products', productRoutes);

const orderRoutes = require('./routes/orders');
app.use('/api/orders', orderRoutes);

const userRoutes = require('./routes/users');
app.use('/api/users', userRoutes);

app.get('/', (req, res) => res.json({ ok: true }));
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));
app.use((err, req, res, next) => {
  console.error('Unhandled Error =>', err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 API listening on ${PORT}`));
