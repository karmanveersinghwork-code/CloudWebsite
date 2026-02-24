const express = require('express');
const router = express.Router();
const { login } = require('../controllers/authController');

// POST /api/auth/login
router.post('/login', login);

// GET /api/auth/logout
router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out' });
  });
});

module.exports = router;
