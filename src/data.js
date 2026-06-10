export const defaultStages = [
  {
    id: "stage-1",
    name: "Stage 1: Recruiter screen",
    weight: 10,
    criteria: [
      { id: "experience-relevance", name: "Experience relevance", critical: false },
      { id: "motivation", name: "Motivation", critical: false },
      { id: "communication", name: "Communication", critical: false },
      { id: "stage-fit", name: "Stage fit", critical: true },
      { id: "comp-alignment", name: "Compensation alignment", critical: false },
      { id: "sales-credibility", name: "Basic sales credibility", critical: false },
    ],
  },
  {
    id: "stage-2",
    name: "Stage 2: Hiring manager interview",
    weight: 25,
    criteria: [
      { id: "sales-process", name: "Sales process", critical: false },
      { id: "gtm-judgement", name: "GTM judgement", critical: false },
      { id: "leadership", name: "Sales leadership", critical: true },
      { id: "pipeline", name: "Pipeline management", critical: false },
      { id: "commercial", name: "Commercial judgement", critical: true },
      { id: "customer", name: "Customer understanding", critical: false },
    ],
  },
  {
    id: "stage-3",
    name: "Stage 3: Founder/final interview",
    weight: 35,
    criteria: [
      { id: "founder-fit", name: "Founder fit", critical: false },
      { id: "culture", name: "Culture", critical: true },
      { id: "strategy", name: "Strategic thinking", critical: false },
      { id: "ambiguity", name: "Ability to operate in ambiguity", critical: false },
      { id: "hiring-confidence", name: "Overall hiring confidence", critical: false },
      {
        id: "revenue-function",
        name: "Previous experience growing a revenue function",
        critical: true,
      },
    ],
  },
  {
    id: "stage-4",
    name: "Stage 4: Optional task/presentation",
    weight: 30,
    criteria: [
      { id: "insight-quality", name: "Quality of insight", critical: false },
      { id: "commercial-story", name: "Commercial storytelling", critical: false },
      { id: "operator-detail", name: "Operating detail", critical: false },
      { id: "executive-presence", name: "Executive presence", critical: false },
    ],
  },
];

export const roleTemplates = [
  {
    id: "cro",
    name: "Chief Revenue Officer",
    stages: [
      {
        id: "stage-1",
        weight: 10,
        criteria: [
          { id: "executive-relevance", name: "Executive revenue experience", critical: true },
          { id: "motivation", name: "Motivation", critical: false },
          { id: "communication", name: "Executive communication", critical: false },
          { id: "stage-fit", name: "Stage fit", critical: true },
          { id: "comp-alignment", name: "Compensation alignment", critical: false },
          { id: "board-credibility", name: "Board-level credibility", critical: true },
        ],
      },
      {
        id: "stage-2",
        weight: 25,
        criteria: [
          { id: "revenue-strategy", name: "Revenue strategy", critical: true },
          { id: "gtm-judgement", name: "GTM judgement", critical: true },
          { id: "leadership", name: "Sales leadership", critical: true },
          { id: "forecasting", name: "Forecasting and operating cadence", critical: false },
          { id: "commercial", name: "Commercial judgement", critical: true },
          { id: "customer", name: "Customer and market understanding", critical: false },
        ],
      },
      {
        id: "stage-3",
        weight: 35,
        criteria: [
          { id: "founder-fit", name: "Founder fit", critical: true },
          { id: "culture", name: "Culture", critical: true },
          { id: "strategy", name: "Strategic thinking", critical: true },
          { id: "ambiguity", name: "Ability to operate in ambiguity", critical: false },
          { id: "hiring-confidence", name: "Overall hiring confidence", critical: false },
          { id: "revenue-function", name: "Previous experience growing a revenue function", critical: true },
        ],
      },
      {
        id: "stage-4",
        weight: 30,
        criteria: [
          { id: "board-narrative", name: "Board-ready revenue narrative", critical: true },
          { id: "growth-plan", name: "Quality of growth plan", critical: true },
          { id: "operating-detail", name: "Operating detail", critical: false },
          { id: "executive-presence", name: "Executive presence", critical: false },
        ],
      },
    ],
  },
  {
    id: "vp-sales",
    name: "VP Sales",
    stages: structuredClone(defaultStages).map(({ id, weight, criteria }) => ({ id, weight, criteria })),
  },
  {
    id: "head-gtm",
    name: "Head of GTM",
    stages: [
      {
        id: "stage-1",
        weight: 10,
        criteria: [
          { id: "gtm-relevance", name: "GTM experience relevance", critical: true },
          { id: "motivation", name: "Motivation", critical: false },
          { id: "communication", name: "Communication", critical: false },
          { id: "stage-fit", name: "Stage fit", critical: true },
          { id: "comp-alignment", name: "Compensation alignment", critical: false },
          { id: "market-fluency", name: "Market fluency", critical: false },
        ],
      },
      {
        id: "stage-2",
        weight: 30,
        criteria: [
          { id: "gtm-architecture", name: "GTM architecture", critical: true },
          { id: "commercial", name: "Commercial judgement", critical: true },
          { id: "cross-functional", name: "Cross-functional leadership", critical: true },
          { id: "pipeline", name: "Pipeline and demand generation judgement", critical: false },
          { id: "data", name: "Data and insight quality", critical: false },
          { id: "customer", name: "Customer understanding", critical: false },
        ],
      },
      {
        id: "stage-3",
        weight: 35,
        criteria: [
          { id: "founder-fit", name: "Founder fit", critical: true },
          { id: "culture", name: "Culture", critical: true },
          { id: "strategy", name: "Strategic thinking", critical: true },
          { id: "ambiguity", name: "Ability to operate in ambiguity", critical: false },
          { id: "hiring-confidence", name: "Overall hiring confidence", critical: false },
        ],
      },
      {
        id: "stage-4",
        weight: 25,
        criteria: [
          { id: "gtm-plan", name: "GTM plan quality", critical: true },
          { id: "segmentation", name: "Segmentation and ICP thinking", critical: false },
          { id: "commercial-story", name: "Commercial storytelling", critical: false },
          { id: "operator-detail", name: "Operating detail", critical: false },
        ],
      },
    ],
  },
  {
    id: "sales-director",
    name: "Sales Director",
    stages: [
      {
        id: "stage-1",
        weight: 15,
        criteria: [
          { id: "experience-relevance", name: "Experience relevance", critical: false },
          { id: "motivation", name: "Motivation", critical: false },
          { id: "communication", name: "Communication", critical: false },
          { id: "stage-fit", name: "Stage fit", critical: true },
          { id: "comp-alignment", name: "Compensation alignment", critical: false },
          { id: "sales-credibility", name: "Sales credibility", critical: true },
        ],
      },
      {
        id: "stage-2",
        weight: 35,
        criteria: [
          { id: "sales-process", name: "Sales process", critical: true },
          { id: "coaching", name: "Rep coaching", critical: true },
          { id: "pipeline", name: "Pipeline management", critical: true },
          { id: "forecasting", name: "Forecasting discipline", critical: false },
          { id: "commercial", name: "Commercial judgement", critical: true },
          { id: "customer", name: "Customer understanding", critical: false },
        ],
      },
      {
        id: "stage-3",
        weight: 30,
        criteria: [
          { id: "manager-fit", name: "Manager fit", critical: true },
          { id: "culture", name: "Culture", critical: true },
          { id: "team-leadership", name: "Team leadership", critical: true },
          { id: "ambiguity", name: "Ability to operate in ambiguity", critical: false },
          { id: "hiring-confidence", name: "Overall hiring confidence", critical: false },
        ],
      },
      {
        id: "stage-4",
        weight: 20,
        criteria: [
          { id: "deal-review", name: "Deal review quality", critical: true },
          { id: "coaching-plan", name: "Coaching plan", critical: false },
          { id: "operating-detail", name: "Operating detail", critical: false },
          { id: "presentation", name: "Presentation clarity", critical: false },
        ],
      },
    ],
  },
  {
    id: "enterprise-ae-leader",
    name: "Enterprise AE Leader",
    stages: [
      {
        id: "stage-1",
        weight: 15,
        criteria: [
          { id: "enterprise-relevance", name: "Enterprise sales relevance", critical: true },
          { id: "motivation", name: "Motivation", critical: false },
          { id: "communication", name: "Communication", critical: false },
          { id: "stage-fit", name: "Stage fit", critical: true },
          { id: "comp-alignment", name: "Compensation alignment", critical: false },
          { id: "customer-credibility", name: "Customer credibility", critical: true },
        ],
      },
      {
        id: "stage-2",
        weight: 35,
        criteria: [
          { id: "deal-strategy", name: "Enterprise deal strategy", critical: true },
          { id: "discovery", name: "Discovery quality", critical: true },
          { id: "stakeholder-mapping", name: "Stakeholder mapping", critical: false },
          { id: "pipeline", name: "Pipeline management", critical: false },
          { id: "commercial", name: "Commercial judgement", critical: true },
          { id: "customer", name: "Customer understanding", critical: true },
        ],
      },
      {
        id: "stage-3",
        weight: 25,
        criteria: [
          { id: "founder-fit", name: "Founder fit", critical: false },
          { id: "culture", name: "Culture", critical: true },
          { id: "strategic-thinking", name: "Strategic thinking", critical: false },
          { id: "resilience", name: "Resilience and ownership", critical: true },
          { id: "hiring-confidence", name: "Overall hiring confidence", critical: false },
        ],
      },
      {
        id: "stage-4",
        weight: 25,
        criteria: [
          { id: "account-plan", name: "Account plan quality", critical: true },
          { id: "executive-conversation", name: "Executive conversation", critical: true },
          { id: "commercial-story", name: "Commercial storytelling", critical: false },
          { id: "next-steps", name: "Next-step discipline", critical: false },
        ],
      },
    ],
  },
];

const reviewer = (name, role, recommendation, scores, notes) => ({
  id: crypto.randomUUID(),
  name,
  role,
  date: "2026-06-10",
  recommendation,
  scores,
  notes,
});

const stage = (template, reviewers = []) => ({
  ...structuredClone(template),
  reviewers,
});

export const sampleCandidates = [
  {
    id: crypto.randomUUID(),
    name: "Maya Ellison",
    title: "VP Sales, Series B SaaS",
    link: "https://www.linkedin.com/",
    assessedRole: "Chief Revenue Officer",
    client: "Northstar AI",
    status: "Final stage",
    recommendationOverride: "",
    notesSummary:
      "Strong enterprise sales operator with credible revenue leadership experience.",
    stages: [
      stage(defaultStages[0], [
        reviewer(
          "Natasha Lane",
          "Recruiter",
          "Yes",
          {
            "experience-relevance": 5,
            motivation: 4,
            communication: 5,
            "stage-fit": 4,
            "comp-alignment": 4,
            "sales-credibility": 5,
          },
          "Clear motivation and very relevant SaaS scale-up experience."
        ),
      ]),
      stage(defaultStages[1], [
        reviewer(
          "Ari Patel",
          "Hiring Manager",
          "Strong Yes",
          {
            "sales-process": 5,
            "gtm-judgement": 4,
            leadership: 5,
            pipeline: 5,
            commercial: 4,
            customer: 4,
          },
          "Very structured around process, inspection and enterprise forecast hygiene."
        ),
        reviewer(
          "Sofia Reed",
          "Commercial Advisor",
          "Yes",
          {
            "sales-process": 4,
            "gtm-judgement": 4,
            leadership: 4,
            pipeline: 5,
            commercial: 4,
            customer: 5,
          },
          "Strong commercial instincts and crisp examples of customer segmentation."
        ),
      ]),
      stage(defaultStages[2], [
        reviewer(
          "Leo Morgan",
          "Founder",
          "Yes",
          {
            "founder-fit": 4,
            culture: 4,
            strategy: 5,
            ambiguity: 4,
            "hiring-confidence": 4,
            "revenue-function": 5,
          },
          "Comfortable with ambiguity and has built the kind of function we need."
        ),
      ]),
      stage(defaultStages[3]),
    ],
  },
  {
    id: crypto.randomUUID(),
    name: "Daniel Cho",
    title: "Sales Director, Fintech",
    link: "https://www.linkedin.com/",
    assessedRole: "VP Sales",
    client: "Orbital Ledger",
    status: "Hiring manager review",
    recommendationOverride: "",
    notesSummary:
      "Excellent closer, but there are concerns around leadership scope and culture fit.",
    stages: [
      stage(defaultStages[0], [
        reviewer(
          "Natasha Lane",
          "Recruiter",
          "Yes",
          {
            "experience-relevance": 4,
            motivation: 5,
            communication: 4,
            "stage-fit": 4,
            "comp-alignment": 4,
            "sales-credibility": 5,
          },
          "Motivated and commercially sharp."
        ),
      ]),
      stage(defaultStages[1], [
        reviewer(
          "Ari Patel",
          "Hiring Manager",
          "Mixed",
          {
            "sales-process": 4,
            "gtm-judgement": 3,
            leadership: 2,
            pipeline: 4,
            commercial: 3,
            customer: 4,
          },
          "Great personal sales craft, less evidence of leading managers through scale."
        ),
      ]),
      stage(defaultStages[2], [
        reviewer(
          "Leo Morgan",
          "Founder",
          "Mixed",
          {
            "founder-fit": 3,
            culture: 2,
            strategy: 4,
            ambiguity: 3,
            "hiring-confidence": 3,
            "revenue-function": 2,
          },
          "Strong but may need a more structured environment than this client can offer."
        ),
      ]),
      stage(defaultStages[3]),
    ],
  },
];
