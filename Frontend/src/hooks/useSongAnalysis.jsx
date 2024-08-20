import React from 'react'
import { toast } from 'react-toastify'
import { useFetch } from './useFetch'

export const useSongAnalysis = () => {
  const { AuthFetch } =  useFetch()
  const RunSongAnalysis = async (SAT, JWT, playlistId, Email, EXPT) => {
    try{
      const response = await AuthFetch(`/api/feature/songanalysis?SAT=${SAT}&Id=${playlistId}&email=${Email}&EXPT=${EXPT}`,{
        headers:{'Authorization' : `Bearer ${JWT}`}
      })
      const data = await response.json()
      if(!response.ok){
        console.log("There was an error in song analysis")
        toast.error(" An error occured when trying to analyze songs")
      }
      console.log("Song analysis succesful")
      toast.success("Song analysis complete")
      return data
    }
    catch(error){
      console.log("There was an error with song analysis", error.message)
    }
  }
  return {RunSongAnalysis}
}
