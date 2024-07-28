const PlaylistModel = require('../models/PlaylistModel')
const { spawn } = require('child_process');
require('dotenv').config()

const getTop100 = async(req, res) => {
    const { SAT, Id, email } = req.query
    let offset
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
            return data;
        } 
        catch (error) {
            console.log(`Failed to fetch audio features for ID: ${trackId}. Error: ${error.message}`);
            return null;
        }
    }
    const fetchAllAudioAnalyses = async (trackIds) => {
        const allResults = await Promise.all(trackIds.map(id => fetchAudioAnalysis(id)));
        const NumberedValues = allResults.map(obj =>
            Object.keys(obj).reduce((acc, key) => {
                if (typeof obj[key] === 'number') {
                    acc[key] = obj[key];
                }
                return acc;
            }, {})
        )    
       return NumberedValues
    };
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
        
        const recenttracksfeatures = await fetchAllAudioAnalyses(recentTrackId);
        recenttracksfeatures.map(feature => analyses.push(feature))
        console.log("Recent Track Features Added", analyses.length)       
    }
    catch(error){
        console.log("An error occured while fetching recent tracks: ", error.message)
        res.status(500).json({ error: 'An error occurred while fetching the playlist tracks' });
    }
    try{
        const response = await fetch(`${process.env.API_BASE_URL}me/top/tracks?time_range=long_term&limit=50&offset=0`,{
            headers:{'Authorization': `Bearer ${SAT}`}
        })
        const data = await response.json()
        if(!response.ok){
            console.log("There was an error fetching top 50 songs")
            res.status(404).json({error: "There was an error fetching the 50 most popular songs"})
        }
        const PopTrackIds = data.items.filter(track => track.name && track.id).map(track => track.id)
        const poptracksfeatures = await fetchAllAudioAnalyses(PopTrackIds);
        poptracksfeatures.map(feature => analyses.push(feature))
        console.log("Popular Track Features Added", analyses.length)    
    
    }
    catch(error){
        console.log("There was an error with the 50 most popular songs request: ", error.message)
        res.status(404).json({error: "There was an error fetch most popular tracks"})
    }

    const newSong = {
        "acousticness": 0.205,
        "danceability": 0.392,
        "duration_ms": 293293,
        "energy": 0.37,
        "instrumentalness": 0.0096,
        "key": 9,
        "liveness": 0.0821,
        "loudness": -10.888,
        "mode": 1,
        "speechiness": 0.0298,
        "tempo": 48.718,
        "time_signature": 4,
        "valence": 0.512
      }
    const pythonProcess = spawn('python', ['scripts/process_data.py']);
    pythonProcess.stdin.write(JSON.stringify({ existing_songs: analyses, new_song: newSong }));
    // pythonProcess.stdin.write(JSON.stringify(analyses));
    pythonProcess.stdin.end();

    pythonProcess.stdout.on('data', (data) => {
        const processedData = JSON.parse(data.toString());
        console.log('Output from Python script:', processedData);
        // res.status(200).json(processedData);
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error('Error from Python script:', data.toString());
        res.status(500).json({ error: 'Failed to process data with Python script' });
    });

 

}

module.exports = {
    getTop100,
}

