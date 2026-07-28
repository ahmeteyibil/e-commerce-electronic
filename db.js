const { Pool } = require('pg');

// Kendi PostgreSQL kullanıcı adı, şifre ve veritabanı adınla burayı güncelle
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'e_commerce_db',
    password: 'postgres',
    port: 5432,
});

module.exports = pool;