const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const csv = require('csv-parser');
const app = express();
const cors = require('cors');
const path = require('path');
require('dotenv').config();

app.use(cors());
app.use(express.json());

let movies = [];
const moviesCsvPath = path.join(__dirname, 'movies.csv');
fs.createReadStream(moviesCsvPath)
    .pipe(csv())
    .on('data', (row) => {
        movies.push(row);
    })
    .on('end', () => {
        console.log('CSV file successfully processed');
    });

const runPythonScript = (scriptPath, arg, res) => {
    const command = `python "${scriptPath}" "${arg}"`;
    console.log(command);

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing script: ${stderr}`);
            return res.status(500).json({ error: 'Failed to execute script' });
        }

        const output = stdout
            .split('\n')
            .map(line => line.trim())
            .filter(line => line !== '');
        console.log(output);
        res.json(output);
    });
};

app.get('/api/recommend', (req, res) => {
    const movieTitle = req.query.title;

    if (!movieTitle) {
        return res.status(400).json({ error: 'Movie title is required' });
    }

    const pythonScriptPath = path.join(__dirname, 'recommendations.py');
    runPythonScript(pythonScriptPath, movieTitle, res);
});

app.get('/api/top', (req, res) => {
    const genre = req.query.genre;
    if (!genre) {
        return res.status(400).json({ error: 'Genre is required' });
    }

    const pythonScriptPath = path.join(__dirname, 'demographic.py');
    runPythonScript(pythonScriptPath, genre, res);
});

app.get('/api/suggestions', (req, res) => {
    const query = req.query.query;

    if (!query) {
        return res.status(400).json({ error: 'Query is required' });
    }

    const filteredMovies = movies
        .filter(movie => movie.title.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 10)
        .map(movie => movie.title);

    res.json(filteredMovies);
});

app.get('/api/movie-details', (req, res) => {
    const title = req.query.title;

    if (!title) {
        return res.status(400).json({ error: 'Title is required' });
    }

    const movie = movies.find(movie => movie.title.toLowerCase() === title.toLowerCase());

    if (movie) {
        res.json({
            title: movie.title,
            poster: movie.poster_path,
        });
    } else {
        res.status(404).json({ error: 'Movie not found' });
    }
});

app.get('/api/collaborative-recommend', (req, res) => {
    const movieTitle = req.query.title;

    if (!movieTitle) {
        return res.status(400).json({ error: 'Movie title is required' });
    }

    const pythonScriptPath = path.join(__dirname, 'ratings.py');
    runPythonScript(pythonScriptPath, `${movieTitle}`, res);
});

const PORT = process.env.PORT || 5003;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
