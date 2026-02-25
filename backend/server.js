require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const path = require('path');

const authRoutes = require('./routes/auth');
// use the new fileRoutes module (routes/fileRoutes.js)
const fileRoutes = require('./routes/fileRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// middleware
app.use(cors({
  origin: ['http://localhost:5500', 'http://localhost:5000'], // allow frontend ports
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'some-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // set to true if using HTTPS
  })
);

// static files (optional, serve frontend from backend if desired)
app.use(express.static(path.join(__dirname, '../frontend')));

// register routes under /api to match frontend requests
app.use('/api/auth', authRoutes);
console.log('Registered /api/auth routes');
app.use('/api/files', fileRoutes);
console.log('Registered /api/files routes');

// catch 404
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
