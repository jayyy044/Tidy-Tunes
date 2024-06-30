const express = require('express');
const router = express.Router();
const {
    beginSpotifyAuth,
    SpotifyAuthUrl,
    SpotifyTokens
}= require('../controller/AuthController');
const authorizeToken = require('../middleware/AuthenticateToken');

// Use the middleware to protect this route
router.get('/', beginSpotifyAuth);
router.post('/accesstoken', SpotifyTokens)
router.use(authorizeToken);
router.get('/spotify', SpotifyAuthUrl)


module.exports = router;
