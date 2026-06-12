const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const generateId = require('../utils/generateId');

const adminSchema = new mongoose.Schema(
  {
    id_admin: { type: String, required: true, unique: true, default: () => generateId('ADM') },
    username: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    nama_lengkap: { type: String, required: true, trim: true },
    role: { type: String, enum: ['admin_biasa', 'kepala_admin'], required: true, default: 'admin_biasa' },
  },
  { collection: 'admin', timestamps: true }
);

adminSchema.pre('save', async function () {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});

adminSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

adminSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('Admin', adminSchema);
