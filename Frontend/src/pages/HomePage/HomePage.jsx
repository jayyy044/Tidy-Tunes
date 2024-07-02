import React from 'react';
import { Link } from 'react-router-dom'
import './HomePage.css'
import headphonesPng from '../../assets/headphones_removed.png'

const HomePage = () => {

  return (
    <>
              {/* <h2>Our Mission</h2>
        <h4>At Tidy Tunes, our mission is to enhance your 
          music listening experience by helping you curate 
          the perfect playlist. We monitor your 
          listening habits and provide personalized suggestions 
          to keep your playlist fresh and enjoyable. 
          Additionally, we keep an eye on your favorite 
          artists, analyzing their new releases to rank 
          songs based on your unique preferences. 
          With Tidy Tunes, you'll always have a 
          playlist that resonates with your musical 
          taste, ensuring every listening session is a joy.
        </h4>
        <h2>Our Mission</h2>
        <h4>At Tidy Tunes, our mission is to enhance your 
          music listening experience by helping you curate 
          the perfect playlist. We monitor your 
          listening habits and provide personalized suggestions 
          to keep your playlist fresh and enjoyable. 
          Additionally, we keep an eye on your favorite 
          artists, analyzing their new releases to rank 
          songs based on your unique preferences. 
          With Tidy Tunes, you'll always have a 
          playlist that resonates with your musical 
          taste, ensuring every listening session is a joy.
        </h4>
        </div>
          <img src={headphonesPng}/>
        </div> */}
      <div className="HomeContainer">
        <div className="Homepage_Welcome">
          hello
          {/* <p id='hh'>Welcome to Tidy Tunes</p>
          <h3>Redefine Your Music Listening Experience</h3> */}
        </div>
        <div className="image">
            <img src={headphonesPng}/>
        </div>
        <div className="HomePage_content">
          helllo2
        </div>
      </div>
      
    </>
  );
}

export default HomePage;

