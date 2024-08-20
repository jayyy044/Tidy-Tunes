import React from 'react'
import { useAuthContext } from './useAuthContext';
import { toast } from 'react-toastify';
import { useFetch } from './useFetch';

export const useRecentlyAdded = () => {
  const {dispatch} = useAuthContext()
  const { AuthFetch } = useFetch()
  const fetchRecentlyAdded = async(SAT, JWT, playlistObj, email, EXPT) => {
    let playlistData = JSON.parse(localStorage.getItem('PlaylistData'));
    playlistData = {
        ...playlistData,
        PlaylistId: playlistObj.PlaylistId,
        PlaylistName: playlistObj.PlaylistName
    };
    localStorage.setItem('PlaylistData', JSON.stringify(playlistData));
    dispatch({ type:'PLAYLIST_ID', payload:playlistData})
    try {    
      const response = await AuthFetch(`/api/feature/recentlyadded?EXPT=${EXPT}`,{
        method: "POST",
        headers: {
          'Authorization': `Bearer ${JWT}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          SAT,
          Info: playlistObj,
          email,
        })
      })
      if(!response.ok){
        console.log("Response Error, Couldn't fetch the recently added tracks")
        toast.error("Couldn't fetch the recently added tracks")
        return
      }
      const data = await response.json()
      console.log("Recently added tracks to playlist recieved")
      if (data.message === 'Playlist deleted successfully') {
        localStorage.removeItem('PlaylistData');
        window.location.reload();
      }
      return data
    }
    catch(error){
      console.log("Couldn't fetch recent tracks", error.message)
    }
 
  }
  return{fetchRecentlyAdded}
}
