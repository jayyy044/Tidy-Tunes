import React, { useEffect, useState } from 'react';
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
  const [artists, setArtists] = useState([]);
  const [artistData, setArtistData] = useState([]);
  const [topGenres, setTopGenres] = useState([]);
  const { state, dispatch } = useAuthContext();
  const { UserTopTracks } = useTopTracks();
  const { UserTopArtists } = useTopArtists();
  const { getArtistAlbums } = useArtistAlbums();
  const { SpotifyTokenSearch } = useSpotifyToken()

  useEffect(() => {
    let Token;
    if (!state.Spotify_access || !state.Spotify_refresh){
      Token = SpotifyTokenSearch();
    }
    else{
      Token = {Spotify_access:state.Spotify_access, Spotify_refresh:state.Spotify_refresh}
    }
    UserTopTracks(state.JWT_access, Token.Spotify_access).then(
      (data) => { setTracks(data); });

    UserTopArtists(state.JWT_access, Token.Spotify_access).then(
      async (TopArtistsObj) => {
        const { sortedArtistInfo, topGenresFiltered } = TopArtistsObj
        setArtists(sortedArtistInfo);
        setTopGenres(topGenresFiltered);
        const albumPromises = sortedArtistInfo.map(artist => {
          const artistData = { id: artist.ArtistID, name: artist.ArtistName, image: artist.ArtistImage};
          return getArtistAlbums(state.JWT_access, Token.Spotify_access, artistData);
        });
        const albumResolvedData = await Promise.all(albumPromises);

        setArtistData(albumResolvedData);
        setIsLoading(false)
      }
    );
  }, [dispatch]);

  return (
    <>
      {isLoading ? <Loader/>: 
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
                          <p>{album.name}</p>
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
          <div className="artistTitle">
            <h4>Top Artist</h4>
          </div>
          <div className="artistCont">
            {artists.map((artist, index) => (
              <div key={index} className="artists">
                <p>{`${artist.ArtistName}, Popularity: ${artist.ArtistPop}`}</p>
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
