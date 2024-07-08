import React, { createContext, useReducer } from 'react';

export const AuthContext = createContext();


const UserState = {
    JWT_access: null,
    Spotify_access: null,
    Spotify_refresh: null,
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
        case 'LOGOUT':
            return {
                ...state,
                token: null,
            };
        default:
            return state;
    }
};

export const AuthContextProvider = ({ children }) => {
    const [state, dispatch] = useReducer(AuthReducer, UserState)
    localStorage.setItem('userState', JSON.stringify(UserState));
  return (
    <AuthContext.Provider value = {{ state, dispatch}}>
        { children }
    </AuthContext.Provider>
  )
}

