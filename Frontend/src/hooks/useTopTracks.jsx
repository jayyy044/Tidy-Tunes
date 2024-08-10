import React from 'react'
import { toast } from 'react-toastify'

export const useTopTracks = () => {
  const UserTopTracks = async (JWT, SAT) => {
    try{
      const response = await fetch( `/api/dashboard/TopTracks?SAT=${SAT}`,{
        headers:{
          'Authorization': `Bearer ${JWT}`
        }
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
