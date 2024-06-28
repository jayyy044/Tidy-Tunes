const express = require('express');
const router = express.Router();
const {
    AuthPage,
    SpotifyAccess
}= require('../controller/AuthController');
const authorizeToken = require('../middleware/AuthenticateToken');

// Use the middleware to protect this route
router.use(authorizeToken);
router.get('/', AuthPage);
router.get('/spotify', SpotifyAccess)


module.exports = router;
