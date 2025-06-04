// api/log-interaction.js
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const MIZUKI_BOT_BASE_URL = process.env.MIZUKI_BOT_NOTIFY_URL;
const MIZUKI_SHARED_SECRET = process.env.MIZUKI_SHARED_SECRET || "default_secret_key_for_mizuki";
const EXCLUDED_IPS_RAW = process.env.EXCLUDED_IPS || "";
const EXCLUDED_IPS_FOR_LOGGING = EXCLUDED_IPS_RAW.split(',').map(ip => ip.trim()).filter(ip => ip);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const clientIp = req.headers['x-forwarded-for']?.split(',').shift() || req.socket?.remoteAddress;
    const userAgent = req.headers['user-agent'];
    const { eventType, eventData, timestamp: clientTimestamp } = req.body;

    if (!MIZUKI_BOT_BASE_URL) {
        // console.warn("Srvls: MIZUKI_BOT_BASE_URL chua cfg. Ko gui log tuong tac.");
        return res.status(202).json({ message: "Interaction logged, notification to bot disabled." });
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
            // console.error(`Srvls: [GeoIP INTERACTION] Loi goi API GeoIP cho IP ${clientIp}:`, geoError.message);
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
        // console.error("Srvls: Loi gui log tuong tac toi bot Mizuki:", botError.response ? botError.response.data : botError.message);
        res.status(500).json({ error: "Failed to notify bot of interaction." });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}