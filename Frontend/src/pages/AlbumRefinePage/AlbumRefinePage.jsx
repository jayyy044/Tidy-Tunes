import React, { useEffect, useState } from 'react'
import './AlbumRefinePage.css'
import { useSearchItem } from '../../hooks/useSearchItem'
import { useAuthContext } from '../../hooks/useAuthContext'
import { usePlaylistContext } from '../../hooks/usePlaylistContext'
import Loader from '../../components/Loader/Loader';
import { useAlbumAnalysis } from '../../hooks/useAlbumAnalysis';
import { useTrackAnalysis } from '../../hooks/useTrackAnalysis';
import { IoMdArrowRoundBack } from "react-icons/io";
import { Modal, Tooltip } from 'antd';
import { GrCircleQuestion } from "react-icons/gr";
import { useAddTrack } from '../../hooks/useAddTrack'
import MediaQuery from 'react-responsive'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

const AlbumRefinePage = () => {
    const navigate = useNavigate()
    const { searchitem } = useSearchItem()
    const { state } = useAuthContext()
    const { state: playlistState} = usePlaylistContext()
    const { AlbumAnalysis } = useAlbumAnalysis()
    const { TrackAnalysis } = useTrackAnalysis()
    const { addtrack } = useAddTrack()
    const [searchloader_A, setSearchLoader_A ]= useState(false)
    const [searchloader_T, setSearchLoader_T ]= useState(false)
    const [albums, setAlbums] = useState(null)
    const [isloading, setIsLoading] = useState(false)
    const [itemSearch, setItemSearch ]= useState()
    const [tracks, setTracks] = useState(null)
    const [trackAnalysis, setTrackAnalysis] = useState(null)
    const [albumAnalysis, setAlbumAnalysis] = useState(null)
    const [visible, setVisible] = useState(false)
    const [selectedsong, setSelectedAlbumSong] = useState(null)
    
    useEffect(() => {
        if(playlistState.PlaylistId === ""){
            navigate('/playlistrefine')
            toast.warn('This feature is currently unavailable please select a playlist first')
        }
    }, [])

    const SubmitForm = async (event) => {
        event.preventDefault()
        if(itemSearch){
            setIsLoading(true)
            setTrackAnalysis(null)
            setTracks(null)
            setAlbums(null)
            setAlbumAnalysis(null)
            searchitem(itemSearch, state.JWT_access, state.Spotify_access, state.expirationTime).then (
                (data) =>{
                    setTracks(data.TrackResults)
                    setAlbums(data.AlbumResults)
                    setIsLoading(false)
                }
            )  
        }
    }

    const AnalyzeTrack = async (track) => {
        if(track){
            console.log("Track data recieved")
            setSearchLoader_T(true)
            const TrackAnalysisResult = await TrackAnalysis(
                track, 
                state.JWT_access, 
                state.Spotify_access,
                state.Email,
                playlistState.PlaylistId,
                state.expirationTime
                )
            setTrackAnalysis(TrackAnalysisResult)
            setSearchLoader_T(false)
            }
    }

    const AnalyzeAlbum = async (album) => {
        if(album){
            console.log("Album Data Recieved")
            setSearchLoader_A(true)
            const AlbumAnalysisResult = await AlbumAnalysis(
                album, 
                state.JWT_access, 
                state.Spotify_access,
                state.Email,
                playlistState.PlaylistId,
                state.expirationTime
                )
            setAlbumAnalysis(AlbumAnalysisResult)
            setSearchLoader_A(false)
        }
    }

    const handletrackadd = async (data) =>{
        setSearchLoader_T(true)
        await addtrack(
            state.Spotify_access,
            state.JWT_access,
            data,
            playlistState.PlaylistId,
            state.expirationTime
        )
        setSearchLoader_T(false)
    }

    
  const handleOk = async () => {
    setVisible(false);
    setSearchLoader_A(true)
    if(selectedsong){
        console.log(`Added Track: ${selectedsong.trackname}`)
        await addtrack(
            state.Spotify_access,
            state.JWT_access,
            selectedsong,
            playlistState.PlaylistId,
            state.expirationTime

        )
        setSearchLoader_A(false)
    }

   };

    const showModal = () => {
        setVisible(true);
    };

    const handleCancel = () => {
        setVisible(false);
    };

    if (isloading) {
        return <Loader/>
    }

  return (
    <>
        <div className="AlbumRefineCont">
            <div className="albumrefine1">
                <div className="SearchTitle">
                    <p>Search</p>
                    <p>Check what songs are similar to your music taste</p>   
                </div>
                <form onSubmit={SubmitForm}>
                    <input
                        type='text'
                        placeholder='Search for a track or album'
                        onChange={(event) => setItemSearch(event.target.value)}
                        value={itemSearch}
                    />  
                    <button type="submit" disabled={isloading}>Search</button>
                </form>   
            </div>

            <div className='albumrefine2'>
                <div className='tracksresulttite'> 
                    <p>Tracks Results </p>
                    {trackAnalysis && <IoMdArrowRoundBack className='backbutton' onClick={() => setTrackAnalysis(null)}/>}
                </div>
                {searchloader_T ? 
                    <Loader/>
                    :
                    trackAnalysis ? 
                        <div className="Trackanalysiscont">
                            <div className="a_trackcont">
                                <img src={trackAnalysis.trackimg} alt={`Track: "${trackAnalysis.name} image"`}/>
                                <div className="a_tracktextCont">
                                    <p>{trackAnalysis.name} </p>
                                    <p>{`By ${trackAnalysis.artist}`}</p> 
                                    <MediaQuery minWidth={1300}>
                                        <p>{`About the Artist: ${trackAnalysis.mainartist}`}</p>
                                        <p>{`Followers: ${trackAnalysis.artistFollowers}`}</p>
                                        <p>{`Main Genres: ${trackAnalysis.artistGenres.join(', ')}`}</p>
                                    </MediaQuery> 
                                    <MediaQuery maxWidth={999} minWidth={700}>
                                        <p>{`About the Artist: ${trackAnalysis.mainartist}`}</p>
                                        <p>{`Followers: ${trackAnalysis.artistFollowers}`}</p>
                                        <p>{`Main Genres: ${trackAnalysis.artistGenres.join(', ')}`}</p>
                                    </MediaQuery> 
                                </div>
                            </div>   
                            <MediaQuery maxWidth={1299} minWidth={1000}>
                                <div className="AboutTheArtist">
                                    <p>{`About the Artist: ${trackAnalysis.mainartist}`}</p>
                                    <p>{`Followers: ${trackAnalysis.artistFollowers}`}</p>
                                    <p>{`Main Genres: ${trackAnalysis.artistGenres.join(', ')}`}</p>
                                </div>
                            </MediaQuery>
                            <MediaQuery maxWidth={699}>
                                <div className="AboutTheArtist">
                                    <p>{`About the Artist: ${trackAnalysis.mainartist}`}</p>
                                    <p>{`Followers: ${trackAnalysis.artistFollowers}`}</p>
                                    <p>{`Main Genres: ${trackAnalysis.artistGenres.join(', ')}`}</p>
                                </div>
                            </MediaQuery>
                            <div className="similarRating">
                                <span style={{display: 'flex', alignItems: 'center'}}>
                                    <p>Similarity Decision</p>
                                    <Tooltip placement='top'  color='rgba(0, 0, 0, 0.8)' title={
                                    <p style={{color: 'var(--AccentColor)'}}
                                    >The similarity analysis is not 100% percent accurate user discretion advised</p>
                                    }>
                                    <GrCircleQuestion className='questiontooltip'/>
                                    </Tooltip>
                                    : 
                                    <p style={{color: 'var(--AccentColor)'}}>{trackAnalysis.decision}</p>
                                </span>
                                <button onClick={()=> handletrackadd(trackAnalysis)} className='addsongbutton'>Add song to playlist</button>
                            </div>
                        </div>
                    :
                    tracks === null ? 
                        <div className="FillinText">
                            <p>
                                Search up a track 
                            </p>
                        </div> 
                    :
                    <>
                        <MediaQuery minWidth={700}>
                            <div className="ColumnContainer">
                                <div className="Column">
                                    {tracks.slice(0,4).map((item) => (
                                        <div key={item.trackid} className="resultsCont" onClick={() => AnalyzeTrack(item)}>
                                            <img  src={item.trackimg} alt={item.name} />
                                            <div className="resultText">
                                                <p>{item.name}</p>
                                                <p>{` By ${item.artist} ` }</p>
                                            </div>
                                        </div>
                                    ))}   
                                </div>
                                <div className="Column">
                                    {tracks.slice(4,8).map((item) => (
                                        <div key={item.trackid} className="resultsCont" onClick={() => AnalyzeTrack(item)}>
                                            <img src={item.trackimg} alt={item.name} />
                                            <div className="resultText">
                                                <p>{item.name}</p>
                                                <p>{` By ${item.artist} `}</p>
                                            </div>
                                        </div>
                                    ))}   
                                </div>
                            </div>
                        </MediaQuery>
                        <MediaQuery maxWidth={699}>
                            <div className="ResultContainer">
                                {tracks.map((item) => (
                                    <div key={item.trackid} className="resultsCont" onClick={() => AnalyzeTrack(item)} >
                                        <img src={item.trackimg}/>
                                        <div className="resultText">
                                            <p>{item.name}</p>
                                            <p>{`By ${item.artist}`}</p>
                                        </div>
                                    </div>
                                ))}       
                            </div>
                        </MediaQuery>
                    </>
                }
            </div>

            
            <div className="albumrefine3">
                <div className='tracksresulttite'> 
                    <p>Album Results </p>
                    {albumAnalysis && <IoMdArrowRoundBack className='backbutton' onClick={() => setAlbumAnalysis(null)}/>}
                </div>
                { searchloader_A ?
                    <Loader/> 
                    :
                    albumAnalysis ?
                        <div className="albumanalysiscont">
                            <div className="albumanalysisinfo">
                                <img src={albumAnalysis.albumimg} alt={`${albumAnalysis.name}'s album image`}/>
                                <div className="albumanalysisinfotext">
                                    <p>{albumAnalysis.name}</p>
                                    <p>{`By: ${albumAnalysis.artist}`}</p>
                                    <p>{`About The Artist: ${albumAnalysis.mainartist}`}</p>
                                    <p>{`Followers: ${albumAnalysis.artistFollowers}`}</p>
                                    <p>{`Main Genres: ${albumAnalysis.artistGenres.join(', ')}`}</p>
                                </div>
                            </div>
                            <div className="AlbumTracksInfo">
                                <div className="analyzedsongstitles">
                                    <p>Song Name</p>
                                    <span style={{display: 'flex', alignItems: 'center'}}>
                                        Similarity
                                        <Tooltip placement='top'  color='rgba(0, 0, 0, 0.8)' title={
                                        <p style={{color: 'var(--AccentColor)'}}
                                        >The similarity analysis is not 100% percent accurate user discretion advised</p>
                                        }>
                                        <GrCircleQuestion className='tooltipicon'/>
                                        </Tooltip>
                                    </span>
                                </div>
                                <div className="AnalyzedSongsInfoCont">
                                    {albumAnalysis.tracksdata.map((song, index) => (
                                        <div onClick={() => showModal(setSelectedAlbumSong(song))} 
                                            key={index} className="analyzedsongsinfo">
                                                <p>{song.trackname}</p>
                                                <p>{song.decision}</p>
                                        </div>
                                    ))}  
                                </div>
                                <Modal
                                    className='AddTrackModal'
                                    title={<p style={{color: 'var(--AccentColor)',
                                    }}> Add Song Alert</p> }
                                    centered
                                    open={visible}
                                    onOk={handleOk}
                                    onCancel={handleCancel}
                                    okText="Confirm"
                                    cancelText="Cancel"
                                    okButtonProps={{ className: 'okButton' }}
                                    cancelButtonProps={{ className: 'cancelButton'}}
                                    >
                                    <p>{`Would you like to add this song to your playlist: 
                                    ${playlistState.PlaylistName}`}</p>
                                </Modal>
                            </div>
                        </div>
                    :
                    albums === null ? 
                        <div className="FillinText">
                            <p>
                            Search up an album  
                            </p>
                        </div> 
                    :
                    <>
                        <MediaQuery minWidth={700}>
                            <div className="ColumnContainer">
                                <div className="Column">
                                    {albums.slice(0, 4).map((album) => (
                                        <div key={album.albumid} className="resultsCont" onClick={() => AnalyzeAlbum(album)}>
                                            <img src={album.albumimg}/>
                                            <div className="resultText">
                                                <p>{album.name}</p>
                                                <p>{`Album Type: ${album.type}`}</p>
                                                <p>{`By ${album.artist}`}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="Column">
                                    {albums.slice(4, 8).map((album) => (
                                        <div key={album.albumid} className="resultsCont" onClick={() => AnalyzeAlbum(album)} >
                                            <img src={album.albumimg}/>
                                            <div className="resultText">
                                                <p>{album.name}</p>
                                                <p>{`Album Type: ${album.type}`}</p>
                                                <p>{`By ${album.artist}`}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </MediaQuery>
                        <MediaQuery maxWidth={699}>
                            <div className="ResultContainer">
                                {albums.map((album) => (
                                    <div key={album.albumid} className="resultsCont" onClick={() => AnalyzeAlbum(album)} >
                                        <img src={album.albumimg}/>
                                        <div className="resultText">
                                            <p>{album.name}</p>
                                            <p>{`Album Type: ${album.type}`}</p>
                                            <p>{`By ${album.artist}`}</p>
                                        </div>
                                    </div>
                                ))}       
                            </div>
                        </MediaQuery>
                    </>
                }
            </div>
        </div>    
    </>
  )
}

export default AlbumRefinePage