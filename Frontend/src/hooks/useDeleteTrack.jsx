import React from 'react'
import { toast } from 'react-toastify'
import { useFetch } from './useFetch'

export const useDeleteTrack = () => {
    const {AuthFetch} = useFetch()
    const DeleteTrack = async (SAT, JWT, playlistId, selectedtrack, EXPT) => {
        try {
            const repsonse = await AuthFetch(`/api/feature/delete?SAT=${SAT}&playlistId=${playlistId}&trackId=${selectedtrack.trackid}&EXPT=${EXPT}`,{
            headers: {'Authorization' : `Bearer ${JWT}`}
            })
            const data = await repsonse.json()
            if(!repsonse.ok){
                console.log("There was an error deleting song")
                toast.error("Failed to delete song")
                return
            }
            localStorage.setItem('Deletion-Track', selectedtrack.trackname);
            window.location.reload();
        }
        catch(error){
            console.log("An error occured when trying to delte song message: ", error.message)
        }

    }
  return{DeleteTrack}
}



