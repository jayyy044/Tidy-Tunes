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

        console.log(data.albums.items[0])
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
    const { SAT, track } = req.query;

    if (!SAT || !track) {
        console.log("Something is missing from the reqeust");
        console.log("This is SAT:", SAT)
        console.log('This is the track object', track)
        res.status(404).json({ error: 'There was an error receiving one of the request parameters' });
        return;
    }

    

}

const AlbumAnalyzer = async(req, res) => {
    const { SAT, album } = req.query;

    if (!SAT || !album) {
        console.log("Something is missing from the reqeust");
        console.log("This is SAT:", SAT)
        console.log('This is the album object', album)
        res.status(404).json({ error: 'There was an error receiving one of the request parameters' });
        return;
    }

}

module.exports = {
    searchitem,
    TrackAnalyzer,
    AlbumAnalyzer
}