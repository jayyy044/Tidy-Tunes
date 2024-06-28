require('dotenv').config()

const querystring = require('querystring')

const AuthPage = (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token == null) {
        console.log("No Authorization Header");
        return res.status(401).send("No Authorization Header");
    }
    res.json({AccessToken: token,payload_user:req.user}).status(200)
};

const SpotifyAccess = (req, res) => {
  const scope = 'user-read-private user-read-email'
  const params = {
      client_id: process.env.CLIENT_ID,
      response_type: 'code',
      scope: scope,
      redirect_uri: process.env.REDIRECT_URI,
      show_dialog: true
  }


  const authUrl = `${process.env.AUTH_URL}?${querystring.stringify(params)}`;
  res.json({ authUrl: authUrl });
}
module.exports = {
  AuthPage,
  SpotifyAccess
};
