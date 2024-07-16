const express = require('express');
const router = express.Router();
const {
    SpotifyAuthUrl,
    SpotifyTokens
}= require('../controller/AuthSpotifyTokenController');
const AuthenticateToken = require('../middleware/AuthenticateToken');

// Use the middleware to protect this route
router.get('/AccessToken', SpotifyTokens)
router.use(AuthenticateToken);
router.get('/AuthCodeUrl', SpotifyAuthUrl)


module.exports = router;
