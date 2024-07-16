import React from 'react'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'


export const useSpotifyAuthUrl = () => {
    const navigate = useNavigate()
    const SpotifyAuthUrl = async (Access_Token) => {
        try{
            if(!Access_Token){
                navigate('/login')
                toast.error("Please log in")
                console.log("No Access Token Provided Please Login")
            }
            const response = await fetch('/api/Auth/AuthCodeUrl',{
                headers:{
                    'Authorization': `Bearer ${Access_Token}`
                },
            })
            const data = await response.json()
            if(!response.ok){
                navigate('/login')
                toast.error("Network Response Error Please Try again Later")
                console.log('The response was not ok')
            }
            window.location.href = data.authUrl;
        }
        catch (error) {
            console.error('An error occurred:', error.message);
        }

    }
  return{SpotifyAuthUrl}
}
