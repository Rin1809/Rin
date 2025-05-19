// rin-personal-card/server/server.js
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import axios from 'axios'; 
import { pool, initializeDb } from './db.js';
import dotenv from 'dotenv';

dotenv.config(); 

const app = express();
const PORT = process.env.PORT || 3001;

const MIZUKI_BOT_NOTIFY_URL = process.env.MIZUKI_BOT_NOTIFY_URL; 
const MIZUKI_SHARED_SECRET = process.env.MIZUKI_SHARED_SECRET || "default_secret_key_for_mizuki";
const EXCLUDED_IPS_RAW = process.env.EXCLUDED_IPS || ""; // Them bien moi cho server
const EXCLUDED_IPS_FOR_INTERACTION_LOG = EXCLUDED_IPS_RAW.split(',').map(ip => ip.trim()).filter(ip => ip);


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
        console.error('🔴 Spotify ID/Secret chưa set.');
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
        tokenExpiryTime = Date.now() + (response.data.expires_in * 1000) - 60000; 
        console.log('✨ Spotify Token lấy xong!');
        return spotifyAccessToken;
    } catch (error) {
        console.error('🔴 Lỗi lấy Spotify token:', error.response ? error.response.data : error.message);
        throw new Error('Lỗi lấy Spotify access token.');
    }
}

initializeDb().then(() => {
    app.listen(PORT, '0.0.0.0', () => { 
        console.log(`🚀 Server đang chạy trên port: ${PORT}`);
        console.log(`Backend API: http://localhost:${PORT} (local) / URL Railway.`);
    });
}).catch(err => {
  console.error("🔴 Khởi tạo DB thất bại:", err);
  process.exit(1);
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
    console.error('🔴 Lỗi fetch guestbook:', error);
    res.status(500).json({ error: 'Lỗi lấy data guestbook' });
  }
});

app.post('/api/guestbook', async (req, res) => {
  const { name, message, language } = req.body;

  if (!name || name.trim() === "" || !message || message.trim() === "" || !language) {
    let missingFields = [];
    if (!name || name.trim() === "") missingFields.push("Name");
    if (!message || message.trim() === "") missingFields.push("Message");
    if (!language) missingFields.push("Language");
    const errorMsg = `${missingFields.join(', ')} không được trống.`;
    return res.status(400).json({ error: errorMsg });
  }

  const validLanguages = ['vi', 'en', 'ja'];
  if (!validLanguages.includes(language.toLowerCase())) {
      return res.status(400).json({ error: `Code ngôn ngữ sai. Phải là: ${validLanguages.join(', ')}.` });
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
    console.log("✨ Entry mới:", newEntry);
    res.status(201).json(newEntry);
  } catch (error) {
    console.error('🔴 Lỗi thêm entry guestbook:', error);
    res.status(500).json({ error: 'Lỗi server khi thêm entry. Thử lại.' });
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
        console.error('🔴 Lỗi lấy Spotify playlists:', error.message);
        if (error.message.includes('Spotify API creds missing')) {
             res.status(503).json({ error: 'Spotify service lỗi (config).' });
        } else if (error.message.includes('Lỗi lấy Spotify access token')) {
             res.status(503).json({ error: 'Spotify service lỗi (auth).' });
        } else {
             res.status(500).json({ error: 'Lỗi lấy Spotify playlists.' });
        }
    }
});

// Endpoint nhận tbáo visit từ frontend
app.post('/api/notify-visit', async (req, res) => {
    const clientIp = req.headers['x-forwarded-for']?.split(',').shift() || req.socket?.remoteAddress;
    const userAgent = req.headers['user-agent'];

    console.log(`[VISIT] Lượt truy cập từ IP: ${clientIp}, User-Agent: ${userAgent}`);

    if (!MIZUKI_BOT_NOTIFY_URL) {
        console.warn("⚠️ MIZUKI_BOT_NOTIFY_URL chưa dc cfg. Ko thể gửi tbáo.");
        return res.status(202).json({ message: "Visit logged, notification to bot disabled." });
    }

    let locationInfo = "Ko xác định";
    let country = "N/A";
    let city = "N/A";
    let region = "N/A";
    let isp = "N/A";

    if (clientIp && clientIp !== "::1" && !clientIp.startsWith("127.0.0.1") && !EXCLUDED_IPS_FOR_INTERACTION_LOG.includes(clientIp)) { 
        try {
            const geoResponse = await axios.get(`http://ip-api.com/json/${clientIp}?fields=status,message,country,countryCode,regionName,city,isp,query`);
            if (geoResponse.data && geoResponse.data.status === 'success') {
                country = geoResponse.data.country || "N/A";
                city = geoResponse.data.city || "N/A";
                region = geoResponse.data.regionName || "N/A";
                isp = geoResponse.data.isp || "N/A";
                locationInfo = `${city}, ${region}, ${country} (ISP: ${isp})`;
            } else {
                locationInfo = `Ko lấy dc ttin vị trí (ip-api: ${geoResponse.data.message || 'lỗi ko rõ'})`;
                console.warn(`[GeoIP] Lỗi từ ip-api.com cho IP ${clientIp}:`, geoResponse.data.message);
            }
        } catch (geoError) {
            console.error(`[GeoIP] Lỗi gọi API GeoIP cho IP ${clientIp}:`, geoError.message);
            locationInfo = "Lỗi lấy ttin vị trí.";
        }
    } else if (EXCLUDED_IPS_FOR_INTERACTION_LOG.includes(clientIp)){ // Check neu IP nam trong list loai tru
        locationInfo = "IP ngoại lệ, không gửi DM." 
    }
     else {
        locationInfo = "Truy cập từ Localhost.";
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
        await axios.post(MIZUKI_BOT_NOTIFY_URL, visitData, {
            headers: {
                'Content-Type': 'application/json',
                'X-Mizuki-Secret': MIZUKI_SHARED_SECRET 
            }
        });
        console.log("✅ Tbáo visit đã gửi tới bot Mizuki.");
        res.status(200).json({ message: "Notification sent to bot." });
    } catch (botError) {
        console.error("🔴 Lỗi gửi tbáo tới bot Mizuki:", botError.response ? botError.response.data : botError.message);
        res.status(500).json({ error: "Failed to notify bot." });
    }
});

// API ENDPOINT MOI CHO LOG INTERACTION
app.post('/api/log-interaction', async (req, res) => {
    const clientIp = req.headers['x-forwarded-for']?.split(',').shift() || req.socket?.remoteAddress;
    const userAgent = req.headers['user-agent'];
    const { eventType, eventData, timestamp: clientTimestamp } = req.body;

    // console.log(`[INTERACTION_LOG] Received: ${eventType} from IP: ${clientIp}`, eventData); // Co the comment out

    if (!MIZUKI_BOT_NOTIFY_URL) {
        console.warn("⚠️ MIZUKI_BOT_NOTIFY_URL chưa dc cfg. Ko thể gửi log tương tác.");
        return res.status(202).json({ message: "Interaction logged by server, notification to bot disabled." });
    }

    let locationInfo = "Ko xác định";
    let country = "N/A";
    let city = "N/A";
    let region = "N/A";
    let isp = "N/A";

    if (clientIp && clientIp !== "::1" && !clientIp.startsWith("127.0.0.1") && !EXCLUDED_IPS_FOR_INTERACTION_LOG.includes(clientIp)) { 
        try {
            const geoResponse = await axios.get(`http://ip-api.com/json/${clientIp}?fields=status,message,country,countryCode,regionName,city,isp,query`);
            if (geoResponse.data && geoResponse.data.status === 'success') {
                country = geoResponse.data.country || "N/A";
                city = geoResponse.data.city || "N/A";
                region = geoResponse.data.regionName || "N/A";
                isp = geoResponse.data.isp || "N/A";
                locationInfo = `${city}, ${region}, ${country} (ISP: ${isp})`;
            } else {
                locationInfo = `Ko lấy dc ttin vị trí (ip-api: ${geoResponse.data.message || 'lỗi ko rõ'})`;
            }
        } catch (geoError) {
            console.error(`[GeoIP INTERACTION] Lỗi gọi API GeoIP cho IP ${clientIp}:`, geoError.message);
            locationInfo = "Lỗi lấy ttin vị trí.";
        }
    } else if (EXCLUDED_IPS_FOR_INTERACTION_LOG.includes(clientIp)){
        locationInfo = "IP ngoại lệ, không gửi DM log." 
    } else {
        locationInfo = "Truy cập từ Localhost.";
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
        await axios.post(`${MIZUKI_BOT_NOTIFY_URL}/log-interaction`, interactionPayload, { // Endpoint moi cua Mizuki
            headers: {
                'Content-Type': 'application/json',
                'X-Mizuki-Secret': MIZUKI_SHARED_SECRET 
            }
        });
        // console.log("✅ Log tương tác đã gửi tới bot Mizuki."); // Co the comment out
        res.status(200).json({ message: "Interaction logged and notification sent to bot." });
    } catch (botError) {
        console.error("🔴 Lỗi gửi log tương tác tới bot Mizuki:", botError.response ? botError.response.data : botError.message);
        res.status(500).json({ error: "Failed to notify bot of interaction." });
    }
});

// Route kiểm tra sức khỏe
app.get('/health', (req, res) => {
  res.status(200).send('Server is healthy! Rin cute <3');
});

// Fallback route
app.use((req, res) => {
    res.status(404).json({ error: 'Not Found. API paths: /api/guestbook, /api/spotify/playlists, /api/notify-visit, /api/log-interaction' });
});