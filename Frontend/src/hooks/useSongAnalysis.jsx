import React from 'react'
import { toast } from 'react-toastify'

export const useSongAnalysis = () => {
  const RunSongAnalysis = async (SAT, JWT, playlistId, Email) => {
    try{
      const response = await fetch(`/api/feature/songanalysis?SAT=${SAT}&Id=${playlistId}&email=${Email}`,{
        headers:{'Authorization' : `Bearer ${JWT}`}
      })
      const data = await response.json()
      if(!response.ok){
        console.log("There was an error in song analysis")
        toast.error(" An error occured when trying to analyze songs")
      }
      console.log("Song analysis succesful")
      return data
    }
    catch(error){
      console.log("There was an error with song analysis", error.message)
      toast.error("There was an error with trying to analyze songs")
    }
  }
  return {RunSongAnalysis}
}
