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
        const response = await fetch(`${process.env.API_BASE_URL}search?q=${item}&type=album%2Ctrack&offset=0&limit=5`,{
            headers: {'Authorization' : `Bearer ${SAT}`}
        })
        const data = await response.json()
        if(!response.ok){
            console.log("Couldn't fetch search results for item")
            res.status(404).json({error: "Couldn't fetch search results for item"})
        }
        const dama = data.map(info => ({
            shit: info.albums
        }))
        console.log(dama)
        // console.log(data.tracks.items)
        // console.log(data.albums.items)
        console.log("The data")
    }
    catch(error){
        console.log("An error occured when trying to search for item: ", error.message)
        res.status(404).json({error: "There was an errro search for item"})
    }

}

module.exports = {
    searchitem
}