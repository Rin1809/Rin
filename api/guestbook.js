// api/guestbook.js
import { pool, initializeDb } from '../_lib/db.js'; // Path nay van giu nguyen
import dotenv from 'dotenv';
dotenv.config();

export default async function handler(req, res) {
  // console.log('API_GUESTBOOK: Handler called, attempting to initialize DB...'); // log
  try {
    await initializeDb(); // Goi db init
    // console.log('API_GUESTBOOK: DB initialized.'); // log
  } catch (dbError) {
    console.error('API_GUESTBOOK_DB_INIT_ERROR:', dbError);
    return res.status(500).json({ error: 'Loi khoi tao database cho guestbook.' });
  }

  if (req.method === 'GET') {
    try {
      // console.log('API_GUESTBOOK_GET: Fetching entries...'); // log
      const result = await pool.query(
        'SELECT id, name, message, language, timestamp FROM guestbook_entries ORDER BY timestamp DESC'
      );
      const entries = result.rows.map(entry => ({
          ...entry,
          language: entry.language.toLowerCase()
      }));
      // console.log('API_GUESTBOOK_GET: Entries fetched, count:', entries.length); // log
      res.status(200).json(entries);
    } catch (error) {
      console.error('Srvls: Loi fetch GBook:', error);
      res.status(500).json({ error: 'Loi lay data guestbook' });
    }
  } else if (req.method === 'POST') {
    // console.log('API_GUESTBOOK_POST: Received POST request.'); // log
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
      // console.log('API_GUESTBOOK_POST: Inserting entry:', { name, language }); // log
      const result = await pool.query(
        'INSERT INTO guestbook_entries (name, message, language) VALUES ($1, $2, $3) RETURNING id, name, message, language, timestamp',
        [name.trim(), message.trim(), language.toLowerCase()]
      );
      const newEntry = {
          ...result.rows[0],
          language: result.rows[0].language.toLowerCase()
      };
      // console.log('API_GUESTBOOK_POST: Entry inserted:', newEntry); // log
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