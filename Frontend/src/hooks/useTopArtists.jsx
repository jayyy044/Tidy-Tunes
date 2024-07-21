import React from 'react'
import { toast } from 'react-toastify'

export const useTopArtists = () => {
  const UserTopArtists = async (JWT_access, Spotify_access) => {
    try{
      const response = await fetch( `/api/dashboard/TopArtists/${Spotify_access}`,{
        headers:{
          'Authorization': `Bearer ${JWT_access}`
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
      console.log("An error occured", error.message)
    }
      
  }
  return{UserTopArtists}
}