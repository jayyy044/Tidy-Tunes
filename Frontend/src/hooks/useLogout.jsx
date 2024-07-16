import React from 'react'
import { useAuthContext } from './useAuthContext'
import { useNavigate } from 'react-router-dom'

export const useLogout = () => {
    const navigate = useNavigate()
    const {state, dispatch} = useAuthContext()


    const LogOut = () => {
        localStorage.removeItem('User')
        localStorage.removeItem('spotifyAuthCode');
        localStorage.removeItem('SpotifyTokens')
        dispatch({ type: 'LOGOUT'})
     }

  return { LogOut }
}
