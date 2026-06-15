const path = require('path');
const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sajikan media profil yang diunggah ke disk lokal (fallback tanpa Cloudinary).
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.get('/', (req, res) => {
  res.json({ success: true, message: 'API Sistem Tabungan Qurban' });
});

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
