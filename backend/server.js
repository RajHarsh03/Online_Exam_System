const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const dns = require('dns');
const { clerkMiddleware } = require('@clerk/express');
require('dotenv').config();
dns.setServers(['8.8.8.8', '8.8.4.4']);

const app = express();

// ── Middleware ────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());

// ── Serve static files ───────────────────────────────
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// ── API Routes ───────────────────────────────────────
app.use('/api/exams', require('./routes/exams'));
app.use('/api/questions', require('./routes/questions'));
app.use('/api/results', require('./routes/results'));
app.use('/api/students', require('./routes/students'));

// ── Database Connection ──────────────────────────────
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err.message));

// ── Start Server (runs even if DB is slow to connect) ─
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
