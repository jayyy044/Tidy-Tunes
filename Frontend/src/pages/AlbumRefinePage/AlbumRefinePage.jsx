import React, { useEffect } from 'react'
import './AlbumRefinePage.css'
import { useSearchItem } from '../../hooks/useSearchItem'
import { useAuthContext } from '../../hooks/useAuthContext'

const AlbumRefinePage = () => {
    const { searchitem } = useSearchItem()
    const { state } = useAuthContext()

    useEffect(() => {
        const searchingitem = "GANG"
        searchitem(searchingitem, state.JWT_access, state.Spotify_access,)

    }, [])
  return (
    <div>AlbumRefinePage</div>
  )
}

export default AlbumRefinePage