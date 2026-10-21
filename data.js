// Comprehensive Lifecycle, Multi-Cultural & Regional Events Database
let userBirthYear = parseInt(localStorage.getItem('lifeline_birth_year') || '1994', 10);

// Default User Demographics (Customizable by user in app)
let userDemographics = JSON.parse(localStorage.getItem('lifeline_user_demographics') || JSON.stringify({
  gender: "all",               // all, male, female
  heritage: "indian",          // indian, american, hispanic, east_asian, jewish, all
  religion: "all",             // all, hindu, christian, jewish, muslim, secular
  region: "bay_area",          // bay_area, socal, nyc, texas, seattle, us_general
  interests: ["festivals", "family", "health", "finance"]
}));

// Core Human Lifecycle Milestones (Across All Demographic Backgrounds)
const CORE_LIFECYCLE_MILESTONES = [
  {
    id: "core-18",
    age: 18,
    type: "milestone",
    tags: ["all", "independence", "legal"],
    title: "Adulthood & Legal Autonomy",
    category: "Independence",
    whatHappens: "You legally become an adult. Medical privacy (HIPAA) takes effect, and parents no longer have automatic access to records.",
    whatPeersDo: "78% open an independent bank account and sign a basic healthcare proxy so parents can help in medical emergencies.",
    actions: [
      "Open independent checking and high-yield savings",
      "Sign durable power of attorney & advance healthcare directive",
      "Understand credit building basics"
    ]
  },
  {
    id: "core-22",
    age: 22,
    type: "milestone",
    tags: ["all", "career", "finance"],
    title: "First Job & 800+ Credit Score",
    category: "Career & Money",
    whatHappens: "Entering the workforce full-time, building financial habits, and establishing creditworthiness.",
    whatPeersDo: "81% set up automatic statement payments on a starter cash-back card to build an 800+ score early.",
    actions: [
      "Set up full autopay on cash-back card to build credit history",
      "Contribute enough to capture full employer 401(k) match",
      "Build a starter $1,000 cash emergency buffer"
    ]
  },
  {
    id: "core-25",
    age: 25,
    type: "milestone",
    tags: ["all", "finance", "health"],
    title: "3–6 Month Emergency Reserve",
    category: "Financial Buffer",
    whatHappens: "Aging off parental health insurance (turning 26) and building genuine self-reliance.",
    whatPeersDo: "74% keep 3 to 6 months of living expenses liquid in a High-Yield Savings Account (HYSA).",
    actions: [
      "Select independent health insurance plan before turning 26",
      "Automate monthly savings into 4%+ APY HYSA",
      "Open and fund a Roth IRA"
    ]
  },
  {
    id: "core-28",
    age: 28,
    type: "milestone",
    tags: ["all", "family", "relationships"],
    title: "Partnership & Long-Term Alignments",
    category: "Partnership",
    whatHappens: "Serious relationships, marriage, combining finances, or first home purchase plans.",
    whatPeersDo: "64% do quarterly money syncs with partner to align on savings, debt, and home buying.",
    actions: [
      "Review mutual credit reports, debt payoff, and savings goals",
      "Decide on joint vs. separate accounts for household bills",
      "Check first-time homebuyer assistance and mortgage pre-approval"
    ]
  },
  {
    id: "core-31",
    age: 31,
    type: "milestone",
    tags: ["family", "kids", "parenting"],
    title: "Daycare & Infant Care Waitlists",
    category: "Early Parenting",
    whatHappens: "Licensed infant daycares have 9–18 month waitlists in most metro areas.",
    whatPeersDo: "92% tour daycares and join 2–3 waitlists 6 to 9 months before needing care.",
    actions: [
      "Tour licensed local daycares and submit waitlist applications early",
      "Enroll in employer Dependent Care FSA ($5,000 pre-tax savings)",
      "Set up pediatric care and schedule 2, 4, 6-month well-child visits"
    ]
  },
  {
    id: "core-32",
    age: 32,
    type: "milestone",
    tags: ["all", "family", "finance"],
    title: "529 College Plan & Term Life",
    category: "Family Protection",
    isCurrentAge: true, // Marker for current year (Age 32 in 2026)
    whatHappens: "Securing family safety nets and beginning compounding college funds for kids.",
    whatPeersDo: "84% open a 529 plan by child's 1st year; 76% lock in 20-year level term life insurance.",
    actions: [
      "Open state direct 529 college savings plan ($150-$300/mo automated)",
      "Secure 20-30 year level term life insurance (10x-12x annual income)",
      "Share 529 digital gifting link with family"
    ]
  },
  {
    id: "core-33",
    age: 33,
    type: "milestone",
    tags: ["all", "legal", "family"],
    title: "Will & Child Legal Guardianship",
    category: "Legal Protection",
    whatHappens: "Without a valid legal will, a family court judge—not you—decides who raises your child.",
    whatPeersDo: "61% execute a valid Last Will & Testament to legally nominate child guardians.",
    actions: [
      "Agree on primary and alternate legal guardians with your partner",
      "Draft and notarize a state-specific Last Will & Testament",
      "Audit primary and contingent beneficiaries on retirement and life policies"
    ]
  },
  {
    id: "core-35",
    age: 35,
    type: "milestone",
    tags: ["family", "kids", "education"],
    title: "Preschool & Elementary School Zoning",
    category: "Education",
    whatHappens: "Children enter preschool; neighborhood elementary school zoning becomes critical.",
    whatPeersDo: "81% research public school district boundaries and kindergarten lottery deadlines.",
    actions: [
      "Check GreatSchools ratings and local elementary feeder boundaries",
      "Enroll in swim lessons and early motor development activities",
      "First pediatric dentist checkup and vision screening"
    ]
  },
  {
    id: "core-40",
    age: 40,
    type: "milestone",
    tags: ["all", "health"],
    title: "Cardiovascular & Health Baseline",
    category: "Health Baseline",
    whatHappens: "Midlife metabolic changes make early prevention essential for longevity.",
    whatPeersDo: "78% complete comprehensive annual preventative bloodwork (ApoB, HbA1c, lipids, blood pressure).",
    actions: [
      "Book comprehensive annual physical (100% covered under ACA prevention)",
      "Check ApoB, lipid panel, and resting blood pressure",
      "Review disability insurance coverage to protect peak earning power"
    ]
  },
  {
    id: "core-45",
    age: 45,
    type: "milestone",
    tags: ["all", "health"],
    title: "Colorectal & Cancer Screening",
    category: "Preventative Health",
    whatHappens: "Official USPSTF screening age for colorectal cancer begins at age 45.",
    whatPeersDo: "72% schedule a screening colonoscopy or non-invasive stool DNA test.",
    actions: [
      "Schedule colonoscopy or discuss Cologuard with physician",
      "Annual mammogram or prostate health consultation based on history",
      "Rebalance investment portfolio as children approach college age"
    ]
  },
  {
    id: "core-50",
    age: 50,
    type: "milestone",
    tags: ["all", "finance"],
    title: "IRS 50+ Catch-Up Contributions",
    category: "Catch-Up Wealth",
    whatHappens: "IRS permits higher tax-sheltered contributions starting the calendar year you turn 50.",
    whatPeersDo: "85% of high earners maximize the additional $7,500 catch-up limit to their 401(k).",
    actions: [
      "Increase 401(k) election to include the $7,500 catch-up limit",
      "Add $1,000 catch-up to traditional or Roth IRA",
      "Begin long-term care insurance research before age 55"
    ]
  },
  {
    id: "core-55",
    age: 55,
    type: "milestone",
    tags: ["all", "family", "legal"],
    title: "Aging Parents & Eldercare Planning",
    category: "Eldercare Planning",
    whatHappens: "Caring for aging parents while planning your own retirement exit.",
    whatPeersDo: "69% establish durable power of attorney and healthcare proxies for aging parents.",
    actions: [
      "Confirm aging parents have valid wills, deeds, and health proxies",
      "Consolidate former employer 401(k) accounts into rollover IRAs",
      "Utilize $1,000 HSA catch-up contribution starting at age 55"
    ]
  },
  {
    id: "core-62",
    age: 62,
    type: "milestone",
    tags: ["all", "finance", "retirement"],
    title: "Social Security Timing Strategy",
    category: "Retirement Cashflow",
    whatHappens: "First age of Social Security eligibility, but with a permanent 30% reduction.",
    whatPeersDo: "88% model break-even scenarios and delay claiming to 67 or 70 for 77% higher payouts.",
    actions: [
      "Download lifetime earnings history from ssa.gov",
      "Model break-even longevity between ages 62, 67, and 70",
      "Optimize spousal and survivor benefit timing"
    ]
  },
  {
    id: "core-65",
    age: 65,
    type: "milestone",
    tags: ["all", "health", "retirement"],
    title: "Medicare Part A & B Enrollment Window",
    category: "Medicare Window",
    whatHappens: "Turning 65 triggers the critical 7-month Medicare Initial Enrollment Period.",
    whatPeersDo: "95% enroll on time to avoid permanent lifetime premium penalties.",
    actions: [
      "Sign up during the 7-month window (3 months before 65th birthday month)",
      "Compare Medigap Plan G vs. Medicare Advantage (Part C)",
      "Verify prescription drug coverage under Part D"
    ]
  },
  {
    id: "core-70",
    age: 70,
    type: "milestone",
    tags: ["all", "legal", "legacy"],
    title: "Living Trust & Generational Legacy",
    category: "Legacy & Transfer",
    whatHappens: "Maximum Social Security benefits kick in; Required Minimum Distributions (RMDs) approach.",
    whatPeersDo: "92% transfer home deeds into a revocable living trust to avoid public probate court.",
    actions: [
      "Claim maximum Social Security check (if delayed to 70)",
      "Re-title primary residence and assets into Revocable Living Trust",
      "Document digital account credentials and legacy family instructions"
    ]
  }
];

// Multi-Cultural, Seasonal & Regional Events Database
const CULTURAL_SEASONAL_EVENTS = [
  // --- SOUTH ASIAN / HINDU TRADITIONS ---
  {
    id: "fest-navratri",
    title: "Navratri Garba & Dandiya Nights",
    season: "October (Fall)",
    timing: "Happening Now · Oct 2026",
    targetAgeApprox: 32,
    heritage: "indian",
    religion: "hindu",
    regions: ["bay_area", "texas", "nyc", "socal"],
    locationDisplay: "Santa Clara / San Jose / Fremont",
    icon: "sparkles",
    color: "#f59e0b",
    summary: "Dandiya Raas & Garba celebrations. Traditional Chaniya Choli/Kurta, live Gujarati bands, energetic family dancing.",
    spots: [
      "Santa Clara Convention Center — Grand Bay Garba with live orchestra",
      "Fremont Hindu Temple & ICC Milpitas nightly Garba",
      "San Jose Event Center — Family & youth Dandiya nights"
    ],
    tips: "Arrive before 8 PM for parking; book passes early as weekend nights sell out."
  },
  {
    id: "fest-durga-puja",
    title: "Durga Puja & Durgotsav",
    season: "October (Fall)",
    timing: "This Week · Oct 2026",
    targetAgeApprox: 32,
    heritage: "indian",
    religion: "hindu",
    regions: ["bay_area", "nyc", "texas"],
    locationDisplay: "Cupertino / Sunnyvale / Fremont",
    icon: "flame",
    color: "#ef4444",
    summary: "Grand pandals, Dhunuchi dance, Sindoor Khela, and traditional Bengali Bhog dinners across the Bay.",
    spots: [
      "Prabasi Durgotsav (San Mateo Expo / Chabot College) — Idol darshan & cultural programs",
      "BayBasi Cupertino / Sunnyvale — Cultural food stalls & evening Aarti",
      "Sanskriti Fremont — Traditional music & fresh Bengali sweets"
    ],
    tips: "Bhog coupons are usually served between 12:30 PM - 2:30 PM."
  },
  {
    id: "fest-diwali",
    title: "Diwali Lights, Mela & Fireworks",
    season: "November (Late Fall)",
    timing: "Coming Up · Nov 2026",
    targetAgeApprox: 32,
    heritage: "indian",
    religion: "hindu",
    regions: ["bay_area", "texas", "nyc", "socal", "seattle"],
    locationDisplay: "Santana Row & Fremont",
    icon: "sun",
    color: "#eab308",
    summary: "The festival of lights. Diya lighting ceremonies, sweet gifting boxes, fireworks, and Santana Row Diwali celebration.",
    spots: [
      "Santana Row Annual Diwali Celebration — Live dances, henna, and lighting display",
      "Fremont Central Park / Temple Deepawali Fireworks Show",
      "San Jose Diwali Bazaar — Ethnic clothing, jewelry, and sweet stalls"
    ],
    tips: "Pre-order mithai boxes (Kaju Katli, Ladoo) 1 week in advance."
  },

  // --- AMERICAN / REGIONAL LOCAL TRADITIONS ---
  {
    id: "fest-halloween-losgatos",
    title: "Halloween on Tait Ave (Los Gatos)",
    season: "October 31",
    timing: "Oct 31, 2026 Tradition",
    targetAgeApprox: 32,
    heritage: "american",
    religion: "secular",
    regions: ["bay_area"],
    locationDisplay: "Los Gatos (Tait Ave & Almond Grove)",
    icon: "ghost",
    color: "#f97316",
    summary: "Legendary South Bay family Halloween hotspot. Entire Victorian streets close to cars with Hollywood-grade haunted houses and massive crowds.",
    spots: [
      "Tait Avenue, Los Gatos — Multi-house themed haunted displays & live DJ houses",
      "Almond Grove Historic District — Walkable trick-or-treating for all ages",
      "Town Plaza Park — Family costume staging and warm cider"
    ],
    tips: "Park near Los Gatos High School and walk in by 5:30 PM; traffic backs up quickly."
  },
  {
    id: "fest-thanksgiving",
    title: "Thanksgiving & Silicon Valley Turkey Trot",
    season: "Late November",
    timing: "Nov 2026 Tradition",
    targetAgeApprox: 32,
    heritage: "american",
    religion: "secular",
    regions: ["bay_area", "us_general"],
    locationDisplay: "Downtown San Jose & Valley Fair",
    icon: "shopping-bag",
    color: "#84cc16",
    summary: "Silicon Valley Turkey Trot (25,000 runners in downtown San Jose) followed by Black Friday family shopping.",
    spots: [
      "Silicon Valley Turkey Trot (Downtown San Jose) — 5K/10K family walk & run",
      "Westfield Valley Fair & Santana Row — Midnight holiday shopping kickoff",
      "Great Mall Milpitas — Holiday family outlet specials"
    ],
    tips: "Register for the Turkey Trot early to get your commemorative tech shirt."
  },
  {
    id: "fest-christmas-vasona",
    title: "Fantasy of Lights & Willow Glen",
    season: "December (Winter)",
    timing: "Dec 2026 Tradition",
    targetAgeApprox: 32,
    heritage: "american",
    religion: "christian",
    regions: ["bay_area"],
    locationDisplay: "Los Gatos Vasona Park & San Jose",
    icon: "tree-pine",
    color: "#10b981",
    summary: "Iconic South Bay holiday light traditions: 1.5-mile drive-thru animated light displays and festive neighborhood walking tours.",
    spots: [
      "Vasona Lake County Park (Los Gatos) — 1.5-mile drive-thru & walk-thru Fantasy of Lights",
      "Willow Glen San Jose (Glen Eyrie / Lincoln Ave) — Hundreds of coordinated illuminated trees",
      "Christmas in the Park (Downtown San Jose Plaza de César Chávez)"
    ],
    tips: "Fantasy of Lights drive-thru tickets sell out weeks in advance; book online in early November."
  },

  // --- JEWISH TRADITIONS ---
  {
    id: "fest-hanukkah",
    title: "Hanukkah Menorah Lighting & Celebrations",
    season: "December (Winter)",
    timing: "Dec 2026 Tradition",
    targetAgeApprox: 32,
    heritage: "jewish",
    religion: "jewish",
    regions: ["bay_area", "nyc", "socal", "us_general"],
    locationDisplay: "Santana Row & SF Union Square",
    icon: "flame",
    color: "#3b82f6",
    summary: "Community Menorah lightings, latke parties, sufganiyot jelly doughnuts, and family dreidel games.",
    spots: [
      "Santana Row Annual Community Menorah Lighting with live klezmer music",
      "Bill Graham Menorah in SF Union Square (San Francisco)",
      "Palo Alto JCC Hanukkah Festival"
    ],
    tips: "Great for families with young kids; hot latkes and gelt drops."
  },

  // --- EAST ASIAN TRADITIONS ---
  {
    id: "fest-lunar-newyear",
    title: "Lunar New Year & Spring Festival",
    season: "Jan / Feb (Winter)",
    timing: "Winter Tradition",
    targetAgeApprox: 32,
    heritage: "east_asian",
    religion: "secular",
    regions: ["bay_area", "nyc", "socal", "seattle"],
    locationDisplay: "San Francisco Chinatown & Cupertino",
    icon: "sparkles",
    color: "#dc2626",
    summary: "Lion dances, red envelope traditions, family reunion dinners, and the historic San Francisco Chinese New Year Parade.",
    spots: [
      "San Francisco Chinatown Grand Parade — Illuminated night parade with 288ft Golden Dragon",
      "Cupertino Memorial Park Lunar New Year Festival — Cultural dances and food stalls",
      "San Jose Vietnam Town Tet Festival — Firecrackers and ao dai pageant"
    ],
    tips: "SF parade requires bleacher tickets or early arrival along Kearny St."
  },

  // --- HISPANIC & LATINO TRADITIONS ---
  {
    id: "fest-dia-muertos",
    title: "Día de los Muertos (Day of the Dead)",
    season: "Nov 1 - 2",
    timing: "Early Nov Tradition",
    targetAgeApprox: 32,
    heritage: "hispanic",
    religion: "catholic",
    regions: ["bay_area", "socal", "texas"],
    locationDisplay: "San Jose East Side & SF Mission",
    icon: "heart",
    color: "#a855f7",
    summary: "Vibrant community altares (altars), marigolds (cempasúchil), sugar skulls, and processions honoring ancestors.",
    spots: [
      "San Jose Eastridge / Plaza de César Chávez Día de los Muertos Festival",
      "San Francisco Mission District Procession & Festival of Altars (24th St)",
      "Oakland Fruitvale Día de los Muertos Festival"
    ],
    tips: "Face painting and traditional Pan de Muerto available at community altars."
  }
];

// Helper to calculate calendar year from age
function getYearForAge(age) {
  return userBirthYear + age;
}

// Filter events tailored to active user demographics
function getActiveTimelineEvents() {
  const events = [...CORE_LIFECYCLE_MILESTONES];

  // Add cultural/seasonal events matching heritage, religion, or region
  CULTURAL_SEASONAL_EVENTS.forEach(fest => {
    const heritageMatch = (userDemographics.heritage === 'all') || 
                          (fest.heritage === userDemographics.heritage) || 
                          (fest.heritage === 'american');
    const regionMatch = (fest.regions.includes(userDemographics.region)) || 
                        fest.regions.includes('us_general');
    
    if (heritageMatch && regionMatch) {
      events.push({
        id: fest.id,
        age: fest.targetAgeApprox,
        type: "cultural",
        isCultural: true,
        title: fest.title,
        timing: fest.timing,
        category: fest.locationDisplay,
        whatHappens: fest.summary,
        whatPeersDo: `Where people go: ${fest.spots[0]}`,
        actions: fest.spots,
        tips: fest.tips,
        color: fest.color
      });
    }
  });

  // Seasonal calendar chronological ordering for Age 32 / 2026
  const seasonalOrder = {
    "fest-navratri": 1,
    "fest-durga-puja": 2,
    "fest-halloween-losgatos": 3,
    "fest-dia-muertos": 4,
    "fest-diwali": 5,
    "fest-thanksgiving": 6,
    "fest-christmas-vasona": 7,
    "fest-hanukkah": 8,
    "fest-lunar-newyear": 9
  };

  // Sort by age, then put core milestone first, then chronological seasonal events
  events.sort((a, b) => {
    if (a.age !== b.age) return a.age - b.age;
    if (a.type === 'milestone' && b.type !== 'milestone') return -1;
    if (a.type !== 'milestone' && b.type === 'milestone') return 1;
    const orderA = seasonalOrder[a.id] || 50;
    const orderB = seasonalOrder[b.id] || 50;
    return orderA - orderB;
  });

  return events;
}
