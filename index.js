const express = require('express');
const app = express();

// هذا المسار يقوم فقط بتسليم الرابط للتطبيق
app.get('/vidsrc/:id', (req, res) => {
    const tmdbId = req.params.id;
    
    // نقوم بإرجاع الرابط كما هو، التطبيق سيستخدم WebView لاستخراجه
    res.json({
        status: "success",
        stream: `https://vidsrc.cc/v2/embed/movie/${tmdbId}`
    });
});

module.exports = app;
