 <h1><img src="https://github.com/jayyy044/Tidy-Tunes/blob/main/Frontend/src/assets/TidyTunes_Logo.png" width="55" height="55" alt="Logo Picture"> Tidy-Tunes · <a href="https://tidy-tunes.netlify.app/" target="_blank">tidy-tunes.netlify.app</a></h1>
 <img src="https://github.com/jayyy044/Tidy-Tunes/blob/main/Frontend/src/assets/homepage.png">
 <h3>Tidy Tunes is a music management web app catering to those invdividuals who want to stay up to date with music but never feel like they have the time to. The frontend is built with vite utlizing React.js and comes with three user friendly pages, the dashboard, a playlist page, and a search page. While the backend is build using node.js and used express.js to handle api request. The backend retrieves all its information from the Spotify API and manages communication with spotify through a Spotify Access token. Additionally, the backend using requests from the frontend to manipulate and MongoDB database. For this application the frontend is hosted with Netlify and the backend is running on an AWS EC2 instance.</h3>
 
 
   <h2>Languages and Tools Used</h2>
  <span>
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB">
    <img src="https://img.shields.io/badge/JavaScript-323330?style=for-the-badge&logo=javascript&logoColor=F7DF1E">
    <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white">
    <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white">
    <img src="https://img.shields.io/badge/Netlify-00C7B7?style=for-the-badge&logo=netlify&logoColor=white">
    <img src="https://img.shields.io/badge/-AntDesign-%230170FE?style=for-the-badge&logo=ant-design&logoColor=white">
    <img src="https://img.shields.io/badge/AWS-%23FF9900.svg?style=for-the-badge&logo=amazon-aws&logoColor=white">
    <img src="https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white">
    <img src="https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white">
    <img src="https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens">
    <img src="https://img.shields.io/badge/-Vite-purple?logo=vite&logoColor=white&style=for-the-badge" alt="badge sample"/>
    <img src="https://img.shields.io/badge/Python-FFD43B?style=for-the-badge&logo=python&logoColor=blue">
  </span>
  <h2>Info on UI</h2>
 <h3> The dashboard page is collection of the users top 10 artist and their latest releases, their most popular genres based on those artist, and finally their top songs in the last couple months.</h3>
<img src="https://github.com/jayyy044/Tidy-Tunes/blob/main/Frontend/src/assets/dashboard.png">
<br>
<h3>The Playlist page gathers the users playlists and requires them to choose one they would like the website to track following this it creates the users music taste off the audio features of the most popular songs and most recent songs. I then use this compiled music to run a similarity analysis on five randmon songs already in that playlist so that users can keep their playlist up to date with their current music taste, removing the tedious task of skipping through 4-5 songs before you start listening. The pages comes with buttons to change the playlist your want the website to track and a refresh button so you can get a new set of analyzed songs. Additionally, the page also has their most recently played songs and most recently added songs.</h3>
<div align="center">
  <img src="https://github.com/jayyy044/Tidy-Tunes/blob/main/Frontend/src/assets/PlaylistPagept1.png" height="500" width="700">
</div>
<img src="https://github.com/jayyy044/Tidy-Tunes/blob/main/Frontend/src/assets/PlaylistPagept2.png">
<br>
<h3>Finally the Search page which allows users to search up songs and albums on which the same similarity analysis is run so users don't need to wait to find out if they will like a song the website will pick up that task for them</h3>
<img src="https://github.com/jayyy044/Tidy-Tunes/blob/main/Frontend/src/assets/Searchpagept1.png">
<img src="https://github.com/jayyy044/Tidy-Tunes/blob/main/Frontend/src/assets/Searchpagept2.png">
