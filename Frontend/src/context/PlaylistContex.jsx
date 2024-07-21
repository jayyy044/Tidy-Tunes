import React, { createContext, useEffect, useReducer } from 'react';

export const PlaylistContext = createContext();


const PlaylistState = {
    PlaylistId:null,
    PlaylistName:null
};

export const PlaylistReducer = (state, action) => {
    switch(action.type) {
        case 'LOGIN':
            return {
                ...state,
                PlaylistId:action.payload.PlaylistId,
                PlaylistName:action.payload.PlaylistName
            };
        case "SET_PLAYLIST_STATE":
            return action.payload
        case 'LOGOUT':
            return {
                PlaylistId:null,
                PlaylistName: null
            };
        default:
            return state;
    }
};

export const PlaylistContextProvider = ({ children }) => {
    const [state, dispatch] = useReducer(PlaylistReducer, PlaylistState)
   
  return (
    <PlaylistContext.Provider value = {{ state, dispatch}}>
        { children }
    </PlaylistContext.Provider>
  )
}

