// api/spotify/playlists.js
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

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

async function getSpotifyTokenInternal() {
    if (spotifyAccessToken && Date.now() < tokenExpiryTime) {
        return spotifyAccessToken;
    }

    if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
        console.error('Srvls: Spotify ID/Secret chua set.');
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
        console.error('Srvls: Loi lay Spotify token:', error.response ? error.response.data : error.message);
        throw new Error('Loi lay Spotify access token.');
    }
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
        const token = await getSpotifyTokenInternal();
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
        console.error('Srvls: Loi lay Spotify playlists:', error.message);
        if (error.message.includes('Spotify API creds missing')) {
             res.status(503).json({ error: 'Spotify service loi (config).' });
        } else if (error.message.includes('Loi lay Spotify access token')) {
             res.status(503).json({ error: 'Spotify service loi (auth).' });
        } else {
             res.status(500).json({ error: 'Loi lay Spotify playlists.' });
        }
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}