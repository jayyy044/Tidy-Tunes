import React, { useState, useEffect } from 'react'
import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  Navigate
} from 'react-router-dom'
import MainLayout from './layout/MainLayout'
import HomePage from './pages/HomePage/HomePage'
import RegisterPage from './pages/RegisterPage/RegisterPage'
import LoginPage from './pages/LoginPage/LoginPage'
import SpotifyPage from './pages/SpotifyPage/SpotifyPage'
import ErrorPage from './pages/ErrorPage/ErrorPage'
import "./app.css";
import { useAuthContext } from './hooks/useAuthContext'


function App() {
  const { state, dispatch } = useAuthContext(); // Context for authentication
  const [isLoading, setIsLoading] = useState(true); // Loading state

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("User"));
    const AuthCode = localStorage.getItem('spotifyAuthCode')
    const SpotifyTokens = JSON.parse(localStorage.getItem('SpotifyTokens'))

    if (user) {
      dispatch({ type: "LOGIN", payload: user }); // Log in user if found in local storage
    }
    if(AuthCode){
      dispatch({ type: 'SPOTIFY_AUTH_CODE', payload: AuthCode})
    }
    if(SpotifyTokens){
      dispatch({ type: 'SPOTIFY_ACCESS', payload: SpotifyTokens})
    }
    setIsLoading(false); // Set loading to false
  }, []);

  if (isLoading) {
    return <div>Loading...</div>; 
  }
  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route path = '/' element= {<MainLayout/>}>
          <Route index element = {<HomePage/>}/>
          <Route path = '/register' element = {<RegisterPage/>}/>
          <Route path = '/login' element = {<LoginPage/>}/>
          <Route path='/dashboard' element={state.JWT_access ? <SpotifyPage /> : <Navigate to='/login' />} />
          <Route path='/error' element={<ErrorPage/>}/>
        </Route>
        
      </>
    )
  )


  return (
    <>
      <RouterProvider router={router}/>
    </>
  )
}

export default App
