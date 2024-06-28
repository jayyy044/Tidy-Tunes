import React, {createContext, useReducer } from 'react'
export const AuthContext = createContext()

const tokenState = {
    token: null
}
export const AuthReducer = (state, action) => {
    switch(action.type){
        case 'LOGIN':
            return {
            ...state,
            token: action.payload,
            };
        case 'LOGOUT':
            return {
            ...state,
            token: null,
            };
        default:
            return state;
    }
}

export const AuthContextProvider = ({ children }) => {
    const [state, dispatch] = useReducer(AuthReducer, tokenState)
  return (
    <AuthContext.Provider value = {{ state, dispatch}}>
        { children }
    </AuthContext.Provider>
  )
}