// Trail Life Northern Tier - Home Page Achievements Loader
// Loads 3 most recent achievements from Google Sheets for the home page.
// This reads the SAME sheet as js/achievements-cms.js (the full achievements
// page) — CSV fetching/parsing lives in js/sheet-cms.js (loaded before this file).

const HOME_ACHIEVEMENTS_CONFIG = {
    SHEET_URL: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQmcY1pgrnq-Ifikl-GnBXFkb1fvaozXjgplGxkp4AE2RTPEVibtoX9A9jAvIP6dYqyAW4QGoMoc3Zb/pub?output=csv',
    MAX_ACHIEVEMENTS: 3 // Show only 3 on home page
};

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
        const achievements = SheetCMS.sortByDateDesc(await SheetCMS.fetchPublishedRows(HOME_ACHIEVEMENTS_CONFIG.SHEET_URL));
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
