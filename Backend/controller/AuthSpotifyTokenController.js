require('dotenv').config()


const SpotifyAuthUrl = (req, res) => {
    const scope = 'user-read-private user-read-email user-top-read playlist-read-private user-read-recently-played playlist-modify-public playlist-modify-private';
    const params = new URLSearchParams({
      client_id: process.env.CLIENT_ID,
      response_type: 'code',
      scope: scope,
      redirect_uri: process.env.REDIRECT_URI,
      show_dialog: true,
    });
    const authUrl = `${process.env.AUTH_URL}?${params.toString()}`;
    res.json({ authUrl });
}


const SpotifyTokens = async (req, res) => {
  const { code, error } = req.query
  if (error || !code) {
    console.log(`error: ${error}`);
    console.log("There was no authorization code");
    res.redirect('http://localhost:4000/error');
    return;
  }

  const req_body = new URLSearchParams({
    code: code,
    grant_type: 'authorization_code',
    redirect_uri: process.env.REDIRECT_URI,
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
  }).toString();
  
  try {
    const response = await fetch(process.env.TOKEN_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: req_body,
    });
    const data = await response.json();
    if (response.ok) {
      console.log("Access to Api recieved")
      const { access_token, refresh_token, expires_in } = data;
      console.log("This is the access token", access_token)
      return res.redirect(`http://localhost:4000/dashboard?SAT=${access_token}&SRT=${refresh_token}`)
    } 
    else {
      console.log('Failed to get access:', data.error);
      return res.redirect(`http://localhost:4000/dashboard?error=ServerError`)
    }
  } 
  catch (error) {
    console.error('Error Recieving with Auth Code:', error.message);
    // return res.status(500).json({ error: 'Internal server error' });
    return res.redirect(`http://localhost:4000/dashboard?error=ServerError`)
  }

}

module.exports = {
  SpotifyAuthUrl,
  SpotifyTokens
};
