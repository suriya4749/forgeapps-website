#!/usr/bin/env python3
"""
Add a new app to the Forge Apps website.

Usage (run from the website folder):
    python3 _tools/new_app.py noctyl "Noctyl" "Dark, minimal icons and useful widgets."

What it does:
  1. Copies _template/ to a new folder named after the slug (e.g. noctyl/),
     filling in the app name, slug and tagline.
  2. Adds the app to assets/apps.js so it shows up on the home page.
  3. Adds the new pages to sitemap.xml.

The new app's pages will be:
  https://forgeapps.in/<slug>/
  https://forgeapps.in/<slug>/privacy/
  https://forgeapps.in/<slug>/terms/
  https://forgeapps.in/<slug>/delete-account/
"""
import os
import re
import shutil
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def main():
    if len(sys.argv) < 4:
        print(__doc__)
        sys.exit(1)
    slug, name, tagline = sys.argv[1].strip().lower(), sys.argv[2].strip(), sys.argv[3].strip()
    if not re.fullmatch(r"[a-z0-9][a-z0-9-]*", slug):
        sys.exit("The slug must be lowercase letters, numbers and dashes, e.g. my-app")

    dest = os.path.join(ROOT, slug)
    if os.path.exists(dest):
        sys.exit(f"A folder called '{slug}' already exists. Pick another slug or delete that folder first.")

    # 1. copy the template and fill in the placeholders
    shutil.copytree(os.path.join(ROOT, "_template"), dest)
    for folder, _, files in os.walk(dest):
        for f in files:
            if f.endswith((".html", ".svg")):
                p = os.path.join(folder, f)
                with open(p, encoding="utf-8") as fh:
                    s = fh.read()
                s = s.replace("{{NAME}}", name).replace("{{SLUG}}", slug).replace("{{TAGLINE}}", tagline)
                with open(p, "w", encoding="utf-8") as fh:
                    fh.write(s)

    # 2. add it to assets/apps.js (before the closing bracket of the apps list)
    apps_js = os.path.join(ROOT, "assets", "apps.js")
    with open(apps_js, encoding="utf-8") as fh:
        js = fh.read()
    entry = (
        "    {\n"
        f'      slug: "{slug}",\n'
        f'      name: "{name}",\n'
        '      kind: "[What kind of app]",\n'
        f'      tagline: "{tagline}",\n'
        '      points: ["[Feature 1]", "[Feature 2]", "[Feature 3]"],\n'
        '      platform: "Android",\n'
        '      stage: "build",\n'
        '      stageNote: "Being built right now",\n'
        f'      icon: "{slug}/icon.svg",\n'
        '      playUrl: "",\n'
        '      // replace with the app\'s own logo colours\n'
        '      colors: { bg: "#1C1F26", bg2: "#111318", accent: "#FF6A2B", accent2: "#FFB547", soft: "#2A2E37", text: "#F5F3EF", btnBg: "#FF6A2B", btnText: "#111318" }\n'
        "    }"
    )
    # newest app goes first, so it shows on the home page's "Latest apps"
    i = js.index("apps: [") + len("apps: [")
    js = js[:i] + "\n" + entry + "," + js[i:]
    with open(apps_js, "w", encoding="utf-8") as fh:
        fh.write(js)

    # 3. add to sitemap.xml
    sm = os.path.join(ROOT, "sitemap.xml")
    if os.path.exists(sm):
        with open(sm, encoding="utf-8") as fh:
            x = fh.read()
        urls = "".join(
            f"  <url><loc>https://forgeapps.in/{slug}/{p}</loc></url>\n"
            for p in ["", "privacy/", "terms/", "delete-account/"]
        )
        x = x.replace("</urlset>", urls + "</urlset>")
        with open(sm, "w", encoding="utf-8") as fh:
            fh.write(x)

    print(f"Done. New pages are in {slug}/")
    print(f"Next: replace {slug}/icon.svg with the real icon, set its colours and [bracketed] text in assets/apps.js,")
    print("then commit and push. The site updates in a minute or two.")


if __name__ == "__main__":
    main()
