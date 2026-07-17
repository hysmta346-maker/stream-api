const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const app = express();

app.get('/api/stream/movie', async (req, res) => {
    const { vid } = req.query;
    if (!vid) return res.status(400).json({ success: false });

    try {
        // 1. جلب صفحة QFilm
        const qFilmRes = await axios.get(`https://a.qfilm.tv/watch.php?vid=${vid}`);
        const $ = cheerio.load(qFilmRes.data);
        const liiiUrl = $('meta[itemprop="contentUrl"]').attr('content');
        
        if (!liiiUrl) return res.status(404).json({ message: "لم نجد رابط liiivideo" });

        // 2. جلب صفحة liiivideo مباشرة
        const liiiRes = await axios.get(liiiUrl);
        
        // 3. استخراج الرابط (نفس منطق الـ grep الخاص بك)
        const match = liiiRes.data.match(/https?:\/\/[^\"']+\.m3u[8]?/);

        if (match) {
            return res.json({ success: true, url: match[0] });
        } else {
            return res.status(404).json({ message: "لم نجد رابط m3u8" });
        }
    } catch (e) {
        return res.status(500).json({ error: e.message });
    }
});

module.exports = app;
