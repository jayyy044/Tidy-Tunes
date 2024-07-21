const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const playlistSchema = new Schema({
    playlistName: {
        type: String,
        required: true
    },
    playlistId: {
        type:String,
        required: true
    },
    RecentlyPlayed: {
        type: [String],
        default: []
    },
    RecentlySkipped: {
        type: [String],
        default: []
    }
}, { _id: false });

const UserPlaylistSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    playlists: {
        type:[playlistSchema],
        required : true
    }
}, { timestamps: true });

module.exports = mongoose.model('UserPlaylist', UserPlaylistSchema);
