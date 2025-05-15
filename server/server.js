import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { pool, initializeDb } from './db.js';

const app = express();
const PORT = process.env.PORT || 3001; // Railway sẽ inject PORT

// Middleware
app.use(cors()); // Kích hoạt CORS cho tất cả routes
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Khởi tạo Database Table
initializeDb().then(() => {
    app.listen(PORT, '0.0.0.0', () => { // Nghe trên 0.0.0.0 cho Railway
        console.log(`🚀 Server is running on port ${PORT}`);
        console.log(`Backend API accessible at http://localhost:${PORT} (local) or your Railway service URL.`);
    });
}).catch(err => {
  console.error("🔴 Failed to initialize DB and start server:", err);
  process.exit(1);
});


// === API Routes cho Guestbook ===

// GET tất cả guestbook entries
app.get('/api/guestbook', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, message, language, timestamp FROM guestbook_entries ORDER BY timestamp DESC'
    );
    const entries = result.rows.map(entry => ({
        ...entry,
        language: entry.language.toLowerCase() // Đảm bảo language code là chữ thường
    }));
    res.status(200).json(entries);
  } catch (error) {
    console.error('🔴 Error fetching guestbook entries:', error);
    res.status(500).json({ error: 'Failed to retrieve guestbook entries' });
  }
});

// POST một guestbook entry mới
app.post('/api/guestbook', async (req, res) => {
  const { name, message, language } = req.body;

  if (!name || name.trim() === "" || !message || message.trim() === "" || !language) {
    // Cung cấp thông điệp lỗi cụ thể hơn cho client
    let missingFields = [];
    if (!name || name.trim() === "") missingFields.push("Name");
    if (!message || message.trim() === "") missingFields.push("Message");
    if (!language) missingFields.push("Language");
    const errorMsg = `${missingFields.join(', ')} are required and cannot be empty.`;
    return res.status(400).json({ error: errorMsg });
  }

  const validLanguages = ['vi', 'en', 'ja'];
  if (!validLanguages.includes(language.toLowerCase())) {
      return res.status(400).json({ error: `Invalid language code. Must be one of: ${validLanguages.join(', ')}.` });
  }

  try {
    const result = await pool.query(
      'INSERT INTO guestbook_entries (name, message, language) VALUES ($1, $2, $3) RETURNING id, name, message, language, timestamp',
      [name.trim(), message.trim(), language.toLowerCase()]
    );
    const newEntry = {
        ...result.rows[0],
        language: result.rows[0].language.toLowerCase() // Đảm bảo language code là chữ thường
    };
    console.log("✨ New entry added:", newEntry);
    res.status(201).json(newEntry);
  } catch (error) {
    console.error('🔴 Error adding guestbook entry:', error);
    // Cung cấp một thông báo lỗi chung hơn, nhưng vẫn hữu ích
    res.status(500).json({ error: 'Failed to add guestbook entry due to a server issue. Please try again.' });
  }
});

// Route kiểm tra sức khỏe đơn giản
app.get('/health', (req, res) => {
  res.status(200).send('Server is healthy! Rin cute <3');
});

// Fallback cho các route không khớp
app.use((req, res) => {
    res.status(404).json({ error: 'Not Found. Are you looking for /api/guestbook ?' });
});