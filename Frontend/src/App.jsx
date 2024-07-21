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
import { usePlaylistContext } from './hooks/usePlaylistContext'
import Loader from './components/Loader/Loader'


function App() {
  const { dispatch: playlistDispatch }= usePlaylistContext()
  const { state, dispatch } = useAuthContext(); // Context for authentication
  const [isLoading, setIsLoading] = useState(true); // Loading state

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("UserState"));
    const playlist = JSON.parse(localStorage.getItem('PlaylistData')); 
    if (user) {
      dispatch({ type: "SET_USER_STATE", payload: user }); 
    }
    if(playlist){
      playlistDispatch({ type: 'SET_PLAYLIST_STATE', payload: playlist})
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
