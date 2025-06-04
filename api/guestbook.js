// api/guestbook.js
import { pool, initializeDb } from '../server/db.js'; // Duong dan toi db.js
import dotenv from 'dotenv';
dotenv.config(); // Load bien moi truong cho local dev voi vercel dev

export default async function handler(req, res) {
  await initializeDb(); // Dam bao table da dc tao

  if (req.method === 'GET') {
    try {
      const result = await pool.query(
        'SELECT id, name, message, language, timestamp FROM guestbook_entries ORDER BY timestamp DESC'
      );
      const entries = result.rows.map(entry => ({
          ...entry,
          language: entry.language.toLowerCase()
      }));
      res.status(200).json(entries);
    } catch (error) {
      console.error('Srvls: Loi fetch GBook:', error);
      res.status(500).json({ error: 'Loi lay data guestbook' });
    }
  } else if (req.method === 'POST') {
    const { name, message, language } = req.body;

    if (!name || name.trim() === "" || !message || message.trim() === "" || !language) {
      let missingFields = [];
      if (!name || name.trim() === "") missingFields.push("Ten");
      if (!message || message.trim() === "") missingFields.push("Loi nhan");
      if (!language) missingFields.push("Ngon ngu");
      const errorMsg = `${missingFields.join(', ')} khong dc de trong.`;
      return res.status(400).json({ error: errorMsg });
    }

    const validLanguages = ['vi', 'en', 'ja'];
    if (!validLanguages.includes(language.toLowerCase())) {
        return res.status(400).json({ error: `Code ngon ngu sai. Phai la: ${validLanguages.join(', ')}.` });
    }

    try {
      const result = await pool.query(
        'INSERT INTO guestbook_entries (name, message, language) VALUES ($1, $2, $3) RETURNING id, name, message, language, timestamp',
        [name.trim(), message.trim(), language.toLowerCase()]
      );
      const newEntry = {
          ...result.rows[0],
          language: result.rows[0].language.toLowerCase()
      };
      res.status(201).json(newEntry);
    } catch (error) {
      console.error('Srvls: Loi them entry GBook:', error);
      res.status(500).json({ error: 'Loi server khi them entry. Thu lai.' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}