const express = require('express');
const router = express.Router();
const AuthenticateToken = require('../middleware/AuthenticateToken');

const {
    getPlaylistInfo,
    getPlaylistTracks,
    getRecentlyPlayed
} = require('../controller/PlaylistRecentsController')

const {
    getTop100
} = require('../controller/SongAnalysisController')

router.use(AuthenticateToken);
router.get('/playlist', getPlaylistInfo)
router.get('/playlistTracks', getPlaylistTracks)
router.get('/Top100', getTop100)
router.get('/RecentlyPlayed', getRecentlyPlayed)

module.exports = router;