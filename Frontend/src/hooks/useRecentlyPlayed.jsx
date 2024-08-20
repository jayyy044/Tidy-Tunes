import React from 'react'
import { toast } from 'react-toastify'
import { useFetch } from './useFetch'

export const useRecentlyPlayed = () => {
    const { AuthFetch } = useFetch()
    const fetchRecentlyPlayed = async (SAT, JWT, EXPT) =>{
        try{
            const response = await AuthFetch(`/api/feature/RecentlyPlayed?SAT=${SAT}&EXPT=${EXPT}`,{
                headers: {'Authorization' : `Bearer ${JWT}`}
            })
            const data = await response.json()
            if(!response.ok){
                toast.error("Failed to fetch recently played songs")
                console.log("Reponse Error, failed to retrieve recent played tracks ")
                return
            }
            console.log("Recently played tracks recieved")
            return data

        }
        catch(error){
            console.log("An Error occuring with recent played tracks fetch:", error.message)
        }

    }
  return {fetchRecentlyPlayed}
}
