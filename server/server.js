// rin-personal-card/server/server.js
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import axios from 'axios';
import { pool, initializeDb } from './db.js';
import dotenv from 'dotenv';
dotenv.config();

const app = express();

const MIZUKI_BOT_BASE_URL = process.env.MIZUKI_BOT_NOTIFY_URL;
const MIZUKI_SHARED_SECRET = process.env.MIZUKI_SHARED_SECRET || "default_secret_key_for_mizuki";
const EXCLUDED_IPS_RAW = process.env.EXCLUDED_IPS || "";
const EXCLUDED_IPS_FOR_LOGGING = EXCLUDED_IPS_RAW.split(',').map(ip => ip.trim()).filter(ip => ip);


app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// --- Spotify API ---
let spotifyAccessToken = null;
let tokenExpiryTime = 0;

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const MY_SPOTIFY_PLAYLIST_IDS = [
    '2uZFS0NuNYPSR0neKprFwU',
    '0NtIFyq7ZFQtDvKDcDycHS',
    '6MlXr1lH5XtSVn7SECc68E',
    '2PynP8hcLDnj7JbLgixwbt',
];

async function getSpotifyToken() {
    if (spotifyAccessToken && Date.now() < tokenExpiryTime) {
        return spotifyAccessToken;
    }

    if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
        console.error('🔴 Spotify ID/Secret chua set.');
        throw new Error('Spotify API creds missing.');
    }

    try {
        const response = await axios.post('https://accounts.spotify.com/api/token',
            'grant_type=client_credentials',
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Basic ' + (Buffer.from(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET).toString('base64'))
                }
            }
        );
        spotifyAccessToken = response.data.access_token;
        tokenExpiryTime = Date.now() + (response.data.expires_in * 1000) - 60000; // Refresh som hon 1p
        return spotifyAccessToken;
    } catch (error) {
        console.error('🔴 Loi lay Spotify token:', error.response ? error.response.data : error.message);
        throw new Error('Loi lay Spotify access token.');
    }
}

// DB init se dc goi khi func start
initializeDb().catch(err => {
  console.error("🔴 Khoi tao DB that bai (serverless):", err);
  // Ko exit process trong serverless
});


// === API Routes cho Guestbook  ===
app.get('/api/guestbook', async (req, res) => {
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
    console.error('🔴 Loi fetch guestbook:', error);
    res.status(500).json({ error: 'Loi lay data guestbook' });
  }
});

app.post('/api/guestbook', async (req, res) => {
  const { name, message, language } = req.body;

  if (!name || name.trim() === "" || !message || message.trim() === "" || !language) {
    let missingFields = [];
    if (!name || name.trim() === "") missingFields.push("Name");
    if (!message || message.trim() === "") missingFields.push("Message");
    if (!language) missingFields.push("Language");
    const errorMsg = `${missingFields.join(', ')} khong duoc trong.`;
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
    console.error('🔴 Loi them entry guestbook:', error);
    res.status(500).json({ error: 'Loi server khi them entry. Thu lai.' });
  }
});

// === API Route cho Spotify Playlists  ===
app.get('/api/spotify/playlists', async (req, res) => {
    try {
        const token = await getSpotifyToken();
        const playlistPromises = MY_SPOTIFY_PLAYLIST_IDS.map(id =>
            axios.get(`https://api.spotify.com/v1/playlists/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
        );

        const playlistResponses = await Promise.all(playlistPromises);
        const playlistsData = playlistResponses.map(response => ({
            id: response.data.id,
            name: response.data.name,
            description: response.data.description,
            imageUrl: response.data.images.length > 0 ? response.data.images[0].url : null,
            externalUrl: response.data.external_urls.spotify,
            owner: response.data.owner.display_name
        }));

        res.status(200).json(playlistsData);
    } catch (error) {
        console.error('🔴 Loi lay Spotify playlists:', error.message);
        if (error.message.includes('Spotify API creds missing')) {
             res.status(503).json({ error: 'Spotify service loi (config).' });
        } else if (error.message.includes('Loi lay Spotify access token')) {
             res.status(503).json({ error: 'Spotify service loi (auth).' });
        } else {
             res.status(500).json({ error: 'Loi lay Spotify playlists.' });
        }
    }
});

// === API Routes cho Blog ===
app.get('/api/blog/posts', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, title, content, image_url, discord_author_id, timestamp FROM blog_posts ORDER BY timestamp DESC'
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('🔴 Loi fetch blog posts:', error);
    res.status(500).json({ error: 'Loi lay data blog posts' });
  }
});

app.post('/api/blog/posts', async (req, res) => {
  const mizukiSecretFromHeader = req.headers['x-mizuki-secret'];
  if (MIZUKI_SHARED_SECRET && mizukiSecretFromHeader !== MIZUKI_SHARED_SECRET) {
    console.warn("🔴 Yeu cau POST /api/blog/posts bi tu choi: Sai secret.");
    return res.status(403).json({ error: "Forbidden: Invalid secret" });
  }

  const { title, content, image_url, discord_message_id, discord_author_id } = req.body;

  if (!title || title.trim() === "") {
    return res.status(400).json({ error: "Tiêu đề không được để trống." });
  }
  if (!discord_message_id || !discord_author_id) {
    return res.status(400).json({ error: "Thiếu thông tin Discord message ID hoặc author ID." });
  }

  try {
    const result = await pool.query(
      'INSERT INTO blog_posts (title, content, image_url, discord_message_id, discord_author_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [title.trim(), content ? content.trim() : null, image_url, discord_message_id, discord_author_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('🔴 Loi them blog post:', error);
    if (error.code === '23505') { // Duplicate key err
        return res.status(409).json({ error: 'Bài blog với ID tin nhắn này đã tồn tại.' });
    }
    res.status(500).json({ error: 'Lỗi server khi thêm bài blog. Vui lòng thử lại.' });
  }
});

// Endpoint nhan tbao visit tu frontend
app.post('/api/notify-visit', async (req, res) => {
    const clientIp = req.headers['x-forwarded-for']?.split(',').shift() || req.socket?.remoteAddress;
    const userAgent = req.headers['user-agent'];

    if (!MIZUKI_BOT_BASE_URL) {
        // console.warn("⚠️ MIZUKI_BOT_BASE_URL chua dc cfg. Ko the gui tbao."); // log nay hoi nhieu
        return res.status(202).json({ message: "Visit logged, notification to bot disabled." });
    }

    let locationInfo = "Ko xac dinh";
    let country = "N/A";
    let city = "N/A";
    let region = "N/A";
    let isp = "N/A";

    if (clientIp && clientIp !== "::1" && !clientIp.startsWith("127.0.0.1") && !EXCLUDED_IPS_FOR_LOGGING.includes(clientIp)) {
        try {
            // Luu y: ip-api.com co rate limit
            const geoResponse = await axios.get(`http://ip-api.com/json/${clientIp}?fields=status,message,country,countryCode,regionName,city,isp,query`);
            if (geoResponse.data && geoResponse.data.status === 'success') {
                country = geoResponse.data.country || "N/A";
                city = geoResponse.data.city || "N/A";
                region = geoResponse.data.regionName || "N/A";
                isp = geoResponse.data.isp || "N/A";
                locationInfo = `${city}, ${region}, ${country} (ISP: ${isp})`;
            } else {
                locationInfo = `Ko lay dc ttin vi tri (ip-api: ${geoResponse.data.message || 'loi ko ro'})`;
            }
        } catch (geoError) {
            // console.error(`[GeoIP VISIT] Loi goi API GeoIP cho IP ${clientIp}:`, geoError.message); // log nay hoi nhieu
            locationInfo = "Loi lay ttin vi tri.";
        }
    } else if (EXCLUDED_IPS_FOR_LOGGING.includes(clientIp)){
        locationInfo = "IP ngoai le, khong gui DM."
    } else {
        locationInfo = "Truy cap tu Localhost.";
        country = "Local";
    }

    const visitData = {
        ip: clientIp || "N/A",
        location: locationInfo,
        country: country,
        city: city,
        region: region,
        isp: isp,
        userAgent: userAgent || "N/A",
        timestamp: new Date().toISOString()
    };

    try {
        let notifyVisitUrl = MIZUKI_BOT_BASE_URL;
        if (notifyVisitUrl.endsWith('/')) {
            notifyVisitUrl = notifyVisitUrl.slice(0, -1);
        }

        await axios.post(`${notifyVisitUrl}/notify-visit`, visitData, {
            headers: {
                'Content-Type': 'application/json',
                'X-Mizuki-Secret': MIZUKI_SHARED_SECRET
            }
        });
        res.status(200).json({ message: "Notification sent to bot." });
    } catch (botError) {
        // console.error("🔴 Loi gui tbao toi bot Mizuki:", botError.response ? botError.response.data : botError.message); // log nay hoi nhieu
        res.status(500).json({ error: "Failed to notify bot." });
    }
});

// API ENDPOINT MOI CHO LOG INTERACTION
app.post('/api/log-interaction', async (req, res) => {
    const clientIp = req.headers['x-forwarded-for']?.split(',').shift() || req.socket?.remoteAddress;
    const userAgent = req.headers['user-agent'];
    const { eventType, eventData, timestamp: clientTimestamp } = req.body;

    if (!MIZUKI_BOT_BASE_URL) {
        // console.warn("⚠️ MIZUKI_BOT_BASE_URL chua dc cfg. Ko the gui log tuong tac."); // log nay hoi nhieu
        return res.status(202).json({ message: "Interaction logged by server, notification to bot disabled." });
    }

    let locationInfo = "Ko xac dinh";
    let country = "N/A";
    let city = "N/A";
    let region = "N/A";
    let isp = "N/A";

    if (clientIp && clientIp !== "::1" && !clientIp.startsWith("127.0.0.1") && !EXCLUDED_IPS_FOR_LOGGING.includes(clientIp)) {
        try {
            const geoResponse = await axios.get(`http://ip-api.com/json/${clientIp}?fields=status,message,country,countryCode,regionName,city,isp,query`);
            if (geoResponse.data && geoResponse.data.status === 'success') {
                country = geoResponse.data.country || "N/A";
                city = geoResponse.data.city || "N/A";
                region = geoResponse.data.regionName || "N/A";
                isp = geoResponse.data.isp || "N/A";
                locationInfo = `${city}, ${region}, ${country} (ISP: ${isp})`;
            } else {
                locationInfo = `Ko lay dc ttin vi tri (ip-api: ${geoResponse.data.message || 'loi ko ro'})`;
            }
        } catch (geoError) {
            // console.error(`[GeoIP INTERACTION] Loi goi API GeoIP cho IP ${clientIp}:`, geoError.message); // log nay hoi nhieu
            locationInfo = "Loi lay ttin vi tri.";
        }
    } else if (EXCLUDED_IPS_FOR_LOGGING.includes(clientIp)){
        locationInfo = "IP ngoai le, khong gui DM log."
    } else {
        locationInfo = "Truy cap tu Localhost.";
        country = "Local";
    }

    const interactionPayload = {
        ip: clientIp || "N/A",
        location: locationInfo,
        country: country,
        city: city,
        region: region,
        isp: isp,
        userAgent: userAgent || "N/A",
        clientTimestamp: clientTimestamp,
        serverTimestamp: new Date().toISOString(),
        eventType,
        eventData
    };

    try {
        let logInteractionUrl = MIZUKI_BOT_BASE_URL;
        if (logInteractionUrl.endsWith('/')) {
            logInteractionUrl = logInteractionUrl.slice(0, -1);
        }
        await axios.post(`${logInteractionUrl}/log-interaction`, interactionPayload, {
            headers: {
                'Content-Type': 'application/json',
                'X-Mizuki-Secret': MIZUKI_SHARED_SECRET
            }
        });
        res.status(200).json({ message: "Interaction logged and notification sent to bot." });
    } catch (botError) {
        // console.error("🔴 Loi gui log tuong tac toi bot Mizuki:", botError.response ? botError.response.data : botError.message); // log nay hoi nhieu
        res.status(500).json({ error: "Failed to notify bot of interaction." });
    }
});

app.get('/health', (req, res) => {
  res.status(200).send('Server is healthy! Rin cute <3');
});



export default app;