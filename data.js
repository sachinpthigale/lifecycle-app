// LifeLine Milestone Data with Dynamic Calendar Year Engine & Zoom Tiers
let userBirthYear = parseInt(localStorage.getItem('lifeline_birth_year') || '1994', 10);

const LIFE_EVENTS = [
  // --- TIER 1: MACRO EPOCHS (Always visible at all zoom levels) ---
  {
    id: "evt-18",
    age: 18,
    tier: 1, // 1: Macro, 2: Decade, 3: Detailed
    title: "Adulthood & Legal Independence",
    category: "Independence",
    whatHappens: "You legally become an adult. Medical privacy (HIPAA) takes effect, and parents no longer have automatic legal or financial authority.",
    whatPeersDo: "78% open an independent bank account and sign a basic healthcare proxy so parents can assist in emergencies.",
    actions: [
      "Open independent checking and high-yield savings accounts",
      "Sign a basic durable power of attorney and healthcare proxy",
      "Establish basic budgeting for rent, food, and tuition"
    ]
  },
  {
    id: "evt-30",
    age: 30,
    tier: 1,
    title: "Family Foundations & Wealth Compounding",
    category: "Family Launch",
    whatHappens: "The defining decade for career compounding, family formation, housing, and long-term asset building.",
    whatPeersDo: "82% solidify a long-term household savings rate of 15-20% and assess home purchase readiness.",
    actions: [
      "Target 1x annual salary saved in retirement accounts by age 30",
      "Assess school district stability and home purchase timeline",
      "Set up automatic monthly investments in low-cost index funds"
    ]
  },
  {
    id: "evt-45",
    age: 45,
    tier: 1,
    title: "Peak Career & Preventative Health",
    category: "Peak & Health",
    whatHappens: "Peak career earning years paired with critical preventative health milestones.",
    whatPeersDo: "74% schedule comprehensive colorectal screenings and rebalance investments as college nears.",
    actions: [
      "Schedule screening colonoscopy or non-invasive stool DNA test (official age 45)",
      "Audit 401(k) compounding and child college savings progress",
      "Review umbrella liability policy ($1M-$2M) as teen drivers emerge"
    ]
  },
  {
    id: "evt-65",
    age: 65,
    tier: 1,
    title: "Retirement & Medicare Window",
    category: "Retirement",
    whatHappens: "The traditional retirement threshold and the pivotal 7-month Medicare enrollment window.",
    whatPeersDo: "95% enroll in Medicare Part A & B on time to avoid lifelong late penalties.",
    actions: [
      "Enroll in Medicare during the 7-month Initial Enrollment window",
      "Transition from accumulation to tax-efficient retirement distribution",
      "Execute an updated living trust and advance healthcare directive"
    ]
  },

  // --- TIER 2: DECADE MILESTONES (Visible at Medium & Detailed Zoom) ---
  {
    id: "evt-22",
    age: 22,
    tier: 2,
    title: "First Job & 800+ Credit Score",
    category: "Career & Credit",
    whatHappens: "Entering full-time professional employment and establishing creditworthiness.",
    whatPeersDo: "81% automate statement payments on a starter cash-back card to build an 800+ credit score.",
    actions: [
      "Contribute enough to earn full employer 401(k) match",
      "Set up autopay on a credit card to build length of credit history",
      "Keep credit utilization under 10% of total limit"
    ]
  },
  {
    id: "evt-25",
    age: 25,
    tier: 2,
    title: "3–6 Month Emergency Reserve",
    category: "Financial Buffer",
    whatHappens: "Aging off parental health coverage (age 26) and building real self-reliance.",
    whatPeersDo: "74% keep 3 to 6 months of living expenses in an FDIC-insured High-Yield Savings Account.",
    actions: [
      "Select independent health insurance plan before 26th birthday",
      "Build a 3-6 month liquid emergency fund in a 4%+ APY HYSA",
      "Open and maximize an annual Roth IRA"
    ]
  },
  {
    id: "evt-32",
    age: 32,
    tier: 2,
    title: "529 College Plan & Term Life",
    category: "Family Protection",
    whatHappens: "Securing financial safety nets for young dependents and automating education savings.",
    whatPeersDo: "84% open a 529 plan by age 1; 76% lock in 20-year level term life insurance.",
    actions: [
      "Open state direct 529 college savings plan ($150-$300/mo automated)",
      "Secure 20-30 year level term life insurance (10x-12x household income)",
      "Share 529 digital gifting link with grandparents"
    ]
  },
  {
    id: "evt-40",
    age: 40,
    tier: 2,
    title: "Cardiovascular & Metabolic Baseline",
    category: "Health Baseline",
    whatHappens: "Midlife metabolic changes make early prevention essential for longevity.",
    whatPeersDo: "78% complete comprehensive annual preventative bloodwork (ApoB, HbA1c, lipids).",
    actions: [
      "Book comprehensive annual physical (100% covered under ACA prevention)",
      "Check ApoB, lipid panel, and resting blood pressure",
      "Review disability insurance coverage to protect peak earning power"
    ]
  },
  {
    id: "evt-50",
    age: 50,
    tier: 2,
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
    id: "evt-62",
    age: 62,
    tier: 2,
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
    id: "evt-70",
    age: 70,
    tier: 2,
    title: "Living Trust & Generational Legacy",
    category: "Legacy & Transfer",
    whatHappens: "Maximum Social Security benefits kick in; Required Minimum Distributions (RMDs) approach.",
    whatPeersDo: "92% transfer home deeds into a revocable living trust to avoid public probate court.",
    actions: [
      "Claim maximum Social Security check (if delayed to 70)",
      "Re-title primary residence and assets into Revocable Living Trust",
      "Document digital account credentials and legacy family instructions"
    ]
  },

  // --- TIER 3: GRANULAR MILESTONES (Visible at Detailed Zoom In) ---
  {
    id: "evt-19",
    age: 19,
    tier: 3,
    title: "Student Loan & Credit Building",
    category: "Credit Foundations",
    whatHappens: "Managing student financial aid disbursements, housing leases, and credit utilization.",
    whatPeersDo: "72% track their credit score monthly and avoid carrying high-interest card balances.",
    actions: [
      "Review subsidized vs unsubsidized student loan accrual",
      "Establish autopay on small recurring subscriptions to build credit",
      "Track free credit report updates on Experian or Credit Karma"
    ]
  },
  {
    id: "evt-28",
    age: 28,
    tier: 3,
    title: "Partnership & Joint Budgeting",
    category: "Couples Planning",
    whatHappens: "Co-managing household expenses, aligning on debt, and setting wedding/home goals.",
    whatPeersDo: "64% do quarterly money syncs with their partner to align on savings and big goals.",
    actions: [
      "Review mutual credit reports, debt balances, and long-term goals",
      "Decide on joint vs separate accounts for household expenses",
      "Evaluate first-time homebuyer assistance and local mortgage pre-approvals"
    ]
  },
  {
    id: "evt-31",
    age: 31,
    tier: 3,
    title: "Daycare & Infant Care Waitlists",
    category: "Early Childcare",
    whatHappens: "Licensed infant daycares have 9–18 month waitlists in most metro areas.",
    whatPeersDo: "92% tour daycares and join waitlists 6 to 9 months before needing coverage.",
    actions: [
      "Tour 2-3 licensed daycare centers or home daycares early",
      "Enroll in employer Dependent Care FSA ($5,000 pre-tax savings)",
      "Schedule pediatric visits at 2, 4, and 6 months"
    ]
  },
  {
    id: "evt-33",
    age: 33,
    tier: 3,
    title: "Will & Child Guardianship",
    category: "Legal Protection",
    whatHappens: "Without a legal will, a family court judge decides who raises your child.",
    whatPeersDo: "61% execute a valid Last Will & Testament to legally nominate child guardians.",
    actions: [
      "Agree on primary and alternate legal guardians with your partner",
      "Draft and notarize a state-specific Last Will & Testament",
      "Audit primary and contingent beneficiaries on 401(k) and life policies"
    ]
  },
  {
    id: "evt-35",
    age: 35,
    tier: 3,
    title: "Preschool & Elementary School Zoning",
    category: "School Zoning",
    whatHappens: "Children transition to preschool and elementary school boundaries become critical.",
    whatPeersDo: "81% research public school district boundaries and kindergarten lottery deadlines.",
    actions: [
      "Check GreatSchools ratings and local elementary feeder boundaries",
      "Enroll in swim lessons and motor development activities",
      "First pediatric dentist checkup and vision screening"
    ]
  },
  {
    id: "evt-38",
    age: 38,
    tier: 3,
    title: "Extracurriculars & 529 Mid-Check",
    category: "Family Enrichment",
    whatHappens: "School-age kids enter sports, music, and academic enrichment programs.",
    whatPeersDo: "76% balance extracurricular budgets with consistent 529 automated contributions.",
    actions: [
      "Audit children's 529 target-date asset allocation",
      "Set an annual family budget for sports, arts, and camps",
      "Review home equity and mortgage refinancing terms"
    ]
  },
  {
    id: "evt-48",
    age: 48,
    tier: 3,
    title: "High School & College Tours",
    category: "College Prep",
    whatHappens: "Teenagers prepare for college admissions, testing, and driving.",
    whatPeersDo: "83% add teen drivers to insurance with safety discounts and tour college campuses.",
    actions: [
      "Increase umbrella liability insurance to $1M-$2M for teen drivers",
      "Estimate expected family contribution (FAFSA / CSS Profile)",
      "Schedule junior year college campus visits"
    ]
  },
  {
    id: "evt-55",
    age: 55,
    tier: 3,
    title: "Aging Parents & Healthcare Proxies",
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
    id: "evt-58",
    age: 58,
    tier: 3,
    title: "Empty Nest & Housing Downsizing",
    category: "Empty Nest",
    whatHappens: "Children leave home; evaluating whether to downsize or remodel for retirement.",
    whatPeersDo: "66% calculate property tax differences and home equity unlock options.",
    actions: [
      "Evaluate downsizing or relocating to lower-tax jurisdictions",
      "Eliminate remaining high-interest debt prior to retirement",
      "Model retirement cash flow with a fee-only fiduciary planner"
    ]
  },
  {
    id: "evt-64",
    age: 64,
    tier: 3,
    title: "Medicare Countdown (Age 64½)",
    category: "Medicare Prep",
    whatHappens: "The 7-month Initial Enrollment Period begins 3 months before your 65th birthday.",
    whatPeersDo: "95% review Medigap Plan G vs Advantage formularies before 65th birthday.",
    actions: [
      "Mark initial enrollment start: 3 months before 65th birthday month",
      "Compare Medicare Supplement Plan G vs Medicare Advantage (Part C)",
      "Review Part D prescription drug formulary with current medications"
    ]
  }
];

// Helper to compute calendar year from age
function getYearForAge(age) {
  return userBirthYear + age;
}
