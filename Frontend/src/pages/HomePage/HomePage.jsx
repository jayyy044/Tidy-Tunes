import React from 'react';
import { Link } from 'react-router-dom'

const HomePage = () => {

  return (
    <>
      <h2>Home Page</h2>
      <Link to='/register'>Sign Up </Link>
      <br/>
      <Link to= '/login'>Login</Link>
    </>
  );
}

export default HomePage;
