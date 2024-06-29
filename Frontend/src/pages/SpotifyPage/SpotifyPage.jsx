import React, { useEffect } from 'react'
import { useAuthContext } from '../../hooks/useAuthContext';
import { toast } from 'react-toastify';
import './SpotifyPage.css'

const SpotifyPage = () => {
  const { state } = useAuthContext()
  return (
    <>
      <div className="contain">

         <div className="pop">
            {state.token}
          </div>
      </div>
    </>
  )
}

export default SpotifyPage