const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 4096,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem'
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem'
  }
});

fs.writeFileSync(path.join(process.cwd(), 'jwt.private.key'), privateKey);
fs.writeFileSync(path.join(process.cwd(), 'jwt.public.key'), publicKey);

console.log('✅ RSA Keys (4096 bits) generated successfully.');
