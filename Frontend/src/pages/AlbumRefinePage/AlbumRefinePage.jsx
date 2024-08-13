import React, { useState } from 'react'
import './AlbumRefinePage.css'
import { useSearchItem } from '../../hooks/useSearchItem'
import { useAuthContext } from '../../hooks/useAuthContext'
import { usePlaylistContext } from '../../hooks/usePlaylistContext'
import Loader from '../../components/Loader/Loader';
import { useAlbumAnalysis } from '../../hooks/useAlbumAnalysis';
import { useTrackAnalysis } from '../../hooks/useTrackAnalysis';

const AlbumRefinePage = () => {
    const { searchitem } = useSearchItem()
    const { state } = useAuthContext()
    const { state: PlaylistState } = usePlaylistContext()
    const { AlbumAnalysis } = useAlbumAnalysis()
    const { TrackAnalysis } = useTrackAnalysis()
    const [albums, setAlbums] = useState(null)
    const [isloading, setIsLoading] = useState(false)
    const [itemSearch, setItemSearch ]= useState()
    const [tracks, setTracks] = useState(null)

    const SubmitForm = async (event) => {
        event.preventDefault()
        if(itemSearch){
            setIsLoading(true)
            searchitem(itemSearch, state.JWT_access, state.Spotify_access,).then (
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
            const TrackAnalysisResult = await TrackAnalysis(track, 
                state.JWT_access, 
                state.Spotify_access,
                state.Email,
                PlaylistState.PlaylistId
                )
            setIsLoading(false)
        }
    }

    const AnalyzeAlbum = async (album) => {
        if(album){
          setIsLoading(true)
          const AlbumAnalysisResult = await AlbumAnalysis(
            album, 
            state.JWT_access, 
            state.Spotify_access,
            state.Email
            )
          console.log(AlbumAnalysisResult)
          console.log("Album Result")
          setIsLoading(false)
        }
    }

    if (isloading) {
        return <Loader/>
    }

  return (
    <>
        <div className="AlbumRefineCont">
            <div className="albumrefine1">
                <p style ={{
                    color: 'var(--AccentColor)',
                    fontSize: '2.5rem'
                }}>Search</p>
                <p>Check what songs are similar to your music taste</p>
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
            <div className="albumrefine2">
                <div className='tracksresulttite'> Tracks Results </div>
                {tracks === null ? 
                <div className="FillinText">
                    <p>
                        Search up a track 
                    </p>
                </div> 
                :
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
                }
            </div>
            <div className="albumrefine3">
                <div className='tracksresulttite'> Album Results</div>
                { albums === null ? 
                <div className="FillinText">
                    <p>
                      Search up an album  
                    </p>
                </div> :
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
                }
            </div>
            {/* <div className="albums">
                {album.AlbumResults.map((album, index) => (
                    <div key= {index} className="anothercont" style={{color: 'white'}}>
                        <img style={{ width:'120px'}}src={album.albumimg}/>
                        <p>{album.name}</p>
                        <p>{album.type}</p>
                        <p>{album.artist}</p>
                    </div>
                ))}   
            </div>
            <div className="tracks">
                {album.TrackResults.map((track, index) => (
                    <div key={index} className="tracksCont">
                        <img style={{ width: '120px'}}src={track.trackimg}/>
                        <p>{track.name}</p>
                        <p>{track.artist}</p>
                    </div>
                ))}
            </div> */}

        </div>    
    </>
  )
}

export default AlbumRefinePage