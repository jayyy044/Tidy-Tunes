import React, { useEffect, useState } from 'react'
import './PlaylistRefinePage.css'
import { usePlaylistFetch } from '../../hooks/usePlaylistFetch'
import { useAuthContext } from '../../hooks/useAuthContext'
import { usePlaylistTracks } from '../../hooks/usePlaylistTracks'
import { usePlaylistContext } from '../../hooks/usePlaylistContext'
import Loader from '../../components/Loader/Loader';
import { Carousel } from 'antd';
import { MdOutlineRefresh } from "react-icons/md";
import { useSongAnalysis } from '../../hooks/useSongAnalysis'
import { useRecentlyPlayed } from '../../hooks/useRecentlyPlayed'


const PlaylistRefinePage = () => {
  const { RunSongAnalysis } = useSongAnalysis()
  const { getPlaylistTracks }= usePlaylistTracks()
  const { PlaylistFetch }= usePlaylistFetch()
  const {fetchRecentlyPlayed} = useRecentlyPlayed()
  const { state } = useAuthContext()
  const { state: playlistState} = usePlaylistContext()
  const [ playlists, setPlaylist ] = useState([])
  const [ isLoading, setIsLoading ] = useState(true)
  const [playlistInfo, setPlaylistInfo] = useState(null);
  const [recentlyadded, setRecentlyAdded ] = useState(null)
  const [recentlyplayed, setRecentlyPlayed] = useState(null)
  const contentStyle = {
    margin: 0,
    height: '160px',
    color: '#fff',
    lineHeight: '160px',
    textAlign: 'center',
    background: '#364d79',
  };
  useEffect(() => {
    PlaylistFetch(state.JWT_access, state.Spotify_access, state.Email).then(
      (filteredPlaylists) => {
        if (filteredPlaylists) {
          if (playlistState.PlaylistId) {
            console.log("Playlist ID exists");
            setPlaylistInfo({
              PlaylistName: playlistState.PlaylistName,
              PlaylistId: playlistState.PlaylistId,
            });
          } else {
            setPlaylist(filteredPlaylists);
            setIsLoading(false);
          }
        }
      }
    );
  }, []);

  const handlePlaylistClick = (id) => {
    console.log("This is the clicked playlist", id)
    setIsLoading(true)
    const selectedPlaylist = playlists.find(playlist => playlist.Id === id);
    if (selectedPlaylist) {
      setPlaylistInfo({
        PlaylistName: selectedPlaylist.Name,
        PlaylistId: selectedPlaylist.Id,
        TotalTracks: selectedPlaylist.TotalTracks
      });
    }
 
  };

  useEffect(()=>{
    if(playlistInfo){
      console.log("Playlist information set: ", playlistInfo)
      setPlaylist(null);
      fetchRecentlyPlayed(state.Spotify_access, state.JWT_access).then(
        (data) => {setRecentlyPlayed(data)
          console.log("GOOOOD", recentlyplayed)
        }
      )
      getPlaylistTracks(state.Spotify_access, state.JWT_access, playlistInfo, state.Email).then(
        (data) => {
            const recentlyAddedObject = {
              username: data.username,
              playlistName: playlistState.PlaylistName,
              playlistImage: data.playlistImage,
              TotalTracks: data.totalTracks,
              recentlyAddedTracks: data.recentTracks,
            };
            setRecentlyAdded(recentlyAddedObject);
            setIsLoading(false)
          }
      );
    }
  }, [playlistInfo])

  const SongAnalyzer = async (event) => {
    event.preventDefault();
    RunSongAnalysis(state.Spotify_access, 
      state.JWT_access, 
      playlistState.PlaylistId,
      state.Email)
  }
 

  if (isLoading) {
    return <Loader/>
  }

  return (
<>
    {playlists ? 
      <div className="PlaylistRefineCont">
         <div className="Playlists">
          <div className="refineTitle">
            <p>Select your Playlist</p>
          </div>
          <div className="PlaylistListCont">
            {playlists.map((playlist, index) => (
              <div key={index} className="playlistList">
                <a className='playlistInfo' onClick={() => handlePlaylistClick(playlist.Id)}>
                  <div className="playlist">
                    <img src={playlist.Image} alt={`This is ${playlist.Name} image`} />                  
                    <p>{`Playlist Name: ${playlist.Name}`}</p>
                  </div>
                  <p>{`Total Tracks ${playlist.TotalTracks}`}</p>
                </a>
              </div>
            ))}
          </div>
        </div> 
      </div>      
        :
      <div className="PlaylistCont">
        <div className="refine-1">
          <div className="PlaylistContainer">
            <img src={recentlyadded.playlistImage}/>
            <div className="PlaylistText">
              <p>Playlist</p>
              <h2>{recentlyadded.playlistName}</h2>
              <div className="UserText">
                <p>{`User: ${recentlyadded.username}  | `}</p>
                <p className='TT'>{`Total Tracks: ${recentlyadded.TotalTracks}`}</p>
              </div>
            </div>
            <div className="tooltip">
              <MdOutlineRefresh className="RefreshIcon" />
              <span className="tooltiptext">Refresh Recents</span>
            </div>
          </div>
          <div className="RefineTitle2">
            Recently Added Tracks
          </div>
          <Carousel arrows infinite className='RefineCarousel'>
            {recentlyadded.recentlyAddedTracks.map((track, index) => (
              <div key={index} className="RecentTracksCont">
                <div className="Track">
                  <img src ={track.trackImage} alt={`${track.trackName}'s Image`}/>
                  <p style={{fontSize: '2rem', marginTop: '1vh'}}>{`${track.trackName}`}</p>
                  <p>{`${track.artistName}`}</p>
                </div>
                <div className="Artist">
                  <img src={track.artistImage} alt={`${track.artistName}'s Name`}/>
                  <div className="artistdescription">
                    <p style={{ fontSize: '3rem', 
                                borderBottom: '1px solid darkgrey',
                                width: 'fit-content',
                                color: 'var(--AccentColor)'
                              }}>{`${track.mainArtist}`}</p>
                    <p>{`${track.artistFollowers} Followers`}</p>
                    <p>{`Main Genres: ${track.artistGenres}`}</p>
                  </div>
                </div>
              </div>
            ))}
          </Carousel>
        </div>
        <div className="refine-2">
          <a onClick={SongAnalyzer}>
            Run analysis
          </a>
        </div>
        <div className="refine-3"> 
          <div className="RecentlyPlayedTitle">
            <p>Recently Played</p>
          </div>
          <Carousel arrows dotPosition="right" infinite className='RecentlyPlayCarousel'>
          {recentlyplayed.map((recentTrack, index) => (
            <div key = {index} className="RecentlyPlayedTrackCont" >
              <img src={recentTrack.trackImg} alt = {`${recentTrack.track}`}/>
              <div className="RecentTracksText">
                <p style={{fontSize: '2.5rem'}}>{recentTrack.track}</p>
                <p style={{color: 'var(--AccentColor)'}}>{recentTrack.artist}</p>
                <p style={{lineHeight: '1.5rem'}}>{recentTrack.time_ago}</p>
              </div>
            </div>
            ))}
          </Carousel>
        </div>
      </div>
      
    }
  </>
  )
}

export default PlaylistRefinePage