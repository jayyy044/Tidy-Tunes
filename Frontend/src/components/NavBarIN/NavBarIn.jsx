import React from 'react'
import './NavBarIn.css'
import { Link, NavLink } from 'react-router-dom'

const NavBarIn = () => {
  return (
    <>
      <nav className='in'>
        <Link to = '/' className='ButtonHome'>
          <h2>
            Tidy Tunes
          </h2>
        </Link>
        <div className="features">
          <NavLink to= '/test1'>
            <h2>
              Add Links to features
            </h2>
          </NavLink>
          <NavLink to= '/test2'>
            <h2>
              Test 2
            </h2>
          </NavLink>
        </div>
      </nav>
    </>
  )
}

export default NavBarIn