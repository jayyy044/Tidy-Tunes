const PlaylistModel = require('../models/PlaylistModel')
require('dotenv').config()

const getTop100 = async(req, res) => {
    const { SAT, Id, email } = req.query
    let offset
    let allTracks = []
    let uniqueTrackIds = new Set();
    let analyses = [];
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
        const totalTracks = FindSelectPlaylist.tracks.total;
        offset = totalTracks < 30 ? 0 : Math.max(totalTracks - 20, 0);

        const response = await fetch(`${process.env.API_BASE_URL}playlists/${Id}/tracks?limit=50&offset=${offset}&fields=items(track(name,id))`, {
            headers: { 'Authorization': `Bearer ${SAT}` }
        });

        if (!response.ok) {
            console.log("Error fetching recently added tracks for playlist:", Id);
            return { error: 'Failed to fetch recently added tracks' };
        }

        const data = await response.json();

        const recentTrackId = data.items
        .filter(item => item.track && item.track.name && item.track.id)
        .map(item => item.track.id);
        const fetchAudioAnalysis = async (trackId, retries = 6, delay = 5000) => {
            try {

                const response = await fetch(`https://api.spotify.com/v1/audio-features/${trackId}`, {
                    headers: { 'Authorization': `Bearer ${SAT}` }
                });
                if (!response.ok) {
                    if (response.status === 429 && retries > 0) {
                        const retryAfter = response.headers.get('Retry-After') || delay;
                        console.warn(`Rate limited. Retrying in ${(retryAfter/1000)}s...`);
                        await new Promise(resolve => setTimeout(resolve, retryAfter));
                        return fetchAudioAnalysis(trackId, retries - 1, delay * 2); // Exponential backoff
                    }
                    console.log(`Failed to fetch audio features for ID: ${trackId}`);
                    return null;
                }
                const data = await response.json();
                console.log("HELLO", data);
                return data;
            } 
            catch (error) {
                console.log(`Failed to fetch audio features for ID: ${trackId}. Error: ${error.message}`);
                return null;
            }
        }
        const fetchAllAudioAnalyses = async () => {
            const allResults = await Promise.all(recentTrackId.map(id => fetchAudioAnalysis(id)));
            console.log("All audio features fetched:", allResults);
        
        };
        
        fetchAllAudioAnalyses();

    //     const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

    // const AudioFeaturesData = async (ids, delayTime = 30000) => {
    // const results = [];

    // for (let i = 0; i < 1; i++) {
    //     const id = ids[i];
    //     try {
    //         const response = await fetch(`https://api.spotify.com/v1/audio-features/${id}`, {
    //             headers: {'Authorization': `Bearer ${SAT}`}
    //         });
    //         if (!response.ok) {
    //             console.log(`Failed to fetch audio features for ID: ${id}`);
    //         }
    //         const data = await response.json();
    //         console.log("HELLO", data)
    //     } 
    //     catch (error) {
    //         console.log(`Failed to fetch audio features for ID: ${id}. Error: ${error.message}`);
    //     }

    //     // Delay before the next request
    //     if (i < ids.length - 1) {
    //     await delay(delayTime);
    //     }
    // }

    // return results;
    // };
        
    //     try {
    //         const recentTrackFeatures = await AudioFeaturesData(recentTrackId);
    //         return recentTrackFeatures;
    //     } catch (error) {
    //         console.log("ERROR", error.message);
    //     }

        // recentlyAddedTracks.forEach(track => {
        //     if (!uniqueTrackIds.has(track.id)) {
        //         uniqueTrackIds.add(track.id);
        //         allTracks.push(track);
        //     }
        // });
    
        console.log("Recently added tracks recieved");
        
    }
    catch(error){
        console.log("An error occured while fetching recent tracks: ", error.message)
        res.status(500).json({ error: 'An error occurred while fetching the playlist tracks' });
    }
 

}

module.exports = {
    getTop100,
}

//getting popular tracks

// try{
//     const response = await fetch(`${process.env.API_BASE_URL}me/top/tracks?time_range=long_term&limit=30&offset=0`,{
//         headers:{'Authorization': `Bearer ${SAT}`}
//     })
//     const data = await response.json()
//     if(!response.ok){
//         console.log("There was an error fetching top 50 songs")
//         res.status(404).json({error: "There was an error fetching the 50 most popular songs"})
//     }
//     const MostPopTracks = data.items.map(track => ({
//         trackName: track.name,
//         trackId: track.id
//     }))
//     MostPopTracks.forEach(track => {
//         if (!uniqueTrackIds.has(track.id)) {
//             uniqueTrackIds.add(track.id);
//             allTracks.push(track);
//         }
//     });
//     console.log("Most Popular Tracks recieved")
// }
// catch(error){
//     console.log("There was an error with the 50 most popular songs request: ", error.message)
//     res.status(404).json({error: "There was an error fetch most popular tracks"})
// }