import React from 'react'
import { toast } from 'react-toastify'
import { useFetch } from './useFetch'


export const useAddTrack = () => {
    const { AuthFetch } = useFetch()
    const addtrack = async (SAT, JWT, track, Id, EXPT) => {
        try{
           const response = await AuthFetch(`/api/feature/addtrack?EXPT=${EXPT}`,{
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${JWT}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    SAT,
                    track,
                    Id
                })
            })

            if(!response.ok){
                console.log("Response Error, failed to add music to playlist")
                toast.error("Failed to add music")

            } 
            const data = await response.json()
            console.log(data)
            toast.success(data)

        }
        catch(error){
            console.log("Error failed to add music: ", error.message)
            toast.error("Failed to add music to playlist")
        }
        

    }
  return {addtrack}
}
