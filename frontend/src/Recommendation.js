import React, { useState } from 'react';
import axios from 'axios';
import './Recommendation.css';
import { useNavigate } from 'react-router-dom';

const API_KEY = process.env.REACT_APP_TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

function Recommendation() {
    const [movie, setMovie] = useState('');
    const [recommendations, setRecommendations] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    
    const getRecommendations = async () => {
        try {
            if (movie.trim() === '') {
                setRecommendations([]);
                return;
            }

            const response = await axios.get(`http://localhost:5003/api/recommend?title=${movie}`);
            const movieTitles = response.data;
            const movieData = await Promise.all(movieTitles.map(fetchMovieDetails));
            setRecommendations(movieData);
            setError('');
            setSuggestions([]);
        } catch (error) {
            console.error('Error fetching recommendations:', error);
            setError('Failed to fetch recommendations.');
            setRecommendations([]);
        }
    };

    const fetchMovieDetails = async (title) => {
        try {
            const response = await axios.get(`${TMDB_BASE_URL}/search/movie`, {
                params: {
                    api_key: API_KEY,
                    query: title,
                },
            });
            const movie = response.data.results[0];
            return {
                title: movie.title,
                poster: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
            };
        } catch (error) {
            console.error('Error fetching movie details:', error);
            return { title, poster: '' };
        }
    };

    const fetchSuggestions = async (query) => {
        try {
            if (query.length > 0) {
                const response = await axios.get(`http://localhost:5003/api/suggestions?query=${query}`);
                setSuggestions(response.data);
            } else {
                setSuggestions([]);
                setRecommendations([]);
            }
        } catch (error) {
            console.error('Error fetching suggestions:', error);
            setSuggestions([]);
        }
    };
    
    const handleMovieClick = (movieTitle) => {
        navigate(`/related/${encodeURIComponent(movieTitle)}`);
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        setMovie(value);
        fetchSuggestions(value);
    };

    const handleSuggestionClick = (suggestion) => {
        setMovie(suggestion);
        setSuggestions([]);
    };

    const handleSearchClick = () => {
        if (movie.trim()) {
            navigate(`/related/${encodeURIComponent(movie)}`);
        }
    };

    return (
        <div className='get'>
            <div className='input-container'>
                <input 
                    type="text" 
                    value={movie} 
                    onChange={handleInputChange} 
                    placeholder="Enter movie name"
                    className='ph'
                />
                {suggestions.length > 0 && (
                    <ul className='suggestions'>
                        {suggestions.map((suggestion, index) => (
                            <li key={index} onClick={() => handleSuggestionClick(suggestion)}>
                                {suggestion}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            <button onClick={getRecommendations} className='getRec'>Get Recommendations</button>
            <button onClick={handleSearchClick} className='seaRec'>Search</button>
            
            {error && <p>{error}</p>}
            
            <div className='container'>
                {recommendations.map((rec, index) => (
                    <div key={index} className='row' onClick={() => handleMovieClick(rec.title)}>
                        {rec.poster && <img src={rec.poster} alt={rec.title} className='poster' />}
                        <p>{rec.title}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Recommendation;
