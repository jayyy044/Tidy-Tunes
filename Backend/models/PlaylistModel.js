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
    playlistData: {
        type: Array,
        default: []
    },
    totalTracks: {
        type: Number,
        default: 0
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

module.exports = mongoose.model('User_Playlist', UserPlaylistSchema);
