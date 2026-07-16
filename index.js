const express = require('express');
const axios = require('axios');
const app = express();

app.get('/vidsrc/:id', async (req, res) => {
    const tmdbId = req.params.id;
    
    try {
        // Headers ضرورية جداً لمحاكاة المتصفح ومنع الحظر
        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Referer': 'https://vidsrc.cc/'
        };

        // طلب البيانات من API الخاص بهم لاستخراج الرابط
        // ملاحظة: هذا المسار يعتمد على الهيكلية الحالية لـ vidsrc
        const response = await axios.get(`https://vidsrc.cc/v2/embed/movie/${tmdbId}`, { headers });
        
        // في حال نجاح الاتصال، نقوم بإرجاع الرابط
        // ملاحظة: إذا كان الموقع يستخدم نظام حماية مشفر، قد تحتاج لتعديل 
        // استخراج الرابط بناءً على ما يرجعه الموقع فعلياً
        res.json({
            status: "success",
            stream: `https://vidsrc.cc/v2/embed/movie/${tmdbId}` // هنا سيرسل الرابط الذي سيتعامل معه التطبيق
        });

    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
});

module.exports = app;
