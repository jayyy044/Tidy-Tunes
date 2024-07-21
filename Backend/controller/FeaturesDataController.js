const cron = require('node-cron');
const UserModel = require('../models/UserModel');
const PlaylistModel = require('../models/PlaylistModel')
const mongoose = require('mongoose');

const getPlaylistInfo = async (req, res) => {
    const { SAT, email } = req.query;
    if (!SAT || !email) {
        console.log("Something is missing from the reqeust");
        console.log("This is SAT:", SAT)
        console.log("This is the user Email", email)
        res.json({ error: 'There was an error receiving one of the request parameters' });
        return;
    }
    const user = await UserModel.findOne({ email });
    if (!user) {
        console.log("Error finding user");
        return res.status(404).json({ error: 'Failed to find user, invalid email' });
    }
    else{
        try {
            const response = await fetch(process.env.API_BASE_URL + 'me', {
                headers: { 'Authorization': `Bearer ${SAT}` }
            });
            const data = await response.json();
            
            if (!response.ok) {
                console.log("Error fetching user");
                return res.status(404).json({ error: 'Failed to fetch Spotify user' });
            }

            console.log("Display Name recieved")

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
            const filteredPlaylists = PlaylistObj.filter(playlist => playlist.Owner === data.display_name);
            const userPlaylist = await PlaylistModel.findOne({email})
            if(!userPlaylist){
                const playlistModelformat = {
                    email,
                    playlists: filteredPlaylists.map(playlist => ({
                        playlistName: playlist.Name,
                        playlistId: playlist.Id,
                        RecentlyPlayed: [],
                        RecentlySkipped: []
                    }))
                }
                const playlistsaved = await PlaylistModel.create(playlistModelformat)
                console.log("dfad", playlistsaved)
            }
            return res.json(filteredPlaylists);
        }
        catch (error) {
            console.log("An Error Occurred", error.message);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }   
};

const getPlaylistTracks = async (req, res) => {
    const { SAT, Info, email } = req.query;
    let offset;
    const parsedInfo = JSON.parse(Info)
    if (!SAT || !Info || !email) {
        console.log("Something is missing from the reqeust");
        console.log("This is SAT:", SAT)
        console.log('This is the Playlist Info', Info)
        console.log("This is the user Email", email)
        res.json({ error: 'There was an error receiving one of the request parameters' });
        return;
    }
    if(!parsedInfo.TotalTracks){
        console.log("NO total tracks")
      try{
            const playlistCheck = await fetch(`${process.env.API_BASE_URL}playlists/${parsedInfo.PlaylistId}`,{
                headers:{'Authorization' : `Bearer ${SAT}`}
            })
            const playlistCheckData = await playlistCheck.json()
            console.log("DADA", playlistCheckData)
        }  
        catch(error){
            console.log("error BRO", error.message)
        }
    }
    else{
        offset = Math.max(parsedInfo.TotalTracks - 5, 0)
    }
    const user = await UserModel.findOne({email});
    if (!user) {
        console.log("Error finding user");
        return res.status(404).json({ error: 'Failed to find user, invalid email' });
    }
    else{
        user.playlistId = parsedInfo.PlaylistId;
        user.playlistName = parsedInfo.PlaylistName
        await user.save();
        console.log("User's Playlist Id set:", user.playlistId);
        console.log("User's Playlist Name set:", user.playlistName);

    }
    try {
        const response = await fetch(`${process.env.API_BASE_URL}playlists/${parsedInfo.PlaylistId}/tracks?limit=5&offset=${offset}&fields=items(track(name,album(images,url),artists(name)))`, {
            headers: { 'Authorization': `Bearer ${SAT}` }
        });
        if (!response.ok) {
            console.log("Error fetching recently added tracks for playlist:", parsedInfo.PlaylistId);
            return { error: 'Failed to fetch recently added tracks' };
        }
        const data = await response.json()
        console.log("Recently added track for playlist recieved")
        const Info_Obj = data.items.map(item => ({
            trackName: item.track.name,
            artistName: item.track.artists.map(artist => artist.name).join(', '),
            imageUrl: item.track.album.images[0]?.url
          })).reverse();
        return res.json(Info_Obj)
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
