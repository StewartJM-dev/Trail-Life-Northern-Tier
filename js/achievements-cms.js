
// Trail Life Northern Tier - Achievements CMS powered by Google Sheets
// CSV fetching/parsing lives in js/sheet-cms.js (loaded before this file).

const ACHIEVEMENTS_CONFIG = {
    SHEET_URL: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQmcY1pgrnq-Ifikl-GnBXFkb1fvaozXjgplGxkp4AE2RTPEVibtoX9A9jAvIP6dYqyAW4QGoMoc3Zb/pub?output=csv'
};

function createAchievementHTML(achievement, index) {
    const cardClass = index % 2 === 0 ? 'achievement-card-red' : 'achievement-card-gold';
    const icon = achievement.icon || 'fa-trophy';
    return `
        <div class="achievement-card ${cardClass} reveal">
            <i class="fas ${icon}" aria-hidden="true"></i>
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
        const achievements = SheetCMS.sortByDateDesc(await SheetCMS.fetchPublishedRows(ACHIEVEMENTS_CONFIG.SHEET_URL));
        loadingEl.style.display = 'none';
        if (achievements.length === 0) {
            gridContainer.innerHTML = '<p style="text-align: center; color: var(--gray); padding: 2rem; grid-column: 1/-1;">No achievements yet. Add achievements to your Google Sheet!</p>';
            return;
        }
        gridContainer.innerHTML = achievements.map((achievement, index) => createAchievementHTML(achievement, index)).join('');
        if (window.observeReveal) window.observeReveal(gridContainer);
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
