import React from 'react'
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from './useAuthContext';
import { toast } from 'react-toastify';

export const useSpotifyToken = () => {
    const navigate = useNavigate();
    const {dispatch } = useAuthContext()
  
    const SpotifyTokenSearch = async () => {
      const urlSearch = new URLSearchParams(window.location.search);
      const Spotify_access = urlSearch.get('SAT');
      const expirationTime = urlSearch.get('expiresin');
      const Error = urlSearch.get('error');

      if (Error) {
        console.log(`error: ${Error}`);
        toast.error("An Error occurred with your authorization");
        navigate('/error');
        return ;
      }
      if (!Spotify_access || !expirationTime) {
        console.log("One of the url parameters are missing");
        toast.error("You weren't given authorization, please try again");
        navigate('/login');
        return ;
      }
  
      console.log('Spotify Access Received');
      let userState = JSON.parse(localStorage.getItem('UserState'));
      userState = {
          ...userState,
          Spotify_access,
          expirationTime
      };
      localStorage.setItem('UserState', JSON.stringify(userState));
      const SpotifyAccess = { Spotify_access, expirationTime }
      dispatch({ type: "SPOTIFY_ACCESS", payload: SpotifyAccess });
      return SpotifyAccess
    }
  
    return { SpotifyTokenSearch };
  };
