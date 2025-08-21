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


// If you will ever set cookies behind a proxy (Nginx), keep this:
app.set('trust proxy', 1);

// Allow only your known frontends (add more if needed)
const ALLOWED_ORIGINS = [
  'http://157.245.104.196:3000', // Next.js admin (your frontend)
  'http://localhost:3000',       // local admin (dev)
  'http://localhost:8081',       // Expo/RN web (dev)
  'http://127.0.0.1:8081',
];

// CORS options with dynamic origin check
const corsOptions = {
  origin(origin, cb) {
    // allow same-origin / curl / server-side calls with no Origin header
    console.log('CORS Origin:', origin);
    if (!origin) return cb(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    return cb(new Error(`CORS: origin not allowed -> ${origin}`), false);
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // IMPORTANT if you send cookies or use withCredentials=true
};

// Handle preflight early (especially important if you use multer or other middlewares)
app.options('*', cors(corsOptions));
app.use(cors(corsOptions));

/* --- Helmet (relaxed cross-origin policies) --- */
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginEmbedderPolicy: false,
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
