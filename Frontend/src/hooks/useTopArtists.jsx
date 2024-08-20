import React from 'react'
import { toast } from 'react-toastify'
import { useFetch } from './useFetch'

export const useTopArtists = () => {
  const { AuthFetch } = useFetch()
  const UserTopArtists = async (JWT, SAT, EXPT) => {
    try{
      const response = await AuthFetch( `/api/dashboard/TopArtists?SAT=${SAT}&EXPT=${EXPT}`,{
        headers:{
          'Authorization': `Bearer ${JWT}`
        },
      })
      const {topGenresFiltered, ArtistInfo} = await response.json()
      if(!response.ok){
        toast.error("Couldn't get Artists")
        console.log('Error fetching Artists')
        return
      }
      console.log("Artist Data was recieved")
      const sortedArtistInfo = ArtistInfo.sort((a, b) => b.ArtistPop - a.ArtistPop);
      const TopArtistsObj = {
        sortedArtistInfo,
        topGenresFiltered
      } 
      return TopArtistsObj
    }
    catch(error){
      console.log("Error occured with retrieving users top artists: ", error.message)
    }
      
  }
  return{UserTopArtists}
}