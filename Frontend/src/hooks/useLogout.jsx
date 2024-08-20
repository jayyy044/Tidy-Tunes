import React from 'react'
import { useAuthContext } from './useAuthContext'
import { usePlaylistContext } from './usePlaylistContext'

export const useLogout = () => {
    const { dispatch} = useAuthContext()
    const {dispatch:playlistDispatch}= usePlaylistContext()
    const LogOut = () => {
        localStorage.clear()
        dispatch({ type: 'LOGOUT'})
        playlistDispatch({type: 'LOGOUT'})
     }

  return { LogOut }
}
