const { Pool } = require('pg');

// Kendi PostgreSQL kullanıcı adı, şifre ve veritabanı adınla burayı güncelle
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'eticaret_db',
    password: 'buraya_kendi_sifreni_yaz',
    port: 5432,
});

module.exports = pool;