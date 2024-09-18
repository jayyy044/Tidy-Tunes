import React, { useEffect, useState } from 'react';
import MediaQuery from 'react-responsive'
import { useAuthContext } from '../../hooks/useAuthContext';
import './SpotifyPage.css';
import { useTopTracks } from '../../hooks/useTopTracks';
import { useTopArtists } from '../../hooks/useTopArtists';
import { useArtistAlbums } from '../../hooks/useArtistAlbums';
import { Carousel } from 'antd';
import Loader from '../../components/Loader/Loader';
import { useSpotifyToken } from '../../hooks/useSpotifyToken';

const SpotifyPage = () => {
  const [isLoading, setIsLoading]= useState(true)
  const [tracks, setTracks] = useState([]);
  const [artistData, setArtistData] = useState([]);
  const [topGenres, setTopGenres] = useState([]);
  const { state, dispatch } = useAuthContext();
  const { UserTopTracks } = useTopTracks();
  const { UserTopArtists } = useTopArtists();
  const { getArtistAlbums } = useArtistAlbums();
  const { SpotifyTokenSearch } = useSpotifyToken()

  useEffect(() => {
    SpotifyTokenSearch().then(
      Token => {
        UserTopTracks(state.JWT_access, Token.Spotify_access, Token.expirationTime).then(
          (data) => { 
            setTracks(data);
           });
    
        UserTopArtists(state.JWT_access, Token.Spotify_access, Token.expirationTime).then(
          async (TopArtistsObj) => {
            const { sortedArtistInfo, topGenresFiltered } = TopArtistsObj
            setTopGenres(topGenresFiltered);
            const albumPromises = sortedArtistInfo.map(artist => {
              const artistData = { 
                id: artist.ArtistID, 
                name: artist.ArtistName, 
                image: artist.ArtistImage,
                follower: artist.follower
              };
              return getArtistAlbums(state.JWT_access, Token.Spotify_access, artistData, Token.expirationTime, sortedArtistInfo);
            });
            const albumResolvedData = await Promise.all(albumPromises);
    
            setArtistData(albumResolvedData);
            setIsLoading(false)
          }
        );

      }
    );

   
  }, [dispatch]);

  return (
    <>
      {isLoading ? <Loader/>: 
          <div className="Dashboard">
            <div className="albumdata">
              <p className='albumdataTitle'>Top Artist & Latest Releases</p>
              <Carousel arrows infinite className='Carousel'>
                {artistData.map((artist, index) => (
                  <div key={index} className="OuterAlbumCont">
                    <div className='albumartistinfo'>
                      <img src={artist.image} alt={`${artist.name}'s image`}/>
                      <div className="artistText">
                        <p>Artist</p>
                        <p>{artist.name}</p>
                        <div className="artistStats">
                          <p>{`Popularity: ${artist.artistpop} | Followers: ${artist.follower} `}</p>
                        </div>
                      </div>
                    </div>
                    <div className="latestReleases">
                      <p className='latestreleasetitle'>Latest Releases:</p>
                      <div className="albumsCont">
                        {artist.albums.map((album, idx) => (
                        <div key={idx} className='albumlist'>
                          <img src={album.image} alt={album.name} />
                          <p>{album.name}</p>
                        </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}   
              </Carousel>
            </div>

            <div className="genre-frequency">
              <p style={{color: 'var(--AccentColor)'}}>Top Genres</p> 
              <div className="genres">
                {topGenres.map((genre, index) => (
                    <p key={index}>{index+1}. {genre[0]}</p>
                ))}
              </div>
            </div>

            <div className="TopTracks">
              <p>Top Songs</p>
              <div className="TopTracksCont">
                {tracks.map((track,index) => (
                  <div key={index} className="track">
                    <img src={track.trackImage} alt={`${track.trackName}'s Image`}/>
                    <p>{`${track.trackName} by ${track.artistName}`}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
      } 
    </>
  );
};

export default SpotifyPage;
