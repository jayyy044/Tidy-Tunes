import React, { createContext, useEffect, useReducer } from 'react';

export const AuthContext = createContext();


const UserState = {
    JWT_access: null,
    Spotify_access: null,
    Spotify_refresh: null,
    Spotify_Auth_Code:null,
    Username: null
};

export const AuthReducer = (state, action) => {
    switch(action.type) {
        case 'LOGIN':
            return {
                ...state,
                JWT_access: action.payload.JWT_access,
                Username: action.payload.Username,
            };
        case 'SPOTIFY_ACCESS':
            return {
                ...state,
                Spotify_access: action.payload.Spotify_access,
                Spotify_refresh: action.payload.Spotify_refresh
            }
        case 'SPOTIFY_AUTH_CODE':
            return {
                ...state,
                Spotify_Auth_Code: action.payload,
            }
        case 'LOGOUT':
            return {
                JWT_access: null,
                Spotify_access: null,
                Spotify_refresh: null,
                Spotify_Auth_Code:null,
                Username: null
            };
        default:
            return state;
    }
};

export const AuthContextProvider = ({ children }) => {
    const [state, dispatch] = useReducer(AuthReducer, UserState)
   
  return (
    <AuthContext.Provider value = {{ state, dispatch}}>
        { children }
    </AuthContext.Provider>
  )
}

