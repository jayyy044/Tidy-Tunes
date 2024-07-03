import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';
import headphonesPng from '../../assets/headphones_removed.png';

const HomePage = () => {
  
  return (
    <div className="HomeContainer">
      <div className="HomePage_Welcome">
        <h1>
          <span>Welcome to</span> 
          <span className='part2'>Tidy Tunes</span> 
        </h1>
        <p>Redefine Your Music Listening Experience</p>
      </div>
      <div className="HomePage_Image">
        <img src={headphonesPng} alt="Headphones" />
      </div>
      
      <div className="HomePage_Content">
        <h1>Our Mission</h1>
        <p>
          At Tidy Tunes, our mission is to enhance your 
          music listening experience by helping you culivate 
          your music. We gaurantee you'll always have a playlist that 
           resonates with your musical taste, ensuring every listening session is a joy.
        </p>
        <Link to='/register'>Get Started</Link>
      </div>
    </div>
  );
};

export default HomePage;
