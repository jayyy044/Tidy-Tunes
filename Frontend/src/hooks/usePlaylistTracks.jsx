import React from 'react'

export const usePlaylistTracks = () => {
  const getPlaylistTracks = async(SpotifyAccess, JWT, playlistinfo) => {
    const butt = JSON.stringify(playlistinfo)
    const response = await fetch (`/api/feature/playlistTracks?SAT=${SpotifyAccess}&Info=${butt}`,{
      headers: {'Authorization': `Bearer ${JWT}`}
    })
    const data = await response.json()
    console.log("GHEHEHHEHE", data)
 
  }
  return{getPlaylistTracks}
}
