// api/spotify/playlists.js
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

    if (!SPOTIFY_CLIENT_ID) {
        // Log loi cho ca local va Vercel
        console.error('SRVLS_SPOTIFY_FATAL: SPOTIFY_CLIENT_ID env var is not set. Check .env file or Vercel config.');
        throw new Error('Spotify API creds missing (ID).');
    }
    if (!SPOTIFY_CLIENT_SECRET) {
        console.error('SRVLS_SPOTIFY_FATAL: SPOTIFY_CLIENT_SECRET env var is not set. Check .env file or Vercel config.');
        throw new Error('Spotify API creds missing (Secret).');
    }

    try {
        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + (Buffer.from(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET).toString('base64'))
            },
            body: 'grant_type=client_credentials'
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: `Spotify token API responded with status ${response.status}` }));
            console.error(`SRVLS_SPOTIFY_TOKEN_ERROR: Spotify token API error: ${response.status}`, errorData);
            throw new Error('Loi lay Spotify access token.');
        }

        const data = await response.json();
        spotifyAccessToken = data.access_token;
        tokenExpiryTime = Date.now() + (data.expires_in * 1000) - 60000;
        return spotifyAccessToken;
    } catch (error) {
        console.error(`SRVLS_SPOTIFY_TOKEN_ERROR: Error getting Spotify token: ${error.message}`, error.stack);
        throw new Error('Loi lay Spotify access token.');
    }
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
        const token = await getSpotifyTokenInternal();
        const playlistPromises = MY_SPOTIFY_PLAYLIST_IDS.map(async (id) => {
            const playlistResponse = await fetch(`https://api.spotify.com/v1/playlists/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!playlistResponse.ok) {
                const errorData = await playlistResponse.json().catch(() => ({ message: `Spotify playlist API for ${id} responded with status ${playlistResponse.status}` }));
                console.error(`SRVLS_SPOTIFY_PLAYLIST_ERROR: Error fetching playlist ${id}: ${playlistResponse.status}`, errorData);
                return { error: true, id, status: playlistResponse.status, data: errorData };
            }
            return playlistResponse.json();
        });

        const playlistResponsesData = await Promise.all(playlistPromises);

        const playlistsData = playlistResponsesData
            .filter(data => data && !data.error)
            .map(data => ({
                id: data.id,
                name: data.name,
                description: data.description,
                imageUrl: data.images && data.images.length > 0 ? data.images[0].url : null,
                externalUrl: data.external_urls.spotify,
                owner: data.owner.display_name
            }));
        
        const erroredPlaylists = playlistResponsesData.filter(data => data && data.error);
        if (erroredPlaylists.length > 0) {
            console.warn(`SRVLS_SPOTIFY_PARTIAL_ERROR: Failed to fetch some playlists:`, erroredPlaylists);
        }

        res.status(200).json(playlistsData);
    } catch (error) {
        const errorMessage = error.message || 'Unknown error';
        console.error(`SRVLS_SPOTIFY_HANDLER_ERROR: Error fetching Spotify playlists: ${errorMessage}`, error.stack);

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