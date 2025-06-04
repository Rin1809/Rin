// api/health.js
export default function handler(req, res) {
  if (req.method === 'GET') {
    res.status(200).send('Serverless API is healthy! Rin cute <3');
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}