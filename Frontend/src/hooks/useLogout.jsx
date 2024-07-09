import React from 'react'
import { useAuthContext } from './useAuthContext'
import { useNavigate } from 'react-router-dom'

export const useLogout = () => {
    const navigate = useNavigate()
    const {state, dispatch} = useAuthContext()


    const LogOut = () => {
        localStorage.removeItem('userState');
        dispatch({ type: 'LOGOUT'})
        console.log(state.JWT_access)
        console.log("The TOken is ", state.JWT_access)


    }

  return { LogOut }
}
