# Forge Apps website (forgeapps.in) — notes for Claude Code

Showcase site for the apps made by **Forge Apps** (Suriya's app studio brand; tagline "Hammered into shape"). Forge Apps itself is not an app. Each app gets its own pages, including the privacy, terms and data-deletion pages that Google Play links to. README.md has the full setup, DNS and admin-panel guide.

## Stack and deploy
- Plain HTML/CSS/JS, **no build step**. Hosted free on **GitHub Pages** from `suriya4749/forgeapps-website` (`main`, root). `CNAME` = forgeapps.in (DNS at GoDaddy).
- **Deploy = commit and push to `main`**; the live site updates in a minute or two.
- Preview: `python3 -m http.server` in this folder → http://localhost:8000.

## Key files
- `assets/apps.js` — **the source of truth**: site settings (email, socials, form key, analytics), the `updates` feed, and the `apps` list (stage idea | build | test | live, Play links, screens, videos, about, facts, colours, `hidden`). The home page shows the first 4 apps.
- `assets/site.js` fills every page from `apps.js`; `assets/frost.css` is the whole design.
- `admin/` — browser admin panel that edits `apps.js` and publishes through the GitHub API with the owner's token. **Keep `apps.js` as `window.FORGE = { …JSON… };`** (double-quoted, JSON-compatible) or the admin panel can't read or write it.
- `_template/` + `_tools/new_app.py` — add an app: `python3 _tools/new_app.py <slug> "<Name>" "<one line>"` creates `<slug>/` with privacy, terms and delete-account pages, adds it first in `apps.js` and to `sitemap.xml`.
- Apps now: `wealthon/` (in closed testing on Google Play), `noctyl/` (icon pack + widgets, hidden for now). `renewly/` (family documents + renewal reminders, Expo app in ~/Desktop/Renewly; stage "build"): app page, privacy, terms and delete-data pages are written for how Renewly really works (on-device storage, on-device ML Kit, optional encrypted sync to the user's own Google Drive, Plus ₹149 one-time). The Renewly app links to these pages and to `contact/?app=renewly&topic=feedback`.
- Note: `_tools/new_app.py` still looks for `apps: [` but apps.js is now JSON (`"apps": [`); it copies the template, then fails on the apps.js step. Add the apps.js entry and sitemap lines by hand (JSON, double quotes) until the tool is fixed.

## Rules
- Each app's privacy page must match what the app really does (data stays on the phone, no sign-in, which AI providers get what). When an app changes data handling, update its privacy page in the same change.
- Support email is support@forgeapps.in everywhere. Socials: instagram.com/forgeapps.in, YouTube @ForgeApps-sk, the Forge Apps Facebook page.
- Credit the developer as "Forge Apps" only, no personal name or location details.
- Keep `sitemap.xml` in step when pages are added or removed. `admin/` stays out of search (robots.txt).
- Placeholders are wrapped in `<span class="todo">` (dashed yellow box); search for `class="todo"` before going live.
- Commit with clear messages; check pages at phone width before pushing.
