const bcrypt = require('bcryptjs');

async function generateHash() {
  const password = 'test123';
  const hash = await bcrypt.hash(password, 10);
  console.log('Hash para a senha "test123":', hash);
}

generateHash();