const express = require('express');
const router = express.Router();
const AuthenticateToken = require('../middleware/AuthenticateToken');
const AuthenticateSAT = require('../middleware/AuthenticateSpotifyToken')

const {
    getPlaylistInfo,
    getRecentlyAdded,
    getRecentlyPlayed,
    updatePlaylistdata
} = require('../controller/PlaylistRecentsController')

const {
    getsonganalysis,
    deleteTrack,
    changeplaylist
} = require('../controller/SongComparisonController')

const {
    searchitem,
    TrackAnalyzer,
    AlbumAnalyzer,
    AddTrack
} = require('../controller/SearchDataController')


router.use(AuthenticateToken);
router.get('/changeplaylist', changeplaylist)
router.use(AuthenticateSAT)
router.get('/playlist', getPlaylistInfo)
router.post('/recentlyadded', getRecentlyAdded)
router.get('/songanalysis', getsonganalysis)
router.get('/updateplaylist', updatePlaylistdata)
router.get('/delete', deleteTrack)
router.get('/RecentlyPlayed', getRecentlyPlayed)
router.post('/addtrack', AddTrack)
router.get('/searchitem', searchitem )

// router.post('/analyzetrack', TrackAnalyzer )
// router.post('/analyzealbum', AlbumAnalyzer )
module.exports = router;