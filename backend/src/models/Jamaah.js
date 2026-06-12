const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const generateId = require('../utils/generateId');

const jamaahSchema = new mongoose.Schema(
  {
    id_jamaah: { type: String, required: true, unique: true, default: () => generateId('JMH') },
    username: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    nama_lengkap: { type: String, required: true, trim: true },
    no_telp: { type: String, required: true, trim: true },
    alamat: { type: String, default: '' },
  },
  { collection: 'jamaah', timestamps: true }
);

jamaahSchema.pre('save', async function () {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});

jamaahSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

jamaahSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('Jamaah', jamaahSchema);
