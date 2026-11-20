import type { ConceptNode } from '../types/observatory';

export const CONCEPT_NODES: ConceptNode[] = [
  {
    id: 'bpm-lifecycle',
    plainTitle: 'Improve the process over time',
    technicalLabel: 'BPM Lifecycle (Outer Frame)',
    symbol: 'BPM',
    group: 'outer-lifecycle',
    badge: 'Textbook anchor',
    analogyBoundary:
      'The outer frame depicts managing the process as a whole, never the path of an individual customer loan application.',
    anchor: { x: 800, y: 58 },
    overviewLandmark: true,
    oneSentence:
      'The continuous management cycle—Identification, Discovery, Analysis, Redesign, Implementation, and Monitoring—used to keep an entire business process healthy.',
    bpmConnection:
      'Directly mirrors the classic BPM lifecycle from Dumas et al. (2018), where process owners diagnose bottlenecks and redesign rules between cycles.',
    receives: 'Process performance insights and operational drift detected during Monitoring.',
    produces: 'Updated process designs, business rules, and runtime monitoring targets.',
    whyNeeded:
      'Runtime case interventions work within an existing process design; structural flaws still require process-level redesign.',
    avoidMisunderstanding:
      'Do not animate or trace a customer case through these six phases. Customers move along the inner execution track, while process owners manage the outer lifecycle.',
    keepSeparate: {
      title: 'Process-level governance vs. case-level action',
      detail:
        'A process owner’s responsibilities—governance, compliance, staffing strategy, and structural redesign—extend far beyond the single dispatch decision supported by prescriptive monitoring.',
    },
    sourceRef: {
      label: 'Dumas, La Rosa, Mendling & Reijers (2018), Fundamentals of BPM, 2nd ed.',
    },
  },
  {
    id: 'monitoring-bridge',
    plainTitle: 'Bridge from monitoring to live action',
    technicalLabel: 'Process Monitoring → Runtime Control',
    group: 'outer-lifecycle',
    badge: 'Textbook anchor',
    anchor: { x: 1320, y: 120 },
    oneSentence:
      'Specializes the textbook BPM monitoring and corrective-action loop to intervene on individual running cases.',
    bpmConnection:
      'The BPM textbook already covers process monitoring and corrective action; prescriptive monitoring extends that loop down to case-level runtime triggers.',
    receives: 'Performance alerts and operational objectives from the BPM Monitoring phase.',
    produces: 'Runtime triggers that evaluate whether an ongoing case should receive an intervention now.',
    whyNeeded:
      'BPM manages the process over time; prescriptive monitoring adds a targeted way to influence cases while they are still running.',
    avoidMisunderstanding:
      'Prescriptive monitoring does not replace process monitoring or redesign—it is a specialized runtime extension of monitoring.',
    sourceRef: {
      label: 'Shoush & Dumas (2023/2024), Section 1–2',
      url: 'https://arxiv.org/abs/2307.06564v2',
    },
  },
  {
    id: 'loan-track',
    plainTitle: 'Help a running loan application',
    technicalLabel: 'Process Execution Track (Runtime)',
    symbol: 'BPMN',
    group: 'inner-track',
    badge: 'Textbook anchor',
    analogyBoundary:
      'Showing one piece per case is a teaching simplification; real BPMN execution tracks tokens that can split and multiply across parallel gateways.',
    anchor: { x: 1085, y: 205 },
    overviewLandmark: true,
    oneSentence:
      'The operational sequence where individual loan applications move from receipt through assessment and offer toward acceptance or rejection.',
    bpmConnection:
      'Represents a single process model executing many concurrent process instances (cases) at once.',
    receives: 'Incoming loan applications (arrival flow λ) and staff capacity.',
    produces: 'Timestamped execution events for every activity performed on each case.',
    whyNeeded:
      'Interventions only matter because cases are actively underway and have not yet reached a final outcome.',
    avoidMisunderstanding:
      'An intervention side activity (sending a second offer) does not require redrawing the entire process diagram.',
    keepSeparate: {
      title: 'Single-piece marker vs. BPMN tokens',
      detail:
        'In BPMN, execution state is carried by tokens that can multiply under parallel gateways (AND-splits). Here each case piece summarizes a case’s current position for clarity.',
    },
    sourceRef: {
      label: 'Dumas et al. (2018), BPMN execution & process instances',
    },
  },
  {
    id: 'active-prefix',
    plainTitle: 'What has happened in this case so far',
    technicalLabel: 'Active Case & Observed Prefix',
    symbol: 'K',
    group: 'inner-track',
    badge: 'Research concept',
    anchor: { x: 1085, y: 278 },
    oneSentence:
      'The sequence of events already observed for a running loan application up to the current decision point, with length K.',
    bpmConnection:
      'Corresponds to a partial process instance trace recorded in an event log before the case finishes.',
    receives: 'Completed activities and timestamps produced as the case advances along the track.',
    produces: 'Encoded prefix features fed into the predictive, causal, and survival instruments.',
    whyNeeded:
      'At decision time, we can only rely on history observed up to now—never future events or the final outcome.',
    avoidMisunderstanding:
      'K stands for prefix length (the number of observed events so far), not the case ID or customer identifier.',
    keepSeparate: {
      title: 'Observed prefix vs. completed trace',
      detail:
        'A live prefix stops at event K. Future events and final acceptance/rejection outcomes must never leak into live prefix features.',
    },
    technicalDetail:
      'Given an ongoing trace σ = ⟨e₁, e₂, ..., eₙ⟩, at decision step K < n the available prefix is hdᴷ(σ) = ⟨e₁, ..., e_K⟩.',
    sourceRef: {
      label: 'Shoush & Dumas (2024), Problem Formulation',
      url: 'https://arxiv.org/abs/2307.06564v2',
    },
  },
  {
    id: 'intervention-activity',
    plainTitle: 'Prepare & send a second offer',
    technicalLabel: 'Runtime Intervention Activity',
    symbol: 't = 1',
    group: 'inner-track',
    badge: 'Textbook anchor',
    anchor: { x: 1365, y: 315 },
    oneSentence:
      'An optional side activity attached to a running case—such as crafting a tailored second loan offer—that consumes a loan officer’s time to improve acceptance odds.',
    bpmConnection:
      'Works like an optional conditional task or escalation path in BPM that triggers only when prescribed, leaving the main process backbone intact.',
    receives: 'An Action = 1 dispatch decision and 1 free loan officer from Capacity.',
    produces: 'Updated case trajectory (potentially higher acceptance chance) and occupied resource time.',
    whyNeeded:
      'Without an actionable side step, predictions would only observe trouble without offering a lever to change the outcome.',
    avoidMisunderstanding:
      'Executing the intervention does not guarantee success; outcomes remain probabilistic.',
    sourceRef: {
      label: 'Shoush & Dumas (2024), Loan Offer Intervention (BPIC2012/2017)',
      url: 'https://arxiv.org/abs/2307.06564v2',
    },
  },
  {
    id: 'historical-workbench',
    plainTitle: 'Learn from past completed cases',
    technicalLabel: 'Historical Records Workbench (Offline)',
    group: 'historical-workbench',
    badge: 'Research concept',
    anchor: { x: 350, y: 265 },
    overviewLandmark: true,
    oneSentence:
      'The offline preparation bench where completed event-log traces are cut into prefixes, split cleanly into training, calibration, and held-out evaluation trays, and used to build the three models.',
    bpmConnection:
      'Starts from the same historical BPM event logs used in process mining and discovery.',
    receives: 'Completed historical traces with known actions and final outcomes.',
    produces: 'Trained predictive, causal, and survival models plus calibrated conformal thresholds.',
    whyNeeded:
      'The runtime instruments cannot guess risk, benefit, or urgency from scratch—they must first learn patterns from past cases without data leakage.',
    avoidMisunderstanding:
      'All prefixes from the same historical case must stay within the same split (train, calibration, or evaluation) so future knowledge never leaks.',
    keepSeparate: {
      title: 'Offline model workbench vs. online policy learning',
      detail:
        'Training and conformal calibration of the three supporting models happen on this historical workbench, visually and procedurally separate from live PPO policy updates.',
    },
    sourceRef: {
      label: 'Shoush & Dumas (2024), Offline Training & Calibration',
      url: 'https://arxiv.org/abs/2307.06564v2',
    },
  },
  {
    id: 'conformal-calibration',
    plainTitle: 'Measure how wide the uncertainty bands should be',
    technicalLabel: 'Conformal Calibration Tray',
    symbol: 'COP · CTE · CIW',
    group: 'historical-workbench',
    badge: 'Research concept',
    anchor: { x: 525, y: 405 },
    oneSentence:
      'An attached calibration procedure on held-out calibration prefixes that turns single model point estimates into outcome sets and uncertainty intervals.',
    bpmConnection:
      'Similar to benchmarking historical forecast errors before trusting a process dashboard estimate.',
    receives: 'Held-out calibration prefixes and raw model outputs (OP, TE, IW).',
    produces: 'Calibrated prediction set COP, treatment-effect interval CTE, and window interval CIW.',
    whyNeeded:
      'A raw point estimate like “70% risk” or “+50pp benefit” hides how wrong the model could be on a given case.',
    avoidMisunderstanding:
      'Conformal calibration is a measuring procedure, not a decision maker. It expresses uncertainty rather than eliminating it or choosing actions.',
    keepSeparate: {
      title: 'Marginal coverage vs. per-case guarantee',
      detail:
        'Standard conformal coverage (e.g. nominal 90%) is marginal across exchangeable cases, not a guarantee for every individual case. Causal and survival settings require additional assumptions.',
    },
    technicalDetail:
      'Using nonconformity scores on a separate calibration split, conformal prediction forms sets/intervals with finite-sample marginal coverage guarantees under exchangeability (Angelopoulos & Bates, 2021).',
    sourceRef: {
      label: 'Angelopoulos & Bates (2021), A Gentle Introduction to Conformal Prediction',
      url: 'https://arxiv.org/abs/2107.07511',
    },
  },
  {
    id: 'sig-outcome-risk',
    plainTitle: 'How likely is an undesirable outcome?',
    technicalLabel: 'Predictive Model & Uncertainty (OP, COP, TU)',
    symbol: 'OP · COP · TU',
    group: 'significance',
    badge: 'Research concept',
    anchor: { x: 350, y: 615 },
    overviewLandmark: true,
    oneSentence:
      'Estimates the probability of rejection (OP), the set of plausible outcomes (COP), and the model’s prediction uncertainty (TU) from the current prefix.',
    bpmConnection:
      'Extends predictive process monitoring (early warning indicators in BPM) by adding explicit uncertainty signals.',
    receives: 'Encoded observed prefix of the currently examined running case.',
    produces: 'Negative-outcome probability OP, conformal outcome set COP, and entropy-based uncertainty TU.',
    whyNeeded:
      'Identifies whether a case is heading toward trouble—and how confident the predictive model actually is.',
    avoidMisunderstanding:
      'Do not confuse three distinct quantities: (1) historical process failure rate across all past loans, (2) a model’s overall prediction error rate on held-out cases, and (3) this case’s predicted risk OP. Also, a COP set containing both outcomes does not mandate “never intervene.”',
    keepSeparate: {
      title: 'Prediction of failure vs. evidence help will work',
      detail:
        'Case A has a 90% predicted rejection probability, yet sending a second offer barely helps (+5pp). High risk alone never justifies spending scarce staff time.',
    },
    technicalDetail:
      'TU is computed as the Shannon entropy of the mean predicted outcome probability: H(OP) = −[OP·log₂(OP) + (1−OP)·log₂(1−OP)]. COP can hold {Accepted}, {Rejected}, {Accepted, Rejected}, or {}.',
    equation: 'TU = −(OP·log₂ OP + (1 − OP)·log₂(1 − OP))',
    sourceRef: {
      label: 'Shoush & Dumas (2024), Predictive & Conformal Components',
      url: 'https://arxiv.org/abs/2307.06564v2',
    },
  },
  {
    id: 'sig-treatment-effect',
    plainTitle: 'How much could this intervention improve the outcome?',
    technicalLabel: 'Causal Treatment Effect (TE & CTE)',
    symbol: 'TE · CTE',
    group: 'significance',
    badge: 'Research concept',
    anchor: { x: 615, y: 615 },
    overviewLandmark: true,
    oneSentence:
      'Estimates the difference in acceptance probability with vs. without sending a second offer (TE), paired with a calibrated interval (CTE).',
    bpmConnection:
      'Answers the process improvement question “does this corrective action actually change the outcome?” rather than merely flagging a troubled case.',
    receives: 'Encoded case prefix and causal model trained on historical treated and untreated cases.',
    produces: 'Estimated treatment-effect point estimate TE and conformal interval CTE.',
    whyNeeded:
      'Distinguishes “lost causes” (high risk, tiny benefit) from “persuadable cases” where an offer genuinely shifts the outcome.',
    avoidMisunderstanding:
      'Estimated treatment effects require causal assumptions (such as unconfoundedness/overlap); ordinary observed correlation is insufficient, and both counterfactual outcomes cannot be observed for the same case.',
    keepSeparate: {
      title: 'Estimated counterfactuals vs. observed correlation',
      detail:
        'In practice, loan officers may historically send second offers to specific types of applicants. The causal model adjusts for confounding rather than assuming raw acceptance rates equal intervention lift.',
    },
    technicalDetail:
      'ITE / CATE estimates E[Y(1) − Y(0) | X = x], comparing estimated success probability under intervention (e.g., 80%) vs. no intervention (e.g., 30% → +50pp lift).',
    equation: 'TE(x) = P(Accept | do(t=1), x) − P(Accept | do(t=0), x)',
    sourceRef: {
      label: 'Shoush & Dumas (2024), Causal Effect Estimation',
      url: 'https://arxiv.org/abs/2307.06564v2',
    },
  },
  {
    id: 'urgency-window',
    plainTitle: 'How long can we still act?',
    technicalLabel: 'Survival Model & Intervention Window (IW, CIW)',
    symbol: 'IW · CIW',
    group: 'urgency',
    badge: 'Research concept',
    anchor: { x: 880, y: 615 },
    overviewLandmark: true,
    oneSentence:
      'Estimates the remaining window during which an intervention can still take place and influence the outcome (IW), plus a calibrated uncertainty band (CIW).',
    bpmConnection:
      'Differs from textbook remaining cycle time estimation: a case might take days to finish overall while its decision window closes in under an hour.',
    receives: 'Observed prefix and survival model trained on historical time-to-event trajectories.',
    produces: 'Estimated intervention window IW and conformal interval CIW.',
    whyNeeded:
      'A beneficial intervention started too late wastes scarce staff time after the customer has already decided or walked away.',
    avoidMisunderstanding:
      'CIW is an uncertainty interval around the estimated window—not a guaranteed deadline before which the customer is locked in.',
    keepSeparate: {
      title: 'Intervention window vs. remaining cycle time',
      detail:
        'Remaining cycle time measures when the entire loan process will close. The intervention window measures only how long the window for a useful second offer stays open.',
    },
    sourceRef: {
      label: 'Shoush & Dumas (2024), Survival Analysis & Intervention Window',
      url: 'https://arxiv.org/abs/2307.06564v2',
    },
  },
  {
    id: 'capacity-resources',
    plainTitle: 'Can we help, and what else needs attention?',
    technicalLabel: 'Capacity & Queue Monitor (n, η, WIP, λ)',
    symbol: 'n · η · WIP · λ',
    group: 'capacity',
    badge: 'Textbook anchor',
    anchor: { x: 1175, y: 615 },
    overviewLandmark: true,
    oneSentence:
      'Tracks how many loan officers are currently free (n), their share of total staff (η = n/N), active cases in flight (WIP), and incoming demand (λ).',
    bpmConnection:
      'Built directly on BPM resource allocation, Little’s Law stock-vs-flow thinking (WIP as stock, λ as arrival flow), and resource utilization.',
    receives: 'Worker slot states (free/busy) and live process arrivals on the track.',
    produces: 'Capacity state components (n, η, WIP, λ) sent to the Decision Desk.',
    whyNeeded:
      'Even a high-benefit, urgent case cannot receive help when zero officers are free—and helping one case now occupies capacity needed by incoming cases.',
    avoidMisunderstanding:
      'WIP is a stock (count of active cases right now), whereas λ is a flow (cases arriving per unit time). Available-resource share η = n/N is the complement of busy utilization (1 − η).',
    keepSeparate: {
      title: 'Available share η vs. busy utilization',
      detail:
        'If N = 4 officers and n = 1 is free, available share η = 25% while busy utilization is 75%. Keeping η = n/N consistent prevents double-counting capacity.',
    },
    equation: 'η = n / N  (for N > 0)',
    sourceRef: {
      label: 'Dumas et al. (2018), Quantitative Process Analysis & Queues',
    },
  },
  {
    id: 'decision-desk',
    plainTitle: 'Choose an action for this case now',
    technicalLabel: 'Dispatch Desk & Intervention Policy (Sₜ → aₜ)',
    symbol: 'Sₜ → 1 | 0',
    group: 'decision-desk',
    badge: 'Research concept',
    analogyBoundary:
      'The interactive desk uses a transparent scripted teaching policy to demonstrate tradeoffs—it is not a trained PPO neural network or a reproduction of paper experiments.',
    anchor: { x: 760, y: 865 },
    overviewLandmark: true,
    oneSentence:
      'Bundles the eight state components Sₜ = (COP, TU, CTE, CIW, n, η, WIP, λ) and chooses between 1 (intervene now) and 0 (do not intervene now) for the examined case.',
    bpmConnection:
      'Acts like a real-time dispatching rule in operations management, except it weighs causal benefit, timing, uncertainty, and congestion jointly.',
    receives: 'Significance (COP, TU, CTE), Urgency (CIW), and Capacity (n, η, WIP, λ).',
    produces: 'Binary decision aₜ ∈ {0, 1} for the current case, updating worker slots when aₜ = 1.',
    whyNeeded:
      'Neither conformal prediction nor individual models make the final choice—an explicit policy must combine evidence with resource constraints.',
    avoidMisunderstanding:
      'The policy evaluates a binary action on the currently considered case rather than sorting a global leaderboard; choosing 0 can leave a later chance open if the window permits, though it never guarantees one.',
    keepSeparate: {
      title: 'Policy execution vs. policy learning',
      detail:
        'At dispatch time, the policy simply reads Sₜ and outputs 0 or 1. Updating the policy happens afterward via the feedback ledger.',
    },
    equation: 'Sₜ = (COP, TU, CTE, CIW, n, η, WIP, λ)  ↦  aₜ ∈ {0, 1}',
    sourceRef: {
      label: 'Shoush & Dumas (2024), MDP State & Binary Action Space',
      url: 'https://arxiv.org/abs/2307.06564v2',
    },
  },
  {
    id: 'feedback-ledger',
    plainTitle: 'Learn from consequences to improve future choices',
    technicalLabel: 'Feedback Ledger & PPO Policy Learning',
    symbol: 'Reward · PPO',
    group: 'feedback-ledger',
    badge: 'Research concept',
    anchor: { x: 1185, y: 865 },
    overviewLandmark: true,
    oneSentence:
      'Records what happened after actions were taken—separating shaped training rewards from evaluated business gain—so PPO can gradually refine the policy.',
    bpmConnection:
      'Mirrors organizational learning in BPM, operating at the policy-update timescale using simulated or logged episodes.',
    receives: 'Chosen action, subsequent environment state changes, and case/resource outcomes.',
    produces: 'Policy parameter updates via Proximal Policy Optimization (PPO).',
    whyNeeded:
      'Immediate gain alone misses opportunity cost: occupying the last officer now can forfeit a better intervention arriving minutes later.',
    avoidMisunderstanding:
      'Training reward is shaped and conditional—it is NOT a universal “60 + 10 − 25” payment for every successful intervention. And a learned PPO policy can beat thresholds without being guaranteed globally optimal.',
    keepSeparate: {
      title: 'Training reward vs. evaluated business gain',
      detail:
        'The ledger keeps shaped RL training signals in one compartment and final evaluated business gain in another so learners never confuse reward shaping with net accounting profit.',
    },
    sourceRef: {
      label: 'Shoush & Dumas (2024), Reward Shaping & PPO Training',
      url: 'https://arxiv.org/abs/2307.06564v2',
    },
  },
];
