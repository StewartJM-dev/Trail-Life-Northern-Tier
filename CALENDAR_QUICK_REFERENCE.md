# Calendar quick reference

- Event source: four public Trail Life Connect subscriptions.
- Refresh: GitHub Actions every six hours and on pushes to `main`.
- Display: Eastern time, month view, event details, upcoming list, and source filters.
- Configuration: `scripts/sync_calendar.py`.
- Workflow: `.github/workflows/calendar-pages.yml`.
- Website snapshot: `data/events.json` (generated before each deployment).
- Deployment setup and troubleshooting: [CALENDAR_SETUP.md](CALENDAR_SETUP.md).

A valid source with zero events is shown as empty. A failed feed aborts the deployment instead of replacing the calendar with an empty result. Check the Updated timestamp on the Events page and the latest workflow run to confirm freshness.
