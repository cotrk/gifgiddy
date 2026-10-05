# Persistent reactions, varied dances, and custom characters

## What will change

- Save each AI-polished reaction in the browser and restore it on the matching Feed or shared-link prank after reload.
- Search several closely related Griddy terms, remove duplicate results, and avoid recently shown dances.
- Add a Character control to the generator where someone can upload a portrait, switch between Original and Custom, and tune its size and position over the dancer.
- Store the selected portrait and placement in the browser so the custom character remains available after reload.

## Important limitation

The custom-character mode will place a real portrait over the dancer and let the user align it per GIF. It will not synthesize a new full-body video or transfer the dance to another body; that would require a video-generation service and a different media workflow.

## Technical details

- Reactions use stable prank-specific browser storage keys; no account or server database is introduced.
- Shared links keep their existing prompt/GIF/caption contract, with reactions restored on the browser where they were created.
- GIF search remains server-side through the existing protected service key; results are de-duplicated before reaching the page.
- Character images stay local as compressed browser data and are rendered as a movable overlay.

## Verification

- Generate several times and confirm results rotate.
- Save a reaction, reload Feed and a shared link, and confirm it remains.
- Upload, align, disable, and restore a character on desktop and mobile-sized screens.
