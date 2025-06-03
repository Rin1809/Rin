// rin-personal-card/server/db.js
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('🔴 DATABASE_URL không được thiết lập, hãy check/thiết lập lại file .env hoặc biến môi trường trên Vercel.');
  if (process.env.NODE_ENV !== 'production') {
    process.exit(1);
  }
}

const poolConfig = {
  connectionString,
};


if (process.env.NODE_ENV === 'production' && connectionString && connectionString.includes('neon.tech')) {
  poolConfig.ssl = { rejectUnauthorized: false };
} else if (process.env.NODE_ENV === 'production') {
  poolConfig.ssl = { rejectUnauthorized: false }; 
}


const pool = new Pool(poolConfig);

pool.on('connect', () => {
  console.log('🟢 Đã kết nối tới PostgreSQL database!');
});

pool.on('error', (err) => {
  console.error('🔴 Unexpected error với idle client', err);
});

const initializeDb = async () => {
  let client;
  try {
    client = await pool.connect();
    await client.query(`
      CREATE TABLE IF NOT EXISTS guestbook_entries (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        language VARCHAR(2) NOT NULL,
        timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✨ Bảng "guestbook_entries" đã được chuẩn bị !');

    await client.query(`
      CREATE TABLE IF NOT EXISTS blog_posts (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT,
        image_url VARCHAR(2048),
        discord_message_id VARCHAR(255) UNIQUE NOT NULL,
        discord_author_id VARCHAR(255) NOT NULL,
        timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✨ Bảng "blog_posts" đã được chuẩn bị !');

  } catch (err) {
    console.error('🔴 Error với database table:', err);
    if (process.env.NODE_ENV === 'production') {

        throw err;
    }
  } finally {
    if (client) client.release();
  }
};

export { pool, initializeDb };