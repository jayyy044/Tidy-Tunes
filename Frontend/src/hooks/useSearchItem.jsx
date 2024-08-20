import React from 'react'
import { useFetch } from './useFetch'

export const useSearchItem = () => {
    const { AuthFetch } = useFetch()
    const searchitem = async (item, JWT, SAT, EXPT) => {
        try {
            const response = await AuthFetch(`/api/feature/searchitem?SAT=${SAT}&item=${item}&EXPT=${EXPT}`, {
                headers: {'Authorization' : `Bearer ${JWT}`}
            })
            const data = await response.json()
            if(!response.ok){
                console.log("There was an error when trying to look up item")
            }
            console.log("Retrieved Search Data")
            return data
        }
        catch(error){
            console.log("An error occured when trying to search item: ", error.message)
        }


    }
  return{searchitem}
}
