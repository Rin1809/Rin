// api/blog/posts.js
import { pool, initializeDb } from '../_lib/db.js'; // Path nay van giu nguyen
import dotenv from 'dotenv';
dotenv.config();

const MIZUKI_SHARED_SECRET = process.env.MIZUKI_SHARED_SECRET || "default_secret_key_for_mizuki";

export default async function handler(req, res) {
  // console.log('API_BLOG_POSTS: Handler called, attempting to initialize DB...'); // log
  try {
    await initializeDb(); // Goi db init, dam bao no la async
    // console.log('API_BLOG_POSTS: DB initialized.'); // log
  } catch (dbError) {
    console.error('API_BLOG_POSTS_DB_INIT_ERROR:', dbError);
    return res.status(500).json({ error: 'Loi khoi tao database cho blog posts.' });
  }


  if (req.method === 'GET') {
    try {
      // console.log('API_BLOG_POSTS_GET: Fetching posts...'); // log
      const result = await pool.query(
        'SELECT id, title, content, image_url, discord_author_id, timestamp FROM blog_posts ORDER BY timestamp DESC'
      );
      // console.log('API_BLOG_POSTS_GET: Posts fetched, count:', result.rows.length); // log
      res.status(200).json(result.rows);
    } catch (error) {
      console.error('Srvls: Loi fetch blog posts:', error);
      res.status(500).json({ error: 'Loi lay data blog posts' });
    }
  } else if (req.method === 'POST') {
    // console.log('API_BLOG_POSTS_POST: Received POST request.'); // log
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
      // console.log('API_BLOG_POSTS_POST: Inserting post:', { title }); // log
      const result = await pool.query(
        'INSERT INTO blog_posts (title, content, image_url, discord_message_id, discord_author_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [title.trim(), content ? content.trim() : null, image_url, discord_message_id, discord_author_id]
      );
      // console.log('API_BLOG_POSTS_POST: Post inserted:', result.rows[0]); // log
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