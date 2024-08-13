const { spawn } = require('child_process');
const PlaylistModel = require('../models/PlaylistModel')



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
            trackid: track.id

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
    if (!SAT || !track) {
        console.log("Something is missing from the reqeust");
        console.log("This is SAT:", SAT)
        console.log('This is the track object', track)
        console.log('This is the user email', email)
        console.log('This is the user playlist id', Id)
        res.status(404).json({ error: 'There was an error receiving one of the request parameters' });
        return;
    }
    const user = await PlaylistModel.findOne({email});
    if (!user) {
        console.log("Error finding user");
        return res.status(404).json({ error: 'Failed to find user, invalid email' });
    }

    const AnalyzeSimilarity = async (storedPlaylist, data) => {

        const inputData = {
            existing_songs: storedPlaylist.playlistData,
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
                res.status(404).json({error: "Analysis script failed"})
            });
    
            pythonProcess.on('close', (code) => {
                if (code !== 0) {
                    console.error(`Python script exited with code ${code}`)
                    res.status(404).json({error: "Analysis script failed"})

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
        
        const storedPlaylist = user.playlists.find(pl => pl.playlistId === Id);
        const SimilarityResult = await AnalyzeSimilarity(storedPlaylist, data)
        if(SimilarityResult){
            const parsedresult = JSON.parse(SimilarityResult) 
            parsedresult.decision =  ((parsedresult.mean_euclidean_distance + parsedresult.mean_cosine_similarity) / 2)> 0.18 ? "Similar":"Not Similar" 
            res.status(200).json(parsedresult)
        }
    }
    catch(error){
        console.log("Failed to retrieve tracks audio analysis")
        res.status(404).json({error: "Failed to retrieve tracks audio analysis"})
    }

}

const AlbumAnalyzer = async(req, res) => {
    const { SAT, album, email } = req.body;


    if (!SAT || !album) {
        console.log("Something is missing from the reqeust");
        console.log("This is SAT:", SAT)
        console.log('This is the album object', album)
        console.log('This is the user email', email)
        res.status(404).json({ error: 'There was an error receiving one of the request parameters' });
        return;
    }
    const user = await PlaylistModel.findOne({email});
    if (!user) {
        console.log("Error finding user");
        return res.status(404).json({ error: 'Failed to find user, invalid email' });
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
        const albumtracks = data.items.map(track => ({
            trackname: track.name,
            trackid: track.id,
            artist: track.artists.map(artist => artist.name).join(', '),
            mainartist: track.artists[0]?.name

        }))
        console.log(albumtracks)
    }
    catch(error){

    }

}

module.exports = {
    searchitem,
    TrackAnalyzer,
    AlbumAnalyzer
}