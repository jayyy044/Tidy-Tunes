require('dotenv').config()

const getTopTracks = async (req, res) => {
    const{ SAT } = req.query
    if(!SAT){
        console.log("Spotify Access token missing")
        res.status(404).json({error: "Missing a request parameter"})
    }
    try{
        const response = await fetch(`${process.env.API_BASE_URL}me/top/tracks?limit=50&offset=0`,{
            headers:{'Authorization':`Bearer ${SAT}`}
        })
        const data = await response.json();

        if(!response.ok){
            return res.status(404).json({error: 'Failed to fetch top tracks'})
        }
        console.log('Top tracks recieved')

        const tracksList = data.items.map(track => ({
            artistName: track.artists[0].name, 
            trackName: track.name,
            trackImage: track.album.images[2].url,
            trackPop: track.popularity
        }));

        const sortedTrackList = (tracksList.sort((a,b) => b.trackPop - a.trackPop)).slice(0,10)
        return res.status(200).json({ sortedTrackList });
    }
    catch(error){
        console.log("Error Fetching Top Tracks", error.message)
        res.status(500).json({error: 'Internal Server Error'})
    }
}

const getTopArtists_Genres = async (req, res) => {
    const{ SAT } = req.query
    try{
        const response = await fetch(process.env.API_BASE_URL + 'me/top/artists?limit=10&&offset=0',{
            headers:{'Authorization':`Bearer ${SAT}`}
        })
        const data = await response.json();
        if(!response.ok){
            return res.status(404).json({error: 'Failed to fetch top artists'})
        }
        console.log('Top artists recieved', data.items[0].followers)
        const allGenres = [];
        data.items.forEach(artist => {
          artist.genres.forEach(genre => {
            allGenres.push(genre);
          });
        });
        const genreFreq = allGenres.reduce((acc, genre) => {
            acc[genre] = (acc[genre] || 0) + 1;
            return acc;
          }, {});
  
        const sortedGenres = Object.entries(genreFreq).sort((a, b) => b[1] - a[1]);
        const topThreeFrequency = sortedGenres[2][1];
        const topGenresFiltered = sortedGenres.filter(([genre, freq]) => freq >= topThreeFrequency);
        
        console.log("Top Genres recieved")

        const ArtistInfo = data.items.map(item => ({
                ArtistPop:item.popularity,
                ArtistID: item.id,
                ArtistImage: item.images[1]?.url,
                ArtistName: item.name,
                follower: item.followers.total
            }));
        
        return res.status(200).json({topGenresFiltered, ArtistInfo})
    }
    catch(error){
        console.log("Error Fetching Top artists", error.message)
        res.status(500).json({error: 'Internal Server Error'})
    }
}

const getTopAlbums = async (req, res) => {
    const { SAT, artistID } = req.query
    if(!SAT || !artistID){
        console.log("Either the Spotify Access token was not recieved: ", SAT,
            "or the artist id wasn't: ", artistID)
        res.status(404).json({error: 'There was an error recieving either the artist id or spotify access token'})
        return
    }
    try{
        const response = await fetch(`https://api.spotify.com/v1/artists/${artistID}/albums?include_groups=album%2Csingle`, {
            headers: {'Authorization': `Bearer ${SAT}`}
        });
        const data = await response.json()
        if(!response.ok){
            console.log("There was an error fetching the albums")
            res.json({error:'There was an error fetching the albums'})
            return
        }
        return res.status(200).json(data.items)
    }
    catch(error){
        console.log("Failed to fetch artist albums", error.message)
        res.status(404).json({error: "Error retrieving artist albums" })
    }
}

module.exports = {
    getTopTracks,
    getTopArtists_Genres,
    getTopAlbums
}
