const express = require('express');
const router = express.Router();
const {
    getTopArtists_Genres,
    getTopTracks,
    getTopAlbums
} = require('../controller/AuthSpotifyDataController')
//add middle ware to check for checking existance of spotify acces token
const AuthenticateToken = require('../middleware/AuthenticateToken');

router.use(AuthenticateToken);
router.get('/TopTracks/', getTopTracks)
router.get('/TopArtists/:token', getTopArtists_Genres)
router.get('/TopAlbums', getTopAlbums)

module.exports = router;