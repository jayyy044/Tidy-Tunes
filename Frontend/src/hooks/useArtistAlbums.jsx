import React, { useState } from 'react'
import { toast } from 'react-toastify'

export const useArtistAlbums = () => {
    const getArtistAlbums = async (JWT_access, Spotify_access, artistdata) => {
        try{
            const response = await fetch(`/api/dashboard/TopAlbums?SAT=${Spotify_access}&artistID=${artistdata.id}`,
                {
                headers: {'Authorization':`Bearer ${JWT_access}`}
            })
            
            const data = await response.json()
            if (!response.ok) {
                console.log("Failed to fetch albums for artist:", artistdata.name);
                toast.error("There was an error in fetching the albums");
                return null;
            }
            const sortedAlbums = data.sort((a, b) => new Date(b.release_date) - new Date(a.release_date));
            const limitedAlbums = sortedAlbums.slice(0, 8);
            const albumsWithImages = limitedAlbums.map(album => {
                const firstImage = album.images[2] ? album.images[2].url : null;
                return {
                    name: album.name,
                    image: firstImage
                };
            });
            const albumdata = { 
                name: artistdata.name,
                albums: albumsWithImages,
                image: artistdata.image
            };
    
            return albumdata
    
        }
        catch(error){
            console.log("An error occuring in getting albums: ", error.message)
            toast.error('An error occuring in fetching albums')
        }
    }
  return {getArtistAlbums}
}

