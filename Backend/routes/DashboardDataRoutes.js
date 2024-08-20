const express = require('express');
const router = express.Router();
const {
    getTopArtists_Genres,
    getTopTracks,
    getTopAlbums
} = require('../controller/DashboardDataController')
//add middle ware to check for checking existance of spotify acces token
const AuthenticateToken = require('../middleware/AuthenticateToken');
const AuthenticateSAT = require('../middleware/AuthenticateSpotifyToken')

router.use(AuthenticateToken);
router.use(AuthenticateSAT)
router.get('/TopTracks/', getTopTracks)
router.get('/TopArtists/', getTopArtists_Genres)
router.get('/TopAlbums', getTopAlbums)

module.exports = router;