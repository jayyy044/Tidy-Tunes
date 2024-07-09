import React from 'react'
import './MainLayout.css'
import { Outlet } from 'react-router-dom'
import NavBarOut from '../components/NavBarOUT/NavBarOut'
import NavBarIn from '../components/NavBarIN/NavBarIn'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useAuthContext } from '../hooks/useAuthContext'

const MainLayout = () => {
  const {state} = useAuthContext()
  return (
    <>
        {state.JWT_access ? <NavBarIn/> : <NavBarOut/>}
        <Outlet/>
        <ToastContainer/>
    </>
  )
}

export default MainLayout