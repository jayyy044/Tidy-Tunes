import React from 'react'
import { toast } from 'react-toastify'
import { useFetch } from './useFetch'


export const usePlaylistFetch = () => {
    const { AuthFetch } = useFetch()
    const PlaylistFetch = async (JWT, SAT, email, EXPT) => {
        try {
            const response = await AuthFetch(`/api/feature/playlist?SAT=${SAT}&email=${email}&EXPT=${EXPT}`,
                {
                headers: { 'Authorization' : `Bearer ${JWT}`}
            })
            const data = await response.json()
            if(!response.ok){
                console.log("Response Error, occured with playlist fetching or user checking")
                toast.error("An Error occured with playlist Authorization")
                return
            }
            return data
        }
        catch(error){
            console.log("Error occured failed to fetch user's playlists:  ", error.message)
        }
    }

  return{PlaylistFetch}
}
