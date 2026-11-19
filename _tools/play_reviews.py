"""Fetch Google Play reviews for every app in assets/apps.js into assets/reviews.json.

Runs daily from .github/workflows/play-reviews.yml. Needs the secret PLAY_SERVICE_ACCOUNT_JSON:
a Google Cloud service account (Google Play Android Developer API enabled) that is invited in
Play Console with access to the apps. Google's API only returns reviews from about the last week,
so this script keeps everything it has seen before and adds or updates new ones.
Only real reviews are stored, exactly as written. The website hides none of them unless the admin
panel marks one as spam.
"""
import json, os, re, sys, time, urllib.parse
from datetime import datetime, timezone

import requests
from google.oauth2 import service_account
from google.auth.transport.requests import Request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
APPS_JS = os.path.join(ROOT, 'assets', 'apps.js')
OUT = os.path.join(ROOT, 'assets', 'reviews.json')
API = 'https://androidpublisher.googleapis.com/androidpublisher/v3/applications/{pkg}/reviews'


def load_apps():
    s = open(APPS_JS, encoding='utf-8').read()
    data = json.loads(s[s.index('{'):s.rindex('}') + 1])
    out = {}
    for a in data.get('apps', []):
        m = re.search(r'[?&]id=([\w.]+)', a.get('playUrl') or '')
        if m:
            out[a['slug']] = m.group(1)
    return out


def iso(sec):
    try:
        return datetime.fromtimestamp(int(sec), tz=timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')
    except Exception:
        return ''


def fetch(session, pkg):
    items, token = [], None
    while True:
        params = {'maxResults': 100}
        if token:
            params['token'] = token
        r = session.get(API.format(pkg=pkg), params=params, timeout=30)
        if r.status_code == 404:
            print(f'  {pkg}: not found or no access (is the service account invited in Play Console?)')
            return items
        r.raise_for_status()
        d = r.json()
        items += d.get('reviews', [])
        token = (d.get('tokenPagination') or {}).get('nextPageToken')
        if not token:
            return items
        time.sleep(0.3)


def convert(rv):
    user = dev = None
    for c in rv.get('comments', []):
        if 'userComment' in c and user is None:
            user = c['userComment']
        if 'developerComment' in c and dev is None:
            dev = c['developerComment']
    if not user:
        return None
    out = {
        'id': rv.get('reviewId'),
        'author': (rv.get('authorName') or '').strip(),
        'stars': int(user.get('starRating') or 0),
        'text': (user.get('text') or '').strip(),
        'date': iso((user.get('lastModified') or {}).get('seconds')),
        'lang': user.get('reviewerLanguage') or '',
        'version': user.get('appVersionName') or '',
        'reply': None,
    }
    if dev and dev.get('text'):
        out['reply'] = {'text': dev['text'].strip(), 'date': iso((dev.get('lastModified') or {}).get('seconds'))}
    return out if out['id'] and out['stars'] else None


def main():
    key = os.environ.get('PLAY_SERVICE_ACCOUNT_JSON')
    if not key:
        print('PLAY_SERVICE_ACCOUNT_JSON is not set; nothing to do.')
        return 0
    creds = service_account.Credentials.from_service_account_info(json.loads(key), scopes=['https://www.googleapis.com/auth/androidpublisher'])
    creds.refresh(Request())
    session = requests.Session()
    session.headers['Authorization'] = 'Bearer ' + creds.token

    try:
        store = json.load(open(OUT, encoding='utf-8'))
    except Exception:
        store = {}
    store.setdefault('apps', {})
    changed = False
    for slug, pkg in load_apps().items():
        print(f'{slug} ({pkg})')
        have = {r['id']: r for r in store['apps'].get(slug, {}).get('reviews', [])}
        for raw in fetch(session, pkg):
            r = convert(raw)
            if r and have.get(r['id']) != r:
                have[r['id']] = r
                changed = True
        lst = sorted(have.values(), key=lambda r: r.get('date', ''), reverse=True)
        store['apps'][slug] = {'package': pkg, 'reviews': lst}
        print(f'  {len(lst)} reviews kept')
    if changed or not store.get('updated'):
        store['updated'] = datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')
        with open(OUT, 'w', encoding='utf-8') as f:
            json.dump(store, f, ensure_ascii=False, indent=1)
            f.write('\n')
        print('reviews.json updated')
    else:
        print('no new reviews')
    return 0


if __name__ == '__main__':
    sys.exit(main())
