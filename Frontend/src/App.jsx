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
import ErrorPage from './pages/ErrorPage/ErrorPage'
import "./app.css";


function App() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route path = '/' element= {<MainLayout/>}>
          <Route index element = {<HomePage/>}/>
          <Route path = '/register' element = {<RegisterPage/>}/>
          <Route path = '/login' element = {<LoginPage/>}/>
          <Route path = '/callback/Auth' element = {<SpotifyPage/>}/>
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
