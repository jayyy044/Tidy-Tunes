import React, { useEffect, useState } from 'react'
import './PlaylistRefinePage.css'
import { usePlaylistFetch } from '../../hooks/usePlaylistFetch'
import { useAuthContext } from '../../hooks/useAuthContext'
import { usePlaylistTracks } from '../../hooks/usePlaylistTracks'
import Loader from '../../components/Loader/Loader';

const PlaylistRefinePage = () => {
  const { getPlaylistTracks }= usePlaylistTracks()
  const { PlaylistFetch }= usePlaylistFetch()
  const { state, dispatch } = useAuthContext()
  const [ playlists, setPlaylist ] = useState([])
  const [ isLoading, setIsLoading ] = useState(true)
  const [ playlistInfo, setPlaylistInfo ]= useState([])
  
  useEffect(() => {
    if(!state.PlaylistId){
      PlaylistFetch(state.JWT_access, state.Spotify_access, state.Email).then(
        (filteredPlaylists) => {
          if (filteredPlaylists) {
            setPlaylist(filteredPlaylists);
          }
        }
      );
    }
    else{
      
    }

    if(state.PlaylistId){
      const selectedPlaylist = playlists.find(playlist => playlist.Id === id);
      if (selectedPlaylist) {
        setPlaylistInfo({
          name: selectedPlaylist.Name,
          Id: selectedPlaylist.Id,
          TotalTracks: selectedPlaylist.TotalTracks
        });
      }
      setPlaylist(null); // Clear the playlists state
      getPlaylistTracks(state.Spotify_access, state.JWT_access, playlistInfo);

    }
    setIsLoading(false);
  }, []);

  const handlePlaylistClick = (id) => {
    console.log("This is the clicked playlist", id)
    setIsLoading(true)
    const selectedPlaylist = playlists.find(playlist => playlist.Id === id);
    if (selectedPlaylist) {
      setPlaylistInfo({
        name: selectedPlaylist.Name,
        Id: selectedPlaylist.Id,
        TotalTracks: selectedPlaylist.TotalTracks
      });
    }
    localStorage.setItem('RefinePlaylist', id);
    dispatch({ type:'PLAYLIST_ID', payload: id})
    setPlaylist(null); 
    getPlaylistTracks(state.Spotify_access, state.JWT_access, playlistInfo); 
  };

  if (isLoading) {
    return <Loader/>
  }

  return (
<>
    {playlists ? 
      <div className="PlaylistRefine">
        <div className="playlist">
          <div className="refineTitle">
            <p>Select your Playlist</p>
          </div>
          {playlists.map((playlist, index) => (
            <div key={index} className="playlistList">
              <a className='playlistInfo' onClick={() => handlePlaylistClick(playlist.Id)}>
                <p>{`Playlist Name: ${playlist.Name}`}</p>
                <div className="playlistText">                  
                  <img src={playlist.Image} alt={`This is ${playlist.Name} image`} />
                  <p>{`Total Tracks ${playlist.TotalTracks}`}</p>
                </div>
              </a>
            </div>
          ))}
        </div>
      </div>      
        :
      <div className="PlaylistCont">
        <div className="refine-1"> Hello</div>
        <div className="refine-2">hello 2</div>
        <div className="refine-3"> hello 3</div>
      </div>
      
    }
  </>
  )
}

export default PlaylistRefinePage