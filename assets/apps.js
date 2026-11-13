/*
  Forge Apps — site settings and the list of apps.
  Edit this with the admin panel (/admin/) or by hand.
  The first 4 apps show on the home page. stage: idea | build | test | live.
*/
window.FORGE = {
  "email": "support@forgeapps.in",
  "youtube": "https://www.youtube.com/@ForgeApps-sk",
  "instagram": "https://www.instagram.com/forgeapps.in/",
  "facebook": "https://www.facebook.com/profile.php?id=61595949729625",
  "formKey": "00da2d2a-9e79-4964-aa47-da2aa6d50dac",
  "analytics": {
    "umami": "a6ca8a38-2ac8-48b6-9664-91036187779d",
    "cloudflare": ""
  },
  "updates": [
    {
      "date": "Nov 2026",
      "app": "renewly",
      "text": "Work started on Renewly: family documents with renewal reminders."
    },
    {
      "date": "Nov 2026",
      "app": "",
      "text": "The new forgeapps.in is live: a fresh design, every app in one place, and early access for testers."
    },
    {
      "date": "Oct 2026",
      "app": "wealthon",
      "text": "WealthOn is in closed testing on Google Play."
    },
    {
      "date": "Oct 2026",
      "app": "noctyl",
      "text": "Work started on Noctyl: icons and widgets first, a full launcher later."
    }
  ],
  "apps": [
    {
      "slug": "renewly",
      "name": "Renewly",
      "kind": "Family documents",
      "tagline": "Your family's documents, always valid.",
      "points": [
        "Scan and find the expiry",
        "Reminders before it's late",
        "The whole family, privately"
      ],
      "platform": "Android",
      "stage": "build",
      "stageNote": "Being built right now",
      "icon": "renewly/icon.png",
      "playUrl": "",
      "screens": [
        {
          "src": "renewly/screens/1.jpg",
          "caption": "Your family’s documents at a glance"
        },
        {
          "src": "renewly/screens/2.jpg",
          "caption": "See what ends soon, sorted for you"
        },
        {
          "src": "renewly/screens/3.jpg",
          "caption": "Everyone in the family, in one place"
        },
        {
          "src": "renewly/screens/4.jpg",
          "caption": "Each person’s documents and due dates"
        }
      ],
      "about": [
        "Renewly keeps your family's passports, IDs, licences, insurance policies and vehicle papers in one private place on your phone, and makes sure none of them quietly runs out.",
        "Scan a document or import a stack of PDFs: Renewly reads the expiry date, sorts each one by type and person, and reminds you 30 days, 10 days, or on the day, whichever you choose.",
        "Everything is encrypted on your phone with app lock, with no sign-in, no ads and no tracking. It is free, with unlimited family members and documents, and sync between phones through your own Google Drive is coming soon."
      ],
      "facts": [
        [
          "Price",
          "Free"
        ],
        [
          "Platform",
          "Android"
        ],
        [
          "Reads",
          "Photos and PDFs, many at once"
        ],
        [
          "Backup",
          "Free encrypted backup file"
        ],
        [
          "Your data",
          "Encrypted on your phone. No sign-in, no ads."
        ]
      ],
      "colors": {
        "bg": "#0F766E",
        "bg2": "#0B3B37",
        "accent": "#2DD4BF",
        "accent2": "#F79009",
        "soft": "#CCFBF1",
        "text": "#FFFFFF",
        "btnBg": "#FFFFFF",
        "btnText": "#0F766E"
      }
    },
    {
      "slug": "wealthon",
      "name": "WealthOn",
      "kind": "Personal finance",
      "tagline": "Know what's safe to spend. Get out of EMIs sooner.",
      "points": [
        "Safe to spend",
        "Due radar",
        "EMI payoff plan"
      ],
      "platform": "Android",
      "stage": "test",
      "stageNote": "In closed testing on Google Play",
      "icon": "wealthon/icon.png",
      "playUrl": "https://play.google.com/store/apps/details?id=com.suriya.wealthon",
      "testUrl": "https://play.google.com/apps/testing/com.suriya.wealthon",
      "screens": [
        {
          "src": "wealthon/screens/1.jpg",
          "caption": "Know what's safe to spend today"
        },
        {
          "src": "wealthon/screens/2.jpg",
          "caption": "See every bill before it's due"
        },
        {
          "src": "wealthon/screens/3.jpg",
          "caption": "Count down to debt-free"
        },
        {
          "src": "wealthon/screens/4.jpg",
          "caption": "Can I afford it? Know before you buy"
        },
        {
          "src": "wealthon/screens/5.jpg",
          "caption": "Your month, planned for you"
        },
        {
          "src": "wealthon/screens/6.jpg",
          "caption": "Import any bank statement"
        },
        {
          "src": "wealthon/screens/7.jpg",
          "caption": "Add a spend in two taps"
        },
        {
          "src": "wealthon/screens/8.jpg",
          "caption": "Your money stays on your phone"
        }
      ],
      "videos": [
        {
          "youtube": "https://youtu.be/Yf8L2sMaDIM?si=QPqDIdfyjIwHzzAq",
          "title": "WealthOn: every feature in 2 minutes"
        }
      ],
      "about": [
        "WealthOn is a personal finance app for people juggling a salary, bills and EMIs. Instead of charts you have to study, it gives you one clear number: what's safe to spend today, after your loans, bills and savings are set aside.",
        "It keeps every due date on one calendar and warns you before money runs short. It shows the day your last loan ends and how paying a little extra brings it closer, and it tells you whether you can afford something before you buy it.",
        "Getting started takes moments: import a bank statement from any bank, or add a spend in two taps, even from the home-screen widget."
      ],
      "facts": [
        [
          "Price",
          "Free · Pro ₹199 one-time"
        ],
        [
          "Platform",
          "Android"
        ],
        [
          "Statement import",
          "PDF, Excel or CSV, any bank"
        ],
        [
          "Currency",
          "Any currency"
        ],
        [
          "Your data",
          "Stays on your phone. No login, no bank link, no ads."
        ]
      ],
      "colors": {
        "bg": "#1E3A8A",
        "bg2": "#14285F",
        "accent": "#EB6834",
        "accent2": "#12B76A",
        "soft": "#C7D2FE",
        "text": "#FFFFFF",
        "btnBg": "#FFFFFF",
        "btnText": "#1E3A8A"
      }
    },
    {
      "slug": "noctyl",
      "name": "Noctyl",
      "hidden": true,
      "kind": "Icons & widgets",
      "tagline": "Dark, minimal icons and useful home-screen widgets.",
      "points": [
        "Dark icon set",
        "Home-screen widgets",
        "Your accent colour"
      ],
      "platform": "Android",
      "stage": "build",
      "stageNote": "Being built right now",
      "icon": "noctyl/icon.png",
      "playUrl": "",
      "about": [
        "Noctyl brings a calm, dark look to your home screen: a set of minimal icons plus useful widgets, applied straight from the app without needing an extra launcher.",
        "Pick your accent colour, icon size and shape, then add widgets like clocks and media controls. A full Noctyl launcher is planned for later."
      ],
      "colors": {
        "bg": "#0B0B0C",
        "bg2": "#18181B",
        "accent": "#F5A524",
        "accent2": "#EDEDED",
        "soft": "#2A2A2F",
        "text": "#EDEDED",
        "btnBg": "#F5A524",
        "btnText": "#0B0B0C"
      }
    }
  ]
};
