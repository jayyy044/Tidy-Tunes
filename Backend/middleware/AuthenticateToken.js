const jwt = require('jsonwebtoken');

const authorizeToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token == null) {
        console.log("No Authorization Header");
        return res.status(401).send("No Authorization Header");
    }  

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            console.log("Token Verification Error:", err);
            return res.status(403).send("Token Verification Error");
        }
        req.user = user;  
        next();
    });
};

module.exports = authorizeToken;

