const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/tabungan_qurban_db';
  try {
    await mongoose.connect(uri);
    console.log(`MongoDB terhubung: ${mongoose.connection.name}`);
  } catch (err) {
    console.error('Gagal terhubung ke MongoDB:', err.message);
    process.exit(1);
  }
}

module.exports = connectDB;
