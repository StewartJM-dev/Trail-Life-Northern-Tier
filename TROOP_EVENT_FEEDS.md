# Troop event feeds

Northern Tier reads registered public troop feeds during its scheduled publication (every six hours). PA-1997's source is https://trooppa1997.com/events.json, maintained by its existing calendar sync. Regular meetings and cancelled events are excluded. Select an adventure by adding `Hit the Trail` to its source calendar title or description; future feeds may supply `hitTheTrail: true` instead. Removing that selection removes it at the next successful refresh. Expired events disappear from the page automatically. Listing an event does not imply an invitation to other troops.

Add approved public feeds to `data/troop-feeds.json`. Feeds follow PA-1997's `events` array format with `id`, `title`, `displayTitle`, `date`, `endDate`, `isMeeting`, `cancelled`, `tentative`, `location`, and optional `poster.fileId` (public Google Drive poster). The Events page automatically creates a horizontal event rail for each registered troop using `js/troop-events.js`; troop profiles remain in the Troops tab. The heading derives from the registry's troop name. Only registered troops are displayed; no empty placeholders are created for other troops.

The importer keeps the checked-in snapshot if a feed fails and logs the failure. It does not access personal contacts or require credentials. Event cards link to the original troop event for descriptions and current details. Ensure GitHub Pages Source is GitHub Actions so scheduled refreshed snapshots are the published site.

Homepage artwork: AI-generated panoramic forest, mountains, trail and lake in the existing crimson and antique gold palette, without troop-specific people, logos or embedded text. The existing headline and buttons remain HTML.
