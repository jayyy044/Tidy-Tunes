import React, { useEffect, useState } from 'react'
import { useAuthContext } from '../../hooks/useAuthContext';
import { toast } from 'react-toastify';
import './SpotifyPage.css'

const SpotifyPage = () => {
  const { state } = useAuthContext()

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const codeParam = urlParams.get('code');
    if (codeParam) {
      console.log(codeParam)
      SpotifyAccessToken(codeParam)
    }

  }, []);



  const SpotifyAccessToken = async (code) => {
    try {
      const response = await fetch('/api/callback/accesstoken', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });
      const data = await response.json();
      if (response.ok) {
        console.log("success");
        console.log(data)
      } else {
        console.error("Error:", data);
      }
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <>
      <div className="contain">

         <div className="pop">
            {`This is my jwt token ${state.token}`}
          </div>
      </div>
    </>
  )
}

export default SpotifyPage