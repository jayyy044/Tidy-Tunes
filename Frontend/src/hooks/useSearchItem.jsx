import React from 'react'

export const useSearchItem = () => {
    const searchitem = async (item, JWT, SAT) => {
        try {

            const response = await fetch(`/api/feature/searchitem?SAT=${SAT}&item=${item}`, {
                headers: {'Authorization' : `Bearer ${JWT}`}
            })
            const data = await response.json()
            if(!response.ok){
                console.log("There was an error when trying to look up item")
            }
            console.log(data)
            console.log("GOT THE DATa")
        }
        catch(error){
            console.log("An error occured when trying to search item: ", error.message)
        }


    }
  return{searchitem}
}
