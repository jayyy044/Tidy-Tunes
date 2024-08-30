import React, { useState } from 'react'
import { toast } from 'react-toastify'
import { useFetch } from './useFetch'

export const useArtistAlbums = () => {
    const { AuthFetch }= useFetch()
    const getArtistAlbums = async (JWT, SAT, artistdata, EXPT, Popularity) => {
        try{
            const response = await AuthFetch(`/api/dashboard/TopAlbums?SAT=${SAT}&artistID=${artistdata.id}&EXPT=${EXPT}`,
                {
                headers: {'Authorization':`Bearer ${JWT}`}
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
            const artistpopularity = Popularity.find(artist => artist.ArtistName === artistdata.name )
            const albumdata = { 
                name: artistdata.name,
                albums: albumsWithImages,
                image: artistdata.image,
                artistpop: artistpopularity.ArtistPop,
                follower: artistdata.follower
            };
            console.log("Popularity", albumdata)
            return albumdata
    
        }
        catch(error){
            console.log("An error occuring in getting albums: ", error.message)
        }
    }
  return {getArtistAlbums}
}

