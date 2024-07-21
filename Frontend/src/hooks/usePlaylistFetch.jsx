import React from 'react'
import { toast } from 'react-toastify'


export const usePlaylistFetch = () => {
    const PlaylistFetch = async (JWT_access, Spotify_access, email) => {
        try {
            const response = await fetch(`/api/feature/playlist?SAT=${Spotify_access}&email=${email}`,
                {
                headers: { 'Authorization' : `Bearer ${JWT_access}`}
            })
            const data = await response.json()
            const { information } = data
            if(!response.ok){
                console.log("An Error occured with playlist fetching or user checking")
                toast.error("An Error occured with playlist Authorization")
                return
            }
            if (information.filteredPlaylists) {
                console.log("Playlist Authorization Successful");
                return information.filteredPlaylists;
            } else if (information.message) {
                console.log("This user is already authorized");
                return;
            }
        }
        catch(error){
            console.log("An error occured", error.message)
        }
    }

  return{PlaylistFetch}
}
