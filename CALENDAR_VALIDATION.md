# Calendar update validation — October 1, 2026 UTC

Prepared against main commit `4941ef280c62c66953b8f377d6420f1b11bba30f`.

Passed:
- All four public Trail Life Connect feeds fetched and parsed successfully.
- Snapshot: 84 events within the configured previous-year/next-two-year window (5 troop, 0 area, 7 regional, 72 national). These counts include past events.
- Four Python tests: DST and recurrence exclusions, all-day exclusive end dates and folded/escaped fields, moved occurrences and cancellations, rejection of non-calendar responses.
- JavaScript syntax checks.
- DOM tests using linkedom: month navigation, Today, four filters, all filters disabled, event-detail dialog, homepage cards, and literal rendering of HTML-like event text.
- HTML control IDs and unique event identifiers verified.

Not completed:
- Live deployment: the GitHub connection rejected creating a branch with HTTP 403, `Resource not accessible by integration`.
- Visual browser review: the execution environment had no Chromium executable, and the browser download failed. DOM interaction checks passed, but visual rendering and service-worker behavior must be checked on deployment.

See CALENDAR_SETUP.md for deployment instructions. Select GitHub Actions as the Pages source before running the workflow.
