import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { AuthContextProvider } from './context/AuthContext.jsx'
import { PlaylistContextProvider } from './context/PlaylistContex.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthContextProvider>
      <PlaylistContextProvider>
       <App /> 
      </PlaylistContextProvider>
    </AuthContextProvider>
  </React.StrictMode>,
)
