import React from 'react'
import { toast } from 'react-toastify'
import { useFetch } from './useFetch'

export const usePlaylistChange = () => {
    const { AuthFetch } = useFetch()
    const ChangePlaylist = async (JWT, email) => {
        let playlistData = JSON.parse(localStorage.getItem('PlaylistData'));
        playlistData = {
            ...playlistData,
            PlaylistId: '',
            PlaylistName: ''
        };
        localStorage.setItem('PlaylistData', JSON.stringify(playlistData));
        try{
            const response = await AuthFetch(`/api/feature/changeplaylist?email=${email}`,{
                headers: {'Authorization':`Bearer ${JWT}`}
            })
            if(!response.ok){
                console.log("Reponse Error, failed to change playlist")
                toast.error("Failed to change playlist")
            }
            const data = await response.json()
            localStorage.setItem('playlist_update', data)
            window.location.reload()
        }
        catch(error){
            console.log("Error occured couldn't change user playlist: ",error.message)
        }

    }
  return {ChangePlaylist}
}
