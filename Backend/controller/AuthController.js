
require('dotenv').config()

const beginSpotifyAuth = async (req, res) => {
   if (req.query.error) {
      console.log(`error: ${req.query.error}`)
      return res.redirect('http://localhost:4000/error')
    }
  const code = req.query.code
  if (code){
    console.log(code)
    res.redirect(`http://localhost:4000/callback/auth?code=${code}`)
  }
  
}

const SpotifyTokens = async (req, res) => {
  const { code } = req.body
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
        console.log("This is the data", data)
        const { access_token, refresh_token, expires_in } = data;
        console.log("Access Token:", access_token);
        //return res.redirect('/playlists/'+ access_token);
        try {
          const response = await fetch(process.env.API_BASE_URL + 'me/playlists', {
            headers: {
              'Authorization': `Bearer ${access_token}`
            }
          });
      
          if (!response.ok) {
            // Handle error response from the Spotify API
            return res.status(response.status).json({ error: 'Failed to fetch playlists' });
          }
      
          const playlists = await response.json();
          console.log(playlists)
          res.json(playlists);

        } 
        catch (error) {
          // Handle any other errors
          console.error('Error fetching playlists:', error);
          res.status(500).json({ error: 'Internal Server Error' });
        }
    } 
    else {
      console.log('Failed to fetch access token:', data.error);
      return res.status(response.status).json({ error: 'Failed to fetch access token' });
    }
  } 
  catch (error) {
        console.error('Error fetching access token:', error);
        return res.status(500).json({ error: 'Internal server error' });
  }

  

   
}

  

    


 

//   if (req.query.code) {
//     const reqBody = {
//         code: req.query.code,
//         grant_type: 'authorization_code',
//         redirect_uri: REDIRECT_URI,
//         client_id: CLIENT_ID,
//         client_secret: CLIENT_SECRET,
//     };
//   }
//   try {
//     const response = await fetch()
//     const response = await t(TOKEN_URL, reqBody, {
//         headers: {
//             'Content-Type': 'application/x-www-form-urlencoded'
//         }
//     });

//     const tokenInfo = response.data;
//     // Here you would typically store the tokens in a session or database
//     // For simplicity, we are just returning them in the response
//     res.json({
//         access_token: tokenInfo.access_token,
//         refresh_token: tokenInfo.refresh_token,
//         expires_in: tokenInfo.expires_in
//     });
//   } catch (error) {
//       res.json({ error: error.response.data });
//   }
// }



const SpotifyAuthUrl = (req, res) => {
  //You can add state parameter to teh params and send a jwt token
  {/*You can then create seperate middle ware for all the spotify shit 
    this will use that state parameter to verify it */}
    const scope = 'user-read-private user-read-email'
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
module.exports = {
  beginSpotifyAuth,
  SpotifyAuthUrl,
  SpotifyTokens
};
