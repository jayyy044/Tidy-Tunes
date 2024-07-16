const express = require('express');
const session = require('express-session');
const app = express();
const PORT = 3000; // Set your preferred port number

app.use(express.json());


const CLIENT_ID = "1be2c8d18d0d41988ee574c8ad08de04";
const CLIENT_SECRET = "ed6fc38fe26a416d9bebb0f1af7630ff";
const REDIRECT_URI = "http://localhost:3000/callback";

const AUTH_URL = "https://accounts.spotify.com/authorize";
const TOKEN_URL = 'https://accounts.spotify.com/api/token';
const API_BASE_URL = 'https://api.spotify.com/v1/';

app.get('/', (req, res) => {
    res.send('<a href="/login">Welcome to this</a>');
});

app.get('/login', (req, res) => {
    const scope = 'user-read-private user-read-email user-top-read'
    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      response_type: 'code',
      scope: scope,
      redirect_uri: REDIRECT_URI,
      show_dialog: true,
    });
    const authUrl = `${AUTH_URL}?${params.toString()}`;
    res.redirect(authUrl)
})

app.get('/callback', async (req, res) => {
    if (req.query.error) {
        console.log(`error: ${req.query.error}`);
        return res.status(400).json({ error: req.query.error });
    }

    const code = req.query.code;
    console.log(code)
    const req_body = new URLSearchParams({
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: REDIRECT_URI,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      }).toString();


    // const req_body = new URLSearchParams({
    //     grant_type: 'client_credentials',
    //     client_id: CLIENT_ID,
    //     client_secret: CLIENT_SECRET,
    // }).toString();

    try {
        const response = await fetch(TOKEN_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: req_body,
        });

        const data = await response.json();

        if (response.ok) {
            console.log("This is the data", data)
            const { access_token, refresh_token, expires_in } = data;

            // Store tokens and expiry in session or wherever appropriate

            console.log("Access Token:", access_token);
            return res.redirect('/playlists/'+ access_token);
        } else {
            console.log('Failed to fetch access token:', data.error);
            return res.status(response.status).json({ error: 'Failed to fetch access token' });
        }
    } catch (error) {
        console.error('Error fetching access token:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/playlists/:token', async (req, res) => {
    
    try {
        const token = req.params.token;
        const response = await fetch(API_BASE_URL + 'me/top/tracks?limit=10&&offset=0', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
    
        if (!response.ok) {
          // Handle error response from the Spotify API
          return res.status(response.status).json({ error: 'Failed to fetch playlists' });
        }
    
        const playlists = await response.json();
        const tracks = playlists.items.map(item => ({
          name: item.name,
          popularity: item.popularity
        }));

        res.json(tracks);
      } catch (error) {
        // Handle any other errors
        console.error('Error fetching playlists:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
      }

      



    // try {
    //     if (!req.session.access_token) {
    //         return res.status(401).json({ error: 'Access token not found' });
    //     }

    //     if (Date.now() > req.session.expires_at) {
    //         return res.redirect('/refresh-token'); // Redirect to refresh token route if token is expired
    //     }

    //     const headers = {
    //         'Authorization': `Bearer ${req.session.access_token}`,
    //     };

    //     const response = await fetch('https://api.spotify.com/v1/me/playlists', {
    //         headers: headers,
    //     });

    //     if (!response.ok) {
    //         throw new Error(`Failed to fetch playlists: ${response.statusText}`);
    //     }

    //     const playlists = await response.json();
    //     res.json(playlists);
    // } catch (error) {
    //     console.error('Error fetching playlists:', error);
    //     res.status(500).json({ error: 'Internal server error' });
    // }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

