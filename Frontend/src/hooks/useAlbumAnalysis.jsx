import React from 'react'
import { toast } from 'react-toastify'


export const useAlbumAnalysis = () => {
    const AlbumAnalysis = async (album, JWT, SAT, email, Id) => {
        try{
            const response = await fetch(`/api/feature/analyzealbum`,{
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization' : `Bearer ${JWT}`},
                body: JSON.stringify({
                    SAT,
                    album,
                    email,
                    Id
                })
            })
            const data = await response.json()
            if(!response.ok){
                console.log("An error occured while trying to analyze album")
                toast.error("Album analysis error")
            }
            console.log("Album Analyzed", data)
            toast.success("Album Analyzed")
            return data

        }
        catch(error){
            console.log("There was an error when trying to analyze album: ", error.message)
            toast.error("Error analyzing album")
        }


    }
  return { AlbumAnalysis }
}
