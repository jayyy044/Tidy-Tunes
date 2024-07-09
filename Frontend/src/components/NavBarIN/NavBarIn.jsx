import './NavBarIn.css'
import React, {useRef, useState, useEffect} from 'react'
import { Link , NavLink } from 'react-router-dom'
import { Drawer } from 'antd'
import MediaQuery from 'react-responsive'
import { TfiAlignJustify } from "react-icons/tfi";
import LogoImg from '../../assets/TidyTunes_Logo.png'
import { useLogout } from '../../hooks/useLogout'

const NavBarIn = () => {
  const { LogOut } = useLogout()
  const elementRef = useRef(null);
  const [height, setHeight] = useState(0);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const updateHeight = () => {
      if (elementRef.current) {
        const rect = elementRef.current.getBoundingClientRect();
        setHeight(rect.height);
        document.documentElement.style.setProperty('--navbarHeight', `${rect.height}px`);
      }
    };

    // Update height initially
    updateHeight();

    // Set up a resize observer to update height on window resize
    const resizeObserver = new ResizeObserver(updateHeight);
    resizeObserver.observe(elementRef.current);

    // Clean up the observer on component unmount
    return () => {
      if (elementRef.current) {
        resizeObserver.unobserve(elementRef.current);
      }
    };
  }, []);
  const showDrawer = () => {
    setOpen(true);
  };
  const closeDrawer = () => {
    setOpen(false);
  };
  const handleClicker = () => {
    LogOut()
  }

  return (
    <>
            <nav ref= {elementRef} className='NavContainer'>
        <Link to ='/' className='LogoImage'>
          <img src={LogoImg} alt='Logo Image'/>
        </Link>
        <Link to = '/' className='homeButton'>
            <h2>
                Tidy Tunes
            </h2>
        </Link>
        <MediaQuery minWidth={750}>
          <div className="user">
            <NavLink onClick={handleClicker} >
              <h2>
                Logout
              </h2>
            </NavLink>
            <NavLink to='/register' >
            <h2>
                Add Links to features
              </h2>
            </NavLink>
          </div>
        </MediaQuery>
        <MediaQuery maxWidth={749}>
          <TfiAlignJustify className= 'icon' onClick={showDrawer}/>
          <Drawer title="Get Started" onClose={closeDrawer} open={open} className='drawer'>
            <NavLink to= '/login' onClick={closeDrawer} >
              <h2>
                Add Links to features
              </h2>
            </NavLink>
            <NavLink to='/register' onClick={closeDrawer} >
              <h2>
                Sign Up
              </h2>
            </NavLink>
          </Drawer>
        </MediaQuery>
      </nav>
      {/* <nav className='in'>
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
      </nav> */}
    </>
  )
}

export default NavBarIn