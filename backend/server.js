// Ensure Node.js version is compatible before loading dependencies
const semver = process.versions.node.split('.').map(n => parseInt(n, 10));
const major = semver[0] || 0;
if (major < 14) {
  console.error(`ERROR: Node.js ${process.versions.node} detected. This project requires Node.js v14 or later. Please upgrade Node.js and try again: https://nodejs.org/`);
  process.exit(1);
}

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
app.use(cors());
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

// register routes
app.use('/auth', authRoutes);
console.log('Registered /auth routes');
app.use('/files', fileRoutes);
console.log('Registered /files routes');

// simple health check
app.get('/', (req, res) => {
  res.send('Server is running');
});

// catch 404
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
