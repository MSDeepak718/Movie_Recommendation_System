import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Top.css';
import { useNavigate } from 'react-router-dom';

const API_KEY = process.env.REACT_APP_TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

function Top({ genre }) {
    const [recommendations, setRecommendations] = useState([]);
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(true);
    const handleMovieClick = (movieTitle) => {
        navigate(`/related/${encodeURIComponent(movieTitle)}`);
    };

    useEffect(() => {
        const getRecommendations = async () => {
            try {
                const response = await axios.get('http://localhost:5003/api/top', {
                    params: { genre }
                });
                const movieTitles = response.data;
                if (movieTitles && movieTitles.length > 0) {
                    const movieData = await Promise.all(movieTitles.map(fetchMovieDetails));
                    setRecommendations(movieData);
                } else {
                    console.error('No movies found for this genre:', genre);
                    setRecommendations([]);
                }
            } catch (error) {
                console.error('Error fetching recommendations:', error);
                setRecommendations([]);
            }finally{
                setLoading(false);
            }
        };

        if (genre) {
            getRecommendations(); 
        }
    }, [genre]);


    const fetchMovieDetails = async (title) => {
        try {
            const response = await axios.get(`${TMDB_BASE_URL}/search/movie`, {
                params: {
                    api_key: API_KEY,
                    query: title,
                },
            });
            const movie = response.data.results[0];

            if (movie) {
                return {
                    title: movie.title,
                    poster: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '',
                };
            } else {
                return { title, poster: '' };
            }
        } catch (error) {
            console.error('Error fetching movie details for:', title, error);
            return { title, poster: '' };
        }
    };

    return (
        <div>
            <div className='container'>
                {loading ? (
                    <p>Loading....</p>
                    ) : (
                        recommendations.length > 0 ? (
                            recommendations.map((rec, index) => (
                                <div key={index} className='row' onClick={() => handleMovieClick(rec.title)}>
                                    {rec.poster ? (
                                        <img src={rec.poster} alt={rec.title} className='poster' />
                                    ) : (
                                        <div>No image available</div>
                                    )}
                                    <p>{rec.title}</p>
                                </div>
                            ))
                        ) : (
                            <div>No recommendations available</div>
                        )
                )}
            </div>
        </div>
    );
}

export default Top;
