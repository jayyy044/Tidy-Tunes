import React from 'react'
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from './useAuthContext';
import { toast } from 'react-toastify';

export const useSpotifyToken = () => {
    const navigate = useNavigate();
    const { state, dispatch } = useAuthContext()
  
    const SpotifyTokenSearch = () => {
      const urlSearch = new URLSearchParams(window.location.search);
      const Spotify_access = urlSearch.get('SAT');
      const Spotify_refresh = urlSearch.get('SRT');
      const Error = urlSearch.get('error');
  
      if (Error) {
        console.log(`error: ${Error}`);
        toast.error("An Error occurred with your authorization");
        navigate('/error');
        return ;
      }
      if (!Spotify_access || !Spotify_refresh) {
        console.log("Either Refresh or Access Tokens were not received");
        toast.error("You weren't given authorization, please try again");
        navigate('/login');
        return ;
      }
  
      console.log('Spotify Access Received');
      let userState = JSON.parse(localStorage.getItem('UserState'));
      userState = {
          ...userState,
          Spotify_access: Spotify_access,
          Spotify_refresh: Spotify_refresh
      };
      localStorage.setItem('UserState', JSON.stringify(userState));
      const SpotifyTokens = { Spotify_access, Spotify_refresh }
      dispatch({ type: "SPOTIFY_ACCESS", payload: SpotifyTokens });
      return SpotifyTokens
    }
  
    return { SpotifyTokenSearch };
  };
