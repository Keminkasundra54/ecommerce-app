// utils/uploader.js
const multer = require('multer');
const path = require('path');
const { v4: uuid } = require('uuid');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'uploads')),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    cb(null, `${uuid()}${ext || ''}`);
  }
});

const fileFilter = (req, file, cb) => {
  // accept images only (adjust if needed)
  if (!file.mimetype.startsWith('image/')) return cb(new Error('Only image uploads are allowed'));
  cb(null, true);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB

module.exports = {
  uploadSingle: (field) => upload.single(field),
  uploadMulti: (field, max = 10) => upload.array(field, max),
  // helper to build absolute URL from req + filename
  fileUrl: (req, filename) => `${req.protocol}://${req.get('host')}/uploads/${filename}`,
};
