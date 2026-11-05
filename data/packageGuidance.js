// Plain-language guidance shown on the homepage package cards.
// DRAFT copy for clinical review: age brackets and "consider if" history are general
// screening guidance, not a diagnosis. Keyed by package name from health-packages.json.
export const packageGuidance = {
  "Executive Wellness Checkup": {
    tagline: "Yearly check for busy professionals",
    age: "22 – 40 yrs",
    audience: ["young", "all"],
    forWho: "A good first full check if you have a desk job, irregular meals or high stress, and nothing is bothering you yet.",
    history: ["Sedentary job", "Family history of diabetes or BP", "No check-up in the last year"],
  },
  "Master Wellness Checkup": {
    tagline: "Full-body check with vitamins",
    age: "30 – 50 yrs",
    audience: ["adult", "all"],
    forWho: "A wider look at organs plus vitamin and mineral levels. Suits constant tiredness, body aches or a yearly review.",
    history: ["Tiredness or low energy", "Vegetarian diet", "Little sun exposure"],
  },
  "Fitness Profile": {
    tagline: "For gym-goers and active people",
    age: "18 – 45 yrs",
    audience: ["young", "adult"],
    forWho: "Checks the heart, kidney, hormone and vitamin markers that matter when you train hard or use supplements.",
    history: ["Regular gym or sports", "Taking protein or supplements", "Unexplained fatigue after workouts"],
  },
  "Hair Fall Profile": {
    tagline: "Find the cause behind hair loss",
    age: "18 – 45 yrs",
    audience: ["young", "adult", "women"],
    forWho: "Looks at thyroid, iron, vitamin D and B12 and other common nutritional causes of thinning hair.",
    history: ["Increased hair fall over 3+ months", "Recent illness or weight loss", "Heavy periods"],
  },
  "Diabetic Profile": {
    tagline: "Track sugar control and its effects",
    age: "Any age with diabetes",
    audience: ["senior", "adult"],
    forWho: "A home-collection monitor for people already diagnosed with diabetes. Repeat every 3 months.",
    history: ["Known diabetes or pre-diabetes", "On regular medication", "Doctor asked for a 3-monthly HbA1c"],
  },
  "Advanced Preventive Health Panel": {
    tagline: "Deep preventive screen",
    age: "40+ yrs",
    audience: ["senior", "adult"],
    forWho: "Screens inflammation, heart risk, metabolism, hormones and a cancer marker. Made for the 40s and beyond.",
    history: ["Age 40 or above", "Family history of heart disease or cancer", "Smoker or drinker"],
  },
  "STD Screening Package": {
    tagline: "Confidential infection screening",
    age: "Sexually active adults",
    audience: ["adult", "young"],
    forWho: "Private screening for common sexually transmitted infections, collected at home and reported discreetly.",
    history: ["New or multiple partners", "Unprotected exposure", "Planning pregnancy or marriage"],
  },
};

// Featured centre-visit package (DEXA scan needs the machine, so no home collection). Keyed "<package name>|centre".
packageGuidance["Fitness Profile|centre"] = {
  tagline: "Fitness blood panel + DEXA body scan",
  age: "18 – 60 yrs",
  audience: ["young", "adult", "senior"],
  forWho: "The Fitness Profile plus a whole-body DEXA scan: body fat, lean muscle, bone density and where your fat sits. Done at our Paradise centre in one visit.",
  history: ["Training for fat loss or muscle gain", "Weight steady but clothes size changing", "Bone health worry or family history of osteoporosis"],
  detailsHref: "/dexa-body-composition",
  detailsLabel: "See the DEXA report",
};

export const audienceFilters = [
  { id: "all", label: "All packages" },
  { id: "young", label: "Under 30" },
  { id: "adult", label: "30 – 45" },
  { id: "senior", label: "45+" },
  { id: "women", label: "Women" },
];

// Fallback for categories missing from health-packages.json's categoryIconMap.
export const extraCategoryIcons = {
  "Cancer Screen": "/assets/ads/icons/cancer.png",
};
