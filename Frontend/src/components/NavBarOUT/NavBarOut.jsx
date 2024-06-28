import React from 'react'
import './NavBarOut.css'
import { Link, NavLink } from 'react-router-dom'

const NavBarOut = () => {
  return (
    <>
      <nav className='out'>
        <Link to = '/' className='homeButton'>
            <h2>
                Tidy Tunes
            </h2>
        </Link>
        <div className="user">
          <NavLink to= '/login' >
            <h2>
              Login
            </h2>
          </NavLink>
          <NavLink to='/register' >
            <h2>
              Sign Up
            </h2>
          </NavLink>
        </div>
      </nav>
    </>
  )
}

export default NavBarOut