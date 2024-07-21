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
import PlaylistRefinePage from './pages/PlaylistRefinePage/PlaylistRefinePage'
import "./app.css";
import { useAuthContext } from './hooks/useAuthContext'
import Loader from './components/Loader/Loader'


function App() {
  const { state, dispatch } = useAuthContext(); // Context for authentication
  const [isLoading, setIsLoading] = useState(true); // Loading state

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("User"));
    const SpotifyTokens = JSON.parse(localStorage.getItem('SpotifyTokens'))
    const playlistId = localStorage.getItem('RefinePlaylist');

    if (user) {
      dispatch({ type: "LOGIN", payload: user }); 
    }
    if(SpotifyTokens){
      dispatch({ type: 'SPOTIFY_ACCESS', payload: SpotifyTokens})
    }
    if(playlistId){
      dispatch({ type: 'PLAYLIST_ID', payload: playlistId})
    }
    setIsLoading(false); 
  }, []);

  if (isLoading) {
    return <Loader/>; 
  }
  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route path = '/' element= {<MainLayout/>}>
          <Route index element = {<HomePage/>}/>
          <Route path = '/register' element = {<RegisterPage/>}/>
          <Route path = '/login' element = {<LoginPage/>}/>
          <Route path='/dashboard' element={state.JWT_access ? <SpotifyPage /> : <Navigate to='/login' />} />
          <Route path= '/playlistRefine' element={state.JWT_access ? <PlaylistRefinePage/> : <Navigate to='/login'/>}/>
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
