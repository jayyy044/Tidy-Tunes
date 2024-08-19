import React, { useEffect, useState } from 'react'
import './PlaylistRefinePage.css'
import { usePlaylistFetch } from '../../hooks/usePlaylistFetch'
import { usePlaylistUpdate } from '../../hooks/usePlaylistUpdate'
import { useAuthContext } from '../../hooks/useAuthContext'
import { useRecentlyAdded } from '../../hooks/useRecentlyAdded'
import { usePlaylistContext } from '../../hooks/usePlaylistContext'
import Loader from '../../components/Loader/Loader';
import { useSongAnalysis } from '../../hooks/useSongAnalysis'
import { useRecentlyPlayed } from '../../hooks/useRecentlyPlayed'
import { useDeleteTrack } from '../../hooks/useDeleteTrack'
import { usePlaylistChange } from '../../hooks/usePlaylistChange'
import { Carousel, Modal, Tooltip } from 'antd';
import { FiAlertTriangle } from "react-icons/fi";
import { MdOutlineRefresh } from "react-icons/md";
import { GrCircleQuestion } from "react-icons/gr";
import { PiPlaylist } from "react-icons/pi";
import { toast } from 'react-toastify'


const PlaylistRefinePage = () => {
  const { PlaylistFetch }= usePlaylistFetch()
  const { UpdatePlaylist } = usePlaylistUpdate()
  const { RunSongAnalysis } = useSongAnalysis()
  const { fetchRecentlyAdded }= useRecentlyAdded()
  const {fetchRecentlyPlayed} = useRecentlyPlayed()
  const { DeleteTrack } = useDeleteTrack()
  const { ChangePlaylist } = usePlaylistChange()
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
        if(playlistState.PlaylistId){
          const playlistfind = filteredPlaylists.find(play => play.Id === playlistState.PlaylistId)
          if(!playlistfind){
            UpdatePlaylist(
              state.JWT_access, 
              state.Spotify_access, 
              state.Email, 
              filteredPlaylists,
              playlistState.PlaylistId
            )
            setPlaylist(filteredPlaylists);
            setIsLoading(false);
          }
          console.log("Playlist exists");
          const playlistInfo = {
            PlaylistName: playlistfind.Name,
            PlaylistId: playlistfind.Id,
          }
          fetchalldata(playlistInfo)
        }
        else{
          setPlaylist(filteredPlaylists);
          setIsLoading(false);
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
      }
      fetchalldata(playlistInfo)

    }
 
  };

  const fetchalldata = async (Info) =>{
    try {   
    setPlaylist(null);
    const playlistRecentlyAdded = await fetchRecentlyAdded(state.Spotify_access, state.JWT_access, Info, state.Email)
    setRecentlyAdded(playlistRecentlyAdded);
    const playlistRecentlyPlayed = await fetchRecentlyPlayed(state.Spotify_access, state.JWT_access)
    setRecentlyPlayed(playlistRecentlyPlayed)
    const songanalysisdata = await RunSongAnalysis(
      state.Spotify_access, 
      state.JWT_access, 
      Info.PlaylistId,
      state.Email)
    setAnalzedSongs(songanalysisdata)
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
      DeleteTrack(
      state.Spotify_access, 
      state.JWT_access, 
      playlistState.PlaylistId,
      selectedTrack)
    }
   };
  
  useEffect(() =>{
    const DeletedTrack = localStorage.getItem('Deletion-Track')
    const ChangedPlaylist = localStorage.getItem('playlist_update')
    if (DeletedTrack) {
      toast.success(`${DeletedTrack} deleted successfully!`);
      localStorage.removeItem('Deletion-Track');
    }
    if(ChangedPlaylist){
      toast.success("Playlist Succesfully changed")
      localStorage.removeItem('playlist_update')
    }
  }, [])

  const handleCancel = () => {
    setVisible(false);
  };

  const playlistchange = async () => {
    ChangePlaylist(state.JWT_access,state.Email)
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
            <img src={recentlyadded.playlistImage} alt = {`${recentlyadded.playlistname} Image`}/>
            <div className="PlaylistText" >
              <p>Playlist</p>
              <h2>{recentlyadded.playlistname}</h2>
              <div className="UserText">
                <p>{`User: ${recentlyadded.username}  | `}</p>
                <p className='TT'>{`Total Tracks: ${recentlyadded.totalTracks}`}</p>
              </div>
            </div >
            <div className='buttonscont'>
              <Tooltip className='buttonsTooltip' 
              color='rgba(255, 255, 255, 0.15)' placement='left' 
              title ={<p style={{color: 'var(--AccentColor)'}}>Refresh Tracks</p>}
              onClick={() => window.location.reload()}>
                <MdOutlineRefresh />
              </Tooltip>
              <Tooltip className='buttonsTooltip'
              color='rgba(255, 255, 255, 0.15)' placement='left' 
              title ={<p style={{color: 'var(--AccentColor)'}}>Switch Playlist</p>}
              onClick={() => playlistchange()}>
                <PiPlaylist  />
              </Tooltip>
            </div>
            
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