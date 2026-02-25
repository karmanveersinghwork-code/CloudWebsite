const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();

const {
  listFiles,
  uploadFile,
  deleteFile,
  getFile,
  getVersions
} = require('../controllers/fileController');

// middleware to check session for protected routes
function ensureLoggedIn(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  console.log('Unauthorized access attempt to files route');
  res.status(401).json({ error: 'Unauthorized' });
}

// Public: list files (no auth) - useful for testing S3/EC2 IAM role
router.get('/', async (req, res) => {
  try {
    await listFiles(req, res);
  } catch (err) {
    console.error('Error in GET /files', err);
    res.status(500).json({ error: 'Failed to list files' });
  }
});

// Protected routes (require session)
router.post('/upload', ensureLoggedIn, upload.single('file'), async (req, res) => {
  try {
    await uploadFile(req, res);
  } catch (err) {
    console.error('Error in POST /files/upload', err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

router.delete('/:filename', ensureLoggedIn, async (req, res) => {
  try {
    await deleteFile(req, res);
  } catch (err) {
    console.error('Error in DELETE /files/:filename', err);
    res.status(500).json({ error: 'Delete failed' });
  }
});

router.get('/download/:filename', ensureLoggedIn, async (req, res) => {
  try {
    await getFile(req, res);
  } catch (err) {
    console.error('Error in GET /files/download/:filename', err);
    res.status(500).json({ error: 'Download failed' });
  }
});

router.get('/versions/:filename', ensureLoggedIn, async (req, res) => {
  try {
    await getVersions(req, res);
  } catch (err) {
    console.error('Error in GET /files/versions/:filename', err);
    res.status(500).json({ error: 'Failed to get versions' });
  }
});

module.exports = router;
