const express = require('express');
const router = express.Router();
const AuthenticateToken = require('../middleware/AuthenticateToken');

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
} = require('../controller/SearchDataController')


router.use(AuthenticateToken);
router.get('/playlist', getPlaylistInfo)
router.post('/updateplaylist', updatePlaylistdata)
router.post('/recentlyadded', getRecentlyAdded)
router.get('/changeplaylist', changeplaylist)
router.get('/RecentlyPlayed', getRecentlyPlayed)
router.get('/songanalysis', getsonganalysis)
router.get('/delete', deleteTrack)
router.get('/searchitem', searchitem )
router.post('/analyzetrack', TrackAnalyzer )
router.post('/analyzealbum', AlbumAnalyzer )
module.exports = router;