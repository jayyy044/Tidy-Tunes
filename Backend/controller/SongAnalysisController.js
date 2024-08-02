const PlaylistModel = require('../models/PlaylistModel')
const { spawn } = require('child_process');
require('dotenv').config()

const getTop100 = async(req, res) => {
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

    //adding delay between each audio analysis request
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

    //Fetching audio analyses for tracks
    const fetchAudioAnalysis = async (trackIds, retries = 6, delay = 5000) => {
        try {
          const response = await fetch(`https://api.spotify.com/v1/audio-features?ids=${trackIds}`, {
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
    
    //Taking all the tracks ids from user playlist and putthing them into chunks
    const ArraySlices = async (arr, arrSize) => {
        const slices = [];
        for (let i = 0; i < arr.length; i += arrSize) {
            slices.push(arr.slice(i, i + arrSize).join(','));
          }
        return slices;
    }

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
                await delay(5000)
                
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
        try{
            let recentTrackId = []
            let limit = 50
            while (true) {
                const response = await fetch(`${process.env.API_BASE_URL}playlists/${Id}/tracks?limit=${limit}&offset=${offset}&fields=items(track(name,id))`, {
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
                if (offset === 0) {
                    break;
                }
                offset -= 50;
                if (offset < 0) {
                    limit += offset; 
                    offset = 0;
                }
            }
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

      //Checking Total Tracks property for the user
    const SavePlaylistTotalTracks = async () => {
        const userPlaylist = user.playlists.find(p => p.playlistId === Id);
        if (!userPlaylist) {
            console.log("Playlist not found in user's playlists");
            return res.status(404).json({ error: "Playlist not found in user's playlists" });
 
        }
        if(userPlaylist.totalTracks === null || userPlaylist.totalTracks !== TotalTracks){
            const result = await PlaylistModel.findOneAndUpdate(
                { email: email, 'playlists.playlistId': Id },
                { $set: { 'playlists.$.totalTracks': TotalTracks } },
                { new: true } 
            );
            if(!result){
                console.log("Error Updated total tracks property");
                return res.status(404).json({ error: "An error occured while trying to update user data" });
            }
            return true;
        }
        else{
            console.log("Total Tracks up to date")
            return false
        }

    }

    // const fetchStandardizedAudioAnalyses = async () => {
    //     try {
    //         const jsonData = JSON.stringify(analyses);
    //         const pythonProcess = spawn('python', ['scripts/processExistingSongs.py']);
            
    //         pythonProcess.stdin.write(jsonData);
    //         pythonProcess.stdin.end(); // Signal that no more data is coming
        
    //         let output = '';
        
    //         // Capture the output from the Python script
    //         pythonProcess.stdout.on('data', (data) => {
    //           output += data.toString();
    //         });
        
    //         return new Promise((resolve) => {
    //           // Capture any errors
    //           pythonProcess.stderr.on('data', (data) => {
    //             console.error('Error:', data.toString());
    //             if (!res.headersSent) {
    //               res.status(500).json({ error: "There was an error with Python processing" });
    //             }
    //           });
        
    //           // Handle process exit
    //           pythonProcess.on('exit', (code) => {
    //             console.log(`Python script exited with code ${code}`);
    //             if (code === 0) {
    //               resolve(output);
    //             } else {
    //               if (!res.headersSent) {
    //                 res.status(500).json({ error: "There was an error with Python processing" });
    //               }
    //               resolve(null); // Resolve with null if there's an error to avoid crashing
    //             }
    //           });
    //         });
    //       } catch (error) {
    //         console.error('Unexpected error:', error.message);
    //         if (!res.headersSent) {
    //           res.status(500).json({ error: "An unexpected error occurred" });
    //         }
    //         return null; // Return null in case of unexpected errors
    //       }
    // };

    const SaveAudioAnalyses = async () => {
        const userPlaylist = user.playlists.find(p => p.playlistId === Id);
        if (!userPlaylist) {
            console.log("Playlist not found in user's playlists");
            return res.status(404).json({ error: "Playlist not found in user's playlists" });
        }
        try {
            if(userPlaylist.playlistData.length === 0){
                userPlaylist.playlistData = analyses
                await user.save()
                console.log(userPlaylist.playlistData.length)
                return true
            }
        }
        catch(error){
            console.log("There was an error saving the standardized data", error.message)
            res.status(404).json({error: "There were issued when trying to save playlist data"})
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
        
        console.log("Track Features :", trackFeaturesMap);
        const userPlaylist = user.playlists.find(p => p.playlistId === Id);
        if (!userPlaylist) {
            console.log("Playlist not found in user's playlists");
            return res.status(404).json({ error: "Playlist not found in user's playlists" });
        }
        const analyzingSimilarityData = async (new_song) => {
            try {
                const inputdata = {
                    existing_songs: userPlaylist.playlistData,
                    new_song
                    // new_song:{ 
                    //     "acousticness": 0.0483,
                    //     "acousticness": 0.26,
                    //     "danceability": 0.923,
                    //     "duration_ms": 113143,
                    //     "energy": 0.678,
                    //     "instrumentalness": 0,
                    //     "key": 3,
                    //     "liveness": 0.115,
                    //     "loudness": -6.841,
                    //     "mode": 0,
                    //     "speechiness": 0.445,
                    //     "tempo": 139.966,
                    //     "time_signature": 4,
                    //     "valence": 0.72
                    //     }
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
                let updatedplaylist =[]
        Promise.all(trackFeaturesMap.map(async song => {
            const songid = song.trackId;
            delete song.trackId;
        
            try {
                const data = await analyzingSimilarityData(song);
                const output = JSON.parse(data);
        
                // Calculate euclidean and cosine distances
                let euclidean = output.euclidean_sorted.reduce((acc, element) => acc + element.euclidean_distance, 0) / output.euclidean_sorted.length;
                let cosine = output.cosine_sorted.reduce((acc, element) => acc + element.cosine_similarity, 0) / output.cosine_sorted.length;
        
                let similar = ((euclidean + cosine) / 2) > 0.45;
        
                console.log(similar);
                console.log(songid);
        
                const trackToUpdate = selecttracks.find(track => track.trackid === songid);
                if (trackToUpdate) {
                    // Create an updated track object
                    const updatedTrack = { ...trackToUpdate, similar };
                    updatedplaylist.push(updatedTrack);
                }
            } catch (error) {
                console.error('Error analyzing similarity data:', error);
            }
        })).then(() => {
            // After all promises are resolved
            // If you want to merge the updated tracks with the original selecttracks
            const mergedPlaylist = selecttracks.map(track =>
                updatedplaylist.find(updated => updated.trackid === track.trackid) || track
            );
            console.log("Merged Playlist:", mergedPlaylist);
        })

        // trackFeaturesMap.map(song => {
        //    const songid = song.trackId 
        //    delete song.trackId
           
        //    analyzingSimilarityData(song).then(
        //     (data) => {
        //         const output = JSON.parse(data)
        //         let euclidean = 0 
        //         let cosine = 0
        //         output.euclidean_sorted.forEach(element => {
        //             euclidean = euclidean + element.euclidean_distance
        //         });
        //         euclidean = euclidean/output.euclidean_sorted.length
        //         output.cosine_sorted.forEach(element => {
        //             cosine = cosine + element.cosine_similarity
        //         });
        //         cosine = cosine/output.cosine_sorted.length
        //         let similar = false;
        //         if (((euclidean + cosine) / 2) > 0.45) {
        //           similar = true;
        //         }
        //         console.log(similar)
        //         console.log(songid)
        //         const trackToUpdate = selecttracks.find(track => track.trackid === songid);
        //         if(trackToUpdate){
        //             const updatedTrack = { ...trackToUpdate, similar };
        //             updatedplaylist.push(updatedTrack)
        //         }
        //         console.log("djdklfjd", updatedplaylist)
                
                // const updatedplaylist = selecttracks.map(track => {
                //     // console.log('TRACkID', track.trackid)
                //     // console.log('song.id', songid)
                //   if (track.trackid === songid) {
                //     return { ...track, similar }; // Add similar as a property
                //   }
                //   return track;
                // });
                
                // console.log("JDJDJ", updatedplaylist);
                
            // }
        //    )

        // })
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
        const updateResult = await SavePlaylistTotalTracks(TotalTracks);
        if(updateResult){
            const recentIds = await fetchAllTracks()
            console.log("Users Recent Tracks recieved", recentIds.length)
            const IdSlices = await ArraySlices(recentIds, 100);
            for(const slice of IdSlices) {
                const recenttracksfeatures = await fetchAudioAnalysis(slice);
                if (recenttracksfeatures) {
                    analyses.push(...recenttracksfeatures);
                }
                await delay(5000); 
            }
            console.log("Recent Track Features Added", analyses.length)  
            const MostPopularTracksResult = await fetchMostPopularTracks()
            if(MostPopularTracksResult){
                console.log("Recent Track Features Added", analyses.length)  
            }
            // const StandardizedData = await fetchStandardizedAudioAnalyses()
            // const ParsedStandardizedData = JSON.parse(StandardizedData)
            // console.log("The standardized data", ParsedStandardizedData.length)
            const SavingStandardizedData = await SaveAudioAnalyses()
            if(SavingStandardizedData){
                console.log("Standardized Data was saved")
            }
            const RefiningTracks = await fetchcomparsiontracks(TotalTracks)
            const updatedTracks = await AddArtistImage(RefiningTracks);
            const RefiningTrackCanidates = updatedTracks.map(track => track.trackname)
            console.log("Refining Tracks recieved", RefiningTrackCanidates )
            const SimilarityData = await SimilarityFetch(updatedTracks)
            if(SimilarityData){
                console.log("Similarity Analysis on tracks completed")
            }
            let euclidean = 0 
            let cosine = 0
            const ParsedSimilarityData = JSON.parse(SimilarityData)
            ParsedSimilarityData.euclidean_sorted.forEach(element => {
                euclidean = euclidean + element.euclidean_distance
            });
            euclidean = euclidean/ParsedSimilarityData.euclidean_sorted.length
            ParsedSimilarityData.cosine_sorted.forEach(element => {
                cosine = cosine + element.cosine_similarity
            });
            cosine = cosine/ParsedSimilarityData.cosine_sorted.length
            console.log((ParsedSimilarityData.mean_euclidean_distance+ParsedSimilarityData.mean_cosine_similarity)/2)
            console.log("HEad AVg", (euclidean+cosine)/2)
            console.log("BOW")
              
        }
        else{
            const RefiningTracks = await fetchcomparsiontracks(TotalTracks)
            const updatedTracks = await AddArtistImage(RefiningTracks);
            const RefiningTrackCanidates = updatedTracks.map(track => track.trackname)
            console.log("Refining Tracks recieved", RefiningTrackCanidates )
            const SimilarityData = await SimilarityFetch(updatedTracks)
            if(SimilarityData){
                console.log("Similarity Analysis on tracks completed")
            }
            let euclidean = 0 
            let cosine = 0
            const ParsedSimilarityData = JSON.parse(SimilarityData)
            ParsedSimilarityData.euclidean_sorted.forEach(element => {
                euclidean = euclidean + element.euclidean_distance
            });
            euclidean = euclidean/ParsedSimilarityData.euclidean_sorted.length
            ParsedSimilarityData.cosine_sorted.forEach(element => {
                cosine = cosine + element.cosine_similarity
            });
            cosine = cosine/ParsedSimilarityData.cosine_sorted.length
            console.log((ParsedSimilarityData.mean_euclidean_distance+ParsedSimilarityData.mean_cosine_similarity)/2)
            console.log("HEad AVg", (euclidean+cosine)/2)
            console.log("BOW")

            

 
        }

    }
    catch(error){
        console.log("There was an error with playlist identification: ", error.message)
        res.status(404).json({error: "Error identifing playlist"})
    }

    //    const newSong = {
        // "acousticness": 0.26,
        // "danceability": 0.923,
        // "duration_ms": 113143,
        // "energy": 0.678,
        // "instrumentalness": 0,
        // "key": 3,
        // "liveness": 0.115,
        // "loudness": -6.841,
        // "mode": 0,
        // "speechiness": 0.445,
        // "tempo": 139.966,
        // "time_signature": 4,
        // "valence": 0.72
    //   }
    // let euclidean = 0 
    // let cosine = 0
    // const payload = {
    //     existing_songs: analyses,
    //     new_song: newSong
    // };
    // const pythonProcess = spawn('python', ['scripts/process_data.py']);

    // pythonProcess.stdin.write(JSON.stringify(payload));
    // pythonProcess.stdin.end();

    // pythonProcess.stdout.on('data', (data) => {
    //     try {
    //         const processedData = JSON.parse(data.toString());
    //         SavePlaylistData(processedData.standardized_existing_songs)
    //         processedData.euclidean_sorted.forEach(element => {
    //             euclidean = euclidean + element.euclidean_distance
    //         });
    //         euclidean = euclidean/processedData.euclidean_sorted.length
    //         processedData.cosine_sorted.forEach(element => {
    //             cosine = cosine + element.cosine_similarity
    //         });
    //         cosine = cosine/processedData.cosine_sorted.length
    //         console.log("ANother avg",((processedData.mean_euclidean_distance+processedData.mean_cosine_similarity)/2))
    //         console.log("Grand Average", (euclidean+cosine)/2)
    //         if(((euclidean+cosine)/2)>=0.45){
    //             console.log("The song is similar")
    //         }
    //         else{
    //             console.log("This song aint similar")
    //         }

    //         // res.status(200).json(processedData); // Uncomment if using in an Express route
    //     } catch (error) {
    //         console.error('Failed to parse output from Python script:', error);
    //         // res.status(500).json({ error: 'Failed to parse output from Python script' }); // Uncomment if using in an Express route
    //     }
    // });

    // pythonProcess.stderr.on('data', (data) => {
    //     console.error('Error from Python script:', data.toString());
    //     // res.status(500).json({ error: 'Failed to process data with Python script' }); // Uncomment if using in an Express route
    // });
 

}


module.exports = {
    getTop100,
}

