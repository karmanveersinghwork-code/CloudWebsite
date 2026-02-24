const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();
const {
  listFiles,
  uploadFile,
  downloadFile,
  deleteFile,
  listVersions
} = require('../controllers/fileController');

// middleware to check session
function ensureLoggedIn(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  res.status(401).json({ error: 'Unauthorized' });
}

router.use(ensureLoggedIn);

router.get('/', listFiles);
router.post('/upload', upload.single('file'), uploadFile);
router.get('/download/:filename', downloadFile);
router.delete('/delete/:filename', deleteFile);
router.get('/versions/:filename', listVersions);

module.exports = router;
