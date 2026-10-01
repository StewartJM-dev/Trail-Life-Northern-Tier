// Trail Life Northern Tier - Spotlight CMS powered by Google Sheets
// CSV fetching/parsing lives in js/sheet-cms.js (loaded before this file).

const SPOTLIGHT_CONFIG = {
    SHEET_URL: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQbKOUft13Bb3ZWOy_HUBazuAeLBDVsEImeI2zRIcs3isGb0et72lkJwYXrJWXE6gWW5_1Bn3US8WHd/pub?output=csv'
};

function formatMonthYear(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long'
    });
}

function createSpotlightHTML(spotlight) {
    const highlights = spotlight.highlights ? spotlight.highlights.split('\n').filter(h => h.trim()).map(h => 
        `<li>${h.trim()}</li>`
    ).join('') : '';

    return `
        <div class="spotlight-content">
            <h2>${formatMonthYear(spotlight.date)}: ${spotlight.troop_number} - ${spotlight.location}</h2>
            <p>${spotlight.description}</p>
            
            ${highlights ? `
                <div class="highlights-section">
                    <h4>
                        <i class="fas fa-star" style="color: var(--gold); margin-right: 10px;"></i>
                        Key Highlights:
                    </h4>
                    <ul>${highlights}</ul>
                </div>
            ` : ''}
            
            ${spotlight.quote ? `
                <div class="quote-box">
                    <p>
                        <i class="fas fa-quote-left" style="color: var(--gold); margin-right: 10px;"></i>
                        <em>${spotlight.quote}</em>
                    </p>
                </div>
            ` : ''}
            
            ${spotlight.website ? `
                <div class="website-link">
                    <a href="${spotlight.website}" target="_blank" class="btn btn-primary">
                        Visit Troop Website
                    </a>
                </div>
            ` : ''}
        </div>
    `;
}

async function loadSpotlight() {
    const loadingEl = document.getElementById('loading');
    const errorEl = document.getElementById('error');
    const contentContainer = document.getElementById('spotlight-content');

    try {
        const spotlights = SheetCMS.sortByDateDesc(await SheetCMS.fetchPublishedRows(SPOTLIGHT_CONFIG.SHEET_URL));

        loadingEl.style.display = 'none';

        if (spotlights.length === 0) {
            contentContainer.innerHTML = '<p style="text-align: center; color: var(--gray); padding: 2rem;">No spotlight yet. Add a spotlight to your Google Sheet to get started!</p>';
            return;
        }

        contentContainer.innerHTML = createSpotlightHTML(spotlights[0]);

    } catch (error) {
        console.error('Error loading spotlight:', error);
        loadingEl.style.display = 'none';
        errorEl.style.display = 'block';
        errorEl.innerHTML = `
            <strong>Error loading spotlight:</strong> ${error.message}
            <br><br>
            Please make sure:
            <ul style="margin-top: 10px; padding-left: 20px;">
                <li>Your Google Sheet is published to the web</li>
                <li>The CSV URL is correctly configured in js/spotlight-cms.js</li>
                <li>Your sheet has the correct column headers</li>
            </ul>
        `;
    }
}

document.addEventListener('DOMContentLoaded', loadSpotlight);
