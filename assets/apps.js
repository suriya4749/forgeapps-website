/*
  Forge Apps — site settings and the list of apps.
  ------------------------------------------------
  This is the ONE file to edit when you add an app or change a link.
  The home page builds each app's showcase panel from the list below.

  stage:     "idea" | "build" | "test" | "live"   → fills the Idea → Build → Test → Live tracker
  stageNote: one short line shown under the tracker
  playUrl:   the Google Play link (https://play.google.com/store/apps/details?id=your.package)
  testUrl:   while in testing, the opt-in link (https://play.google.com/apps/testing/your.package)
  screens / videos / about / facts: optional; when present they show in the home spotlight and on the app page
  colors:    the app's own brand colours, taken from its logo
             bg / bg2 = panel background, accent = main brand colour, accent2 = second colour,
             soft = light tint, text = text on the panel, btnBg / btnText = the main button
*/
window.FORGE = {
  email: "support@forgeapps.in",
  youtube: "",    // e.g. "https://www.youtube.com/@forgeapps"
  instagram: "",  // e.g. "https://www.instagram.com/forgeapps"

  // Contact form (forgeapps.in/contact/). Messages are emailed to the address this key was made for.
  // Get a free key at https://web3forms.com (enter support@forgeapps.in, the key arrives by email) and paste it here.
  // While it's empty, the form opens the visitor's email app with the message filled in instead.
  formKey: "00da2d2a-9e79-4964-aa47-da2aa6d50dac",

  // Website analytics. No cookies, no personal data.
  // umami:      the Website ID from https://cloud.umami.is (Settings → Websites → Add website → forgeapps.in)
  // cloudflare: optional extra, the token from Cloudflare → Web Analytics → Add a site (page views + speed)
  analytics: { umami: "", cloudflare: "" },

  // Short news shown on the home page under "Latest updates" (newest first)
  updates: [
    { date: "Oct 2026", app: "wealthon", text: "WealthOn is in closed testing on Google Play." },
    { date: "Oct 2026", app: "noctyl", text: "Work started on Noctyl: icons and widgets first, a full launcher later." }
  ],

  apps: [
    {
      slug: "wealthon",
      name: "WealthOn",
      kind: "Personal finance",
      tagline: "Know what's safe to spend. Get out of EMIs sooner.",
      points: ["Safe to spend", "Due radar", "EMI payoff plan"],
      platform: "Android",
      stage: "test",
      stageNote: "In closed testing on Google Play",
      icon: "wealthon/icon.png",
      playUrl: "https://play.google.com/store/apps/details?id=com.suriya.wealthon",
      testUrl: "https://play.google.com/apps/testing/com.suriya.wealthon",   // closed-testing opt-in link (remove once live)
      // Screenshots (about 540×960) with a short caption each — shown in the home spotlight and on the app page
      screens: [
        { src: "wealthon/screens/1.jpg", caption: "Know what's safe to spend today" },
        { src: "wealthon/screens/2.jpg", caption: "See every bill before it's due" },
        { src: "wealthon/screens/3.jpg", caption: "Count down to debt-free" },
        { src: "wealthon/screens/4.jpg", caption: "Can I afford it? Know before you buy" },
        { src: "wealthon/screens/5.jpg", caption: "Your month, planned for you" },
        { src: "wealthon/screens/6.jpg", caption: "Import any bank statement" },
        { src: "wealthon/screens/7.jpg", caption: "Add a spend in two taps" },
        { src: "wealthon/screens/8.jpg", caption: "Your money stays on your phone" }
      ],
      // Videos (9:16) shown on the app page
      videos: [
        { src: "wealthon/videos/ad.mp4", poster: "wealthon/videos/ad.jpg", title: "WealthOn in 60 seconds" },
        { src: "wealthon/videos/safe-to-spend.mp4", poster: "wealthon/videos/safe-to-spend.jpg", title: "Safe to spend" },
        { src: "wealthon/videos/debt-free.mp4", poster: "wealthon/videos/debt-free.jpg", title: "Count down to debt-free" },
        { src: "wealthon/videos/warns-you.mp4", poster: "wealthon/videos/warns-you.jpg", title: "Warns you before it happens" }
      ],
      // About the app — shown on the app page
      about: [
        "WealthOn is a personal finance app for people juggling a salary, bills and EMIs. Instead of charts you have to study, it gives you one clear number: what's safe to spend today, after your loans, bills and savings are set aside.",
        "It keeps every due date on one calendar and warns you before money runs short. It shows the day your last loan ends and how paying a little extra brings it closer, and it tells you whether you can afford something before you buy it.",
        "Getting started takes moments: import a bank statement from any bank, or add a spend in two taps, even from the home-screen widget."
      ],
      facts: [
        ["Price", "Free · Pro ₹199 one-time"],
        ["Platform", "Android"],
        ["Statement import", "PDF, Excel or CSV, any bank"],
        ["Currency", "Any currency"],
        ["Your data", "Stays on your phone. No login, no bank link, no ads."]
      ],
      colors: { bg: "#1E3A8A", bg2: "#14285F", accent: "#EB6834", accent2: "#12B76A", soft: "#C7D2FE", text: "#FFFFFF", btnBg: "#FFFFFF", btnText: "#1E3A8A" }
    },
    {
      slug: "noctyl",
      name: "Noctyl",
      kind: "Icons & widgets",
      tagline: "Dark, minimal icons and useful home-screen widgets.",
      points: ["Dark icon set", "Home-screen widgets", "Your accent colour"],
      platform: "Android",
      stage: "build",
      stageNote: "Being built right now",
      icon: "noctyl/icon.png",
      playUrl: "",
      about: [
        "Noctyl brings a calm, dark look to your home screen: a set of minimal icons plus useful widgets, applied straight from the app without needing an extra launcher.",
        "Pick your accent colour, icon size and shape, then add widgets like clocks and media controls. A full Noctyl launcher is planned for later."
      ],
      colors: { bg: "#0B0B0C", bg2: "#18181B", accent: "#F5A524", accent2: "#EDEDED", soft: "#2A2A2F", text: "#EDEDED", btnBg: "#F5A524", btnText: "#0B0B0C" }
    }
  ]
};
