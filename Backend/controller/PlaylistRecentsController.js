const UserModel = require('../models/UserModel');
const PlaylistModel = require('../models/PlaylistModel')

const getPlaylistInfo = async (req, res) => {
    const { SAT, email } = req.query;
    if (!SAT || !email) {
        console.log("Something is missing from the reqeust");
        console.log("This is SAT:", SAT)
        console.log("This is the user Email", email)
        return res.status(404).json({ error: 'There was an error receiving one of the request parameters' });
        
    }
    const user = await UserModel.findOne({ email })
    if(!user){
        console.log("Error finding user");
        return res.status(404).json({ error: 'Failed to find user, invalid email' });
    }
    try {
        //Retrieving user's whole profile to retrieve their display name 
        const userprofile = await fetch(`${process.env.API_BASE_URL}me`, {
            headers: { 'Authorization': `Bearer ${SAT}` }
        });
        const userprofiledata = await userprofile.json();
        if (!userprofile.ok) {
            console.log("Response Error, failed to fetch user");
            return res.status(404).json({ error: 'Failed to fetch user, invalid email' });
        }
        console.log("Display Name recieved")

        //retrieving all of user's playlist
        const usersplaylists = await fetch(`${process.env.API_BASE_URL}me/playlists?limit=50&offset=0`, {
            headers: { 'Authorization': `Bearer ${SAT}` }
        });
        const usersplaylistdata = await usersplaylists.json();
        if (!usersplaylists.ok) {
            console.log("Error fetching user playlists");
            return res.status(404).json({ error: 'Failed to fetch user playlists' });
        }
        console.log('Users Playlists received');
        const PlaylistObj = usersplaylistdata.items.map(playlist => ({
            Id:playlist.id,
            Image: playlist.images[0].url,
            Name: playlist.name,
            Owner: playlist.owner.display_name,
            TotalTracks: playlist.tracks.total
        }));
        //Filtering out all playlist that aren't created by the owner 
        const filteredPlaylists = PlaylistObj.filter(playlist => playlist.Owner === userprofiledata.display_name);
        const storedPlaylists = await PlaylistModel.findOne({email})
        const playlistModelformat = {
                email,
                playlists: filteredPlaylists.map(playlist => ({
                    playlistName: playlist.Name,
                    playlistId: playlist.Id,
                }))
            }
        if(!storedPlaylists){
            const playlistsaved = await PlaylistModel.create(playlistModelformat)
            console.log("New playlist information saved", playlistsaved)
        }
        res.status(200).json(filteredPlaylists);
        // const existingPlaylistNames = new Set(storedPlaylists.playlists.map(playlist => playlist.playlistName));
        // const newPlaylists = filteredPlaylists.filter(playlist => !existingPlaylistNames.has(playlist.Name));
        // if(newPlaylists.length > 0){
        //     const updatedPlaylists = [...storedPlaylists.playlists, ...newPlaylists.map(playlist => ({
        //         playlistName: playlist.Name,
        //         playlistId: playlist.Id,
        //     }))];

        //     const filter = { email: email };
        //     const update = { $set: { playlists: updatedPlaylists } };
        //     const options = { new: true };

        //     const playlistsaved = await PlaylistModel.findOneAndUpdate(filter, update, options);
        //     const playlistNames = playlistsaved.playlists.map(playlist => playlist.playlistName);
        //     console.log("Updated Playlist: ", playlistNames);
        // }
        // return res.json(filteredPlaylists);
    }
    catch (error) {
        console.log("An Error Occurred", error.message);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

const updatePlaylistdata = async(req,res) => {
    const { SAT, email, Id } = req.body;
    if (!SAT || !email || !Id ) {
        console.log("Something is missing from the reqeust");
        console.log("This is SAT:", SAT)
        console.log("This is the user Email", email)
        console.log("This is the playlist id", Id)
        res.status(404).json({ error: 'There was an error receiving one of the request parameters' });
        return;
    }
    try{
        const user = await UserModel.findOne({ email })
        if(!user){
            console.log("Error finding user");
            return res.status(404).json({ error: 'Failed to find user, invalid email' });
        }
        user.playlistId = ''
        user.playlistName = ''
        await user.save()
        console.log(user, "Updated User profle")
        const updatedDocument = await PlaylistModel.findOneAndUpdate(
            { email }, 
            { $pull: { playlists: { playlistId: Id } }},
            { new: true } 
        )
        if (!updatedDocument) {
            console.log("Error finding user ");
            return res.status(404).json({ error: 'Failed to find user, invalid email' });
        }
        console.log(updatedDocument.playlists, "Updated User playlist data")
        res.status(200).json(true)
    }
    catch(error){
        console.log("Failed to update user's profile: ",error.message)
        return res.status(404).json({error: "Failed to upated user profile"})
    }
}




//User has now clicked on the playlis they want us to track so we are retrieving necessary information
const getRecentlyAdded = async (req, res) => {
    let playlistExists
    const { SAT, Info, email } = req.body;
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
            console.log("Response Error, failed to retrieve user playlists");
            return res.status(404).json({ error: 'Failed to fetch user playlists' });
        }
        console.log('Users Playlists received');

        const PlaylistObj = CheckedData.items.map(playlist => ({
            name:playlist.name,
            Id:playlist.id,
            TotalTracks: playlist.tracks.total,
            Image: playlist.images[0].url,
        }));
        playlistExists = PlaylistObj.find(playlist => playlist.Id === Info.PlaylistId);
        // if playlist doesn't exist we will remove it from everywhere
        if (!playlistExists) {
            const user = await UserModel.findOne({email});
            if (!user) {
                console.log("Error finding user");
                return res.status(404).json({ error: 'Failed to find user, invalid email' });
            }
            user.playlistId = ''; 
            user.playlistName = '';
            await user.save(); 
            const User_Playlist = await PlaylistModel.findOneAndUpdate(
                { email },
                { $pull: { playlists: {  playlistId: Info.PlaylistId } } },
                { new: true } 
            );
            if (!User_Playlist) {
                console.log("Error finding user playlist");
                return res.status(404).json({ error: 'Failed to find user playlist' });
            }
            console.log("Playlist deleted successfully");
            return res.status(200).json({ message: 'Playlist deleted successfully' });

        }
        Info.totaltracks = playlistExists.TotalTracks;
        console.log("Total Tracks:", Info.totaltracks)
    }
    catch(error){
        console.log("An error occured with playlist verification: ",error.message)
        return res.json({error: "playlist verification error"})
    }
    const offset = Math.max(Info.totaltracks - 5, 0)
    if(offset<5){
        offset = 0 
    }
    const user = await UserModel.findOne({email});
    if (!user) {
        console.log("Error finding user");
        return res.status(404).json({ error: 'Failed to find user, invalid email' });
    }
    if(user.playlistId !== Info.playlistId){
        user.playlistId = Info.PlaylistId;
        user.playlistName = Info.PlaylistName
        await user.save();
        console.log("User's Playlist Id set:", user.playlistId);
        console.log("User's Playlist Name set:", user.playlistName);
    }
    const storedplaylistdata = await PlaylistModel.findOne({email});
    if (!storedplaylistdata) {
        console.log("Error finding user playlist");
        return res.status(404).json({ error: 'Failed to find user playlist, invalid email' });
    }
    const selectedplaylist = storedplaylistdata.playlists.find(play => play.playlistId === Info.PlaylistId)
    if(!selectedplaylist){
        await PlaylistModel.findOneAndUpdate(
            { email },
            { $push: { 
                playlists: {  
                    playlistId: Info.PlaylistId,
                    playlistName: Info.PlaylistName

                    } 
                } },
            { new: true } 
        );
    }
    try {
        const response = await fetch(`${process.env.API_BASE_URL}playlists/${Info.PlaylistId}/tracks?limit=5&offset=${offset}&fields=items(added_at,track(name,album(images,url),artists(name,id)))`, {
            headers: { 'Authorization': `Bearer ${SAT}` }
        });
        if (!response.ok) {
            console.log("Response Error, couldn't retrieve recently added tracks");
            return res.status(404).json({ error: 'Failed to fetch recently added tracks' });
        }
        const data = await response.json()
        console.log("Recently added track for playlist recieved")

        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric'
        };
        const recentTracks = data.items.map(item => {
            const date = new Date(item.added_at);
            const formattedDate = date.toLocaleDateString('en-US', options);
            return {
                addedAt: formattedDate,
                trackName: item.track.name,
                artistName: item.track.artists.map(artist => artist.name).join(', '),
                trackImage: item.track.album.images[0]?.url
            };
        }).reverse();
        const recentlyAddedTrackNames = recentTracks.map(track => track.trackName)
        console.log("Recently Added Tracks", recentlyAddedTrackNames)
        if(user){
            const username = user.username
            if(playlistExists){
                const Info_Obj = {
                    username: username,
                    playlistname:playlistExists.name,
                    playlistImage: playlistExists.Image,
                    totalTracks:playlistExists.TotalTracks,
                    recentTracks: recentTracks
                }
                return res.status(200).json(Info_Obj)
            }
        }
    }
    catch(error){
        console.log("An error occured while fetching recent added tracks: ", error.message)
        res.status(404).json({ error: 'An error occurred while retrieving recently added tracks' });
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
              timeAgo = " well over an hour ago";
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
    getRecentlyAdded,
    getRecentlyPlayed,
    updatePlaylistdata
};
