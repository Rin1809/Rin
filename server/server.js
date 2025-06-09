// server/server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';


import spotifyPlaylistsHandler from '../api/spotify/playlists.js';
import guestbookHandler from '../api/guestbook.js';
import blogPostsHandler from '../api/blog/posts.js';
import healthHandler from '../api/health.js';
import logInteractionHandler from '../api/log-interaction.js';
import notifyVisitHandler from '../api/notify-visit.js';
import { initializeDb } from './db.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middlewares
app.use(cors()); 
app.use(express.json());


const run = (handler) => (req, res) => {

    if (!req.socket) {
        req.socket = { remoteAddress: '::1' };
    }
    handler(req, res);
};

initializeDb().then(() => {
    console.log("Database initialized for local server.");

    app.get('/api/health', run(healthHandler));
    
    app.get('/api/spotify/playlists', run(spotifyPlaylistsHandler));

    app.get('/api/guestbook', run(guestbookHandler));
    app.post('/api/guestbook', run(guestbookHandler));
    
    app.get('/api/blog/posts', run(blogPostsHandler));
    app.post('/api/blog/posts', run(blogPostsHandler));
    
    app.post('/api/log-interaction', run(logInteractionHandler));
    app.post('/api/notify-visit', run(notifyVisitHandler));

    app.get('/', (req, res) => {
      res.send('Local Rin Personal Card API Server is running! ✨');
    });

    app.listen(port, () => {
      console.log(`🚀 Server is listening at http://localhost:${port}`);
    });
}).catch(err => {
    console.error("Failed to initialize database. Server not started.", err);
    process.exit(1);
});

