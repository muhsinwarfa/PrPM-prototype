import type { QuizQuestion, TourStep, WorkedHistoricalStep } from '../types/observatory';

export const GUIDED_TOUR_STEPS: TourStep[] = [
  {
    id: 'tour-lifecycle',
    stepNumber: 1,
    title: 'Textbook BPM Lifecycle',
    subtitle: 'Outer frame: Manage the process as a whole',
    targetCaseId: 'B',
    targetStaffN: 1,
    focusNodeIds: ['bpm-lifecycle', 'monitoring-bridge'],
    focusEdgeIds: ['edge-lifecycle-bridge', 'edge-bridge-track'],
    relationshipLabel: 'Monitoring insights inform process improvement & runtime control',
    explanation:
      'Start with familiar BPM: Identification, Discovery, Analysis, Redesign, Implementation, and Monitoring already include monitoring and corrective action over time. Prescriptive monitoring specializes that loop to influence individual running cases—without moving customers through management phases.',
    takeaway: 'Process owners improve the whole process; runtime control helps specific running cases.',
  },
  {
    id: 'tour-running-case',
    stepNumber: 2,
    title: 'Running Case & Observed Prefix',
    subtitle: 'Inner track: Case B has observed prefix K = 5',
    targetCaseId: 'B',
    targetStaffN: 1,
    focusNodeIds: ['loan-track', 'active-prefix', 'intervention-activity'],
    focusEdgeIds: ['edge-track-prefix'],
    relationshipLabel: 'Execution produces events → Observed history forms a prefix (length K)',
    explanation:
      'Cases A, B, and C are loan applications already underway. Case B is currently examined at K = 5 observed events—only history up to now, with zero future leakage. Preparing a second offer is a side activity that does not require redrawing the whole process.',
    takeaway: 'K is prefix length (events observed so far), never the case ID.',
  },
  {
    id: 'tour-prediction-insufficient',
    stepNumber: 3,
    title: 'Why Prediction Alone Is Insufficient',
    subtitle: 'Examining Case A: 90% risk, yet only +5pp benefit',
    targetCaseId: 'A',
    targetStaffN: 1,
    focusNodeIds: ['historical-workbench', 'sig-outcome-risk'],
    focusEdgeIds: ['edge-workbench-risk', 'edge-prefix-risk'],
    relationshipLabel: 'Historical prefixes train predictive model → Prefix informs OP',
    explanation:
      'Look at Case A on the Risk instrument: it has a 90% predicted rejection probability (OP). A naive alert-by-risk threshold would rush to help Case A. Yet high risk only warns us that Case A is likely to fail—not that sending a second offer will change its outcome (+5pp).',
    takeaway: 'A case can be very risky (Case A, 90%) without being worth intervening on.',
  },
  {
    id: 'tour-treatment-benefit',
    stepNumber: 4,
    title: 'Causal Treatment Benefit',
    subtitle: 'Examining Case B: 30% → 80% (+50pp causal lift)',
    targetCaseId: 'B',
    targetStaffN: 1,
    focusNodeIds: ['sig-treatment-effect', 'historical-workbench'],
    focusEdgeIds: ['edge-workbench-causal', 'edge-prefix-causal'],
    relationshipLabel: 'Causal model estimates counterfactual lift (TE)',
    explanation:
      'Now switch to Case B: the causal instrument compares two estimated alternatives—30% acceptance without a second offer vs. 80% with one (+50pp lift). Both alternatives cannot be observed simultaneously for the same case, and causal estimation relies on causal assumptions.',
    takeaway: 'Look for persuadable cases where the intervention shifts the outcome, not merely high risk.',
  },
  {
    id: 'tour-urgency',
    stepNumber: 5,
    title: 'Urgency & Intervention Window',
    subtitle: 'Examining Case B: Narrow 0.5–1.5h window vs. Case C (4–8h)',
    targetCaseId: 'B',
    targetStaffN: 1,
    focusNodeIds: ['urgency-window', 'active-prefix'],
    focusEdgeIds: ['edge-workbench-survival', 'edge-prefix-urgency'],
    relationshipLabel: 'Survival model estimates intervention window (IW)',
    explanation:
      'Both Case B and Case C offer +50pp estimated benefit. Yet survival analysis estimates Case B’s intervention window at 0.5–1.5h, compared with 4–8h for Case C—and much shorter than Case B’s 4–9h total remaining cycle time.',
    takeaway: 'A useful intervention still fails if the opportunity window closes before staff finish.',
  },
  {
    id: 'tour-uncertainty',
    stepNumber: 6,
    title: 'Visible Uncertainty: TU & Conformal Calibration',
    subtitle: 'Calibration tray → COP, CTE, CIW (for Case B)',
    targetCaseId: 'B',
    targetStaffN: 1,
    focusNodeIds: ['conformal-calibration', 'sig-outcome-risk', 'sig-treatment-effect', 'urgency-window'],
    focusEdgeIds: ['edge-workbench-calibration', 'edge-calibration-risk', 'edge-calibration-causal', 'edge-calibration-urgency'],
    relationshipLabel: 'Calibration data calibrate sets (COP) and intervals (CTE, CIW)',
    explanation:
      'Held-out calibration prefixes turn point predictions into conformal sets (COP) and intervals (CTE, CIW), while entropy TU measures outcome uncertainty. Calibration is a measuring procedure—not the decision maker—and nominal coverage is marginal across exchangeable cases, not a per-case guarantee.',
    takeaway: 'Uncertainty remains visible rather than hidden inside single numbers.',
  },
  {
    id: 'tour-capacity',
    stepNumber: 7,
    title: 'Scarce Staff Capacity',
    subtitle: 'Capacity: 1 free loan officer (n = 1, η = 100%)',
    targetCaseId: 'B',
    targetStaffN: 1,
    focusNodeIds: ['capacity-resources', 'intervention-activity'],
    focusEdgeIds: ['edge-track-capacity', 'edge-intervention-capacity'],
    relationshipLabel: 'An intervention occupies a resource & limits other cases',
    explanation:
      'With N = 1 loan officer, helping Case B drops free staff n from 1 to 0 (η drops from 100% to 0%) until the intervention duration finishes. Meanwhile active WIP stock and incoming flow λ compete for future capacity.',
    takeaway: 'Helping one case occupies capacity and blocks other cases until completion.',
  },
  {
    id: 'tour-decision',
    stepNumber: 8,
    title: 'The Dispatch Desk & Eight-Component State',
    subtitle: 'Sₜ = (COP, TU, CTE, CIW, n, η, WIP, λ) → 1 or 0',
    targetCaseId: 'B',
    targetStaffN: 1,
    focusNodeIds: ['decision-desk', 'sig-outcome-risk', 'sig-treatment-effect', 'urgency-window', 'capacity-resources'],
    focusEdgeIds: ['edge-risk-desk', 'edge-causal-desk', 'edge-urgency-desk', 'edge-capacity-desk', 'edge-desk-intervention'],
    relationshipLabel: 'Model outputs & capacity update Sₜ → Policy chooses 1 or 0',
    explanation:
      'The policy reads all eight state components for Case B and chooses a binary action: 1 (Intervene now) or 0 (Do not intervene now). Choosing 0 can leave a later chance open if the window holds, though it never guarantees one.',
    takeaway: 'Evidence and resource constraints combine at the desk into one binary decision.',
  },
  {
    id: 'tour-learning',
    stepNumber: 9,
    title: 'Feedback Ledger & Policy Learning (PPO)',
    subtitle: 'Observe → Act → Env changes → Outcome & Reward → Update policy',
    targetCaseId: 'B',
    targetStaffN: 1,
    focusNodeIds: ['feedback-ledger', 'decision-desk'],
    focusEdgeIds: ['edge-desk-feedback', 'edge-feedback-desk'],
    relationshipLabel: 'Feedback updates the policy (separate from model calibration)',
    explanation:
      'When an intervention or waiting period completes and an outcome is observed, the feedback ledger separates shaped RL training signals from evaluated business gain. PPO updates the policy to weigh opportunity cost—distinct from offline fitting/calibration of the three supporting models.',
    takeaway: 'PPO learns from delayed consequences when waiting protects capacity for better opportunities.',
  },
  {
    id: 'tour-recap',
    stepNumber: 10,
    title: 'Whole-System Recap',
    subtitle: 'Two loops working at two timescales',
    targetCaseId: 'B',
    targetStaffN: 1,
    focusNodeIds: [
      'bpm-lifecycle',
      'loan-track',
      'historical-workbench',
      'sig-outcome-risk',
      'sig-treatment-effect',
      'urgency-window',
      'capacity-resources',
      'decision-desk',
      'feedback-ledger',
    ],
    focusEdgeIds: [],
    relationshipLabel: 'All landmarks connected: Process governance + Runtime prescription',
    explanation:
      'Historical logs train and calibrate Significance and Urgency instruments; live monitoring tracks Capacity; the Dispatch Desk weighs all eight components for a binary action; Feedback refines the policy; and aggregate Monitoring informs BPM Redesign.',
    takeaway: 'A sound intervention is worthwhile, timely, confident enough, and feasible with today’s staff.',
  },
];

export const WORKED_HISTORICAL_TRACE: {
  traceId: string;
  splitAssignment: string;
  finalOutcome: string;
  steps: WorkedHistoricalStep[];
} = {
  traceId: 'Historical Trace #H-104 (Completed Loan Application)',
  splitAssignment: 'Training Split (all prefixes K = 2..5 from #H-104 stay in Training — zero leakage)',
  finalOutcome: '2nd offer sent → Loan Accepted (+60 value, −25 cost)',
  steps: [
    {
      k: 2,
      observedEvents: ['e1: Application received (09:00)', 'e2: Credit screening (09:20)'],
      excludedFutureEvents: [
        'e3: Assessment completed (09:50)',
        'e4: First offer sent (10:15)',
        'e5: Customer portal revisit (11:00)',
        'e6: 2nd offer sent & Accepted (12:40)',
      ],
      encodedFeatures: {
        elapsedMinutes: 20,
        riskFlags: 1,
        firstOfferSent: false,
        portalViews: 0,
      },
      predictiveAnswer: 'Early baseline risk only (OP ≈ 65%, high uncertainty TU).',
      causalAnswer: '2nd-offer treatment effect not open yet (first offer not sent).',
      survivalAnswer: 'Intervention window has not opened yet.',
    },
    {
      k: 3,
      observedEvents: [
        'e1: Application received (09:00)',
        'e2: Credit screening (09:20)',
        'e3: Assessment completed (09:50)',
      ],
      excludedFutureEvents: [
        'e4: First offer sent (10:15)',
        'e5: Customer portal revisit (11:00)',
        'e6: 2nd offer sent & Accepted (12:40)',
      ],
      encodedFeatures: {
        elapsedMinutes: 50,
        riskFlags: 1,
        firstOfferSent: false,
        portalViews: 0,
      },
      predictiveAnswer: 'Moderate-high rejection risk (OP ≈ 68%).',
      causalAnswer: 'Waiting for first offer before 2nd-offer causal lift applies.',
      survivalAnswer: 'Expected offer preparation time remaining.',
    },
    {
      k: 4,
      observedEvents: [
        'e1: Application received (09:00)',
        'e2: Credit screening (09:20)',
        'e3: Assessment completed (09:50)',
        'e4: First offer sent (10:15)',
      ],
      excludedFutureEvents: [
        'e5: Customer portal revisit (11:00)',
        'e6: 2nd offer sent & Accepted (12:40)',
      ],
      encodedFeatures: {
        elapsedMinutes: 75,
        riskFlags: 1,
        firstOfferSent: true,
        portalViews: 0,
      },
      predictiveAnswer: 'OP = 70% rejection risk (TU = 0.88 bits).',
      causalAnswer: 'Estimated treatment lift TE = +45pp if 2nd offer is sent.',
      survivalAnswer: 'Estimated intervention window IW ≈ 1.5–2.5h.',
    },
    {
      k: 5,
      observedEvents: [
        'e1: Application received (09:00)',
        'e2: Credit screening (09:20)',
        'e3: Assessment completed (09:50)',
        'e4: First offer sent (10:15)',
        'e5: Customer portal revisit (11:00)',
      ],
      excludedFutureEvents: ['e6: 2nd offer sent & Accepted (12:40)'],
      encodedFeatures: {
        elapsedMinutes: 120,
        riskFlags: 1,
        firstOfferSent: true,
        portalViews: 2,
      },
      predictiveAnswer: 'OP = 70% rejection risk; portal revisits confirm hesitation.',
      causalAnswer: 'TE rises to +50pp (30% → 80% acceptance with 2nd offer).',
      survivalAnswer: 'Window narrows sharply: IW ≈ 0.5–1.5h before customer walks away.',
    },
  ],
};

export const CHECK_UNDERSTANDING_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    question: '1. Why might we skip the riskiest case?',
    choices: [
      'Because riskier cases are always too late to finish the process',
      'Because high failure risk does not prove our specific intervention will improve the outcome',
      'Because predictive models cannot estimate probabilities above 85%',
    ],
    recommendedIndex: 1,
    explanation:
      'Case A has a 90% predicted rejection risk, yet sending a second offer adds only +5 percentage points. Spending our only free officer on a low-benefit case wastes scarce capacity that could transform Case B (+50pp).',
    relatedConceptId: 'sig-treatment-effect',
  },
  {
    id: 'q2',
    question: '2. Why do we need a causal model as well as a predictive model?',
    choices: [
      'To estimate how much the intervention changes success probability compared with not intervening',
      'To replace event-log prefixes with shorter case identifiers',
      'To guarantee 100% acceptance whenever a worker becomes busy',
    ],
    recommendedIndex: 0,
    explanation:
      'A predictive model estimates what happens under status-quo behavior (OP). A causal model estimates the counterfactual difference (TE) between treating and not treating the same case, under appropriate causal assumptions.',
    relatedConceptId: 'sig-treatment-effect',
  },
  {
    id: 'q3',
    question: '3. What can a conformal interval tell us, and what can it not promise?',
    choices: [
      'It promises a guaranteed deadline for every single individual case',
      'It chooses Action 1 or Action 0 automatically without a policy',
      'It expresses marginal uncertainty across exchangeable cases, without eliminating uncertainty or guaranteeing an individual case',
    ],
    recommendedIndex: 2,
    explanation:
      'Conformal prediction translates calibration errors into sets (COP) and intervals (CTE, CIW) with marginal coverage guarantees under assumptions like exchangeability. It does not guarantee any single case, reveal a hard deadline, or replace the intervention policy.',
    relatedConceptId: 'conformal-calibration',
  },
  {
    id: 'q4',
    question: '4. How does helping one case affect other cases?',
    choices: [
      'It occupies a finite officer slot until finished, lowering n and η and creating opportunity cost for concurrent or arriving cases',
      'It permanently deletes waiting cases from WIP',
      'It speeds up incoming arrival rate λ automatically',
    ],
    recommendedIndex: 0,
    explanation:
      'With N = 1 free officer, starting an intervention drops free staff n from 1 to 0 (η = 0%). Until that intervention finishes, no other running or arriving case can receive help.',
    relatedConceptId: 'capacity-resources',
  },
  {
    id: 'q5',
    question: '5. How does runtime intervention differ from process redesign?',
    choices: [
      'Runtime intervention animates customers through Discovery and Analysis',
      'Process redesign modifies the overall process structure across cycles, whereas runtime intervention influences an ongoing case within the current process',
      'They are identical; sending a second offer redraws the entire BPMN model',
    ],
    recommendedIndex: 1,
    explanation:
      'Process redesign (outer BPM lifecycle) alters process rules, roles, or paths for future cases as a whole. Runtime intervention (inner track) acts selectively on a live case using a side activity without redesigning the process.',
    relatedConceptId: 'bpm-lifecycle',
  },
];

export const STUDY_EVIDENCE_SECTIONS = [
  {
    title: 'Event Logs & Interventions Evaluated in Shoush & Dumas (v1 2023 / v2 2024)',
    summary:
      'The paper evaluates its framework on three real-world public event logs inside simulated online evaluation environments with finite resources and intervention durations:',
    items: [
      {
        name: 'BPIC2012 (Loan Application Process)',
        detail:
          'Consumer loan applications at a Dutch financial institution. Intervention: sending an additional loan offer (2nd offer) to increase acceptance likelihood while consuming officer capacity.',
      },
      {
        name: 'BPIC2017 (Expanded Loan Application Process)',
        detail:
          'Larger loan origination log from the same banking domain with multi-offer trajectories. Intervention: creating/sending an additional loan offer.',
      },
      {
        name: 'TrafficFines (Road Traffic Fine Management)',
        detail:
          'High-volume public administration log tracking traffic fine notifications, payments, and escalations. Intervention: triggering a collection/reminder action to resolve unpaid fines before costly escalation.',
      },
    ],
  },
  {
    title: 'Empirical Findings & Qualifications (Revised 2024 Version, arXiv:2307.06564v2)',
    summary:
      'Because the full paper PDF/tables are not bundled in this app’s local assets, exact monetary gain numbers and episode counts are withheld rather than interpolated. Below is what the revised 2024 evaluation reports conceptually under its experimental assumptions:',
    items: [
      {
        name: 'RL Baselines (BL1 & BL2) vs. Simple Thresholds',
        detail:
          'In arXiv:2307.06564v2 (Evaluation), the proposed uncertainty-aware PPO agent is compared against RL-based baselines (BL1 and BL2) rather than only fixed-threshold rules. A fixed threshold is shown in this app purely as a teaching comparator.',
      },
      {
        name: 'Resource Scarcity & Dataset Nuances',
        detail:
          'Uncertainty and capacity signals help PPO balance immediate gain against opportunity cost when resources are tight—though v2 also documents important limitations, including comparable performance to baselines on TrafficFines in some configurations and unstable positive-gain behavior in some BPIC2017 settings.',
      },
      {
        name: 'Delayed Feedback & Reward Shaping',
        detail:
          'The paper uses shaped, conditional training rewards (separate from final evaluated net business gain) so PPO can learn despite delayed case outcomes and capacity contention across episodes, without claiming guaranteed global optimality.',
      },
    ],
  },
];

export const VERIFIED_SOURCES = [
  {
    title:
      'Shoush & Dumas (2023 Preprint) — Prescriptive Process Monitoring Under Resource Constraints: A Reinforcement Learning Approach',
    citation: 'arXiv:2307.06564v1',
    url: 'https://arxiv.org/abs/2307.06564v1',
    status: 'External primary reference (preprint)',
  },
  {
    title:
      'Shoush & Dumas (2024 Revised Version) — Prescriptive Process Monitoring Under Resource Constraints: A Reinforcement Learning Approach',
    citation: 'arXiv:2307.06564v2',
    url: 'https://arxiv.org/abs/2307.06564v2',
    status: 'External primary reference (revised evaluation with BL1/BL2 baselines)',
  },
  {
    title:
      'Angelopoulos & Bates (2021) — A Gentle Introduction to Conformal Prediction and Distribution-Free Uncertainty Quantification',
    citation: 'arXiv:2107.07511',
    url: 'https://arxiv.org/abs/2107.07511',
    status: 'External conformal prediction reference',
  },
  {
    title:
      'Dumas, La Rosa, Mendling & Reijers (2018) — Fundamentals of Business Process Management (2nd Edition)',
    citation: 'Springer, 2018',
    url: '',
    status: 'Textbook reference (BPM lifecycle, monitoring & corrective action, Little’s Law; chapter/page numbers omitted without attached text)',
  },
];
