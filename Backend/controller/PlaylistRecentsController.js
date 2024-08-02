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

    const user = await UserModel.findOne({ email })
    if(!user){
        console.log("Error finding user");
        return res.status(404).json({ error: 'Failed to find user, invalid email' });
    }
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
        const playlistModelformat = {
                email,
                playlists: filteredPlaylists.map(playlist => ({
                    playlistName: playlist.Name,
                    playlistId: playlist.Id,
                }))
            }
        if(!userPlaylist){
            const playlistsaved = await PlaylistModel.create(playlistModelformat)
            console.log("New playlist information saved", playlistsaved)
        }
        const existingPlaylistNames = new Set(userPlaylist.playlists.map(playlist => playlist.playlistName));
        const newPlaylists = filteredPlaylists.filter(playlist => !existingPlaylistNames.has(playlist.Name));
        if(newPlaylists.length > 0){
            const updatedPlaylists = [...userPlaylist.playlists, ...newPlaylists.map(playlist => ({
                playlistName: playlist.Name,
                playlistId: playlist.Id,
            }))];

            const filter = { email: email };
            const update = { $set: { playlists: updatedPlaylists } };
            const options = { new: true };

            const playlistsaved = await PlaylistModel.findOneAndUpdate(filter, update, options);
            const playlistNames = playlistsaved.playlists.map(playlist => playlist.playlistName);
            console.log("Updated Playlist: ", playlistNames);
        }
        return res.json(filteredPlaylists);
    }
    catch (error) {
        console.log("An Error Occurred", error.message);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

const getPlaylistTracks = async (req, res) => {
    const { SAT, Info, email } = req.query;
    let offset;
    let matchedPlaylist
    const parsedInfo = JSON.parse(Info)
    if (!SAT || !Info || !email) {
        console.log("Something is missing from the reqeust");
        console.log("This is SAT:", SAT)
        console.log('This is the Playlist Info', Info)
        console.log("This is the user Email", email)
        res.status(404).json({ error: 'There was an error receiving one of the request parameters' });
        return;
    }
    try{
        const playlistExistsCheck  = await fetch(process.env.API_BASE_URL + 'me/playlists?limit=50&offset=0', {
            headers: { 'Authorization': `Bearer ${SAT}` }
        });
        const CheckedData = await playlistExistsCheck.json();
        
        if (!playlistExistsCheck.ok) {
            console.log("Error fetching user playlists");
            return res.status(404).json({ error: 'Failed to fetch user playlists' });
        }
        console.log('Users Playlists received');
        const PlaylistObj = CheckedData.items.map(playlist => ({
            Id:playlist.id,
            TotalTracks: playlist.tracks.total,
            Image: playlist.images[0].url,
        }));
        const playlistExists = PlaylistObj.some(playlist => playlist.Id === parsedInfo.PlaylistId);

        if (!playlistExists) {
            const user = await UserModel.findOne({email});
            if (!user) {
                console.log("Error finding user");
                return res.status(404).json({ error: 'Failed to find user, invalid email' });
            }
            user.playlistId = ''; 
            await user.save(); 
            const User_Playlist = await PlaylistModel.findOneAndUpdate(
                { email },
                { $pull: { playlists: {  playlistId: parsedInfo.PlaylistId } } },
                { new: true } 
            );
            if (!User_Playlist) {
                console.log("Error finding user playlist");
                return res.status(404).json({ error: 'Failed to find user playlist' });
            }
            console.log("Playlist deleted successfully");
            return res.status(200).json({ message: 'Playlist deleted successfully' });

        }

        matchedPlaylist = PlaylistObj.find(playlist => playlist.Id === parsedInfo.PlaylistId);
        if (matchedPlaylist) {
            parsedInfo.totalTracks = matchedPlaylist.TotalTracks;
        } 
    }
    catch(error){
        console.log("There was an error with the playlistId verification process: ",error.message)
        return res.json({error: "There was an error with the playlistId verification process"})
    }
    offset = Math.max(parsedInfo.totalTracks - 5, 0)
    if(offset<5){
        offset = 0 
    }
    const user = await UserModel.findOne({email});
    if (!user) {
        console.log("Error finding user");
        return res.status(404).json({ error: 'Failed to find user, invalid email' });
    }
    if(user.playlistId !== parsedInfo.playlistId){
        user.playlistId = parsedInfo.PlaylistId;
        user.playlistName = parsedInfo.PlaylistName
        await user.save();
        console.log("User's Playlist Id set:", user.playlistId);
        console.log("User's Playlist Name set:", user.playlistName);
    }
    try {
        const response = await fetch(`${process.env.API_BASE_URL}playlists/${parsedInfo.PlaylistId}/tracks?limit=5&offset=${offset}&fields=items(added_at,track(name,album(images,url),artists(name,id)))`, {
            headers: { 'Authorization': `Bearer ${SAT}` }
        });
        if (!response.ok) {
            console.log("Error fetching recently added tracks for playlist:", parsedInfo.PlaylistId);
            return { error: 'Failed to fetch recently added tracks' };
        }
        const data = await response.json()
        console.log("Recently added track for playlist recieved")


        const recentTracks = data.items.map(item => ({
            addedAt: item.added_at,
            trackName: item.track.name,
            artistName: item.track.artists.map(artist => artist.name).join(', '),
            trackImage: item.track.album.images[0]?.url,
            id: item.track.artists[0].id,
            mainArtist: item.track.artists[0]?.name
        })).reverse();


        const AddArtistImage = async (tracks) => {
        return Promise.all(tracks.map(async (track) => {
            const response = await fetch(`${process.env.API_BASE_URL}artists/${track.id}`, {
                headers: { 'Authorization': `Bearer ${SAT}` }
            });
            const { images, followers, genres } = await response.json();
            if(!response.ok){
                console.log("Error Fetching artist image")
                return res.status(404).json({error: "Error fetching artist image"})
            }
            return {
                ...track,
                artistImage: images[0]?.url,
                artistFollowers: followers.total,
                artistGenres: genres
            };
        }));
        };
        const updatedTracks = await AddArtistImage(recentTracks);
        const recentlyAddedTrackNames = updatedTracks.map(track => track.trackName)
        console.log("Recently Added Tracks", recentlyAddedTrackNames)
        // AddArtistImage(recentTracks).then(data => console.log("Updated Tracks" ,data));



        const user = await UserModel.findOne({ email })
        if(user){
            const username = user.username
            if(matchedPlaylist){
                const Info_Obj = {
                    username: username,
                    playlistImage: matchedPlaylist.Image,
                    totalTracks:matchedPlaylist.TotalTracks,
                    recentTracks: updatedTracks
                }
                return res.json(Info_Obj)
            }
        }
    }
    catch(error){
        console.log("An error occured while fetching recent tracks: ", error.message)
        res.status(500).json({ error: 'An error occurred while fetching the playlist tracks' });
    }
}

const getRecentlyPlayed = async (req, res) => {
    const { SAT } = req.query;
    if (!SAT) {
        console.log("Something is missing from the reqeust");
        console.log("This is SAT:", SAT)
        res.status(404).json({ error: 'There was an error receiving one of the request parameters' });
        return;
    }
    const now = new Date();
    const currentTime = now.getTime();
    console.log("TIME", currentTime)
    try {     
        const response = await fetch(`https://api.spotify.com/v1/me/player/recently-played?limit=5&before=${currentTime}`, {
            headers: {'Authorization': `Bearer ${SAT}`}
        });
        const data = await response.json()
        if(!response.ok){
            console.log("There was an error in recieving the recently played tracks")
            res.status(404).json({error: "Error fetching recently played tracks"})
        }
        const tracks = data.items.map(item => ({
            track: item.track.name,
            artist: item.track.artists.map(artist => artist.name).join(', '),
            trackImg: item.track.album.images[0].url,
            played_at: item.played_at
        }));
        const newNow = new Date()
        const current = newNow.getTime();
        tracks.forEach(track => {
            const playedAt = new Date(track.played_at).getTime();
            const differenceInMilliseconds = current - playedAt;
            const differenceInMinutes = Math.floor(differenceInMilliseconds / 60000);
      
            let timeAgo;
            if (differenceInMinutes < 1) {
              timeAgo = "just now";
            } else if (differenceInMinutes < 30) {
              timeAgo = `${differenceInMinutes} minute${differenceInMinutes > 1 ? 's' : ''} ago`;
            } else if (differenceInMinutes < 60) {
              timeAgo = "30 minutes ago";
            } else if (differenceInMinutes < 120) {
              timeAgo = "1 hour ago";
            } else {
              timeAgo = "over an hour ago";
            }
      
            track.time_ago = timeAgo; 
          });
        console.log("We got recently played tracks")
        res.status(200).json(tracks)
    }
    catch(error){
        console.log("Error occured when trying to fetch recently played:", error.message)
        res.status(404).json({error: "There was an error when trying to fetch recently played tracks"})
    }
}

module.exports = {
    getPlaylistInfo,
    getPlaylistTracks,
    getRecentlyPlayed
};
