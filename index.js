const express = require('express');
const axios = require('axios');
const cors = require('cors');
const cheerio = require('cheerio');

const app = express();

app.use(cors());
app.use(express.json());

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';
const PROXY_URL = 'https://corsproxy.io/?';

app.get('/api/stream/movie', async (req, res) => {
    const { vid } = req.query;

    if (!vid) {
        return res.status(400).json({ success: false, message: 'يرجى إرسال الـ vid' });
    }

    const qFilmUrl = `https://a.qfilm.tv/watch.php?vid=${vid}`;

    try {
        // 1. جلب صفحة QFilm عبر البروكسي
        const qFilmResponse = await axios.get(PROXY_URL + encodeURIComponent(qFilmUrl), {
            headers: { 'User-Agent': USER_AGENT }
        });
        
        const $ = cheerio.load(qFilmResponse.data);
        const liiivideoUrl = $('meta[itemprop="contentUrl"]').attr('content');

        if (!liiivideoUrl) {
            return res.status(404).json({ success: false, message: "لم يتم العثور على رابط liiivideo" });
        }

        // 2. جلب صفحة liiivideo عبر البروكسي
        const liiiResponse = await axios.get(PROXY_URL + encodeURIComponent(liiivideoUrl), {
            headers: { 'User-Agent': USER_AGENT }
        });
        
        // البحث عن الرابط
        const m3u8Regex = /https?:\/\/[^\"']+\.(m3u8|m3u)/;
        const match = liiiResponse.data.match(m3u8Regex);

        if (match) {
            return res.status(200).json({
                success: true,
                url: match[0]
            });
        } else {
            return res.status(404).json({ success: false, message: "تعذر استخراج رابط البث المباشر" });
        }

    } catch (error) {
        console.error('Error:', error.message);
        return res.status(500).json({
            success: false,
            message: 'فشل السيرفر في جلب البيانات من المصدر',
            error: error.message
        });
    }
});

app.get('/', (req, res) => {
    res.status(200).send('StreamMaster Proxy API is running! 🚀');
});

module.exports = app;
