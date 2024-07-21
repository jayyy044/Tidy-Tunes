const cron = require('node-cron');
const User = require('../models/UserModel');
const mongoose = require('mongoose');

const getPlaylistInfo = async (req, res) => {
    const { SAT, email } = req.query;

    if (!SAT || !email) {
        console.log("Either the Spotify Access token was not received: ", SAT,
            "or the user email wasn't: ", email);
        res.json({ error: 'There was an error receiving either the user email or Spotify access token' });
        return;
    }

    const user = await User.findOne({ email });
    if (!user) {
        console.log("Error finding user");
        return res.status(404).json({ error: 'Failed to find user, invalid email' });
    }
    if(!user.playlistsongs) {
        try {
            const response = await fetch(process.env.API_BASE_URL + 'me', {
                headers: { 'Authorization': `Bearer ${SAT}` }
            });
            const data = await response.json();
            
            if (!response.ok) {
                console.log("Error fetching user");
                return res.status(404).json({ error: 'Failed to fetch Spotify user' });
            }
            
            const response2 = await fetch(process.env.API_BASE_URL + 'me/playlists?limit=50&offset=0', {
                headers: { 'Authorization': `Bearer ${SAT}` }
            });
            const data2 = await response2.json();
            
            if (!response2.ok) {
                console.log("Error fetching user playlists");
                return res.status(404).json({ error: 'Failed to fetch user playlists' });
            }
    
            console.log('Users Playlists received');
            const PlaylistObj = data2.items.map(playlist => ({
                Id:playlist.id,
                Image: playlist.images[0].url,
                Name: playlist.name,
                Owner: playlist.owner.display_name,
                TotalTracks: playlist.tracks.total
            }));
            // const databasePlaylistObj = data2.items.map()
            const filteredPlaylists = PlaylistObj.filter(playlist => playlist.Owner === data.display_name);
            const information = {
                filteredPlaylists,
                message: ''
            }
            return res.json({ information });
        } catch (error) {
            console.log("An Error Occurred", error.message);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }
    else{
        const information = {
            filteredPlaylists: [],
            message: 'Playlist Already Received'
        }
        return res.json({ information })
    }
   
};

const getPlaylistTracks = async (req, res) => {
    const { SAT, Info } = req.query;
    const JSONparsedInfo = JSON.parse(Info)
    if (!SAT || !Info) {
        console.log("Either the Spotify Access token was not received: ", SAT,
            "or the playlist Info wasn't: ", Info);
        res.json({ error: 'There was an error receiving either the playlist Info or Spotify access token' });
        return;
    }   
    try {
        const playlistTracks = await Promise.all(JSONparsedInfo.map(async (playlist) => {
            const offset = Math.max(playlist.TotalTracks - 5, 0); // Calculate offset for the last 10 tracks
            const response = await fetch(`${process.env.API_BASE_URL}playlists/${playlist.Id}/tracks?limit=5&offset=${offset}&fields=items(track(name,artists(name),album(images(url))))`, {
                headers: { 'Authorization': `Bearer ${SAT}` }
            });
            
            if (!response.ok) {
                console.log("Error fetching recently added tracks for playlist:", playlist.Id);
                return { error: 'Failed to fetch recently added tracks' };
            }

            const data = await response.json();
            return data.items.map(item => ({
                playlistName: playlist.name,
                trackTitle: item.track.name,
                artistName: item.track.artists.map(artist => artist.name).join(', '),
                imageUrl: item.track.album.images[0].url,
            })).reverse();
        }));
        console.log("Recently Added tracks recieved")
        const validTracks = playlistTracks.flat()
        res.json(validTracks);
    }
    catch(error){
        console.log("An error occured while fetching recent tracks: ", error.message)
        res.status(500).json({ error: 'An error occurred while fetching the playlist tracks' });
    }
}

module.exports = {
    getPlaylistInfo,
    getPlaylistTracks
};

