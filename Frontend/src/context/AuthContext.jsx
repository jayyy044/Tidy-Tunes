import React, { createContext, useEffect, useReducer } from 'react';

export const AuthContext = createContext();


const UserState = {
    JWT_access: null,
    Spotify_access: null,
    expirationTime: null,
    Email: null,
};

export const AuthReducer = (state, action) => {
    switch(action.type) {
        case 'LOGIN':
            return {
                ...state,
                JWT_access: action.payload.JWT_access,
                Email: action.payload.Email,
            };
        case 'SPOTIFY_ACCESS':
            return {
                ...state,
                Spotify_access: action.payload.Spotify_access,
                expirationTime: action.payload.expirationTime
            }
        case "SET_USER_STATE":
            return action.payload
        case 'PLAYLIST_ID':
            return{
                ...state,
                PlaylistId: action.payload
            }
        case 'LOGOUT':
            return {
                JWT_access: null,
                Spotify_access: null,
                expirationTime: null,
                Email: null,
                PlaylistId:null
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

