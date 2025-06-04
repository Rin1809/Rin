// api/blog/posts.js
import { pool, initializeDb } from '../_lib/db.js'; // sua path db
import dotenv from 'dotenv';
dotenv.config();

const MIZUKI_SHARED_SECRET = process.env.MIZUKI_SHARED_SECRET || "default_secret_key_for_mizuki";

export default async function handler(req, res) {
  await initializeDb(); // goi db init

  if (req.method === 'GET') {
    try {
      const result = await pool.query(
        'SELECT id, title, content, image_url, discord_author_id, timestamp FROM blog_posts ORDER BY timestamp DESC'
      );
      res.status(200).json(result.rows);
    } catch (error) {
      console.error('Srvls: Loi fetch blog posts:', error);
      res.status(500).json({ error: 'Loi lay data blog posts' });
    }
  } else if (req.method === 'POST') {
    const mizukiSecretFromHeader = req.headers['x-mizuki-secret'];
    if (MIZUKI_SHARED_SECRET && mizukiSecretFromHeader !== MIZUKI_SHARED_SECRET) {
      console.warn("Srvls: YC POST /api/blog/posts bi tu choi: Sai secret.");
      return res.status(403).json({ error: "Forbidden: Invalid secret" });
    }

    const { title, content, image_url, discord_message_id, discord_author_id } = req.body;

    if (!title || title.trim() === "") {
      return res.status(400).json({ error: "Tieu de khong duoc de trong." });
    }
    if (!discord_message_id || !discord_author_id) {
      return res.status(400).json({ error: "Thieu Discord message ID hoac author ID." });
    }

    try {
      const result = await pool.query(
        'INSERT INTO blog_posts (title, content, image_url, discord_message_id, discord_author_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [title.trim(), content ? content.trim() : null, image_url, discord_message_id, discord_author_id]
      );
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Srvls: Loi them blog post:', error);
      if (error.code === '23505') { // Duplicate key err
          return res.status(409).json({ error: 'Bai blog voi ID tin nhan nay da ton tai.' });
      }
      res.status(500).json({ error: 'Loi server khi them bai blog. Vui long thu lai.' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}