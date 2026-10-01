// Trail Life Northern Tier - shared Google Sheets CMS helper
//
// Every "CMS" page (blog, achievements, spotlight, gallery, home-achievements)
// fetches a Google Sheet published as CSV, parses it, and keeps only rows
// marked published. This file is the one place that logic lives; the
// per-page scripts just supply a SHEET_URL and their own rendering.
const SheetCMS = (() => {

    // Parses CSV text into rows of cells, honoring RFC 4180 quoting: a
    // quoted field can contain commas, newlines, and "" as an escaped quote.
    // (The old copy-pasted parser in each page split on "\n" before looking
    // at quotes, so a cell with an actual line break in it would silently
    // corrupt the row — this version reads the whole text character by
    // character so that can't happen.)
    function parseCSV(text) {
        const rows = [];
        let row = [], field = '', insideQuotes = false;

        for (let i = 0; i < text.length; i++) {
            const char = text[i];

            if (insideQuotes) {
                if (char === '"') {
                    if (text[i + 1] === '"') { field += '"'; i++; }
                    else insideQuotes = false;
                } else {
                    field += char;
                }
                continue;
            }

            if (char === '"') {
                insideQuotes = true;
            } else if (char === ',') {
                row.push(field);
                field = '';
            } else if (char === '\r') {
                // skip; the matching \n ends the row
            } else if (char === '\n') {
                row.push(field);
                rows.push(row);
                row = [];
                field = '';
            } else {
                field += char;
            }
        }
        if (field.length || row.length) {
            row.push(field);
            rows.push(row);
        }
        // Drop fully blank trailing/blank lines
        return rows.filter(r => r.length > 1 || r[0] !== '');
    }

    function rowsToObjects(rows) {
        if (!rows.length) return [];
        const headers = rows[0].map(h => h.trim());
        return rows.slice(1).map(cells => {
            const obj = {};
            headers.forEach((header, index) => { obj[header] = (cells[index] || '').trim(); });
            return obj;
        });
    }

    // Fetches a published Google Sheet CSV and returns only the rows whose
    // "published" column is "true". Pass extraFilter for a page-specific
    // extra requirement (e.g. the gallery also requires an image_url).
    async function fetchPublishedRows(sheetUrl, { extraFilter } = {}) {
        if (!sheetUrl || sheetUrl === 'YOUR_GOOGLE_SHEETS_CSV_URL_HERE') {
            throw new Error('Google Sheets URL is not configured.');
        }

        const response = await fetch(sheetUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch sheet (HTTP ${response.status})`);
        }

        const csvText = await response.text();
        const rows = rowsToObjects(parseCSV(csvText));

        return rows.filter(row => {
            if (!(row.published && row.published.toLowerCase() === 'true')) return false;
            return extraFilter ? extraFilter(row) : true;
        });
    }

    function sortByDateDesc(rows, field = 'date') {
        return [...rows].sort((a, b) => new Date(b[field]) - new Date(a[field]));
    }

    return { parseCSV, fetchPublishedRows, sortByDateDesc };
})();
