require('dotenv').config()

const express = require('express')

const cors = require ("cors")

const querystring = require('querystring');

const corsOptions = {
    origin: '*',
    credentials:true,           
    optionSuccessStatus:200,
}

const app = express()

app.use(cors(corsOptions))

app.use(express.json())

app.use((req, res, next) => {
    console.log(req.path, req.method)
    next()
})
app.get('/', (req , res) => {
    console.log('hello')
})
app.get('/login', (req, res) => {
    const scope = 'user-read-private user-read-email';
    const params = {
      client_id: process.env.CLIENT_ID,
      response_type: 'code',
      scope: scope,
      redirect_uri: process.env.REDIRECT_URI,
      show_dialog: true
    };
  
    const authUrl = `${process.env.AUTH_URL}?${querystring.stringify(params)}`;
  
    res.redirect(authUrl);
  });

app.get('/callback', async (req, res) => {
    console.log(req)
});
  


app.listen(3000, () => (
    console.log("Listening on Port 3000")
))