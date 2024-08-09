const PlaylistModel = require('../models/PlaylistModel')
const { spawn } = require('child_process');
require('dotenv').config()

const getsonganalysis = async(req, res) => {
    const { SAT, Id, email } = req.query
    let offset
    let analyses = [];
    let TotalTracks
    if (!SAT || !Id || !email) {
        console.log("Something is missing from the reqeust");
        console.log("This is SAT:", SAT)
        console.log('This is the Playlist Id', Id)
        console.log("This is the user Email", email)
        res.status(404).json({ error: 'There was an error receiving one of the request parameters' });
        return;
    }
    //We need the user playlist model to start loading data in  maybe
    const user = await PlaylistModel.findOne({email});
    if (!user) {
        console.log("Error finding user");
        return res.status(404).json({ error: 'Failed to find user, invalid email' });
    }
    //Fetching audio analyses for tracks
    const fetchAudioAnalysis = async (trackIds, retries = 6, delay = 5000) => {
        try {
          const response = await fetch(`${process.env.API_BASE_URL}audio-features?ids=${trackIds}`, {
            headers: { 'Authorization': `Bearer ${SAT}` }
          });
          if (!response.ok) {
            if (response.status === 429 && retries > 0) {
              const retryAfter = response.headers.get('Retry-After') || delay;
              console.warn(`Rate limited. Retrying in ${(retryAfter / 1000)}s...`);
              await new Promise(resolve => setTimeout(resolve, retryAfter));
              return fetchAudioAnalysis(trackIds, retries - 1, delay * 2); // Exponential backoff
            }
            console.log(`Failed to fetch audio features for IDs: ${trackIds}`);
            return null;
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
          return null;
        }
    };
    
    const fetchMostPopularTracks = async () => {
        const timeRanges = ['long_term', 'medium_term', 'short_term'];
        const trackIdsByRange = {}
        try{
            for (const timeRange of timeRanges){ 
                const response = await fetch(`${process.env.API_BASE_URL}me/top/tracks?time_range=long_term&limit=50&offset=0`,{
                    headers:{'Authorization': `Bearer ${SAT}`}
                })
                const data = await response.json()
                if(!response.ok){
                    console.log("There was an error fetching top songs")
                    res.status(404).json({error: "There was an error fetching the most popular songs"})
                }
    
                trackIdsByRange[timeRange] = data.items
                .filter(track => track.name && track.id)
                .map(track => track.id);
                
                const poptracksfeatures = await fetchAudioAnalysis(trackIdsByRange[timeRange].join(','));
                if (poptracksfeatures) {
                    analyses.push(...poptracksfeatures);
                }
                
            } 
            return true
        }   
        catch(error){
            console.log("There was an error with the 50 most popular songs request: ", error.message)
            res.status(404).json({error: "There was an error fetch most popular tracks"})
        }

    }

    //Fetching all the tracks from the users playlist 
    const fetchAllTracks = async () => {
        offset = TotalTracks < 50 ? 0 : Math.max(TotalTracks - 50, 0);
        let recentTrackId = []
        try{
            const response = await fetch(`${process.env.API_BASE_URL}playlists/${Id}/tracks?limit=50&offset=${offset}&fields=items(track(name,id))`, {
                headers: { 'Authorization': `Bearer ${SAT}` }
            });
            if (!response.ok) {
                console.log("Error fetching recently added tracks for playlist:", Id);
                return { error: 'Failed to fetch recently added tracks' };
            }
            const data = await response.json();
            const tracks = data.items
            .filter(item => item.track && item.track.name && item.track.id)
            .map(item => item.track.id);
            recentTrackId.push(...tracks);
            return recentTrackId
        }
        catch(error){
            console.log("There was an error while fetching tracks from user playlist: ", error.message)
            res.status(404).json({error: "There was an error fetching playlist tracks"})
        }
    }

    //Adding Image, follower and Genres for the artist that made a track this is for the refining tracks
    const AddArtistImage = async (trackArtist) => {
        return Promise.all(trackArtist.map(async (artist) => {
            const response = await fetch(`${process.env.API_BASE_URL}artists/${artist.artistid}`, {
                headers: { 'Authorization': `Bearer ${SAT}` }
            });
            const { images, followers, genres } = await response.json();
            if(!response.ok){
                console.log("Error Fetching artist image")
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
    const fetchcomparsiontracks = async (TotalTracks) => {
        PlaylistOffset = Math.floor(Math.random() * ((TotalTracks-5) - 0 + 1)) + 0;
        try{
            const response = await fetch (`${process.env.API_BASE_URL}playlists/${Id}/tracks?limit=5&offset=${PlaylistOffset}&fields=items(track(name,id,album(images,url),artists(name,id)))`,{
                headers:{'Authorization' : `Bearer ${SAT}`}
            })
            const data = await response.json()
            if(!response.ok){ 
                console.log("Error while fetching random playlist tracks")
                res.status(404).json({error: "Error fetching playlist refining tracks"})
            }
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

    
    //Fetch and compare the audio features of the chosen songs
    const SimilarityFetch = async (selecttracks) => {
        const trackIds = selecttracks.map(track => track.trackid);
        const allTrackIdsString = trackIds.join(',');
        const audioFeaturesList = await fetchAudioAnalysis(allTrackIdsString);
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
                        res.status(500).json({ error: "There was an error with Python processing" });
                        }
                    });
                
                    // Handle process exit
                    pythonProcess.on('exit', (code) => {
                        console.log(`Python script exited with code ${code}`);
                        if (code === 0) {
                        resolve(output);
                        } else {
                        if (!res.headersSent) {
                            res.status(500).json({ error: "There was an error with Python processing" });
                        }
                        resolve(null); // Resolve with null if there's an error to avoid crashing
                        }
                    });
    
                });
            } 
            catch (error) {
                console.error('Unexpected error:', error.message);
                if (!res.headersSent) {
                res.status(500).json({ error: "An unexpected error occurred" });
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

    try{
        const SelectPlaylist = await fetch(process.env.API_BASE_URL + 'me/playlists?limit=50&offset=0', {
            headers: { 'Authorization': `Bearer ${SAT}` }
        });
        const SelectPlaylistData = await SelectPlaylist.json();
    
        if (!SelectPlaylist.ok) {
            console.log("Error fetching user playlists");
            return res.status(404).json({ error: 'Failed to fetch user playlists' });
        }
        console.log('Users Playlists received');
        const FindSelectPlaylist = SelectPlaylistData.items.find(playlist => playlist.id === Id);
        if(!FindSelectPlaylist){
            console.log("Could Not find playlist with this", Id,"Id")
            res.status(404).json({error: 'There was an error finding the playlist'})
        }
        TotalTracks = FindSelectPlaylist.tracks.total;
        console.log("Total Tracks Recieved: ", TotalTracks)
        const recentIds = await fetchAllTracks()
        console.log("Users Recent Tracks recieved", recentIds.length)
        const recenttracksfeatures = await fetchAudioAnalysis(recentIds);
        if (recenttracksfeatures) {
            analyses.push(...recenttracksfeatures);
            console.log("Recent Track Features Added", analyses.length)  

        }
        const MostPopularTracksResult = await fetchMostPopularTracks()
        if(MostPopularTracksResult){
            console.log("Most Popular Track Features Added", analyses.length)  
        }
        const RefiningTracks = await fetchcomparsiontracks(TotalTracks)
        const updatedTracks = await AddArtistImage(RefiningTracks);
        const RefiningTrackCanidates = updatedTracks.map(track => track.trackname)
        console.log("Refining Tracks recieved", RefiningTrackCanidates )
        const SimilarityData = await SimilarityFetch(updatedTracks)
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
    catch(error){
        console.log("There was an error with playlist identification: ", error.message)
        res.status(404).json({error: "Error identifing playlist"})
    }
}

const deleteTrack = async (req, res) => {
   const { SAT, playlistId, trackId} = req.query
   let trackUri

    if (!SAT || !playlistId || !trackId) {
        console.log("Something is missing from the reqeust");
        console.log("This is SAT:", SAT)
        console.log('This is the Playlist Id', playlistId)
        console.log("This is the track Id", trackId)
        res.status(404).json({ error: 'There was an error receiving one of the request parameters' });
        return;
    }
    try{
        const response = await fetch(`${process.env.API_BASE_URL}tracks/${trackId}`,{
            headers:{'Authorization':`Bearer ${SAT}`}
        })
        const data = await response.json()
        if(!response.ok){
            console.log("Couldn't retrive track data")
            res.status(404).json({error: "We couldn't retrieve the track data"})
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


module.exports = {
    getsonganalysis,
    deleteTrack
}

