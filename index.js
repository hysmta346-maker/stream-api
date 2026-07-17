const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();

// تفعيل CORS لمنع حظر الطلبات القادمة من تطبيق الأندرويد
app.use(cors());
app.use(express.json());

// 1. مسار جلب روابط الأفلام
app.get('/api/stream/movie/:id', async (req, res) => {
    const movieId = req.params.id;
    const targetUrl = `https://db.speedracelight.com/3/movie/${movieId}`;
    
    try {
        // تمرير الـ Headers المطلوبة لتجاوز حماية السيرفر المستهدف
        const response = await axios.get(targetUrl, {
            params: {
                language: 'en'
            },
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                'Referer': 'https://player.videasy.to/',
                'Origin': 'https://player.videasy.to'
            },
            timeout: 10000 // مهلة اتصال 10 ثوانٍ
        });

        // إرجاع البيانات الناتجة لتطبيق الأندرويد مباشرة
        return res.status(200).json({
            success: true,
            data: response.data
        });

    } catch (error) {
        console.error('Error in movie proxy:', error.message);
        return res.status(error.response?.status || 500).json({
            success: false,
            message: 'فشل خادم العرض في الاستجابة للطلب',
            error: error.message
        });
    }
});

// 2. مسار جلب روابط المسلسلات والحلقات
app.get('/api/stream/tv/:id/:season/:episode', async (req, res) => {
    const { id, season, episode } = req.params;
    const targetUrl = `https://db.speedracelight.com/3/tv/${id}/season/${season}/episode/${episode}`;
    
    try {
        const response = await axios.get(targetUrl, {
            params: { 
                append_to_response: 'external_ids' 
            },
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                'Referer': 'https://player.videasy.to/',
                'Origin': 'https://player.videasy.to'
            },
            timeout: 10000
        });

        return res.status(200).json({
            success: true,
            data: response.data
        });

    } catch (error) {
        return res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// اختبار عمل السيرفر عند فتحه بالمتصفح مباشرة
app.get('/', (req, res) => {
    res.status(200).send('StreamMaster Flat API is running perfectly from root! 🚀');
});

module.exports = app;
