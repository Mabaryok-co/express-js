const crypto = require('crypto');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

const ENCRYPTION_KEY = crypto.scryptSync(process.env.APP_KEY, 'salt', 32);
const IV = Buffer.alloc(16, 0);

// Encryption Helper Functions
const encryptData = (data) => {
  const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, IV);
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
};
// Decrypt Helper Function
const decryptData = (encrypted) => {
  const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, IV);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

module.exports = { encryptData, decryptData };