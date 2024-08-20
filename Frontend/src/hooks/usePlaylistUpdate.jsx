import React from 'react'
import { toast } from 'react-toastify'
import { useFetch } from './useFetch'

export const usePlaylistUpdate = () => {
    const { AuthFetch } = useFetch()
    const UpdatePlaylist = async (JWT, email, Id, EXPT) =>{
        try{
            const response = await AuthFetch(`/api/feature/updateplaylist?email=${email}&Id=${Id}&EXPT=${EXPT}`, {
                headers: {
                    'Authorization': `Bearer ${JWT}`,
                },
            })
            if(!response.ok){
                console.log("Response Error, failed to update user data")
                toast.error("Failed to updated user data")
                return
            }
            const data = await response.json()
            if(data){
                let playlistData = JSON.parse(localStorage.getItem('PlaylistData'));
                playlistData = {
                    ...playlistData,
                    PlaylistId: '',
                    PlaylistName: ''
                };
                localStorage.setItem('PlaylistData', JSON.stringify(playlistData));
                console.log("User profile successfully updated")
                toast.success("User profile successfully updated")
    
            }
        }
        catch(error){
            console.log("Error, couldn't user's playlist data: ", error.message)
        }
        

    }
  return {UpdatePlaylist}
}
