const { Pool } = require('pg');
require('dotenv').config()

// Kendi PostgreSQL kullanıcı adı, şifre ve veritabanı adınla burayı güncelle
// const pool = new Pool({
//     user: process.env.DB_USER,
//     host: process.env.DB_HOST,
//     database: process.env.DB_NAME,
//     password: process.env.DB_PW,
//     port: process.env.DB_PORT,
// });

const pool = new Pool({
    connectionString: process.env.DB_CON_STR,
    ssl: {
        rejectUnauthorized: false, // Neon için gerekli
    },
    // Neon pooler ile çalışmak için (opsiyonel)
    max: 10, // Maksimum bağlantı sayısı
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,

});

pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Neon bağlantı hatası:', err.stack);
    process.exit(1);
  } else {
    console.log('✅ Neon PostgreSQL bağlantısı başarılı!');
    release();
  }
});

module.exports = pool;