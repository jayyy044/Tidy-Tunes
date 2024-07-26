import React from 'react'
import { useAuthContext } from './useAuthContext';
import { toast } from 'react-toastify';

export const usePlaylistTracks = () => {
  const {dispatch} = useAuthContext()
  const getPlaylistTracks = async(SpotifyAccess, JWT, playlistinfo, Email) => {
    let playlistData = JSON.parse(localStorage.getItem('PlaylistData'));
    playlistData = {
        ...playlistData,
        PlaylistId: playlistinfo.PlaylistId,
        PlaylistName: playlistinfo.PlaylistName
    };
    localStorage.setItem('PlaylistData', JSON.stringify(playlistData));
    dispatch({ type:'PLAYLIST_ID', payload:playlistData})
    const parsedInfo = JSON.stringify(playlistinfo)
    try {    
      const response = await fetch (`/api/feature/playlistTracks?SAT=${SpotifyAccess}&Info=${parsedInfo}&email=${Email}`,{
        headers: {'Authorization': `Bearer ${JWT}`}
      })
      if(!response.ok){
        console.log("Couldn't fetch the recently added tracks")
        toast.error("Couldn't fetch the recently added tracks")
        return
      }
      const data = await response.json()
      console.log("Recently added tracks to playlist recieved")
      if (data.message === 'Playlist deleted successfully') {
        localStorage.removeItem('PlaylistData');
        window.location.reload();
        console.log("Playlist deleted successfully");
      }
      return data
    }
    catch(error){
      console.log("Couldn't fetch recent tracks", error.message)
      toast.error("An error occured while fetching recent tracks")
    }
 
  }
  return{getPlaylistTracks}
}
