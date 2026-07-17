const express = require('express');
const axios = require('axios');
const cors = require('cors');
const cheerio = require('cheerio'); // مكتبة القشط الجديدة

const app = express();

app.use(cors());
app.use(express.json());

// مسار جلب رابط الفيديو المباشر
// الاستخدام: /api/stream/movie?vid=a02e077b5
app.get('/api/stream/movie', async (req, res) => {
    const vid = req.query.vid;

    if (!vid) {
        return res.status(400).json({ success: false, message: 'يرجى إرسال الـ vid' });
    }

    const qFilmUrl = `https://a.qfilm.tv/watch.php?vid=${vid}`;

    try {
        // 1. جلب صفحة QFilm
        const qFilmResponse = await axios.get(qFilmUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36' }
        });
        
        const $q = cheerio.load(qFilmResponse.data);
        const liiivideoUrl = $q('meta[itemprop="contentUrl"]').attr('content');

        if (!liiivideoUrl) {
            throw new Error("لم يتم العثور على رابط LiiiVideo");
        }

        // 2. جلب صفحة LiiiVideo لاستخراج رابط m3u8
        const liiiResponse = await axios.get(liiivideoUrl, {
            headers: { 'Referer': qFilmUrl, 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
        });
        
        const liiiData = liiiResponse.data;

        // 3. البحث عن رابط m3u8 باستخدام Regex (كما جربنا في تيرمكس)
        const m3u8Regex = /https?:\/\/[^\"']+\.(m3u8|m3u)/;
        const match = liiiData.match(m3u8Regex);

        if (match) {
            return res.status(200).json({
                success: true,
                url: match[0], // هذا هو الرابط المباشر للتشغيل
                source: "LiiiVideo"
            });
        } else {
            throw new Error("لم يتم العثور على رابط m3u8 داخل صفحة البث");
        }

    } catch (error) {
        console.error('Error:', error.message);
        return res.status(500).json({
            success: false,
            message: 'فشل استخراج الرابط',
            error: error.message
        });
    }
});

// اختبار السيرفر
app.get('/', (req, res) => {
    res.status(200).send('StreamMaster Scraper API is running! 🚀');
});

module.exports = app;
