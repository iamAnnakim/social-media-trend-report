// server.js
const express = require('express');
const cors = require('cors');
const cheerio = require('cheerio');
const app = express();

app.use(cors());

// ✅ Google Trends - 더미 데이터 사용
app.get('/api/google-trends', (req, res) => {
  const dummyHashtags = [
    '#이재명아들', '#사전투표기간', '#카리나', '#최정우', '#한화대lg', '#롯데대삼성', '#키움대kia', '#사전투표소'
  ];
  res.json({ hashtags: dummyHashtags });
});

// ✅ Twitter Trends - 실제 크롤링 유지
app.get('/api/twitter-trends', async (req, res) => {
  try {
    const html = await fetch('https://trends24.in/korea/').then(r => r.text());
    const $ = cheerio.load(html);
    const trends = [];

    $('ol.trend-card__list li a').each((i, el) => {
      trends.push($(el).text().trim());
    });

    res.json({ trends });
  } catch (err) {
    console.error('Twitter Trends fetch error:', err);
    res.status(500).json({ error: 'Twitter Trends fetch failed' });
  }
});

// ✅ YouTube Trending - 더미 데이터 사용
app.get('/api/youtube-trending', (req, res) => {
  const dummyVideos = [
    { title: '젓가락', views: '1250000', category: 'Lifestyle' },
    { title: '사전투표', views: '890000', category: 'Politics' },
    { title: '배인규', views: '1570000', category: 'Entertainment' },
    { title: '투표', views: '2200000', category: 'Politics' },
    { title: '나인 퍼즐', views: '730000', category: 'Lifestyle' },
    { title: '이준석 젓가락', views: '730000', category: 'Politics' },
    { title: '이재명 젓가락', views: '730000', category: 'Politics' },
    { title: '대선 토론 3차', views: '730000', category: 'Politics' },
    { title: '이재명 아들들', views: '730000', category: 'Politics' },
  ];
  res.json({ videos: dummyVideos });
});

// ✅ 서버 실행
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
