
const beginSpotifyAuth = async (req, res) => {
   if (req.query.error) {
    console.log(`error: ${req.query.error}`)
    res.redirect('http://localhost:4000/error')
    return 
    
    }
  const code = req.query.code
  if(code){
    res.redirect('http://localhost:4000/callback')
    console.log(`The Code we got: ${code}`)
    const req_body = new URLSearchParams ({
      'code':code,
      'grant_type':"authorization_code",
      'redirect_uri': process.env.REDIRECT_URI,
      'client_id': process.env.CLIENT_ID,
      'client_secret': process.env.CLIENT_SECRET
    })
    try{
      response = await fetch (process.env.TOKEN_URL,{
        method: 'POST',
        body: req_body
      })
      const data = await response.json()
      if(!response.ok){
        res.send("ERROR")
        console.log("ERROR")
      }
      console.log(data)

    }
    catch (error) {
      console.error('Error fetching token:', error);
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

};

const SpotifyAuthUrl = (req, res) => {
  const scope = 'user-read-private user-read-email'
  const params = new URLSearchParams({
      client_id: process.env.CLIENT_ID,
      response_type: 'code',
      scope: scope,
      redirect_uri: process.env.REDIRECT_URI,
      show_dialog: true
  })


  const authUrl = `${process.env.AUTH_URL}?${params.toString()}`;
  res.json({ authUrl: authUrl });
}
module.exports = {
  beginSpotifyAuth,
  SpotifyAuthUrl
};
