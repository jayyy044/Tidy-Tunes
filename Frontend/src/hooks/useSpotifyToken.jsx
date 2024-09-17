import React from 'react'
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from './useAuthContext';
import { toast } from 'react-toastify';
import { PlaylistContext } from '../context/PlaylistContex';
import { usePlaylistChange } from './usePlaylistChange';
import { usePlaylistContext } from './usePlaylistContext';

export const useSpotifyToken = () => {
    const navigate = useNavigate();
    const {dispatch, state } = useAuthContext()
    const {state:playlistState} = usePlaylistContext()
  
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
        if(state.Spotify_access){
          const SpotifyAccess = { Spotify_access: state.Spotify_access, expirationTime: state.expirationTime };
          return SpotifyAccess;
        }
        else{
          console.log("One of the url parameters are missing");
          toast.error("You weren't given authorization, please try again");
          navigate('/login');
          return ;
        }
        
      }
      else{
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
      
    }
  
    return { SpotifyTokenSearch };
  };
