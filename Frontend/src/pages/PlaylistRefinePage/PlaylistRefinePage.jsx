import React, { useEffect, useState, useRef } from 'react'
import './PlaylistRefinePage.css'
import { usePlaylistFetch } from '../../hooks/usePlaylistFetch'
import { useAuthContext } from '../../hooks/useAuthContext'
import { usePlaylistTracks } from '../../hooks/usePlaylistTracks'
import { usePlaylistContext } from '../../hooks/usePlaylistContext'
import Loader from '../../components/Loader/Loader';
import { useSongAnalysis } from '../../hooks/useSongAnalysis'
import { useRecentlyPlayed } from '../../hooks/useRecentlyPlayed'
import { useDeleteTrack } from '../../hooks/useDeleteTrack'
import { Carousel, Modal, Tooltip } from 'antd';
import { FiAlertTriangle } from "react-icons/fi";
import { MdOutlineRefresh } from "react-icons/md";
import { GrCircleQuestion } from "react-icons/gr";
import { toast } from 'react-toastify'


const PlaylistRefinePage = () => {
  const { RunSongAnalysis } = useSongAnalysis()
  const { getPlaylistTracks }= usePlaylistTracks()
  const { PlaylistFetch }= usePlaylistFetch()
  const {fetchRecentlyPlayed} = useRecentlyPlayed()
  const { DeleteTrack } = useDeleteTrack()
  const requestsent = useRef(false)
  const { state } = useAuthContext()
  const { state: playlistState} = usePlaylistContext()
  const [ playlists, setPlaylist ] = useState([])
  const [ isLoading, setIsLoading ] = useState(true)
  const [recentlyadded, setRecentlyAdded ] = useState(null)
  const [recentlyplayed, setRecentlyPlayed] = useState(null)
  const [analyzedsongs, setAnalzedSongs] = useState(null)
  const [visible, setVisible] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState(null);


  useEffect(() => {
    PlaylistFetch(state.JWT_access, state.Spotify_access, state.Email).then(
      (filteredPlaylists) => {
        if (filteredPlaylists) {
          if (playlistState.PlaylistId) {
            console.log("Playlist ID exists");
            const playlistInfo = {
              PlaylistName: playlistState.PlaylistName,
              PlaylistId: playlistState.PlaylistId,
            }
            if(!requestsent.current){
              fetchalldata(playlistInfo)
            }

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
    setPlaylist(null);
    const selectedPlaylist = playlists.find(playlist => playlist.Id === id);
    if (selectedPlaylist) {
      const playlistInfo = {
        PlaylistName: selectedPlaylist.Name,
        PlaylistId: selectedPlaylist.Id,
        TotalTracks: selectedPlaylist.TotalTracks
      }
      fetchalldata(playlistInfo)
    }
 
  };

  const fetchalldata = async (Info) =>{
    try {   
    setPlaylist(null);
    requestsent.current = true
    const songanalysisdata = await RunSongAnalysis(state.Spotify_access, 
      state.JWT_access, 
      Info.PlaylistId,
      state.Email)
    setAnalzedSongs(songanalysisdata)
    fetchRecentlyPlayed(state.Spotify_access, state.JWT_access).then(
      (data) => {
        setRecentlyPlayed(data)
      }
    )
    const playlistTracksdata = await getPlaylistTracks(state.Spotify_access, state.JWT_access, Info, state.Email)
    setRecentlyAdded(playlistTracksdata);
    }
    finally{
      setIsLoading(false)
    }
  }


  const showModal = (track) => {
    setSelectedTrack(track);
    setVisible(true);
  };

  const handleOk = async (event) => {
    event.preventDefault()
    setVisible(false);
    if (selectedTrack) {
      console.log(`Deleting track: ${selectedTrack.trackname}`);
      DeleteTrack(state.Spotify_access, 
      state.JWT_access, 
      playlistState.PlaylistId,
      selectedTrack)
    }
   };
  
  useEffect(() =>{
    const DeletedTrack = localStorage.getItem('Deletion-Track')
    if (DeletedTrack) {
      toast.success(`${DeletedTrack} deleted successfully!`);
      localStorage.removeItem('trackDeleted');
    }
  }, [])

  const handleCancel = () => {
    setVisible(false);
  };

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
              <h2>{recentlyadded.playlistname}</h2>
              <div className="UserText">
                <p>{`User: ${recentlyadded.username}  | `}</p>
                <p className='TT'>{`Total Tracks: ${recentlyadded.totalTracks}`}</p>
              </div>
            </div>
            <Tooltip className='refreshTracks' 
            color='rgba(255, 255, 255, 0.15)' placement='bottom' 
            title ={<p style={{color: 'var(--AccentColor)'}}>Refresh Tracks</p>}
            onClick={() => window.location.reload()}>
              
              <MdOutlineRefresh className="RefreshIcon" />
            </Tooltip>
          </div>
          <div className="RefineTitle2">
            Refine Your Playlist
          </div>
          <Carousel arrows infinite className='RefineCarousel'>
          {analyzedsongs.map((track, index) => (
              <div key={index} className="RefiningTracksCont">
                <div className="Refine-Track">
                  <img src ={track.trackimg} alt={`${track.trackname}'s Image`}/>
                  <p style={{fontSize: '1.5rem', marginTop: '1vh',
                    maxwidth: "100%",
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word',
                    color: 'var(--AccentColor)' 
                  }}>{`${track.trackname}`}</p>
                  <p>{`${track.artistname}`}</p>
                </div>
                <div className="Refine-ArtistCont">
                  <div className="Refine-Artist">
                    <img src={track.artistImage} alt={`${track.mainartistname}'s Name`}/>
                    <div className="Refine-ArtistDescription">
                      <p style={{ fontSize: '3rem', 
                                  borderBottom: '1px solid darkgrey',
                                  color: 'var(--AccentColor)',
                                  maxwidth: "100%",
                                  wordWrap: 'break-word',
                                  overflowWrap: 'break-word' ,
                                }}>{`${track.mainartistname}`}</p>
                      <p>{`${track.artistFollowers} Followers`}</p>
                      <p>{`Main Genres: ${track.artistGenres}`}</p>
                    </div>
                  </div>
                  <div className="similarity">
                    <div className="similaritytext">
                      
                      <span style={{display: 'flex', alignItems: 'center'}}>
                        Tidy Tunes Similarity Decision
                        <Tooltip placement='top'  color='rgba(0, 0, 0, 0.8)' title={
                          <p style={{color: 'var(--AccentColor)'}}
                          >The similarity analysis is not 100% percent accurate user discretion advised</p>
                          }>
                          <GrCircleQuestion style={{
                          marginInline: '0.2vw',
                          fontSize: '20px'}} />
                        </Tooltip>
                        :
                      </span>
                      <p style={{marginLeft: '0.4vw'}}>{track.decision}</p>
                    </div>
                    <button className='TrackDelete' type="primary" onClick={() => showModal(track)}><p>Delete Track</p></button> 
                    <Modal
                      className='DeleteTrackModal'
                      title={<span style={{color: 'var(--AccentColor)',
                        display: 'flex',
                        alignContent: 'center'
                      }}><FiAlertTriangle style={{fontSize: '20px', marginRight: '0.25vw'}}/> Warning</span> }
                      centered
                      open={visible}
                      onOk={handleOk}
                      onCancel={handleCancel}
                      okText="Confirm"
                      cancelText="Cancel"
                      okButtonProps={{ className: 'okButton' }}
                      cancelButtonProps={{ className: 'cancelButton'}}
                    >
                      <p>Are your sure you would like to delete this song?</p>
                    </Modal>
                  </div>
                  
                </div>
              </div>
            ))}
          </Carousel>
        </div>
        <div className="refine-2">
          <div className="RecentlyAddedTitle">
            <p>Recently Added </p>
          </div>
          <Carousel arrows infinite dotPosition="right" className='RecentlyAddedCarousel'>
            {recentlyadded.recentTracks.map((track, index) => (
               <div key={index} className="RecentAddedCont">
                  <img src ={track.trackImage} alt={`${track.trackName}'s Image`}/>
                   <div className="RecentlyAddedTrack">
                    <p style={{fontSize: '2rem'}}>{`${track.trackName}`}</p>
                    <p style={{color: 'var(--AccentColor)'}}>{`${track.artistName}`}</p>
                    <p>{track.addedAt}</p>
                  </div>
                </div>
              ))} 
          </Carousel>
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
                <p style={{fontSize: '2rem', 
                  lineHeight: '2.4rem'}}>{recentTrack.track}</p>
                <p style={{color: 'var(--AccentColor)'}}>{recentTrack.artist}</p>
                <p>{recentTrack.time_ago}</p>
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