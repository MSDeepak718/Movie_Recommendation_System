import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Recommendation from './Recommendation';
import Top from './Top';
import Related from './Related';
import './App.css';
import Image from './Assets/logo.png';

function App() {
    return (
        <>
            <div className='nav'>
                <img src={Image} alt="logo" className="logo" />
                <div className='menu'>
                    <h3>UNLIMITED TV SHOWS & MOVIES</h3>
                    <button className='join'>Join now</button>
                    <button className='signin'>Sign In</button>
                </div>
            </div>
            <div className='content'>
                <h1>Only on Netflix</h1>
                <h3>Netflix is the home of amazing original programming that you can’t find anywhere else. Movies, TV shows, specials and more, all tailored specifically to you.</h3>
            </div>
            <Router>
                <Routes>
                    <Route path='/' element={
                        <div className="rows">
                            <h5>Movies based on your interest</h5>
                            <Recommendation />
                            <h5>Science Fiction</h5>
                            <Top genre="sciencefiction" />
                            <h5>Animation</h5>
                            <Top genre="animation" />
                            <h5>Fantasy</h5>
                            <Top genre="fantasy" />
                            <h5>Romantic</h5>
                            <Top genre="romance" />
                            <h5>Action</h5>
                            <Top genre="action" />
                        </div>
                    }/>
                    <Route path="/related/:movieTitle" element={<Related />} />
                </Routes>
        </Router>
        </>
    );
}

export default App;
