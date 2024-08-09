import React from 'react'
import { toast } from 'react-toastify'

export const useDeleteTrack = () => {
    const DeleteTrack = async (SAT, JWT, playlistId, selectedtrack) => {
        try {
            const repsonse = await fetch(`/api/feature/delete?SAT=${SAT}&playlistId=${playlistId}&trackId=${selectedtrack.trackid}`,{
            headers: {'Authorization' : `Bearer ${JWT}`}
            })
            const data = await repsonse.json()
            if(!repsonse.ok){
                console.log("There was an error deleting song")
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



