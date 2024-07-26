import React from 'react'

export const useSongAnalysis = () => {
  const RunSongAnalysis = async (SAT, JWT, playlistId, Email) => {
    try{
      const response = await fetch(`/api/feature/Top100?SAT=${SAT}&Id=${playlistId}&email=${Email}`,{
        headers:{'Authorization' : `Bearer ${JWT}`}
      })
      const data = await response.json()
      if(!response.ok){
        console.log("There was an error in song analysis")
      }
      console.log("SONG analysis succesful", data)
    }
    catch(error){
      console.log("There was an error with song analysis", error.message)
    }
  }
  return {RunSongAnalysis}
}
