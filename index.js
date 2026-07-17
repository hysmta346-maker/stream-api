const express = require('express');
const axios = require('axios');
const cors = require('cors');
const cheerio = require('cheerio');

const app = express();

app.use(cors());
app.use(express.json());

// تعريف ثابت للمتصفح لمحاكاة طلب حقيقي
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

app.get('/api/stream/movie', async (req, res) => {
    const { vid } = req.query;

    if (!vid) {
        return res.status(400).json({ success: false, message: 'يرجى إرسال الـ vid' });
    }

    const qFilmUrl = `https://a.qfilm.tv/watch.php?vid=${vid}`;

    try {
        // 1. جلب صفحة QFilm مع Headers لمحاكاة متصفح Chrome
        const qFilmResponse = await axios.get(qFilmUrl, {
            headers: {
                'User-Agent': USER_AGENT,
                'Referer': 'https://a.qfilm.tv/',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1'
            }
        });
        
        const $ = cheerio.load(qFilmResponse.data);
        const liiivideoUrl = $('meta[itemprop="contentUrl"]').attr('content');

        if (!liiivideoUrl) {
            return res.status(404).json({ success: false, message: "لم يتم العثور على رابط liiivideo" });
        }

        // 2. جلب صفحة liiivideo لاستخراج الرابط المباشر
        const liiiResponse = await axios.get(liiivideoUrl, {
            headers: {
                'User-Agent': USER_AGENT,
                'Referer': qFilmUrl,
                'Accept': '*/*'
            }
        });
        
        // البحث عن الرابط باستخدام Regex
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
            message: 'فشل السيرفر في جلب البيانات',
            error: error.message
        });
    }
});

app.get('/', (req, res) => {
    res.status(200).send('StreamMaster API is running perfectly! 🚀');
});

module.exports = app;
