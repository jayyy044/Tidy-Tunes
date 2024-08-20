import React from 'react'
import { toast } from 'react-toastify'

export const useAddTrack = () => {
    const addtrack = async (SAT, JWT, track, Id) => {
        try{
           const response = await fetch('/api/feature/addtrack',{
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
