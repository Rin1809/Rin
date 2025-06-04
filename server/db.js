// rin-personal-card/server/db.js
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DB_URL_ERR: DATABASE_URL khong dc set.');
  if (process.env.NODE_ENV !== 'production') {
    // process.exit(1); // Ko exit trong serverless
  }
}

const poolConfig = {
  connectionString,
};

if (process.env.NODE_ENV === 'production' && connectionString && connectionString.includes('neon.tech')) {
  poolConfig.ssl = { rejectUnauthorized: false };
} else if (process.env.NODE_ENV === 'production') {
  // Cho cac TH khac (VD: Railway Postgres ko can rejectUnauthorized: false)
  // poolConfig.ssl = { rejectUnauthorized: false }; // Co the bat/tat tuy DB provider
}

const pool = new Pool(poolConfig);

pool.on('connect', () => {
  // console.log('DB: Connected to PostgreSQL!'); // Hơi nhiều log cho serverless
});

pool.on('error', (err) => {
  console.error('DB_ERR: Unexpected error on idle client', err);
});

let dbInitialized = false;
let initializeDbPromise = null;

const initializeDbLogic = async () => {
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
    // console.log('DB_OK: Table "guestbook_entries" ready.');

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
    // console.log('DB_OK: Table "blog_posts" ready.');
    dbInitialized = true;
  } catch (err) {
    console.error('DB_INIT_ERR: Loi DB tables:', err);
    // throw err; // Ko throw de app ko crash hoan toan tren Vercel
  } finally {
    if (client) client.release();
  }
};

const initializeDb = async () => {
  if (dbInitialized) {
    return;
  }
  if (initializeDbPromise) {
    return initializeDbPromise;
  }
  initializeDbPromise = initializeDbLogic();
  try {
    await initializeDbPromise;
  } finally {
    initializeDbPromise = null; // Reset promise de co the goi lai neu that bai
  }
};

export { pool, initializeDb };