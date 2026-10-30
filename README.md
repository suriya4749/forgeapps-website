# Forge Apps website (forgeapps.in)

A plain HTML/CSS site, no build step. It runs free on GitHub Pages.

```
website/
├── index.html            → forgeapps.in (latest 3 apps)
├── apps/                 → forgeapps.in/apps/ (every app, with filters)
├── wealthon/             → forgeapps.in/wealthon/
│   ├── index.html          app page
│   ├── privacy/            forgeapps.in/wealthon/privacy/   ← put this in Play Console
│   ├── terms/              forgeapps.in/wealthon/terms/
│   ├── delete-account/     forgeapps.in/wealthon/delete-account/
│   └── icon.svg            placeholder: replace with the real icon
├── noctyl/               → forgeapps.in/noctyl/   (coming-soon page)
├── assets/             (ui.css = layout, motion.js = logo intro + fade-ins; vendor/ is no longer used)
│   ├── apps.js             ← THE file to edit: app list, Play links, email, socials
│   ├── site.js, style.css
│   └── logo.svg, favicon, og-image.png
├── _template/            blank app (not published; used by the script)
├── _tools/new_app.py     adds a new app in one command
├── 404.html, CNAME, robots.txt, sitemap.xml
```

## Before going live: fill in the yellow boxes

Anything shown in a **dashed yellow box** on a page is a placeholder. Search the files for `class="todo"` to find them all. The important ones are in `wealthon/privacy/index.html`:
- Where WealthOn's data is kept (phone only, server or Firebase)
- Whether there is sign-in
- Any crash or analytics tools
- The AI providers used for statement import, and what is sent to them

Then delete the `<span class="todo">…</span>` wrapper around each answer.

## Publish on GitHub Pages (one time)

1. Create a new **public** repository on GitHub, e.g. `suriya4749/forgeapps-website`.
2. Upload everything inside this `website` folder to the root of the repo, either with the GitHub web upload or:
   ```bash
   cd ~/Desktop/"Forge Apps"/website
   git init && git add . && git commit -m "Forge Apps website"
   git branch -M main
   git remote add origin https://github.com/suriya4749/forgeapps-website.git
   git push -u origin main
   ```
3. In the repo: **Settings → Pages → Build and deployment → Deploy from a branch → `main` / root → Save**.
4. In the same page, set **Custom domain** to `forgeapps.in` (the `CNAME` file already says this).

## Point forgeapps.in at GitHub (GoDaddy → DNS)

Add these records (and delete any old A record for `@` that GoDaddy added, such as "Parked"):

| Type  | Name | Value                  |
|-------|------|------------------------|
| A     | @    | 185.199.108.153        |
| A     | @    | 185.199.109.153        |
| A     | @    | 185.199.110.153        |
| A     | @    | 185.199.111.153        |
| CNAME | www  | suriya4749.github.io   |

DNS can take from a few minutes to a few hours. Once GitHub shows the domain as verified, tick **Enforce HTTPS** in Settings → Pages.

## Redirect the old domain (wealthonapp.com)

GoDaddy → wealthonapp.com → **Forwarding** → forward to `https://forgeapps.in/wealthon/` as a **permanent (301)** redirect. Old links in the Play listing and testers' builds keep working.

## Update Google Play for WealthOn

- App content → Privacy policy → `https://forgeapps.in/wealthon/privacy/`
- Data deletion URL (Data safety section) → `https://forgeapps.in/wealthon/delete-account/`
- Store settings → Website `https://forgeapps.in/wealthon/` and contact email
- Developer account → Developer name → `Forge Apps`

## Admin panel (forgeapps.in/admin/)

Edit apps, Google Play links, YouTube videos, screenshots, icons, colours, About text and updates without touching code.
1. Create a fine-grained GitHub token: Settings → Developer settings → Fine-grained tokens → only the forgeapps-website repo → Repository permissions → Contents: Read and write.
2. Open forgeapps.in/admin/, paste the token, Connect.
3. Make changes, then **Publish to GitHub**. The live site updates about a minute later.
Images can be uploaded (saved into the repo, resized) or added as a link. New apps get their own pages created automatically.
The admin page is hidden from search engines and does nothing without your token.

## Screens, videos and About for an app

In `assets/apps.js`, an app can have `screens` (phone screenshots, about 540×960, each with a short caption), `videos` (9:16 MP4 with a poster image), `about` (a few paragraphs) and `facts` (label/value pairs). Anything you add shows up automatically in the home page spotlight and in the app page's Screenshots / Videos / About sections; leave them out and those sections stay hidden. Put the files in the app's folder, e.g. `wealthon/screens/` and `wealthon/videos/`.

The home page shows the first 4 apps; clicking one shows it in the spotlight below.

## Day-to-day changes

**When an app goes live on Google Play:** open `assets/apps.js`, set its `status` to `"live"` and paste the Play link into `playUrl`. The app page button turns into "Get it on Google Play" automatically.

**Add your socials:** fill in `youtube` and `instagram` in `assets/apps.js`. The buttons appear automatically.

**Add a new app** (gets its own page plus privacy, terms and delete-account pages, and a card on the All apps page). The script puts the new app first in `assets/apps.js`, so it shows in "Latest apps" on the home page (which shows the first 3):
```bash
cd ~/Desktop/"Forge Apps"/website
python3 _tools/new_app.py my-app "My App" "One line about what it does."
```
Then replace `my-app/icon.svg`, fill in the [bracketed] text, and push:
```bash
git add . && git commit -m "Add My App" && git push
```
It goes live at `https://forgeapps.in/my-app/` within a minute or two.

**Preview locally:** double-click `index.html`, or run `python3 -m http.server` in this folder and open http://localhost:8000.
