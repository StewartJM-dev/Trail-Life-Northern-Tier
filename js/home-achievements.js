// Trail Life Northern Tier - Home Page Achievements Loader
// Loads 3 most recent achievements from Google Sheets for the home page

const HOME_ACHIEVEMENTS_CONFIG = {
    SHEET_URL: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQmcY1pgrnq-Ifikl-GnBXFkb1fvaozXjgplGxkp4AE2RTPEVibtoX9A9jAvIP6dYqyAW4QGoMoc3Zb/pub?output=csv',
    MAX_ACHIEVEMENTS: 3 // Show only 3 on home page
};

function parseCSV(text) {
    const lines = text.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const achievements = [];
    
    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        const values = [];
        let currentValue = '';
        let insideQuotes = false;
        
        for (let char of lines[i]) {
            if (char === '"') {
                insideQuotes = !insideQuotes;
            } else if (char === ',' && !insideQuotes) {
                values.push(currentValue.trim().replace(/^"|"$/g, ''));
                currentValue = '';
            } else {
                currentValue += char;
            }
        }
        values.push(currentValue.trim().replace(/^"|"$/g, ''));

        const achievement = {};
        headers.forEach((header, index) => {
            achievement[header] = values[index] || '';
        });

        if (achievement.published && achievement.published.toLowerCase() === 'true') {
            achievements.push(achievement);
        }
    }
    
    return achievements;
}

function createHomeAchievementHTML(achievement) {
    const icon = achievement.icon || 'fa-trophy';
    
    return `
        <div class="achievement-card">
            <div class="achievement-icon">
                <i class="fas ${icon}"></i>
            </div>
            <h3>${achievement.troop}</h3>
            <p>${achievement.description}</p>
        </div>
    `;
}

async function loadHomeAchievements() {
    const container = document.getElementById('home-achievements');
    
    // Only load if we're on a page with this container
    if (!container) return;
    
    try {
        const response = await fetch(HOME_ACHIEVEMENTS_CONFIG.SHEET_URL);
        
        if (!response.ok) {
            throw new Error('Failed to fetch achievements');
        }

        const csvText = await response.text();
        const achievements = parseCSV(csvText);

        // Sort by date (newest first) and take only the first 3
        achievements.sort((a, b) => new Date(b.date) - new Date(a.date));
        const recentAchievements = achievements.slice(0, HOME_ACHIEVEMENTS_CONFIG.MAX_ACHIEVEMENTS);

        if (recentAchievements.length === 0) {
            container.innerHTML = `
                <div class="achievement-card">
                    <div class="achievement-icon">
                        <i class="fas fa-trophy"></i>
                    </div>
                    <h3>No achievements yet</h3>
                    <p>Check back soon for troop achievements!</p>
                </div>
            `;
            return;
        }

        // Display the achievements
        container.innerHTML = recentAchievements.map(createHomeAchievementHTML).join('');

    } catch (error) {
        console.error('Error loading home achievements:', error);
        // Show a friendly fallback message
        container.innerHTML = `
            <div class="achievement-card">
                <div class="achievement-icon">
                    <i class="fas fa-trophy"></i>
                </div>
                <h3>Recent Achievements</h3>
                <p>View our troop achievements on the achievements page!</p>
            </div>
        `;
    }
}

// Load achievements when page loads
document.addEventListener('DOMContentLoaded', loadHomeAchievements);
