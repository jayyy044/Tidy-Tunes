import React from 'react'
import { useLogout } from './useLogout'
import { toast } from 'react-toastify'


export const useFetch = () => {
  const {LogOut}= useLogout()
  const AuthFetch = async (url,options={}) => {
    const response = await fetch(url,options)

    if(response.status === 403){
      LogOut()
      toast.warn("Your session expired please login again")
      return
    }

    return response

  }
  return {AuthFetch}
}

