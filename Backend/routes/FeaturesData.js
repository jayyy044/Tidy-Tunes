const express = require('express');
const router = express.Router();
const AuthenticateToken = require('../middleware/AuthenticateToken');

const {
    getPlaylistInfo,
    getPlaylistTracks,
    getRecentlyPlayed
} = require('../controller/PlaylistRecentsController')

const {
    getsonganalysis,
    deleteTrack
} = require('../controller/SongComparisonController')

const {
    searchitem,
} = require('../controller/SearchDataController')

router.use(AuthenticateToken);
router.get('/playlist', getPlaylistInfo)
router.get('/playlistTracks', getPlaylistTracks)
router.get('/RecentlyPlayed', getRecentlyPlayed)
router.get('/songanalysis', getsonganalysis)
router.get('/delete', deleteTrack)
router.get('/searchitem', searchitem )
module.exports = router;