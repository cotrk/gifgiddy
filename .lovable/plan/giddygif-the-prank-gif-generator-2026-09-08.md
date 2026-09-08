# GiddyGif — the prank GIF generator

A fake "AI GIF generator" landing page at `/`. Whatever the user types, it only ever generates GIFs of the trending "Giddy" dance. That's the entire joke and the entire feature.

## Experience flow

1. **Hero** — mock-serious AI-generator UI: big headline ("Type anything. Get the perfect GIF."), a text prompt box, and a Generate button. Clean, convincing look.
2. **The "generation"** — on submit, a fake loading sequence plays: status lines like "Understanding your prompt...", "Rendering frames...", "Upscaling...". A progress bar crawls.
3. **The result** — a random GIF of the Giddy dance (pulled from KLIPY GIF search for "giddy dance") appears, no matter what was typed.
4. **Escalating chaos on repeats** — the longer someone keeps trying, the more the app falls apart, like early AI generations:
   - Try 1–2: plays it straight, normal result.
   - Try 3+: the status lines turn unhinged ("Adding more Giddy...", "It cannot be stopped..."), the result area spawns extra overlapping Giddy GIFs at random positions/rotations, caption text becomes increasingly confident and wrong ("A serene sunset over the mountains — as requested").
   - Final stage: the screen floods with Giddy GIFs, maybe a "It's all Giddy now." takeover moment with a reset button.
5. **Gallery of shame** — a section below logging every past generation in-session: the user's prompt vs. the Giddy GIF it got, framed like a museum of AI misfires.

## Design direction

Confident, over-polished "AI startup" aesthetic on the surface (dark theme, bold display type, gradient accents) that visibly degrades as the prank escalates — the contrast is the joke.

## Technical notes

- **GIF source**: KLIPY connector (GIF search for "giddy dance"), proxied through a server function so the key stays server-side. Fallback: if the connector isn't connected, bundle a few agent-generated Giddy-dance-style GIFs as local assets so the prank still works.
- Frontend: TanStack Start route at `/` only, state all client-side (prompt, try count, escalation stage, history list).
- The generator never actually generates anything — it just picks a random Giddy GIF. The user's prompt is stored only to roast it later in the gallery.
- Unique head metadata for the route (title/description) that plays the joke straight.
