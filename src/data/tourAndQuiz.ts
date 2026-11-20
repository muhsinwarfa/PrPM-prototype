import type { QuizQuestion, TourStep } from '../types/observatory';

export const GUIDED_TOUR_STEPS: TourStep[] = [
  {
    id: 'tour-lifecycle',
    stepNumber: 1,
    title: 'Textbook BPM Lifecycle',
    subtitle: 'Outer frame: Manage the process as a whole',
    focusNodeIds: ['bpm-lifecycle', 'monitoring-bridge'],
    focusEdgeIds: ['edge-lifecycle-bridge', 'edge-bridge-track'],
    relationshipLabel: 'Monitoring insights inform process improvement & runtime control',
    explanation:
      'Start with familiar BPM: Identification, Discovery, Analysis, Redesign, Implementation, and Monitoring manage the process over time. Prescriptive monitoring attaches to Monitoring to influence individual cases while they are still running—without turning customer applications into lifecycle steps.',
    takeaway: 'Process owners improve the whole process; runtime control helps specific running cases.',
  },
  {
    id: 'tour-running-case',
    stepNumber: 2,
    title: 'Running Case & Observed Prefix',
    subtitle: 'Inner track: Execution produces events up to length K',
    focusNodeIds: ['loan-track', 'active-prefix', 'intervention-activity'],
    focusEdgeIds: ['edge-track-prefix'],
    relationshipLabel: 'Execution produces events → Observed history forms a prefix (length K)',
    explanation:
      'Cases A, B, and C are loan applications already underway. Clicking a case reveals its prefix—only events observed up to the current decision point (length K), with no future leakage. An intervention means preparing a second offer as a side activity.',
    takeaway: 'K is prefix length (how many events we have seen so far), never the case ID.',
  },
  {
    id: 'tour-prediction-insufficient',
    stepNumber: 3,
    title: 'Why Prediction Alone Is Insufficient',
    subtitle: 'Historical workbench → Predictive model (OP)',
    focusNodeIds: ['historical-workbench', 'sig-outcome-risk'],
    focusEdgeIds: ['edge-workbench-risk', 'edge-prefix-risk'],
    relationshipLabel: 'Historical prefixes train predictive model → Prefix informs OP',
    explanation:
      'Case A has a 90% predicted probability of rejection (OP). A naive alert-by-risk rule would rush to help Case A. Yet high risk only tells us what is likely to go wrong—not whether our second offer can actually fix it.',
    takeaway: 'A case can be very risky without being worth intervening on.',
  },
  {
    id: 'tour-treatment-benefit',
    stepNumber: 4,
    title: 'Causal Treatment Benefit',
    subtitle: 'Significance: What changes if we intervene?',
    focusNodeIds: ['sig-treatment-effect', 'historical-workbench'],
    focusEdgeIds: ['edge-workbench-causal', 'edge-prefix-causal'],
    relationshipLabel: 'Causal model estimates counterfactual lift (TE)',
    explanation:
      'The causal model compares two estimated alternatives for the same case: success without a second offer vs. success with one. For Case B, acceptance rises from 30% to 80% (+50pp), whereas Case A gains only +5pp. Both counterfactuals cannot be observed simultaneously.',
    takeaway: 'Look for cases where the intervention changes the outcome, not merely high risk.',
  },
  {
    id: 'tour-urgency',
    stepNumber: 5,
    title: 'Urgency & Intervention Window',
    subtitle: 'Urgency: How long can we still act?',
    focusNodeIds: ['urgency-window', 'active-prefix'],
    focusEdgeIds: ['edge-workbench-survival', 'edge-prefix-urgency'],
    relationshipLabel: 'Survival model estimates intervention window (IW)',
    explanation:
      'Both Case B and Case C show +50pp estimated benefit. But survival analysis estimates Case B’s intervention window at 0.5–1.5 hours, while Case C has 4–8 hours. This window is narrower than ordinary remaining cycle time.',
    takeaway: 'A useful intervention can still arrive too late if the window closes first.',
  },
  {
    id: 'tour-uncertainty',
    stepNumber: 6,
    title: 'Visible Uncertainty: TU & Conformal Calibration',
    subtitle: 'Calibration tray → COP, CTE, CIW',
    focusNodeIds: ['conformal-calibration', 'sig-outcome-risk', 'sig-treatment-effect', 'urgency-window'],
    focusEdgeIds: ['edge-workbench-calibration', 'edge-calibration-risk', 'edge-calibration-causal', 'edge-calibration-urgency'],
    relationshipLabel: 'Calibration data calibrate sets (COP) and intervals (CTE, CIW)',
    explanation:
      'Separate calibration prefixes turn point predictions into conformal sets (COP) and intervals (CTE, CIW), while entropy TU measures predictive uncertainty. Calibration is a measuring procedure—not the decision maker—and nominal coverage is marginal across cases, not a per-case guarantee.',
    takeaway: 'Uncertainty remains visible rather than hidden inside single numbers.',
  },
  {
    id: 'tour-capacity',
    stepNumber: 7,
    title: 'Scarce Staff Capacity',
    subtitle: 'Capacity: n, η, WIP, and arrival rate λ',
    focusNodeIds: ['capacity-resources', 'intervention-activity'],
    focusEdgeIds: ['edge-track-capacity', 'edge-intervention-capacity'],
    relationshipLabel: 'An intervention occupies a resource & limits other cases',
    explanation:
      'With N = 1 loan officer, helping Case A, B, or C drops free staff n from 1 to 0 (η = n/N drops from 100% to 0%). Meanwhile WIP (active stock) and λ (incoming arrival flow) compete for that officer’s future hours.',
    takeaway: 'Helping one case right now prevents helping another until the worker finishes.',
  },
  {
    id: 'tour-decision',
    stepNumber: 8,
    title: 'The Dispatch Desk & Eight-Component State',
    subtitle: 'Sₜ = (COP, TU, CTE, CIW, n, η, WIP, λ) → 1 or 0',
    focusNodeIds: ['decision-desk', 'sig-outcome-risk', 'sig-treatment-effect', 'urgency-window', 'capacity-resources'],
    focusEdgeIds: ['edge-risk-desk', 'edge-causal-desk', 'edge-urgency-desk', 'edge-capacity-desk', 'edge-desk-intervention'],
    relationshipLabel: 'Model outputs & capacity update Sₜ → Policy chooses 1 or 0',
    explanation:
      'The policy receives all eight state components and chooses a binary action for the currently considered case: 1 (Intervene now) or 0 (Do not intervene now). Choosing 0 may leave a later chance open if the window holds, though it never guarantees one.',
    takeaway: 'Evidence and resource constraints combine at the desk into one binary decision.',
  },
  {
    id: 'tour-learning',
    stepNumber: 9,
    title: 'Feedback Ledger & Policy Learning (PPO)',
    subtitle: 'Observe → Act → Environment changes → Reward → Update policy',
    focusNodeIds: ['feedback-ledger', 'decision-desk'],
    focusEdgeIds: ['edge-desk-feedback', 'edge-feedback-desk'],
    relationshipLabel: 'Feedback updates the policy (separate from model calibration)',
    explanation:
      'After actions play out, the feedback ledger separates shaped training rewards from evaluated business gain. PPO updates the policy to balance immediate gain against opportunity cost—keeping policy learning separate from fitting the predictive, causal, and survival models.',
    takeaway: 'PPO teaches the policy when waiting saves scarce capacity for better opportunities.',
  },
  {
    id: 'tour-recap',
    stepNumber: 10,
    title: 'Whole-System Recap',
    subtitle: 'Two loops working at two timescales',
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
      'You can now trace the full observatory: historical logs train and calibrate Significance and Urgency instruments; live capacity tracks Capacity; the Decision Desk weighs all eight components for a binary action; Feedback refines the policy; and aggregate Monitoring informs BPM Redesign.',
    takeaway: 'A good decision is worthwhile, timely, confident enough, and feasible with today’s staff.',
  },
];

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
    title: 'Event Logs Evaluated in the Paper',
    summary:
      'Shoush & Dumas evaluate their framework on three real-world public benchmark logs from process mining, constructing simulated online evaluation environments with realistic intervention costs, outcomes, and resource limits:',
    items: [
      {
        name: 'BPIC2012 (Loan Application Process)',
        detail:
          'Consumer loan applications at a Dutch financial institution. Interventions correspond to sending an additional loan offer (creating/communicating a second offer) to improve acceptance likelihood.',
      },
      {
        name: 'BPIC2017 (Expanded Loan Application Process)',
        detail:
          'Larger, richer loan origination log from the same banking domain with multiple offers, customer responses, and cancellations.',
      },
      {
        name: 'TrafficFines (Road Traffic Fine Management)',
        detail:
          'Public administration process tracking fine notifications, payments, and appeals—demonstrating the approach outside banking.',
      },
    ],
  },
  {
    title: 'Core Conceptual Findings (Under Study Assumptions)',
    summary:
      'Note: Specific numerical monetary totals and episode convergence counts vary across versions and experimental configurations; because the full paper PDF is not attached here, exact benchmark figures are intentionally withheld rather than guessed.',
    items: [
      {
        name: 'Resource Scarcity Changes Optimal Decisions',
        detail:
          'When staff capacity N is tight relative to arrival flow λ and WIP, policies that intervene purely on risk or naive expected value exhaust staff early and miss higher-leverage cases later.',
      },
      {
        name: 'Uncertainty-Aware RL Outperforms Myopic Thresholds',
        detail:
          'Under the study’s simulation assumptions, feeding conformal uncertainty (COP, CTE, CIW) and entropy (TU) alongside capacity signals (n, η, WIP, λ) into PPO yielded higher evaluated net gain than fixed-threshold baselines—without claiming global optimality.',
      },
      {
        name: 'Learning Speed & Reward Shaping',
        detail:
          'Shoush & Dumas use shaped, conditional training rewards (distinct from final evaluated business gain) to help PPO converge more reliably when intervention feedback is delayed and resource contention couples decisions across time.',
      },
    ],
  },
];

export const VERIFIED_SOURCES = [
  {
    title: 'Shoush & Dumas (2023 Preprint) — Prescriptive Process Monitoring Under Resource Constraints: A Reinforcement Learning Approach',
    citation: 'arXiv:2307.06564v1',
    url: 'https://arxiv.org/abs/2307.06564v1',
    status: 'Primary source (link verified; exact tables not attached locally)',
  },
  {
    title: 'Shoush & Dumas (2024 Revised Version) — Prescriptive Process Monitoring Under Resource Constraints: A Reinforcement Learning Approach',
    citation: 'arXiv:2307.06564v2',
    url: 'https://arxiv.org/abs/2307.06564v2',
    status: 'Primary source (link verified; exact tables not attached locally)',
  },
  {
    title: 'Angelopoulos & Bates (2021) — A Gentle Introduction to Conformal Prediction and Distribution-Free Uncertainty Quantification',
    citation: 'arXiv:2107.07511',
    url: 'https://arxiv.org/abs/2107.07511',
    status: 'Conformal prediction reference (link verified)',
  },
  {
    title: 'Dumas, La Rosa, Mendling & Reijers (2018) — Fundamentals of Business Process Management (2nd Edition)',
    citation: 'Springer, 2018',
    url: '',
    status: 'Textbook anchor (chapter/page numbers omitted because textbook text is not attached)',
  },
];
