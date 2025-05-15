import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config(); // Cho phép sử dụng file .env khi dev local

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('🔴 DATABASE_URL không được thiết lập, hãy check/thiết lập lại file .env');
  // Chỉ thoát nếu không phải môi trường Railway/production
  if (process.env.NODE_ENV !== 'production' && !process.env.RAILWAY_ENVIRONMENT) {
    process.exit(1);
  }
}

const pool = new Pool({
  connectionString,
  // SSL bắt buộc cho kết nối tới DB trên Railway từ bên ngoài network của Railway
  // Hoặc nếu app và DB cùng project trên Railway, SSL có thể không cần thiết.
  // Để an toàn và tương thích nhiều trường hợp, nên bật cho production.
  ssl: process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT ? { rejectUnauthorized: false } : false,
});

pool.on('connect', () => {
  console.log('🟢 Đã kết nối tới PostgreSQL database!');
});

pool.on('error', (err) => {
  console.error('🔴 Unexpected error với idle client', err);
  process.exit(-1); // Thoát nếu có lỗi nghiêm trọng với pool
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
  } catch (err) {
    console.error('🔴 Error với database table:', err);
    // Nếu đang trong môi trường Railway/production và không khởi tạo được DB thì là vấn đề lớn
    if (process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT) {
        throw err; // Ném lỗi để server không khởi động nếu DB không sẵn sàng
    }
  } finally {
    if (client) client.release();
  }
};

export { pool, initializeDb };