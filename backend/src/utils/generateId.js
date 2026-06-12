const crypto = require('crypto');

// ID unik bergaya "JMH-A1B2C3D4" sesuai tipe Varchar(20) pada skema.
function generateId(prefix) {
  return `${prefix}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
}

module.exports = generateId;
