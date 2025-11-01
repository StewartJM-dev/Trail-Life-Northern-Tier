// Trail Life Northern Tier - Spotlight CMS powered by Google Sheets

const SPOTLIGHT_CONFIG = {
    SHEET_URL: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQbKOUft13Bb3ZWOy_HUBazuAeLBDVsEImeI2zRIcs3isGb0et72lkJwYXrJWXE6gWW5_1Bn3US8WHd/pub?output=csv'
};

function parseCSV(text) {
    const lines = text.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const spotlights = [];

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

        const spotlight = {};
        headers.forEach((header, index) => {
            spotlight[header] = values[index] || '';
        });

        if (spotlight.published && spotlight.published.toLowerCase() === 'true') {
            spotlights.push(spotlight);
        }
    }

    return spotlights;
}

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
        if (SPOTLIGHT_CONFIG.SHEET_URL === 'YOUR_GOOGLE_SHEETS_CSV_URL_HERE') {
            throw new Error('Please configure your Google Sheets URL in js/spotlight-cms.js');
        }

        const response = await fetch(SPOTLIGHT_CONFIG.SHEET_URL);
        
        if (!response.ok) {
            throw new Error('Failed to fetch spotlight from Google Sheets');
        }

        const csvText = await response.text();
        const spotlights = parseCSV(csvText);

        spotlights.sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return dateB - dateA;
        });

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
