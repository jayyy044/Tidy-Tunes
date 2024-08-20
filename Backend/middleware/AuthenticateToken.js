const jwt = require('jsonwebtoken');

const authorizeToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token == null) {
        console.log("No Authorization Token");
        return res.status(403).json({ error: "No Authorization Token"});
    }  

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                console.warn("Jwt Acces Token Expired");
                return res.status(403).json({ error: "Token Expired" });
            } else {
                console.log("Token Verification Error:", err);
                return res.status(403).json({ error: "Token Verification Error" });
            }
        }
        req.user = user;  
        next();
    });
};

module.exports = authorizeToken;

