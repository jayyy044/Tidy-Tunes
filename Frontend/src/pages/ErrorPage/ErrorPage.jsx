import React from 'react';
import { Link } from 'react-router-dom';
import question_mark from '../../assets/question_mark.png'
import './ErrorPage.css'

const HomePage = () => {

  return (
    <>
    
        <div className="errorcontainer">
          <div className="message">
            <div className="errortext">
              <h2>Something Went Wrong...</h2>
              <h3>
                  Tidy Tunes requires access to your 
                  spotify account to be able to provide our 
                  services click below to be redirected back 
                  to login page to try again
              </h3>
              <Link to = '/login' >Login Page</Link>
            </div>
            <img src={question_mark}/>
          </div>         
        </div>
    </>
  );
}

export default HomePage;