# Calendar operation

The home page and Events page read `data/events.json`. The Events page provides a month view, source checkboxes, event details, and an upcoming-events list. All times are displayed in America/New_York. All-day event end dates follow iCalendar's exclusive-end convention.

## Publish this update

1. Apply the supplied patch to the `main` branch of `StewartJM-dev/Trail-Life-Northern-Tier`.
2. In the repository's **Settings → Pages → Build and deployment**, select **GitHub Actions** as the source.
3. Open **Actions → Refresh calendar and publish website → Run workflow** and select `main`.
4. Wait for the `publish` job to succeed. Check the live Events page and its Updated timestamp, all four filters, and event details.

The workflow refreshes and deploys every six hours and on pushes to main. No external CORS proxy or Google Calendar import is used. Scheduled workflows in inactive public repositories may be disabled by GitHub after 60 days; re-enable the workflow if necessary.

## Feed configuration

The four existing, public Trail Life Connect subscriptions are configured in `scripts/sync_calendar.py`: troop, area, region, and national. Feed URLs are subscription links, so only public-calendar links should be used here. Dates, locations, descriptions, recurrences, exclusions, and moved occurrences are parsed using `icalendar` and `recurring-ical-events`.

The snapshot includes the previous year and next two years. Empty valid feeds are allowed. All four feeds must fetch and parse successfully before a new snapshot is published; a failed sync leaves the existing live deployment intact. The page marks snapshots older than 24 hours as delayed.

## Verify locally

```sh
python -m pip install -r scripts/calendar-requirements.txt
python -m unittest discover -s tests
python scripts/sync_calendar.py
python -m http.server 8000
```

Open `http://localhost:8000/events.html` and `http://localhost:8000/index.html`.

## GitHub connection access

If publishing through the ChatGPT GitHub connection fails with `Resource not accessible by integration`, open GitHub **Settings → Applications → Installed GitHub Apps → the ChatGPT/OpenAI app → Configure**. Ensure this repository is selected and approve any pending permission update. The app needs Contents write access and permission to edit workflow files. Installation permissions are determined by the app; there may be no editable permission dropdown. If the connection cannot request the necessary permissions, the patch can be applied with an authorized local Git checkout or GitHub's web editor instead.
