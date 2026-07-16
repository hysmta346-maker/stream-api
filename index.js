const express = require('express');
const app = express();

app.get('/vidsrc/:id', (req, res) => {
    const tmdbId = req.params.id;
    const streamUrl = `https://vidsrc.cc/v2/embed/movie/${tmdbId}`;
    
    res.json({
        status: "success",
        stream: streamUrl
    });
});

module.exports = app;
