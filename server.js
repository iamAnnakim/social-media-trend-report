// server.js
const express = require('express');
const cors = require('cors');
const cheerio = require('cheerio');
const app = express();

app.use(cors());

// ✅ Google Trends - 더미 데이터 사용
app.get('/api/google-trends', (req, res) => {
  const dummykeywords = [
    '#김종석', '#메이플 렌', '#잡식공룡', '#월드컵 예선', '#wwdc', '#강유정', '#2026 6월 모의고사', '#g7'
  ];
  res.json({ keywords: dummykeywords });
});

// ✅ X Trends - 실제 크롤링 유지
app.get('/api/X-trends', async (req, res) => {
  try {
    const html = await fetch('https://trends24.in/korea/').then(r => r.text());
    const $ = cheerio.load(html);
    const trends = [];

    $('ol.trend-card__list li a').each((i, el) => {
      trends.push($(el).text().trim());
    });

    res.json({ trends });
  } catch (err) {
    console.error('X Trends fetch error:', err);
    res.status(500).json({ error: 'X Trends fetch failed' });
  }
});

// ✅ YouTube Trending - 더미 데이터 사용
app.get('/api/youtube-trending', (req, res) => {
  const dummyVideos = [
    { title: '김종석', views: '1250000', category: 'Lifestyle' },
    { title: '축구 국가대표팀', views: '1010000', category: 'Sports' },
    { title: '취임식', views: '990000', category: 'Politics' },
    { title: '선거방송', views: '878000', category: 'Politics' },
    { title: '광장', views: '852000', category: 'Lifestyle' },
    { title: '잡식동물', views: '730000', category: 'Lifestyle' },
    { title: '현충일', views: '654000', category: 'Lifestyle' },
    { title: '오킹', views: '588000', category: 'Lifestyle' },
    { title: '김혜경', views: '576000', category: 'Politics' },
  ];
  res.json({ videos: dummyVideos });
});

// ✅ 서버 실행
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});