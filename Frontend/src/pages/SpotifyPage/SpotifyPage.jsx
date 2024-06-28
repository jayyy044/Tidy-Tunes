import React, { useEffect } from 'react'
import { useAuthContext } from '../../hooks/useAuthContext';
import { toast } from 'react-toastify';
import './SpotifyPage.css'

const SpotifyPage = () => {
  const { state } = useAuthContext()
  // useEffect(() => {
  //   const SpotifyAuthUrl = async () => {
  //     try {
  //       if(!state.token){
  //         toast.error("Please log in")
  //         throw new Error("Please Log in")
  //       }
  //       const response = await fetch('/api/auth/spotify',{
  //         headers:{
  //           'Authorization': `Bearer ${state.token}`
  //         }
  //       });
  //       if (!response.ok) {
  //         throw new Error('Network response was not ok');
  //       }
  //       const data = await response.json();
  //       window.location.href = data.authUrl;
  //     } catch (error) {
  //       console.error('An error occurred:', error);
  //     }
  //   };
  //   SpotifyAuthUrl();
  // }, []);
  return (
    <>
      <div className="contain">

         <div className="pop">
            {state.token}
          </div>
      </div>
    </>
  )
}

export default SpotifyPage