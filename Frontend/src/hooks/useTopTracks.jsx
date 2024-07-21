import React from 'react'
import { toast } from 'react-toastify'

export const useTopTracks = () => {
  const UserTopTracks = async (JWT_access, Spotify_access_Token) => {
    try{
      const response = await fetch( `/api/dashboard/TopTracks/${Spotify_access_Token}`,{
        headers:{
          'Authorization': `Bearer ${JWT_access}`
        },
      })
      const { sortedTrackList }= await response.json()
      if(!response.ok){
        toast.error("Couldn't get tracks")
        console.log('Error fetching tracks')
        return
      }
      console.log("Top Tracks recieved")
      return sortedTrackList
    }
    catch(error){
      console.log("An error occured", error.message)
    }
      
  }
  return{UserTopTracks}
}
