const AuthorizeSpotifyToken = async (req, res, next) => {
    const EXPT = req.query.EXPT
    if(!EXPT){
        console.log("Expiration Time Missing")
        return res.status(403).json({error: "Expiration Time Missing"})
    }
    const current_time = Date.now()
    if(current_time>EXPT){
        return res.status(403).json({error: "Spotify Access Token Expired"})
    }
    next()

}

module.exports = AuthorizeSpotifyToken