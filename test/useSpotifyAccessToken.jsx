import React from 'react'
import { useAuthContext } from '../Frontend/src/hooks/useAuthContext';

export const useSpotifyAccessToken = () => {
    const { state, dispatch } = useAuthContext()

    const SpotifyAccessToken = async (AuthCode) => {
        try {
          const response = await fetch('/api/Auth/AccessToken', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${state.JWT_access}`
            },
            body: JSON.stringify({ AuthCode }),
          });
          const data = await response.json();
          if (response.ok) {
            const SpotifyTokens = { Spotify_access: data.access_token, Spotify_refresh:data.refresh_token}
            localStorage.setItem('SpotifyTokens', JSON.stringify(SpotifyTokens))
            dispatch({ type: "SPOTIFY_ACCESS", payload: SpotifyTokens})
            console.log("Successfully retrieved spotify tokens");
            return data.access_token
          } else {
            console.error("An Error occured when trying to retrieve the spotify tokens:", data.error);
          }
        } catch (error) {
          console.log('An error occured in fetching the tokens: ',error.message);
        }
      };

  return{SpotifyAccessToken}
}
