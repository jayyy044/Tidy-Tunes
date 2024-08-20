import React from 'react'
import { toast } from 'react-toastify'
import { useFetch } from './useFetch'

export const useTopTracks = () => {
  const { AuthFetch } = useFetch()
  const UserTopTracks = async (JWT, SAT, expirationTime) => {
    try{
      console.log("TIME", expirationTime)
      const response = await AuthFetch( `/api/dashboard/TopTracks?SAT=${SAT}&EXPT=${expirationTime}`,{
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
      console.log("Error with retrieving users top tracks: ", error.message)
    }
      
  }
  return{UserTopTracks}
}
