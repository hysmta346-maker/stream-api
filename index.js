
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const app = express();

// إعدادات المتصفح للتمويه
const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
    'Referer': 'https://a.qfilm.tv/',
    'Accept-Language': 'en-US,en;q=0.9',
    'Connection': 'keep-alive'
};

app.get('/api/stream/movie', async (req, res) => {
    const { vid } = req.query;
    if (!vid) return res.status(400).json({ success: false, message: 'Missing vid' });

    try {
        // 1. جلب صفحة QFilm مع الهيدرز
        const qFilmRes = await axios.get(`https://a.qfilm.tv/watch.php?vid=${vid}`, { headers: HEADERS });
        const $ = cheerio.load(qFilmRes.data);
        const liiiUrl = $('meta[itemprop="contentUrl"]').attr('content');
        
        if (!liiiUrl) return res.status(404).json({ message: "لم نجد رابط liiivideo" });

        // 2. جلب صفحة liiivideo مع الهيدرز (هنا سر الحل للـ 403)
        const liiiRes = await axios.get(liiiUrl, { 
            headers: { 
                ...HEADERS, 
                'Referer': 'https://a.qfilm.tv/' // إيهام الموقع أننا جئنا من qfilm
            } 
        });
        
        // 3. استخراج الرابط
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
