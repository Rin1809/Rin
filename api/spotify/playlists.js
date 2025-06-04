// api/spotify/playlists.js
import axiosPkg from 'axios';
const { default: axios } = axiosPkg;

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

    if (!SPOTIFY_CLIENT_ID) {
        console.error('SRVLS_SPOTIFY_FATAL: SPOTIFY_CLIENT_ID env var is not set on Vercel.'); // log
        throw new Error('Spotify API creds missing (ID).');
    }
    if (!SPOTIFY_CLIENT_SECRET) {
        console.error('SRVLS_SPOTIFY_FATAL: SPOTIFY_CLIENT_SECRET env var is not set on Vercel.'); // log
        throw new Error('Spotify API creds missing (Secret).');
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
        // console.log('SRVLS_SPOTIFY_INFO: Token obtained.'); // log
        return spotifyAccessToken;
    } catch (error) {
        const errorDetails = error.response ? JSON.stringify(error.response.data) : error.message;
        console.error(`SRVLS_SPOTIFY_TOKEN_ERROR: Error getting Spotify token: ${errorDetails}`, error.stack); // log
        throw new Error('Loi lay Spotify access token.');
    }
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
        // console.log('SRVLS_SPOTIFY_INFO: Handler called, attempting to get token and playlists...'); // log
        const token = await getSpotifyTokenInternal();
        // console.log('SRVLS_SPOTIFY_INFO: Token ready, fetching playlists...'); // log
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

        // console.log('SRVLS_SPOTIFY_INFO: Playlists fetched successfully.'); // log
        res.status(200).json(playlistsData);
    } catch (error) {
        const errorMessage = error.message || 'Unknown error';
        console.error(`SRVLS_SPOTIFY_HANDLER_ERROR: Error fetching Spotify playlists: ${errorMessage}`, error.stack); // log

        if (errorMessage.includes('Spotify API creds missing')) {
             res.status(503).json({ error: 'Spotify service loi (config).' });
        } else if (errorMessage.includes('Loi lay Spotify access token')) {
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