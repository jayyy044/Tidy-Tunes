import React from 'react'
import { toast } from 'react-toastify'

export const useTrackAnalysis = () => {
    const TrackAnalysis = async (track, JWT, SAT, email, Id) => {
        try{
            const response = await fetch (`/api/feature/analyzetrack`,{
                method: 'POST',
                headers:{
                    'Authorization':`Bearer ${JWT}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    SAT,
                    track,
                    email,
                    Id
                })
            })
            const data = await response.json()
            if(!response.ok){
                console.log("An error occured while trying to analyze track")
                toast.error("Track analysis error")
            }
            console.log("Track Analyzed", data.name)
            toast.success("Track Analyzed")
            return data

        }
        catch(error){
            console.log("There was an error when trying to analyze track: ", error.message)
            toast.error("Error analyzing track")
        }

    }
  return { TrackAnalysis }
}
