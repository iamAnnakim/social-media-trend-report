// script.js
class LiveDataManager {
    constructor() {
        this.updateInterval = 1 * 60 * 1000;
        this.lastUpdate = new Date();
        this.isConnected = true;
        this.charts = {};
        this.currentData = {
            google: [],
            X: [],
            youtube: [],
            sentiment: {},
            engagement: {}
        };

        this.initializeData();
        this.startLiveUpdates();
    }

    async fetchGoogleData() {
        const res = await fetch('http://localhost:3000/api/google-trends');
        const data = await res.json();
        this.currentData.google = data.keywords.map(tag => ({
            keyword: tag,
            posts: Math.floor(Math.random() * 1000000000),
            growth: Math.random() * 5,
            category: 'general'
        }));
    }

    async fetchXData() {
        const res = await fetch('http://localhost:3000/api/X-trends');
        const data = await res.json();
        this.currentData.X = data.trends.map(trend => ({
            trend: trend,
            tweets: Math.floor(Math.random() * 50000),
            growth: Math.random() * 10,
            region: 'Korea'
        }));
    }

    async fetchYouTubeData() {
        const res = await fetch('http://localhost:3000/api/youtube-trending');
        const data = await res.json();
        this.currentData.youtube = data.videos.map(video => ({
            title: video.title,
            views: parseInt(video.views),
            growth: Math.random() * 20,
            category: video.category
        }));
    }

    async initializeData() {
        await Promise.all([
            this.fetchGoogleData(),
            this.fetchXData(),
            this.fetchYouTubeData()
        ]);
        this.updateDisplays();
    }

    startLiveUpdates() {
        setInterval(async () => {
            await this.initializeData();
            this.updateTimestamps();
        }, this.updateInterval);

        setInterval(() => {
            this.updateCountdown();
        }, 1000);

        setInterval(() => {
            this.simulateMicroUpdates();
        }, 30000);
    }

    simulateMicroUpdates() {
        const liveFeed = document.getElementById('live-feed');
        if (liveFeed) this.addLiveFeedItem();
        this.updateLiveCounters();
    }

    addLiveFeedItem() {
        const platforms = ['Google', 'X', 'YouTube'];
        const platform = platforms[Math.floor(Math.random() * platforms.length)];
        const actions = ['New trending keyword', 'Viral content detected', 'Engagement spike', 'New trend emerging'];
        const action = actions[Math.floor(Math.random() * actions.length)];

        const feedItem = document.createElement('div');
        feedItem.className = 'feed-item fade-in';
        feedItem.innerHTML = `
            <div class="platform">${platform}</div>
            <div class="content">${action}</div>
        `;

        const liveFeed = document.getElementById('live-feed');
        liveFeed.insertBefore(feedItem, liveFeed.firstChild);

        // Keep only last 5 items
        while (liveFeed.children.length > 5) {
            liveFeed.removeChild(liveFeed.lastChild);
        }
    }

    updateLiveCounters() {
        const postsCount = document.getElementById('live-posts-count');
        const trendsCount = document.getElementById('live-trends-count');
        const engagementRate = document.getElementById('live-engagement');

        if (postsCount) {
            const currentCount = parseInt(postsCount.textContent) || 2400000;
            postsCount.textContent = (currentCount + Math.floor(Math.random() * 1000)).toLocaleString();
        }

        if (trendsCount) {
            const currentTrends = parseInt(trendsCount.textContent) || 45;
            trendsCount.textContent = Math.max(40, currentTrends + Math.floor(Math.random() * 3 - 1));
        }

        if (engagementRate) {
            const currentRate = parseFloat(engagementRate.textContent) || 7.8;
            engagementRate.textContent = (currentRate + (Math.random() - 0.5) * 0.2).toFixed(1);
        }
    }

    updateDisplays() {
        this.renderTrendingTopics();
        this.renderKeywordCloud();
        this.renderRegionalTrends();
        this.renderPlatformData();
        this.updateCharts();
        this.updateInsights();
    }

    renderTrendingTopics(platform = 'all') {
        const container = document.getElementById('live-trending-list');
        if (!container) return;

        let data = [];
        
        if (platform === 'all' || platform === 'google') {
            data = data.concat(this.currentData.google.slice(0, 5).map(item => ({
                ...item,
                platform: 'google',
                type: 'keyword',
                engagement: this.formatNumber(item.posts),
                isLive: Math.random() > 0.7
            })));
        }

        if (platform === 'all' || platform === 'X') {
            data = data.concat(this.currentData.X.slice(0, 5).map(item => ({
                ...item,
                platform: 'X',
                type: 'trend',
                engagement: this.formatNumber(item.tweets) + ' tweets',
                isLive: Math.random() > 0.6
            })));
        }

        if (platform === 'all' || platform === 'youtube') {
            data = data.concat(this.currentData.youtube.slice(0, 3).map(item => ({
                ...item,
                platform: 'youtube',
                type: 'video',
                engagement: this.formatNumber(item.views) + ' views',
                isLive: Math.random() > 0.8
            })));
        }

        // Sort by growth rate
        data.sort((a, b) => b.growth - a.growth);

        container.innerHTML = data.map((item, index) => `
            <div class="trending-item ${item.isLive ? 'live' : ''}" data-platform="${item.platform}">
                <div class="trending-info">
                    <h3>${item.keyword || item.trend || item.title}</h3>
                    <div class="trending-meta">
                        <span class="platform-tag ${item.platform}">${item.platform.charAt(0).toUpperCase() + item.platform.slice(1)}</span>
                        <span>${item.engagement}</span>
                        <span class="velocity-badge ${this.getVelocityClass(item.growth)}">${this.getVelocityText(item.growth)}</span>
                    </div>
                    <p class="trending-description">${this.getDescription(item)}</p>
                </div>
                <div class="trending-stats">
                    <div class="growth-indicator">${item.growth > 0 ? '+' : ''}${item.growth.toFixed(1)}%</div>
                    <div class="engagement-count">${item.engagement}</div>
                </div>
            </div>
        `).join('');
    }

    renderKeywordCloud() {
        const container = document.getElementById('live-keyword-cloud');
        if (!container) return;

        // Extract keywords from current trending data
        const keywords = [];
        
        // From Google keywords
        this.currentData.google.slice(0, 10).forEach(item => {
            keywords.push({
                text: item.keyword.replace('#', ''),
                size: this.getKeywordSize(item.posts),
                count: item.posts,
                trending: item.growth > 3
            });
        });

        // From X trends
        this.currentData.X.slice(0, 8).forEach(item => {
            if (!item.trend.startsWith('#')) return;
            keywords.push({
                text: item.trend.replace('#', ''),
                size: this.getKeywordSize(item.tweets * 1000),
                count: item.tweets * 1000,
                trending: item.growth > 5
            });
        });

        container.innerHTML = keywords.map(keyword => `
            <span class="keyword-tag size-${keyword.size} ${keyword.trending ? 'trending' : ''}" 
                  data-count="${keyword.count}" 
                  title="${this.formatNumber(keyword.count)} mentions">
                #${keyword.text}
            </span>
        `).join('');

        // Add click events
        container.querySelectorAll('.keyword-tag').forEach(tag => {
            tag.addEventListener('click', () => {
                const keyword = tag.textContent;
                const count = tag.getAttribute('data-count');
                this.showKeywordDetails(keyword, count);
            });
        });
    }

    renderRegionalTrends() {
        const container = document.getElementById('korea-trends');
        if (!container) return;

        const koreaData = this.currentData.X.slice(0, 8);
        
        container.innerHTML = koreaData.map((item, index) => `
            <div class="regional-item">
                <div class="regional-rank">${index + 1}</div>
                <div class="regional-content">
                    <div class="regional-trend">${item.trend}</div>
                    <div class="regional-stats">${this.formatNumber(item.tweets)} tweets</div>
                </div>
                <div class="regional-growth ${item.growth > 0 ? 'positive' : 'negative'}">
                    ${item.growth > 0 ? '+' : ''}${item.growth.toFixed(1)}%
                </div>
            </div>
        `).join('');
    }

    renderPlatformData() {
        // Google keywords
        const googleContainer = document.getElementById('google-trends');
        if (googleContainer) {
            googleContainer.innerHTML = this.currentData.google.slice(0, 6).map(item => `
                <div class="keyword-item">
                    <span class="keyword-text">${item.keyword}</span>
                    <span class="keyword-count">${this.formatNumber(item.posts)}</span>
                </div>
            `).join('');

            // Update stats
            const topkeyword = document.getElementById('google-top-keyword');
            const totalTracked = document.getElementById('google-total');
            if (topkeyword) topkeyword.textContent = this.currentData.google[0].keyword;
            if (totalTracked) totalTracked.textContent = this.currentData.google.length;
        }

        // X trends
        const XContainer = document.getElementById('X-trends');
        if (XContainer) {
            XContainer.innerHTML = this.currentData.X.slice(0, 6).map(item => `
                <div class="trend-item">
                    <span class="trend-text">${item.trend}</span>
                    <span class="trend-count">${this.formatNumber(item.tweets)}</span>
                </div>
            `).join('');

            // Update stats
            const topTrend = document.getElementById('X-top-trend');
            if (topTrend) topTrend.textContent = this.currentData.X[0].trend;
        }

        // YouTube videos
        const youtubeContainer = document.getElementById('youtube-videos');
        if (youtubeContainer) {
            youtubeContainer.innerHTML = this.currentData.youtube.slice(0, 5).map(item => `
                <div class="video-item">
                    <span class="video-title">${item.title}</span>
                    <span class="video-views">${this.formatNumber(item.views)}</span>
                </div>
            `).join('');

            // Update stats
            const topVideo = document.getElementById('youtube-top-video');
            const topCategory = document.getElementById('youtube-top-category');
            if (topVideo) topVideo.textContent = this.currentData.youtube[0].title;
            if (topCategory) topCategory.textContent = this.currentData.youtube[0].category;
        }
    }

    updateCharts() {
        this.updateSentimentChart();
        this.updateEngagementChart();
        this.updatePlatformChart();
        this.updateVelocityChart();
    }

    updateSentimentChart() {
        const ctx = document.getElementById('live-sentiment-chart');
        if (!ctx) return;

        if (!this.charts.sentiment) {
            this.charts.sentiment = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Positive', 'Neutral', 'Negative'],
                    datasets: [{
                        data: [68, 20, 12],
                        backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        } else {
            // Update with new data
            const newData = [
                68 + (Math.random() - 0.5) * 10,
                20 + (Math.random() - 0.5) * 6,
                12 + (Math.random() - 0.5) * 4
            ];
            this.charts.sentiment.data.datasets[0].data = newData;
            this.charts.sentiment.update();
        }
    }

    updateEngagementChart() {
        const ctx = document.getElementById('live-engagement-chart');
        if (!ctx) return;

        if (!this.charts.engagement) {
            this.charts.engagement = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: this.generateTimeLabels(24),
                    datasets: [
                        {
                            label: 'Google',
                            data: this.generateEngagementData(24),
                            borderColor: '#10b981',
                            backgroundColor: '#10b98120',
                            tension: 0.4
                        },
                        {
                            label: 'X',
                            data: this.generateEngagementData(24),
                            borderColor: '#1da1f2',
                            backgroundColor: '#1da1f220',
                            tension: 0.4
                        },
                        {
                            label: 'YouTube',
                            data: this.generateEngagementData(24),
                            borderColor: '#ff0000',
                            backgroundColor: '#ff000020',
                            tension: 0.4
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    },
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        } else {
            // Add new data point and remove oldest
            this.charts.engagement.data.datasets.forEach(dataset => {
                dataset.data.push(Math.random() * 100 + 50);
                if (dataset.data.length > 24) {
                    dataset.data.shift();
                }
            });
            this.charts.engagement.update();
        }
    }

    updatePlatformChart() {
        const ctx = document.getElementById('platform-distribution-chart');
        if (!ctx) return;

        if (!this.charts.platform) {
            this.charts.platform = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['Posts', 'Engagement', 'Growth'],
                    datasets: [
                        {
                            label: 'Google',
                            data: [45, 78, 23],
                            backgroundColor: '#10b981'
                        },
                        {
                            label: 'X',
                            data: [35, 65, 18],
                            backgroundColor: '#1da1f2'
                        },
                        {
                            label: 'YouTube',
                            data: [20, 85, 31],
                            backgroundColor: '#ff0000'
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        }
    }

    updateVelocityChart() {
        const ctx = document.getElementById('velocity-chart');
        if (!ctx) return;

        if (!this.charts.velocity) {
            this.charts.velocity = new Chart(ctx, {
                type: 'radar',
                data: {
                    labels: ['Viral Speed', 'Engagement Rate', 'Share Velocity', 'Comment Growth', 'Reach Expansion'],
                    datasets: [{
                        label: 'Current Trends',
                        data: [75, 82, 68, 91, 77],
                        borderColor: '#667eea',
                        backgroundColor: '#667eea20',
                        pointBackgroundColor: '#667eea'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        r: {
                            beginAtZero: true,
                            max: 100
                        }
                    },
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        } else {
            // Update velocity data
            this.charts.velocity.data.datasets[0].data = this.charts.velocity.data.datasets[0].data.map(
                value => Math.max(0, Math.min(100, value + (Math.random() - 0.5) * 10))
            );
            this.charts.velocity.update();
        }
    }

    updateInsights() {
        const container = document.getElementById('live-insights');
        if (!container) return;

        const insights = this.generateLiveInsights();
        
        container.innerHTML = insights.map(insight => `
            <div class="insight-item ${insight.type}">
                <h4>${insight.title}</h4>
                <p>${insight.description}</p>
            </div>
        `).join('');
    }

    generateLiveInsights() {
    const insights = [];

    // Analyze current data for insights
    const topGoogleGrowth = Math.max(...this.currentData.google.map(item => item.growth));
    const topXGrowth = Math.max(...this.currentData.X.map(item => item.growth));
    if (topGoogleGrowth > 5) {
        insights.push({
            type: 'positive',
            title: 'Google Surge Detected',
            description: `keyword growth rate reached ${topGoogleGrowth.toFixed(1)}% - highest in 24 hours`
        });
    }

    if (topXGrowth > 10) {
        insights.push({
            type: 'alert',
            title: 'X Trend Explosion',
            description: `Korea trending topic growing at ${topXGrowth.toFixed(1)}% - viral potential detected`
        });
    }

    // 🟧 정치 이슈: 대통령 선거 관련
    insights.push({
        type: 'alert',
        title: 'Election Debate Intensifies',
        description: 'Online discussions around presidential election fairness are rapidly increasing across social platforms.'
    });

    // 🟥 보안 이슈: SKT 유출
    insights.push({
        type: 'alert',
        title: 'Security Concerns Rising',
        description: 'SK Telecom data breach draws massive public attention, fueling conversations on digital safety.'
    });

    return insights;
}

    updateTimestamps() {
        const now = new Date();
        
        // Update last update time
        const lastUpdateElement = document.getElementById('last-update-time');
        if (lastUpdateElement) {
            lastUpdateElement.textContent = now.toLocaleTimeString();
        }

        // Update footer timestamp
        const footerUpdate = document.getElementById('footer-last-update');
        if (footerUpdate) {
            footerUpdate.textContent = now.toLocaleString();
        }

        // Update data age
        const dataAge = document.getElementById('data-age');
        if (dataAge) {
            const secondsAgo = Math.floor((now - this.lastUpdate) / 1000);
            if (secondsAgo < 60) {
                dataAge.textContent = 'Just now';
            } else if (secondsAgo < 3600) {
                dataAge.textContent = `${Math.floor(secondsAgo / 60)} minutes ago`;
            } else {
                dataAge.textContent = `${Math.floor(secondsAgo / 3600)} hours ago`;
            }
        }
    }

    updateCountdown() {
        const nextUpdate = new Date(this.lastUpdate.getTime() + this.updateInterval);
        const now = new Date();
        const timeLeft = nextUpdate - now;

        const countdownElement = document.getElementById('next-update-countdown');
        if (countdownElement && timeLeft > 0) {
            const minutes = Math.floor(timeLeft / 60000);
            const seconds = Math.floor((timeLeft % 60000) / 1000);
            countdownElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    // Utility methods
    formatNumber(num) {
        if (num >= 1000000000) {
            return (num / 1000000000).toFixed(1) + 'B';
        } else if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    getKeywordSize(count) {
        if (count > 1000000000) return 5;
        if (count > 500000000) return 4;
        if (count > 100000000) return 3;
        if (count > 50000000) return 2;
        return 1;
    }

    getVelocityClass(growth) {
        if (growth > 15) return 'hot';
        if (growth > 5) return 'rising';
        return '';
    }

    getVelocityText(growth) {
        if (growth > 15) return 'HOT';
        if (growth > 5) return 'Rising';
        if (growth > 0) return 'Growing';
        return 'Stable';
    }

    getDescription(item) {
        const descriptions = {
            google: {
                lifestyle: "Lifestyle content driving high engagement across demographics",
                fashion: "Fashion trends influencing global style conversations",
                photography: "Visual content showcasing creative photography techniques",
                art: "Artistic expression gaining momentum in creative communities",
                general: "Broad appeal content with consistent engagement patterns"
            },
            X: {
                default: "Real-time discussion trending in Korean social media landscape"
            },
            youtube: {
                Music: "Music content driving significant viewer engagement",
                Gaming: "Gaming community content with high interaction rates",
                Technology: "Tech-focused content appealing to innovation enthusiasts",
                default: "Video content gaining traction across diverse audiences"
            }
        };

        if (item.platform === 'google') {
            return descriptions.google[item.category] || descriptions.google.general;
        } else if (item.platform === 'X') {
            return descriptions.X.default;
        } else if (item.platform === 'youtube') {
            return descriptions.youtube[item.category] || descriptions.youtube.default;
        }

        return "Trending content with growing engagement metrics";
    }

    generateTimeLabels(hours) {
        const labels = [];
        const now = new Date();
        for (let i = hours - 1; i >= 0; i--) {
            const time = new Date(now.getTime() - i * 60 * 60 * 1000);
            labels.push(time.getHours() + ':00');
        }
        return labels;
    }

    generateEngagementData(points) {
        return Array.from({ length: points }, () => Math.random() * 50 + 25);
    }

    showKeywordDetails(keyword, count) {
        const modal = document.createElement('div');
        modal.className = 'keyword-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${keyword}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <p><strong>Total Mentions:</strong> ${this.formatNumber(parseInt(count))}</p>
                    <p><strong>Platform Distribution:</strong></p>
                    <ul>
                        <li>Google: 65%</li>
                        <li>X: 25%</li>
                        <li>YouTube: 10%</li>
                    </ul>
                    <p><strong>Trend Status:</strong> ${Math.random() > 0.5 ? 'Rising' : 'Stable'}</p>
                    <p><strong>Peak Time:</strong> ${Math.floor(Math.random() * 12) + 1}:00 ${Math.random() > 0.5 ? 'PM' : 'AM'}</p>
                </div>
            </div>
        `;

        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;

        modal.querySelector('.modal-content').style.cssText = `
            background: white;
            padding: 2rem;
            border-radius: 10px;
            max-width: 500px;
            width: 90%;
        `;

        modal.querySelector('.modal-close').style.cssText = `
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            float: right;
        `;

        document.body.appendChild(modal);

        modal.addEventListener('click', (e) => {
            if (e.target === modal || e.target.classList.contains('modal-close')) {
                document.body.removeChild(modal);
            }
        });
    }

    // Public methods for external control
    refreshData() {
        this.simulateDataUpdate();
        this.updateDisplays();
        this.updateTimestamps();
        this.showNotification('Live data refreshed successfully!', 'success');
    }

    filterByPlatform(platform) {
        this.renderTrendingTopics(platform);
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : '#667eea'};
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 3000);
    }
}

let liveDataManager;

document.addEventListener('DOMContentLoaded', function() {
    liveDataManager = new LiveDataManager();
    initializeEventListeners();
    initializeNavigation();
    animateHeroStats();
});
function initializeEventListeners() {
    // Filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            filterButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const platform = this.getAttribute('data-platform');
            liveDataManager.filterByPlatform(platform);
        });
    });

    // Time selector buttons
    const timeButtons = document.querySelectorAll('.time-btn');
    timeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            timeButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            // Update charts based on time selection
            const timeRange = this.getAttribute('data-time');
            updateChartsForTimeRange(timeRange);
        });
    });

    // Sort selector
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            const sortBy = this.value;
            sortTrendingData(sortBy);
        });
    }

    // Mobile navigation
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }
}

function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            scrollToSection(targetId);
        });
    });
}

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        const offsetTop = section.offsetTop - 80;
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
    }
}

function animateHeroStats() {
    const statNumbers = document.querySelectorAll('.stat-number');
    
    statNumbers.forEach(stat => {
        const target = parseFloat(stat.getAttribute('data-target')) || 0;
        if (target === 0) {
            // Set initial values for live counters
            if (stat.id === 'live-posts-count') stat.textContent = '2,400,000';
            if (stat.id === 'live-trends-count') stat.textContent = '45';
            if (stat.id === 'live-engagement') stat.textContent = '7.8';
            return;
        }
        
        const increment = target / 100;
        let current = 0;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            stat.textContent = current.toFixed(1);
        }, 20);
    });
}

function updateChartsForTimeRange(timeRange) {
    // Update charts based on selected time range
    if (liveDataManager && liveDataManager.charts.engagement) {
        let dataPoints;
        switch(timeRange) {
            case '1h':
                dataPoints = 12; // 5-minute intervals
                break;
            case '6h':
                dataPoints = 24; // 15-minute intervals
                break;
            case '24h':
                dataPoints = 24; // 1-hour intervals
                break;
            default:
                dataPoints = 24;
        }
        
        // Regenerate data for the new time range
        liveDataManager.charts.engagement.data.labels = liveDataManager.generateTimeLabels(dataPoints);
        liveDataManager.charts.engagement.data.datasets.forEach(dataset => {
            dataset.data = liveDataManager.generateEngagementData(dataPoints);
        });
        liveDataManager.charts.engagement.update();
    }
}

function sortTrendingData(sortBy) {
    // This would sort the trending data based on the selected criteria
    // For now, we'll just refresh the display
    if (liveDataManager) {
        liveDataManager.renderTrendingTopics();
    }
}

function refreshLiveData() {
    if (liveDataManager) {
        liveDataManager.refreshData();
    }
}

// Global functions for external access
window.LiveTrendScope = {
    refreshData: refreshLiveData,
    scrollToSection: scrollToSection,
    filterByPlatform: (platform) => liveDataManager?.filterByPlatform(platform),
    showNotification: (message, type) => liveDataManager?.showNotification(message, type)
};

// Handle window resize for charts
window.addEventListener('resize', () => {
    if (liveDataManager && liveDataManager.charts) {
        Object.values(liveDataManager.charts).forEach(chart => {
            if (chart && chart.resize) {
                chart.resize();
            }
        });
    }
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    .fade-in {
        animation: fadeIn 0.6s ease-in;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;
document.head.appendChild(style);


