# Forge Apps website (forgeapps.in) — notes for Claude Code

Showcase site for the apps made by **Forge Apps** (Suriya's app studio brand; tagline "Hammered into shape"). Forge Apps itself is not an app. Each app gets its own pages, including the privacy, terms and data-deletion pages that Google Play links to. README.md has the full setup, DNS and admin-panel guide.

## Stack and deploy
- Plain HTML/CSS/JS, **no build step**. Hosted free on **GitHub Pages** from `suriya4749/forgeapps-website` (`main`, root). `CNAME` = forgeapps.in (DNS at GoDaddy).
- **Deploy = commit and push to `main`**; the live site updates in a minute or two.
- Preview: `python3 -m http.server` in this folder → http://localhost:8000.

## Key files
- `assets/apps.js` — **the source of truth**: site settings (email, socials, form key, analytics), the `updates` feed, and the `apps` list (stage idea | build | test | live, Play links, screens, videos, about, facts, colours, `hidden`). The home page shows the first 4 apps.
- `assets/prices.js` — Google Play's WealthOn Pro price per country (copied from Play Console) + time zone → country; the WealthOn page shows the visitor's own price. Update it when Play prices change.
- `assets/site.js` fills every page from `apps.js`; `assets/frost.css` is the base design and `assets/workshop.css` (loaded after it on every page) is the Workshop look: grid paper, condensed headings, outlined cards, the blueprint hero and the phone tab bar.
- `apps.js` also holds `home` (top-section text, blueprint screens, section order and desktop/phone switches), `phone` (top-right Get app / status chip, tab bar tabs, socials under the buttons), `faq` (home questions; links as [text](url)) and each app's `pricing` (Free/Pro lists; the Pro amount comes from prices.js). `featured: true` = the home spotlight app.
- `assets/home.js` (home page only) builds the on-the-bench column in the top section, the app rows (desktop; phones keep the spotlight list), the rule book + timeline and the questions help desk from `apps.js`.
- `assets/v3.js` + `assets/v3.css` (loaded last on every page): Google Play reviews (home strip, app-page section, `reviews/` page), the featured-app strip and numbers on the home page, "by Forge Apps Labs" under Play buttons and in the footer (`playName` / `playDevUrl` in apps.js), and the small animations (stamp drop, count-up, sparks on orange buttons, timeline fill, typewriter labels; all off with reduce-motion).
- Reviews: `.github/workflows/play-reviews.yml` runs `_tools/play_reviews.py` daily with the secret `PLAY_SERVICE_ACCOUNT_JSON` and commits `assets/reviews.json` (real reviews only, kept forever because the API returns ~1 week). `apps.js` → `reviews` holds the admin choices (home strip on/off, per-app on/off, hidden spam ids, pinned ids, star rating copied from Play Console). Because the Action commits, run `git pull` before pushing from the Mac.
- Theme: `theme` in apps.js = `soft` (default, calmer tones) or `classic` (brighter original); set in admin → Look.
- Hero phone: Android blueprint frame; `home.hero.screens` = list of `{src,label}` (plain phone screenshots in `assets/hero/`), swiped automatically or by hand.
- `about/` is the About me page (blueprint portrait); the founder portrait is `assets/founder.jpg` (comic style; Suriya Kumar).
- The admin panel opens `/?preview=1` to show unpublished changes (read from localStorage); analytics is off in preview.
- `admin/` — browser admin panel that edits `apps.js` and `prices.js` and publishes through the GitHub API with the owner's token. The token is stored in the browser encrypted with a 6-digit passcode (PBKDF2 + AES-GCM); 10 wrong passcodes wipe it, and it locks after a set time without use. **Keep `apps.js` as `window.FORGE = { …JSON… };`** (double-quoted, JSON-compatible) or the admin panel can't read or write it.
- `_template/` + `_tools/new_app.py` — add an app: `python3 _tools/new_app.py <slug> "<Name>" "<one line>"` creates `<slug>/` with privacy, terms and delete-account pages, adds it first in `apps.js` and to `sitemap.xml`.
- Apps now: `wealthon/` (in closed testing on Google Play), `noctyl/` (icon pack + widgets, hidden for now). `renewly/` (family documents + renewal reminders, Expo app in ~/Desktop/Renewly; stage "build"): app page, privacy, terms and delete-data pages are written for how Renewly really works (on-device storage, on-device ML Kit, optional encrypted sync to the user's own Google Drive; free, no ads, no in-app purchases). The Renewly app links to these pages and to `contact/?app=renewly&topic=feedback`.
- Note: `_tools/new_app.py` still looks for `apps: [` but apps.js is now JSON (`"apps": [`); it copies the template, then fails on the apps.js step. Add the apps.js entry and sitemap lines by hand (JSON, double quotes) until the tool is fixed.

## Rules
- Each app's privacy page must match what the app really does (data stays on the phone, no sign-in, which AI providers get what). When an app changes data handling, update its privacy page in the same change.
- Support email is support@forgeapps.in everywhere. Socials: instagram.com/forgeapps.in, YouTube @ForgeApps-sk, the Forge Apps Facebook page.
- The studio is "Forge Apps" (Google Play developer name: "Forge Apps Labs"), founded and run by Suriya Kumar. His name appears on the About page and the home founder block; legal pages credit "Forge Apps". No location details beyond "Made in India".
- Keep `sitemap.xml` in step when pages are added or removed. `admin/` stays out of search (robots.txt).
- Placeholders are wrapped in `<span class="todo">` (dashed yellow box); search for `class="todo"` before going live.
- Commit with clear messages; check pages at phone width before pushing.
