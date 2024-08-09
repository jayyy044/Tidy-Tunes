import React from 'react'
import { toast } from 'react-toastify'

export const useRecentlyPlayed = () => {
    const fetchRecentlyPlayed = async (SAT, JWT) =>{
        try{
            const response = await fetch(`/api/feature/RecentlyPlayed?SAT=${SAT}`,{
                headers: {'Authorization' : `Bearer ${JWT}`}
            })
            const data = await response.json()
            if(!response.ok){
                toast.error("An Error Occured while trying to fetch recently played songs")
                console.log("An Error occuring with recent played tracks fetch")
                return
            }
            console.log("Recently played tracks recieved")
            return data

        }
        catch(error){
            toast.error("An Error Occured while trying to fetch recently played songs")
            console.log("An Error occuring with recent played tracks fetch:", error.message)
        }

    }
  return {fetchRecentlyPlayed}
}
