import React from 'react'
import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider
} from 'react-router-dom'
import MainLayout from './layout/MainLayout'
import HomePage from './pages/HomePage/HomePage'
import RegisterPage from './pages/RegisterPage/RegisterPage'
import LoginPage from './pages/LoginPage/LoginPage'
import SpotifyPage from './pages/SpotifyPage/SpotifyPage'
import "./app.css";
// import { useEffect } from 'react'
// import { useAuthContext } from './hooks/useAuthContext'

function App() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path = '/' element= {<MainLayout/>}>
        <Route index element = {<HomePage/>}/>
        <Route path = '/register' element = {<RegisterPage/>}/>
        <Route path = '/login' element = {<LoginPage/>}/>
        <Route path = '/callback' element = {<SpotifyPage/>}/>
      </Route>
    )
  )

  // const {dispatch} = useAuthContext();

  // useEffect(() => {
  //   token = localStorage.getItem("token")
  //   if (token){
  //     dispatch({type: "LOGIN", payload: token})
  //   }
  
    
  // }, [])
  

  return (
    <>
      <RouterProvider router={router}/>
    </>
  )
}

export default App
