const PlaylistModel = require('../models/PlaylistModel')
const UserModel = require('../models/UserModel')
const { spawn } = require('child_process');

//  //Fetch and compare the audio features of the chosen songs
 const SimilarityFetch = async (res, selecttracks, analyses, SAT, Id, user) => {
    const trackIds = selecttracks.map(track => track.trackid);
    const allTrackIdsString = trackIds.join(',');
    const audioFeaturesList = await fetchAudioAnalysis(res, SAT, allTrackIdsString);
    const trackFeaturesMap = trackIds.map((trackId, index) => ({
        trackId,
        ...audioFeaturesList[index] // Spread operator to include all features
    }));
    
    console.log("Track Features :", trackFeaturesMap.length);
    const userPlaylist = user.playlists.find(p => p.playlistId === Id);
    if (!userPlaylist) {
        console.log("Playlist not found in user's playlists");
        return res.status(404).json({ error: "Playlist not found in user's playlists" });
    }
    const analyzingSimilarityData = async (new_song) => {
        try {
            const inputdata = {
                existing_songs: analyses,
                new_song
            };
            const jsonData = JSON.stringify(inputdata);
            const pythonProcess = spawn('python', ['scripts/SimilarityAnalysis.py']);
    
            pythonProcess.stdin.write(jsonData);
            pythonProcess.stdin.end(); // Signal that no more data is coming
    
            let output = '';
    
            // Capture the output from the Python script
            pythonProcess.stdout.on('data', (data) => {
                output += data.toString();
            });
    
            return new Promise((resolve) => {
            // Capture any errors
                pythonProcess.stderr.on('data', (data) => {
                    console.error('Error:', data.toString());
                    if (!res.headersSent) {
                        return res.status(500).json({ error: "There was an error with Python processing" });
                    }
                });
            
                // Handle process exit
                pythonProcess.on('exit', (code) => {
                    console.log(`Python script exited with code ${code}`);
                    if (code === 0) {
                        resolve(output);
                    } 
                    else {
                        if (!res.headersSent) {
                            return res.status(500).json({ error: "There was an error with Python processing" });
                        }
                        resolve(null); // Resolve with null if there's an error to avoid crashing
                    }
                });

            });
        } 
        catch (error) {
            console.error('Unexpected error:', error.message);
            if (!res.headersSent) {
                return res.status(500).json({ error: "An unexpected error occurred" });
            }
            return null; // Return null in case of unexpected errors
        }


    }
    let updatedplaylist = [];

    await Promise.all(trackFeaturesMap.map(async song => {
        const songid = song.trackId;
        delete song.trackId;
        try {
            const data = await analyzingSimilarityData(song);
            const output = JSON.parse(data);

            const similar = (output.mean_euclidean_distance + output.mean_cosine_similarity) / 2;
            const percentage = (similar / 0.35) * 100;
            const decision = similar> 0.18 ? "Similar":"Not Similar"

            const trackToUpdate = selecttracks.find(track => track.trackid === songid);
            if (trackToUpdate) {
                const updatedTrack = { ...trackToUpdate, similar, percentage, decision };
                updatedplaylist.push(updatedTrack);
            }
        } catch (error) {
            console.error('Error analyzing similarity data:', error);
        }
    }));

    const mergedPlaylist = selecttracks.map(track =>
        updatedplaylist.find(updated => updated.trackid === track.trackid) || track
    );
    return mergedPlaylist;
}

//Adding Image, follower and Genres for the artist that made a track this is for the refining tracks
const AddArtistImage = async (res, trackArtist, SAT) => {
    return Promise.all(trackArtist.map(async (artist) => {
        const response = await fetch(`${process.env.API_BASE_URL}artists/${artist.artistid}`, {
            headers: { 'Authorization': `Bearer ${SAT}` }
        });
        const { images, followers, genres } = await response.json();
        if(!response.ok){
            console.log("Repsone Error, failed to fetching artist image")
            return res.status(404).json({error: "Error fetching artist image"})
        }
        return {
            ...artist,
            artistImage: images[0]?.url,
            artistFollowers: followers.total,
            artistGenres: genres
        };
    }));
};

 //Fetching Random tracks from playlist that will have similarity code ran on them
const fetchcomparsiontracks = async (res, TotalTracks, SAT, Id) => {
    PlaylistOffset = Math.floor(Math.random() * ((TotalTracks-5) + 1)) ;
    try{
        const response = await fetch (`${process.env.API_BASE_URL}playlists/${Id}/tracks?limit=5&offset=${PlaylistOffset}&fields=items(track(name,id,album(images,url),artists(name,id)))`,{
            headers:{'Authorization' : `Bearer ${SAT}`}
        })
        
        if(!response.ok){ 
            console.log("Response Error, failed to fetching random playlist tracks")
            return res.status(404).json({error: "Error fetching playlist refining tracks"})
        }
        const data = await response.json()

        const RefiningTracks = data.items.map(track => ({
            trackid: track.track.id,
            trackname: track.track.name,
            trackimg: track.track.album.images[0].url,
            artistname: track.track.artists.map(artist => artist.name).join(', '),
            artistid: track.track.artists[0].id,
            mainartistname: track.track.artists[0]?.name
        })) 
        return RefiningTracks
    }
    catch(error){
        console.log("There was an error while fetching refining tracks: ", error.message)
        res.status(404).json({error: "There was error while receiving refining tracks"})
    }
}

// //Saves collected tracks to database to streamline analysis process
const SavePlaylistData = async (res, analyses, user, Id, totaltracks) => {
    const storedPlaylist = user.playlists.find(pl => pl.playlistId === Id);
    try{
        storedPlaylist.totalTracks = totaltracks
        storedPlaylist.playlistData = analyses
        await user.save()
        return {
            name: storedPlaylist.playlistName,
            id: storedPlaylist.playlistId,
            playlistdata: storedPlaylist.playlistData.length,
            TotalTrack: storedPlaylist.totalTracks
        }
    }
    catch(error){
        console.log("There was an error saving playlist data: ", error.message)
        res.status(404).json({error: "Error occured trying to save playlist data"})
    }
}

// //retrieving user playlist's most popular songs
const fetchMostPopularTracks = async (res, SAT, analyses) => {
    const timeRanges = ['long_term', 'medium_term', 'short_term'];
    const trackIdsByRange = {}
    try{
        for (const timeRange of timeRanges){ 
            const response = await fetch(`${process.env.API_BASE_URL}me/top/tracks?time_range=long_term&limit=50&offset=0`,{
                headers:{'Authorization': `Bearer ${SAT}`}
            })
            const data = await response.json()
            if(!response.ok){
                console.log("Response Error, couldn't retrieve top songs")
                return res.status(404).json({error: "Failed to retrieve top songs"})
            }

            trackIdsByRange[timeRange] = data.items
            .filter(track => track.name && track.id)
            .map(track => track.id);
            
            const poptracksfeatures = await fetchAudioAnalysis(res, SAT ,trackIdsByRange[timeRange].join(','));
            if (poptracksfeatures) {
                analyses.push(...poptracksfeatures);
            }
            
        } 
        return true
    }   
    catch(error){
        console.log("Error failed to retrieve most popular songs : ", error.message)
        res.status(404).json({error: "An error occured couldn't fetch most popular tracks"})
    }

}

//Fetching audio analyses for tracks
const fetchAudioAnalysis = async (res, SAT, trackIds, retries = 6, delay = 5000) => {
    try {
        const response = await fetch(`${process.env.API_BASE_URL}audio-features?ids=${trackIds}`, {
        headers: { 'Authorization': `Bearer ${SAT}` }
        });
        if (!response.ok) {
            if (response.status === 429 && retries > 0) {
                const retryAfter = response.headers.get('Retry-After') || delay;
                console.warn(`Rate limited. Retrying in ${(retryAfter / 1000)}s...`);
                await new Promise(resolve => setTimeout(resolve, retryAfter));
                return fetchAudioAnalysis(res, SAT, trackIds, retries - 1, delay * 2); // Exponential backoff
            }
            console.log(`Failed to fetch audio features for IDs: ${trackIds}`);
            return res.status(404).json("Response Errorm couldn't fetch audio analyses")
        }
        console.log("Song Analyzed");
        const data = await response.json();
        const processedData = data.audio_features.map(feature => {
            const numericalData = {};
            for (const key in feature) {
                if (typeof feature[key] === 'number') {
                numericalData[key] = feature[key];
                }
            }
            return numericalData;
        });
    
        return processedData;
    } catch (error) {
        console.log(`Failed to fetch audio features for IDs: ${trackIds}. Error: ${error.message}`);
        res.status(404).json({error: "An Error occured couldn't retrieve audio features"})
    }
};

//Retrieves most recently added songs in user's playlist
const fetchRecentTracks = async (res, TotalTracks, SAT, Id) => {
    const offset = TotalTracks < 50 ? 0 : Math.max(TotalTracks - 50, 0);
    let recentTrackId = []
    try{
        const response = await fetch(`${process.env.API_BASE_URL}playlists/${Id}/tracks?limit=50&offset=${offset}&fields=items(track(name,id))`, {
            headers: { 'Authorization': `Bearer ${SAT}` }
        });
        if (!response.ok) {
            console.log("Response Error, couldn't retrieved recently added tracks")
            return res.status(404).json({ error: 'Failed to retrieve recently added tracks' });
        }
        const data = await response.json();
        const tracks = data.items
        .filter(item => item.track && item.track.name && item.track.id)
        .map(item => item.track.id);
        recentTrackId.push(...tracks);
        return recentTrackId
    }
    catch(error){
        console.log("Error couldn't retrieve recent tracks from playlist: ", error.message)
        res.status(404).json({error: "Error rectrieving playlist's recent tracks"})
    }
}

// Checks if playlist exists and grabs specified playlist's total tracks
const CheckSelectPlaylist = async (res, Id, SAT, userdocument) =>{
    try{
        const usersplaylist = await fetch(`${process.env.API_BASE_URL}me/playlists?limit=50&offset=0`, {
            headers: { 'Authorization': `Bearer ${SAT}` }
        });
        const usersplaylistdata = await usersplaylist.json();
    
        if (!usersplaylist.ok) {
            console.log("Response Error, couldn't retrieve user's playlists");
            return res.status(404).json({ error: "Response Error, couldn't retrieve user's playlists" });
        }
        console.log('Users Playlists retrieved');

        const SelectPlaylist = usersplaylistdata.items.find(playlist => playlist.id === Id);
        if(!SelectPlaylist){
            DeleteProfileInfo(userdocument, Id)
        }
        return SelectPlaylist
    }
    catch(error){
        console.log("Error ocurred, failed to playlist processing: ", error.message)
        res.status(404).json({error: "Failed to process user playlist"})
    }
}

const DeleteProfileInfo = async ( userdocument, Id) => {
    userdocument.playlistId = ''; 
    userdocument.playlistName = '';
    await userdocument.save(); 
    await PlaylistModel.findOneAndUpdate(
        { email },
        { $pull: { playlists: {  playlistId: Id } } },
        { new: true } 
    );
    console.log("Playlist deleted successfully");
    return res.status(200).json({ message: 'Playlist deleted successfully' });

}

const getsonganalysis = async(req, res) => {
    const { SAT, Id, email } = req.query
    let analyses = [];
    if (!SAT || !Id || !email) {
        console.log("Something is missing from the reqeust");
        console.log("This is SAT:", SAT)
        console.log('This is the Playlist Id', Id)
        console.log("This is the user Email", email)
        return res.status(404).json({ error: 'There was an error receiving one of the request parameters' });
    }

    const playlistDocument = await PlaylistModel.findOne({email});
    if (!playlistDocument) {
        console.log("Error finding user");
        return res.status(404).json({ error: 'Failed to find user, invalid email' });
    }

    const userdocument = await UserModel.findOne({email})
    if (!userdocument) {
        console.log("Error finding user");
        return res.status(404).json({ error: 'Failed to find user, invalid email' });
    }

    const checkedPlaylist = await CheckSelectPlaylist(res, Id, SAT, userdocument )
    console.log("Total Tracks Recieved: ", checkedPlaylist.tracks.total)
    const storedPlaylist = playlistDocument.playlists.find(pl => pl.playlistId === Id);

    const updatedAt = new Date(playlistDocument.updatedAt);
    const now = new Date();
    const oneMonthInMillis = 30 * 24 * 60 * 60 * 1000; // Approximation of one month in milliseconds
    const timeSinceUpdate = now - updatedAt;

    if((storedPlaylist.totalTracks !== checkedPlaylist.tracks.total) || 
        (timeSinceUpdate > oneMonthInMillis) ||
        (storedPlaylist.playlistData.length === 0) ){
        const recentIds = await fetchRecentTracks(res, checkedPlaylist.tracks.total, SAT, Id)
        console.log("Users Recent Tracks recieved", recentIds.length)
        const recenttracksfeatures = await fetchAudioAnalysis(res, SAT, recentIds);
        if (recenttracksfeatures) {
            analyses.push(...recenttracksfeatures);
            console.log("Recent Track Audio Analysis Completed", analyses.length)  
        }
        const MostPopularTracksResult = await fetchMostPopularTracks(res, SAT, analyses)
        if(MostPopularTracksResult){
            console.log("Most Popular Track Features Added", analyses.length)  
        }
        const SavingData = await SavePlaylistData(res, analyses, playlistDocument, Id, checkedPlaylist.tracks.total)
        if(SavingData){
            console.log("Playist Data updated", SavingData)
        }
    }
    else{
        analyses = [...storedPlaylist.playlistData]
        console.log("Playlist data recieved from database",analyses.length)
    }
    const RefiningTracks = await fetchcomparsiontracks(res, checkedPlaylist.tracks.total, SAT, Id)
    const updatedTracks = await AddArtistImage(res, RefiningTracks, SAT);
    const RefiningTrackCanidates = updatedTracks.map(track => track.trackname)
    console.log("Refining Track Canidates",RefiningTrackCanidates)
    const SimilarityData = await SimilarityFetch(res, updatedTracks, analyses, SAT, Id, playlistDocument)
    if(SimilarityData){
        const similaritytracknames = SimilarityData.map(track => ({
            name: track.trackname,
            decision: track.decision
        }))
        console.log("Similarity Analysis:", similaritytracknames)
        console.log("Similarity Analysis on tracks completed")

    }
    res.status(200).json(SimilarityData)
}

const deleteTrack = async (req, res) => {
   const { SAT, playlistId, trackId} = req.query
   let trackUri

    if (!SAT || !playlistId || !trackId) {
        console.log("Something is missing from the reqeust");
        console.log("This is SAT:", SAT)
        console.log('This is the Playlist Id', playlistId)
        console.log("This is the track Id", trackId)
        return res.status(404).json({ error: 'There was an error receiving one of the request parameters' });
    }
    try{
        const response = await fetch(`${process.env.API_BASE_URL}tracks/${trackId}`,{
            headers:{'Authorization':`Bearer ${SAT}`}
        })
        const data = await response.json()
        if(!response.ok){
            console.log("Couldn't retrive track data")
            return res.status(404).json({error: "We couldn't retrieve the track data"})
        }
        trackUri = data.uri
        console.log("Track Uri retrieved")
    }
    catch(error){
        console.log('There was an issue trying to get track URI message:', error.message)
        res.status(404).json({error: "There was an error fetching track uri"})
    }
    try{
        const body = {
            tracks:[{ uri: trackUri }]
        }
        const response = await fetch(`${process.env.API_BASE_URL}playlists/${playlistId}/tracks`,{
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SAT}`
            },
            body: JSON.stringify(body)
        })
        const data = await response.json()
        if(!response.ok){
            console.log("Couldn't Delete Song")
            res.status(404).json({error: "Couldn't Delete Song"})
        }
        if(data.snapshot_id){
            console.log("Song Successfully Deleted")
            let result = 'Song Successfully Deleted'
            res.status(200).json(result)
        }

    }
    catch(error){
        console.log("An Error occured while trying to deleting select track", error.message)
        res.status(404).json({error: "An error occured when trying to delete song, backend"})
    }
    
}

const changeplaylist = async (req, res) => {
    const { email } = req.query
    if (!email) {
        console.log("Something is missing from the reqeust");
        console.log("This is user email:", email)
        return res.status(404).json({ error: 'There was an error receiving one of the request parameters' });
    }
    const user = await UserModel.findOne({ email })
        if(!user){
            console.log("Error finding user");
            return res.status(404).json({ error: 'Failed to find user, invalid email' });
        }
        user.playlistId = ''
        user.playlistName = ''
        await user.save()
        console.log(user, "Changed user playlist")
        res.status(200).json(true)

}


module.exports = {
    getsonganalysis,
    deleteTrack,
    changeplaylist
}

