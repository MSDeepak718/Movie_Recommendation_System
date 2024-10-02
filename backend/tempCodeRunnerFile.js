app.get('/api/collaborative-recommend', (req, res) => {
    const movieTitle = req.query.title;

    if (!movieTitle) {
        return res.status(400).json({ error: 'Movie title is required' });
    }

    const pythonScriptPath = 'backend/ratings.py';
    runPythonScript(pythonScriptPath, `${movieTitle} 20`, res); 
});