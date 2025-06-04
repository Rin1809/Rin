// api/_lib/db.js
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config(); // Load bien mt cho local/Vercel dev

const { Pool } = pg;
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DB_FATAL_ERROR: DATABASE_URL is not set. Check Vercel environment variables.');
  // Ko exit trong serverless, nhưng sẽ gây lỗi ở các query
}

const poolConfig = {
  connectionString,
};

// Neon.tech yeu cau SSL, cac provider khac co the khac
if (process.env.NODE_ENV === 'production' && connectionString && connectionString.includes('neon.tech')) {
  poolConfig.ssl = { rejectUnauthorized: false };
} else if (process.env.NODE_ENV === 'production' && connectionString && !connectionString.includes('localhost')) {
  // neu la production va ko phai localhost, va ko phai neon -> co the can SSL (tuy provider)
  // vi du cho Railway, Heroku:
  // poolConfig.ssl = { rejectUnauthorized: false };
}


const pool = new Pool(poolConfig);

pool.on('connect', () => {
  // console.log('DB: Connected to PostgreSQL pool.'); // Qua nhieu log cho serverless
});

pool.on('error', (err, client) => { // Them client vao param de debug
  console.error('DB_POOL_ERROR: Unexpected error on idle client.', {
    error: err.message,
    stack: err.stack,
    client: client ? 'Client info available' : 'Client info not available'
  });
});

let dbInitialized = false;
let initializeDbPromise = null;

const initializeDbLogic = async () => {
  if (dbInitialized) return;
  console.log('DB_INIT_LOGIC: Attempting to initialize database schema...');
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
    // console.log('DB_INIT_LOGIC: Table "guestbook_entries" checked/created.');

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
    // console.log('DB_INIT_LOGIC: Table "blog_posts" checked/created.');
    dbInitialized = true;
    console.log('DB_INIT_LOGIC: Database schema initialized successfully.');
  } catch (err) {
    console.error('DB_INIT_LOGIC_ERROR: Error initializing database tables:', {
        error: err.message,
        stack: err.stack
    });
    // Ko throw err de app ko crash, nhung log loi la quan trong
  } finally {
    if (client) client.release();
  }
};

// Ham initializeDb se goi initializeDbLogic
async function initializeDb() { // export ham nay
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
    initializeDbPromise = null;
  }
};

export { pool, initializeDb }; // Dam bao export dung