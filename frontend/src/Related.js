import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './Related.css';

const API_KEY = process.env.REACT_APP_TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

function Related() {
    const { movieTitle } = useParams();
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [movieDetails, setMovieDetails] = useState({});
    const [moviePoster, setMoviePoster] = useState('');  
    const [movieTrailer, setMovieTrailer] = useState(''); 
    const [cast, setCast] = useState([]);  

    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                const response = await axios.get(`http://localhost:5003/api/collaborative-recommend?title=${movieTitle}`);
                const movieDetails = await Promise.all(
                    response.data.map(async (title) => {
                        const movieResponse = await axios.get(`${TMDB_BASE_URL}/search/movie`, {
                            params: {
                                api_key: API_KEY,
                                query: title,
                            },
                        });
                        const movie = movieResponse.data.results[0];
                        return {
                            title: movie.title,
                            poster: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '',
                        };
                    })
                );
                setRecommendations(movieDetails);

                const clickedMovieResponse = await axios.get(`${TMDB_BASE_URL}/search/movie`, {
                    params: {
                        api_key: API_KEY,
                        query: movieTitle,
                    },
                });
                const clickedMovie = clickedMovieResponse.data.results[0];
                if (clickedMovie) {
                    setMoviePoster(clickedMovie.poster_path ? `https://image.tmdb.org/t/p/w500${clickedMovie.poster_path}` : '');
                    setMovieDetails({
                        title: clickedMovie.title,
                        releaseDate: clickedMovie.release_date,
                        rating: clickedMovie.vote_average,
                        genres: clickedMovie.genre_ids.join(', '),
                        runtime: clickedMovie.runtime,
                        language: clickedMovie.original_language,
                    });

                    const trailerResponse = await axios.get(`${TMDB_BASE_URL}/movie/${clickedMovie.id}/videos`, {
                        params: {
                            api_key: API_KEY,
                        },
                    });
                    const trailer = trailerResponse.data.results.find(video => video.type === "Trailer");
                    setMovieTrailer(trailer ? trailer.key : '');

                    const castResponse = await axios.get(`${TMDB_BASE_URL}/movie/${clickedMovie.id}/credits`, {
                        params: {
                            api_key: API_KEY,
                        },
                    });
                    setCast(castResponse.data.cast.slice(0, 5)); 

                }
            } catch (error) {
                console.error("Error fetching recommendations:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRecommendations();
    }, [movieTitle]);

    return (
        <div className="recommendations">
            <div className="movie-details">
                <div className="movie-info">
                    <h2>{movieDetails.title}</h2>
                    <p><strong>Release Date:</strong> {movieDetails.releaseDate}</p>
                    <p><strong>Rating:</strong> {movieDetails.rating}/10</p>
                    <p><strong>Language:</strong> {movieDetails.language}</p>
                    {movieTrailer && (
                        <div className="movie-trailer">
                            <h3>Watch Trailer:</h3>
                            <iframe
                                width="560"
                                height="315"
                                src={`https://www.youtube.com/embed/${movieTrailer}`}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                title="Movie Trailer"
                            ></iframe>
                        </div>
                    )}

                    {cast.length > 0 && (
                        <div className="movie-cast">
                            <h3>Top Cast:</h3>
                            <ul>
                                {cast.map((member, index) => (
                                    <li key={index}>{member.name} as {member.character}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
                
                <div className="image-rightside">
                    <img src={moviePoster} alt={`${movieTitle} poster`} />
                </div>
            </div>
            <h2 className='movies-related'>Movies Related to {movieTitle}</h2>
            {loading ? (
                <p>Loading recommendations...</p>
            ) : (
                <div className="container">
                    {recommendations.length > 0 ? (
                        recommendations.map((rec, index) => (
                            <div key={index} className="row">
                                {rec.poster ? (
                                    <img src={rec.poster} alt={rec.title} className='poster' />
                                ) : (
                                    <div className="no-poster">No Image Available</div>
                                )}
                                <p>{rec.title}</p>
                            </div>
                        ))
                    ) : (
                        <p>No recommendations available.</p>
                    )}
                </div>
            )}
        </div>
    );
}

export default Related;
