
const express = require('express');
const axios = require('axios'); // تأكد من إضافة axios في package.json
const app = express();

app.get('/vidsrc/:id', async (req, res) => {
    const tmdbId = req.params.id;
    const embedUrl = `https://vidsrc.cc/v2/embed/movie/${tmdbId}`;
    
    try {
        // هنا نقوم بطلب الصفحة واستخراج رابط الفيديو منها
        const response = await axios.get(embedUrl);
        const html = response.data;
        
        // هذا مجرد مثال: يجب أن تبحث عن الرابط الحقيقي داخل الـ HTML
        // سأضع رابطاً تجريبياً لنتأكد هل المشكلة من الرابط أم من المشغل
        res.json({
            status: "success",
            stream: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" 
        });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Failed to fetch stream" });
    }
});

module.exports = app;
