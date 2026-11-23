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
      "title": "Renewly closed testing starts soon",
      "text": "Scan a document and the expiry date is read for you, reminders before anything runs out, loans and EMIs, and safe watermarked copies. Want to try it first? Ask to join the tester list.",
      "cat": "beta"
    },
    {
      "date": "Nov 2026",
      "app": "renewly",
      "title": "Renewal guides for 15 countries",
      "text": "Renewly now shows the fee, the papers you need and the steps to renew passports, licences and more, taken from official government sites and checked every week."
    },
    {
      "date": "Nov 2026",
      "app": "wealthon",
      "text": "Safe-to-spend, a due-date radar and an EMI payoff plan, all on your phone. Free to use; Pro is one payment.",
      "title": "WealthOn is live on Google Play",
      "cat": "release"
    },
    {
      "date": "Nov 2026",
      "app": "renewly",
      "text": "Family documents with renewal reminders: scan a document and the expiry date is read for you.",
      "title": "Work started on Renewly"
    },
    {
      "date": "Nov 2026",
      "app": "",
      "text": "A fresh design, every app in one place, and early access for testers.",
      "title": "The new forgeapps.in is live",
      "cat": "studio"
    },
    {
      "date": "Oct 2026",
      "app": "wealthon",
      "text": "The first testers could try it on Google Play before launch.",
      "title": "WealthOn enters closed testing",
      "cat": "beta"
    },
    {
      "date": "Oct 2026",
      "app": "noctyl",
      "text": "Icons and widgets first, a full launcher later.",
      "title": "Work started on Noctyl"
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
      "stageNote": "Closed testing starts soon",
      "icon": "renewly/icon.png",
      "playUrl": "",
      "screens": [
        {
          "src": "renewly/screens/1.jpg",
          "caption": "All your family's documents, in one safe place"
        },
        {
          "src": "renewly/screens/2.jpg",
          "caption": "Scan once and Renewly reads the type, owner and expiry"
        },
        {
          "src": "renewly/screens/3.jpg",
          "caption": "Reminders before anything runs out, at your time"
        },
        {
          "src": "renewly/screens/4.jpg",
          "caption": "Everyone in one family vault: people, vehicles and homes"
        },
        {
          "src": "renewly/screens/5.jpg",
          "caption": "Know the fee, papers and steps to renew"
        },
        {
          "src": "renewly/screens/6.jpg",
          "caption": "Loans and EMIs: scan the loan letter, get reminded"
        },
        {
          "src": "renewly/screens/7.jpg",
          "caption": "Share a watermarked copy, not your original"
        },
        {
          "src": "renewly/screens/8.jpg",
          "caption": "Private by design: encrypted on your phone, no account"
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
          "Free now · Plus later, one payment"
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
      },
      "videos": [
        {
          "youtube": "https://www.youtube.com/watch?v=QrIIkSRAAU0",
          "title": "Renewly: Never Miss a Passport, ID or Insurance Renewal | Family Document Vault for Android"
        }
      ],
      "featured": true,
      "pricing": {
        "show": true,
        "title": "Free now. Plus, once.",
        "lead": "Every feature is free while Renewly grows. When Plus arrives it will be one payment, no subscription, and everyone who installed before keeps everything free.",
        "free": {
          "name": "Always free",
          "amount": "Free",
          "items": [
            "Scan a document and the expiry date is read on your phone",
            "You and up to 3 family members",
            "15 documents",
            "Reminders from 90 days to 1 day before, at your time",
            "How to renew: fee, papers and steps",
            "App lock, encryption on your phone and a backup file",
            "1 loan with EMI reminders",
            "5 safe shares a month",
            "Emergency card for yourself"
          ]
        },
        "pro": {
          "name": "Renewly Plus",
          "badge": "Coming later",
          "soon": true,
          "soonText": "One payment",
          "note": "pay once, keep it",
          "groups": [
            {
              "title": "Your whole family",
              "items": [
                {
                  "text": "Everyone in your family",
                  "note": "free: you + 3"
                },
                {
                  "text": "Unlimited documents",
                  "note": "free: 15"
                },
                {
                  "text": "Emergency cards for everyone",
                  "note": "free: yours"
                }
              ]
            },
            {
              "title": "Stay on top",
              "items": [
                {
                  "text": "Unlimited loans and EMIs",
                  "note": "free: 1"
                },
                {
                  "text": "Home-screen widget",
                  "note": ""
                },
                {
                  "text": "Every version of a document",
                  "note": "free: the latest"
                }
              ]
            },
            {
              "title": "Share and import",
              "items": [
                {
                  "text": "Unlimited safe shares",
                  "note": "free: 5 a month"
                },
                {
                  "text": "Import any number of files at once",
                  "note": "free: 3"
                },
                {
                  "text": "Sync between family phones",
                  "note": "coming soon"
                }
              ]
            }
          ]
        }
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
      "stage": "live",
      "stageNote": "On Google Play",
      "icon": "wealthon/icon.png",
      "playUrl": "https://play.google.com/store/apps/details?id=com.suriya.wealthon",
      "screens": [
        {
          "src": "wealthon/screens/mwib0cxf0.jpg",
          "caption": ""
        },
        {
          "src": "wealthon/screens/mwib0cyk1.jpg",
          "caption": ""
        },
        {
          "src": "wealthon/screens/mwib0czo2.jpg",
          "caption": ""
        },
        {
          "src": "wealthon/screens/mwib0d0r3.jpg",
          "caption": ""
        },
        {
          "src": "wealthon/screens/mwib0d1u4.jpg",
          "caption": ""
        },
        {
          "src": "wealthon/screens/mwib0d2t5.jpg",
          "caption": ""
        },
        {
          "src": "wealthon/screens/mwib0d3y6.jpg",
          "caption": ""
        },
        {
          "src": "wealthon/screens/mwib0d507.jpg",
          "caption": ""
        }
      ],
      "videos": [
        {
          "youtube": "https://youtu.be/Ihw48xZoQNo?si=9E2pCuHnT_FN_QoB",
          "title": "WealthOn: know what’s safe to spend | free budget & debt app"
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
      },
      "pricing": {
        "show": true,
        "title": "Free, always. Pro, once.",
        "lead": "Everything you need is free. Pro is one payment, no subscription.",
        "free": {
          "name": "Free, always",
          "amount": "₹0",
          "items": [
            "Safe to spend, every day",
            "What’s due, with the low balance warning",
            "This month’s plan and answers to your money questions",
            "Speak or type to add a spend, or use the widget",
            "Can I afford it? (four ways to pay) and Thinking about",
            "Debt-free date, days of freedom and the payoff planner",
            "Next month preview, the money check-up and yearly bills",
            "Budgets, loans and EMIs, 2 credit cards",
            "1 statement import a month (the first one sorted by AI)",
            "Your days, evening check-in, round-ups and Your week",
            "Money score, 1 spending alert, 5 widgets",
            "Any currency, reminders, weekly automatic backup, app lock, CSV export"
          ]
        },
        "pro": {
          "name": "WealthOn Pro",
          "badge": "One payment",
          "note": "pay once, keep it",
          "groups": [
            {
              "title": "Save money",
              "items": [
                {
                  "text": "Spending alerts for every shop and category",
                  "note": "free: 1 alert"
                },
                {
                  "text": "Subscriptions finder with price-rise alerts",
                  "note": ""
                },
                {
                  "text": "Every credit card",
                  "note": "free: 2"
                }
              ]
            },
            {
              "title": "Save time with AI",
              "items": [
                {
                  "text": "Unlimited statement imports",
                  "note": "free: 1 a month"
                },
                {
                  "text": "AI sorting on every import",
                  "note": "free: first import"
                },
                {
                  "text": "Read any statement with AI",
                  "note": "free: once"
                },
                {
                  "text": "Coach’s words",
                  "note": ""
                }
              ]
            },
            {
              "title": "See the big picture",
              "items": [
                {
                  "text": "Analytics for 3 months, 6 months and a year",
                  "note": ""
                },
                {
                  "text": "Money score history and details",
                  "note": ""
                },
                {
                  "text": "Monthly PDF report",
                  "note": ""
                }
              ]
            },
            {
              "title": "Make it yours",
              "items": [
                {
                  "text": "All 16 widgets",
                  "note": "free: 5"
                },
                {
                  "text": "Daily backup",
                  "note": "free: weekly"
                },
                {
                  "text": "Unlimited goals, lend & borrow and repeats",
                  "note": "free: 3 goals, 2 people, 10 repeats"
                },
                {
                  "text": "Receipt photos",
                  "note": ""
                },
                {
                  "text": "Extra colours",
                  "note": ""
                }
              ]
            }
          ]
        }
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
  ],
  "faq": [
    {
      "q": "Who is behind Forge Apps?",
      "a": "An independent studio in India that designs, builds and supports every app itself, from the first sketch to the replies in your inbox."
    },
    {
      "q": "Are your apps free?",
      "a": "Every app is free to start. Where there is an upgrade, it is clearly priced and one-time wherever possible. WealthOn Pro, for example, is a one-time ₹199."
    },
    {
      "q": "Do your apps collect my data?",
      "a": "We keep data on your phone wherever possible and never sell it. Each app has its own privacy policy on its page."
    },
    {
      "q": "How do I become a tester?",
      "a": "Enter your Google Play email in the [early access](#early) section. We add you to the test and email you the link, usually within a day."
    },
    {
      "q": "How do I delete my data?",
      "a": "Each app’s page has a “Delete your data” link that explains how to do it in the app or by email."
    },
    {
      "q": "Can I suggest an app idea?",
      "a": "Yes, please. [Send it here](contact/?topic=idea). Every idea is read, and the best ones end up in the forge."
    }
  ],
  "home": {
    "hero": {
      "label": "Independent app studio · Made in India",
      "title": "Useful apps,\nhammered into *shape.*",
      "text": "We build thoughtful Android applications that solve everyday problems. Simple experiences, transparent pricing and privacy built into the foundation.",
      "textPhone": "Thoughtful Android apps for everyday problems. Simple, fairly priced and private by design.",
      "btn1": {
        "text": "Explore our apps",
        "href": "#work"
      },
      "btn2": {
        "text": "Meet Forge Apps",
        "href": "about/"
      },
      "screens": [
        {
          "src": "assets/hero/wealthon-start.jpg",
          "label": "WealthOn",
          "app": "wealthon",
          "specs": "Status: Live on Google Play\nPrice: Free · Pro is one payment\nSign-up: None\nYour data: Stays on your phone"
        },
        {
          "src": "assets/hero/renewly-start.jpg",
          "label": "Renewly",
          "app": "renewly",
          "specs": "Status: Being built\nPrice: Free, no in-app purchases\nSign-up: None\nYour data: Stays on your phone"
        }
      ],
      "stamp": "Built in the forge",
      "log": [
        {
          "app": "wealthon",
          "steps": "safe to spend\ndue-date radar\nEMI payoff plan\nno sign-up\ndata stays on phone",
          "result": "live on Google Play",
          "next": "",
          "progress": 100,
          "specs": "Status: Live on Google Play\nPrice: Free · Pro is one payment\nSign-up: None\nYour data: Stays on your phone"
        },
        {
          "app": "renewly",
          "steps": "family vault\nexpiry reminders",
          "result": "",
          "next": "renewal steps",
          "progress": 64,
          "specs": "Status: Being built\nPrice: Free, no in-app purchases\nSign-up: None\nYour data: Stays on your phone"
        }
      ]
    },
    "sections": [
      {
        "id": "featured",
        "desktop": true,
        "phone": true
      },
      {
        "id": "work",
        "desktop": true,
        "phone": true
      },
      {
        "id": "reviews",
        "desktop": true,
        "phone": true
      },
      {
        "id": "why",
        "desktop": true,
        "phone": true
      },
      {
        "id": "how",
        "desktop": true,
        "phone": true
      },
      {
        "id": "stats",
        "desktop": true,
        "phone": true
      },
      {
        "id": "founder",
        "desktop": true,
        "phone": true
      },
      {
        "id": "early",
        "desktop": true,
        "phone": true
      },
      {
        "id": "news",
        "desktop": true,
        "phone": true
      },
      {
        "id": "faq",
        "desktop": true,
        "phone": true
      },
      {
        "id": "contact",
        "desktop": true,
        "phone": true
      }
    ],
    "pitch": {
      "app": "wealthon",
      "title": "New: WealthOn. Know what’s safe to spend today.",
      "text": "One number, after your loans, bills and savings are set aside. Free on Google Play."
    },
    "follow": {
      "kicker": "Follow the forge",
      "title": "Watch the next app take shape.",
      "text": "Sketches, build videos and launches, as they happen.",
      "instagram": "Screens & sketches",
      "youtube": "Demos & builds",
      "facebook": "News & launches"
    }
  },
  "phone": {
    "topRight": "getapp",
    "getApp": "auto",
    "under": "apps",
    "tabs": [
      {
        "id": "home",
        "on": true
      },
      {
        "id": "apps",
        "on": true
      },
      {
        "id": "updates",
        "on": true
      },
      {
        "id": "about",
        "on": true
      },
      {
        "id": "contact",
        "on": true
      },
      {
        "id": "approach",
        "on": false
      }
    ]
  },
  "theme": "soft",
  "playName": "Forge Apps Labs",
  "playDevUrl": "https://play.google.com/store/apps/developer?id=Forge+Apps+Labs",
  "stats": {
    "tiles": [
      "rating",
      "reviews",
      "updates",
      "apps"
    ],
    "custom": []
  },
  "reviews": {
    "home": true,
    "apps": {},
    "hide": [],
    "pin": [],
    "rating": {}
  }
};
