// api/notify-visit.js
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

    if (!MIZUKI_BOT_BASE_URL) {
        return res.status(202).json({ message: "Visit logged, notification to bot disabled." });
    }

    let locationInfo = "Ko xac dinh";
    let country = "N/A";
    let city = "N/A";
    let region = "N/A";
    let isp = "N/A";

    if (clientIp && clientIp !== "::1" && !clientIp.startsWith("127.0.0.1") && !EXCLUDED_IPS_FOR_LOGGING.includes(clientIp)) {
        try {
            const geoApiResponse = await fetch(`http://ip-api.com/json/${clientIp}?fields=status,message,country,countryCode,regionName,city,isp,query`);
            const geoData = await geoApiResponse.json();
            if (geoApiResponse.ok && geoData && geoData.status === 'success') {
                country = geoData.country || "N/A";
                city = geoData.city || "N/A";
                region = geoData.regionName || "N/A";
                isp = geoData.isp || "N/A";
                locationInfo = `${city}, ${region}, ${country} (ISP: ${isp})`;
            } else {
                locationInfo = `Ko lay dc ttin vi tri (ip-api: ${geoData.message || 'loi ko ro'})`;
            }
        } catch (geoError) {
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

        const botResponse = await fetch(`${notifyVisitUrl}/notify-visit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Mizuki-Secret': MIZUKI_SHARED_SECRET
            },
            body: JSON.stringify(visitData)
        });
        if (!botResponse.ok) {
            const errorText = await botResponse.text();
            // log chi tiet hon de debug loi 404
            console.error(`Srvls: Loi gui tbao den bot Mizuki (${botResponse.status}). URL: ${notifyVisitUrl}/notify-visit. Resp: ${errorText}`);
            throw new Error(`Failed to notify bot: ${botResponse.status}`);
        }
        res.status(200).json({ message: "Notification sent to bot." });
    } catch (botError) {
        res.status(500).json({ error: "Failed to notify bot." });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}