import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../hooks/useAuthContext';
import './SpotifyPage.css';
import { useTopTracks } from '../../hooks/useTopTracks';
import { useTopArtists } from '../../hooks/useTopArtists';
import { useArtistAlbums } from '../../hooks/useArtistAlbums';
import { toast } from 'react-toastify';
import { Carousel } from 'antd';

const SpotifyPage = () => {
  const [isLoading, setIsLoading]= useState(true)
  const [tracks, setTracks] = useState([]);
  const [artists, setArtists] = useState([]);
  const [artistData, setArtistData] = useState([]);
  const [topGenres, setTopGenres] = useState([]);
  const navigate = useNavigate();
  const { state, dispatch } = useAuthContext();
  const { UserTopTracks } = useTopTracks();
  const { UserTopArtists } = useTopArtists();
  const { getArtistAlbums } = useArtistAlbums();

  useEffect(() => {
    
    const urlSearch = new URLSearchParams(window.location.search);
    const Spotify_access = urlSearch.get('SAT');
    const Spotify_refresh = urlSearch.get('SRT');
    const Error = urlSearch.get('error');

    if (Error) {
      console.log(`error: ${Error}`);
      toast.error("An Error occurred with your authorization");
      navigate('/error');
      return;
    }
    if (!Spotify_access || !Spotify_refresh) {
      console.log("Either Refresh or Access Tokens were not received");
      toast.error("You weren't given authorization, please try again");
      navigate('/login');
    }

    console.log('Spotify Access Received');
    const SpotifyTokens = { Spotify_access, Spotify_refresh };
    localStorage.setItem('SpotifyTokens', JSON.stringify(SpotifyTokens));
    dispatch({ type: "SPOTIFY_ACCESS", payload: SpotifyTokens });

    UserTopTracks(state.JWT_access, Spotify_access).then(
      (data) => { setTracks(data); });

    UserTopArtists(state.JWT_access, Spotify_access).then(
      async (TopArtistsObj) => {
        const { ArtistInfo, topGenresFiltered } = TopArtistsObj
        setArtists(ArtistInfo);
        setTopGenres(topGenresFiltered);
        const albumPromises = ArtistInfo.map(artist => {
          const artistData = { id: artist.ArtistID, name: artist.ArtistName, image: artist.ArtistImage};
          return getArtistAlbums(state.JWT_access, Spotify_access, artistData);
        });
        const albumResolvedData = await Promise.all(albumPromises);

        setArtistData(albumResolvedData);
        setIsLoading(false)
      }
    );
  }, [dispatch]);

  return (
    <>
      {isLoading ? <div className="load"><span className="loader"></span></div>: 
      <div className="Dashboard">
        <div className="albumdata">
          <Carousel arrows infinite className='Carousel'>
              {artistData.map((artist, index) => (
                <div key={index} className="OuterAlbumCont">
                    <div className="artistname">
                      <p>{artist.name}</p>
                    </div>
                    <div className="InnerAlbumCont">
                      <div className="AlbumArtist">
                        <img src={artist.image} alt={`${artist.name}'s image`}/>
                      </div>
                      <div className="albuminfo">
                        <p>Latest Releases:</p>
                        <div className="albumsCont">
                          {artist.albums.map((album, idx) => (
                          <div key={idx} className='albumlist'>
                            <img src={album.image} alt={album.name} />
                            <h2>{album.name}</h2>
                          </div>
                          ))}
                        </div>
                      </div>
                    </div>
                </div>
              ))} 
          </Carousel>
        </div>
        <div className="genre-frequency">
          <h4>Top Genres:</h4> 
          <div className="genres">
            {topGenres.map((genre, index) => (
                <p key={index}>{genre[0]}: {genre[1]}</p>
            ))}
          </div>
        </div>
        <div className="TopTracks">
          <div className="TopTrackTitle">
            <h4>Top Songs</h4>
          </div>
          <div className="TopTracksCont">
            {tracks.map((track,index) => (
              <div key={index} className="track">
                <img src={track.trackImage} alt={`${track.trackName}'s Image`}/>
                <p>{`${track.trackName} by ${track.artistName}`}</p>
              </div>
            ))}
          </div>
        </div>
          
        <div className="artist">
          {artists.map((artist, index) => (
            <div key={index} className="artists">
            <p>Name: {artist.ArtistName}</p>
            <p>Popularity: {artist.ArtistPop}</p>
          </div>
          ))}
        </div>
      </div>
      } 
    </>
  );
};

export default SpotifyPage;
