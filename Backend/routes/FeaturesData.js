const express = require('express');
const router = express.Router();
const AuthenticateToken = require('../middleware/AuthenticateToken');

const {
    getPlaylistInfo,
    getPlaylistTracks
} = require('../controller/FeaturesDataController')

router.use(AuthenticateToken);
router.get('/playlist', getPlaylistInfo)
router.get('/playlistTracks', getPlaylistTracks)

module.exports = router;