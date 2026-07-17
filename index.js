const express = require('express');
const axios = require('axios');
const cors = require('cors');
const cheerio = require('cheerio');

const app = express();

app.use(cors());
app.use(express.json());

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

// دالة لجلب البيانات مع زيادة المهلة (Timeout) إلى 15 ثانية
const getViaProxy = async (url) => {
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    const response = await axios.get(proxyUrl, {
        headers: { 'User-Agent': USER_AGENT },
        timeout: 15000 // رفع المهلة إلى 15 ثانية
    });
    return response.data.contents;
};

app.get('/api/stream/movie', async (req, res) => {
    const { vid } = req.query;

    if (!vid) {
        return res.status(400).json({ success: false, message: 'يرجى إرسال الـ vid' });
    }

    const qFilmUrl = `https://a.qfilm.tv/watch.php?vid=${vid}`;

    try {
        const qFilmHtml = await getViaProxy(qFilmUrl);
        const $ = cheerio.load(qFilmHtml);
        const liiivideoUrl = $('meta[itemprop="contentUrl"]').attr('content');

        if (!liiivideoUrl) {
            return res.status(404).json({ success: false, message: "لم يتم العثور على رابط liiivideo" });
        }

        const liiiHtml = await getViaProxy(liiivideoUrl);
        const m3u8Regex = /https?:\/\/[^\"']+\.(m3u8|m3u)/;
        const match = liiiHtml.match(m3u8Regex);

        if (match) {
            return res.status(200).json({ success: true, url: match[0] });
        } else {
            return res.status(404).json({ success: false, message: "تعذر استخراج الرابط" });
        }

    } catch (error) {
        return res.status(500).json({ success: false, message: 'فشل السيرفر: ' + error.message });
    }
});

module.exports = app;
