
// Trail Life Northern Tier - Achievements CMS powered by Google Sheets

const ACHIEVEMENTS_CONFIG = {
    SHEET_URL: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQmcY1pgrnq-Ifikl-GnBXFkb1fvaozXjgplGxkp4AE2RTPEVibtoX9A9jAvIP6dYqyAW4QGoMoc3Zb/pub?output=csv'
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

function createAchievementHTML(achievement, index) {
    const cardClass = index % 2 === 0 ? 'achievement-card-red' : 'achievement-card-gold';
    const iconColor = index % 2 === 0 ? 'var(--gold)' : 'white';
    const icon = achievement.icon || 'fa-trophy';
    return `
        <div class="achievement-card ${cardClass}">
            <i class="fas ${icon}" style="color: ${iconColor};"></i>
            <h3>${achievement.title}</h3>
            <p><strong>${achievement.troop}</strong></p>
            <p>${achievement.description}</p>
        </div>
    `;
}

async function loadAchievements() {
    const loadingEl = document.getElementById('loading');
    const errorEl = document.getElementById('error');
    const gridContainer = document.getElementById('achievements-grid');
    try {
        if (ACHIEVEMENTS_CONFIG.SHEET_URL === 'YOUR_GOOGLE_SHEETS_CSV_URL_HERE') {
            throw new Error('Please configure your Google Sheets URL in js/achievements-cms.js');
        }
        const response = await fetch(ACHIEVEMENTS_CONFIG.SHEET_URL);
        if (!response.ok) {
            throw new Error('Failed to fetch achievements from Google Sheets');
        }
        const csvText = await response.text();
        const achievements = parseCSV(csvText);
        achievements.sort((a, b) => new Date(b.date) - new Date(a.date));
        loadingEl.style.display = 'none';
        if (achievements.length === 0) {
            gridContainer.innerHTML = '<p style="text-align: center; color: var(--gray); padding: 2rem; grid-column: 1/-1;">No achievements yet. Add achievements to your Google Sheet!</p>';
            return;
        }
        gridContainer.innerHTML = achievements.map((achievement, index) => createAchievementHTML(achievement, index)).join('');
    } catch (error) {
        console.error('Error loading achievements:', error);
        loadingEl.style.display = 'none';
        errorEl.style.display = 'block';
        errorEl.innerHTML = `
            <strong>Error loading achievements:</strong> ${error.message}
            <br><br>Please make sure:
            <ul style="margin-top: 10px; padding-left: 20px;">
                <li>Your Google Sheet is published to the web</li>
                <li>The CSV URL is correctly configured in js/achievements-cms.js</li>
                <li>Your sheet has the correct column headers</li>
            </ul>
        `;
    }
}

document.addEventListener('DOMContentLoaded', loadAchievements);
