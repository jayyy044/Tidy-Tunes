const { spawn } = require('child_process');
const PlaylistModel = require('../models/PlaylistModel')
const UserModel = require('../models/UserModel')
const {
    CheckSelectPlaylist,
    fetchRecentTracks,
    fetchAudioAnalysis,
    fetchMostPopularTracks,
    SavePlaylistData,
    SimilarityFetch,
} = require('./SongComparisonController')

const Analyzer = async (res, SAT, Id, email, analyses, albumtracks) => {
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
    const oneMonthInMillis = 30 * 24 * 60 * 60 * 1000; 
    const timeSinceUpdate = now - updatedAt;
    const totaltrackscondition = checkedPlaylist.tracks.total - storedPlaylist.totalTracks


    if(( totaltrackscondition > 5) || 
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
            if(!albumtracks){
                return storedPlaylist.playlistData
            }
    }
    else{
        if(!albumtracks){
            return storedPlaylist.playlistData
        }
        analyses = [...storedPlaylist.playlistData]
        console.log("Playlist data recieved from database",analyses.length)
    }
    const SimilarityData = await SimilarityFetch(res, albumtracks, analyses, SAT, Id, playlistDocument)
    if(SimilarityData){
        const similaritytracknames = SimilarityData.map(track => ({
            name: track.trackname,
            decision: track.decision
        }))
        console.log("Similarity Analysis:", similaritytracknames)
        console.log("Similarity Analysis on tracks completed")

    }
    return SimilarityData
}
const AddArtistData = async (res, track, SAT) =>{
   
    const response = await fetch(`${process.env.API_BASE_URL}artists/${track.artistid}`, {
        headers: { 'Authorization': `Bearer ${SAT}` }
    });
    const { followers, genres, name } = await response.json();
    if(!response.ok){
        console.log("Repsone Error, failed to fetching artist image")
        return res.status(404).json({error: "Error fetching artist image"})
    }
    return {
        ...track,
        artistFollowers: followers.total,
        artistGenres: genres,
        mainartist: name
    };
}

const searchitem = async (req,res) => {
    const { SAT, item } = req.query;
    if (!SAT || !item) {
        console.log("Something is missing from the reqeust");
        console.log("This is SAT:", SAT)
        console.log('This is the search item', item)
        res.status(404).json({ error: 'There was an error receiving one of the request parameters' });
        return;
    }
    try{
        const response = await fetch(`${process.env.API_BASE_URL}search?q=${item}&type=album,track&offset=0&limit=8`,{
            headers: {'Authorization' : `Bearer ${SAT}`}
        })
        const data = await response.json()
        if(!response.ok){
            console.log("Couldn't fetch search results for item")
            res.status(404).json({error: "Couldn't fetch search results for item"})
        }

        const AlbumResults = data.albums.items.map(album => ({ 
            name: album.name,
            type: album.album_type,
            artist: album.artists.map(artist => artist.name).join(', '),
            albumimg: album.images[1].url,
            albumid: album.id
        }))
        const TrackResults = data.tracks.items.map(track => ({
            name:track.name,
            artist: track.artists.map(artist => artist.name).join(', '),
            trackimg: track.album.images[1].url,
            trackid: track.id,
            artistid: track.artists[0].id

        }))
        res.status(200).json({AlbumResults, TrackResults})

    }
    catch(error){
        console.log("An error occured when trying to search for item: ", error.message)
        res.status(404).json({error: "There was an errro search for item"})
    }

}

const TrackAnalyzer = async(req, res) => {
    const { SAT, track, email, Id } = req.body;
    let analyses = []
    const flagTrack = true
    if (!SAT || !track) {
        console.log("Something is missing from the reqeust");
        console.log("This is SAT:", SAT)
        console.log('This is the track object', track)
        console.log('This is the user email', email)
        console.log('This is the user playlist id', Id)
        res.status(404).json({ error: 'There was an error receiving one of the request parameters' });
        return;
    }
    const storedData = await Analyzer(res, SAT, Id, email, analyses)

    const AnalyzeSimilarity = async (storedData, data) => {

        const inputData = {
            existing_songs: storedData,
            new_song: data
        };

        return new Promise((resolve, reject) => {
            const pythonProcess = spawn('python', ['scripts/SimilarityAnalysis.py']);
    
            pythonProcess.stdin.write(JSON.stringify(inputData));
            pythonProcess.stdin.end();
    
            let outputData = '';
    
            pythonProcess.stdout.on('data', (data) => {
                outputData += data.toString();
            });
    
            pythonProcess.stderr.on('data', (data) => {
                console.error("Similarity analysis failed")
                console.warn(`stderr: ${data}`);
                if (!res.headersSent) {
                    return res.status(404).json({error: "Analysis script failed"})
                }
            });
    
            pythonProcess.on('close', (code) => {
                if (code !== 0) {
                    console.error(`Python script exited with code ${code}`)
                    if (!res.headersSent) {
                        return res.status(404).json({error: "Analysis script failed"})
                    }
                    

                }
                console.log(`Python script exited with code ${code}`)
                resolve(outputData);
            });
        });
    
    }


    try{
        const response = await fetch (`${process.env.API_BASE_URL}audio-features/${track.trackid}`,{
            headers: {'Authorization': `Bearer ${SAT}`}
        })
        if(!response.ok){
            console.log("Response Error, couldn't fetch track's audio analysis ")
            res.status(404).json({error:"Response Error, couldn't fetch track's audio analyis"})
        }
        const data = await response.json()
        const updatedtrack = await AddArtistData(res, track, SAT)
        const SimilarityResult = await AnalyzeSimilarity(storedData, data)
        if(SimilarityResult){
        const parsedresult = JSON.parse(SimilarityResult) 
        updatedtrack.decision =  ((parsedresult.mean_euclidean_distance + parsedresult.mean_cosine_similarity) / 2)> 0.18 ? "Similar":"Not Similar" 
        res.status(200).json(updatedtrack)
    }
    }
    catch(error){
        console.log("Failed to analyze tracks data")
        res.status(404).json({error: "Failed to analyze tracks data"})
    }
    

}

const AlbumAnalyzer = async(req, res) => {
    const { SAT, album, email, Id } = req.body;
    let analyses = []
    let albumtracks
    let updatedartistinfo
    if (!SAT || !album || !email || !Id) {
        console.log("Something is missing from the reqeust");
        console.log("This is SAT:", SAT)
        console.log('This is the album object', album)
        console.log('This is the user email', email)
        console.log('This is the user playlist id', Id)
        res.status(404).json({ error: 'There was an error receiving one of the request parameters' });
        return;
    }
    try{
        const response = await fetch (`${process.env.API_BASE_URL}albums/${album.albumid}/tracks`,{
            headers: {'Authorization': `Bearer ${SAT}`}
        })
        if(!response.ok){
            console.log("Reponse Error, failed to retrieve album tracks")
            res.status(404).json({error: "Response Error, failed to retrieve album tracks"})
        }
        const data = await response.json()
        const artistinfo = {
            artistid:data.items[0].artists[0]?.id
        }
        updatedartistinfo = await AddArtistData(res, artistinfo, SAT)
        if(!updatedartistinfo){
            console.log("Error retrieving artist information from album")
            return res.status(404).json({error: "Error retrieving artist information"})
        }
        albumtracks = data.items.map(track => ({
            trackname: track.name,
            trackid: track.id,
            artist: track.artists.map(artist => artist.name).join(', '),

        }))
        console.log("Album Data analyzed")
    }
    catch(error){
        console.log("Failed to analyze album data: ", error.message)
        return res.status(404).json({error: "Failed to analyze album data"})
    }
    const resultsdata = await Analyzer(res, SAT, Id, email, analyses, albumtracks)

    const updateddata = {
        ...album,
        ...updatedartistinfo,
        tracksdata: resultsdata
    }
    return res.status(200).json(updateddata)

}

const AddTrack = async(req, res) => {
    const {SAT, track, Id} = req.body
    let trackUri
    if (!SAT || !Id || !track) {
        console.log("Something is missing from the reqeust");
        console.log("This is SAT:", SAT)
        console.log('This is the Playlist Id', Id)
        console.log("This is the track information",track )
        return res.status(404).json({ error: 'There was an error receiving one of the request parameters' });
    }
    try{
        const response = await fetch(`${process.env.API_BASE_URL}tracks/${track.trackid}`,{
            headers:{'Authorization':`Bearer ${SAT}`}
        })
        const data = await response.json()
        if(!response.ok){
            console.log("Response Error, couldn't retrive track data")
            return res.status(404).json({error: "We couldn't retrieve the track data"})
        }
        trackUri = data.uri
        console.log("Track Uri retrieved", trackUri)
    }
    catch(error){
        console.log('Failed to retrieve track uri :', error.message)
        res.status(404).json({error: "Error fetching track uri"})
    }
    try{
        const body = {
            uris: [trackUri]
        }
        const response = await fetch(`${process.env.API_BASE_URL}playlists/${Id}/tracks`,{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SAT}`
            },
            body: JSON.stringify(body)
        })
        const data = await response.json()
        if(!response.ok){
            console.log("Response Error, Couldn't Add Song")
            return res.status(404).json({error: "Couldn't Add Song"})
        }
        if(data.snapshot_id){
            console.log("Song Successfully Added")
            let result = 'Song Successfully Added'
            res.status(200).json(result)
        }

    }
    catch(error){
        console.log("Failed to add select track", error.message)
        res.status(404).json({error: "Failed to add track to playlist"})
    }

}

module.exports = {
    searchitem,
    TrackAnalyzer,
    AlbumAnalyzer,
    AddTrack
}