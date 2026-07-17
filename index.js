const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());

// وظيفة المحلل: تحاكي متصفحاً حقيقياً لجلب الرابط
const getStreamUrl = async (vid) => {
    try {
        // 1. رابط الـ Embed الأساسي
        const embedUrl = `https://vidsrc.to/embed/movie/${vid}`;
        
        // 2. محاكاة طلب للحصول على كود المصدر
        const response = await axios.get(embedUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
            }
        });

        // هنا المنطق البرمجي (هذا الجزء متغير حسب تحديثات الموقع)
        // في العادة نقوم ببحث عن الـ source url عبر Regex أو Cheerio
        const m3u8Regex = /https?:\/\/[^\"']+\.(m3u8)/;
        const match = response.data.match(m3u8Regex);

        if (match) {
            return match[0];
        } else {
            throw new Error("لم نتمكن من فك تشفير الرابط");
        }
    } catch (e) {
        return null;
    }
};

app.get('/api/stream/movie', async (req, res) => {
    const { vid } = req.query; // هنا ترسل الـ ID الخاص بالفيلم

    const streamUrl = await getStreamUrl(vid);

    if (streamUrl) {
        return res.status(200).json({
            success: true,
            url: streamUrl
        });
    } else {
        return res.status(404).json({ success: false, message: "فشل استخراج الرابط من المصدر" });
    }
});

module.exports = app;
