export type ObservatoryMode = 'explore' | 'tour' | 'compare' | 'whatif';

export type ConceptRoleBadge = 'Textbook anchor' | 'Research concept' | 'Teaching analogy';

export type ConceptGroup =
  | 'outer-lifecycle'
  | 'inner-track'
  | 'historical-workbench'
  | 'significance'
  | 'urgency'
  | 'capacity'
  | 'decision-desk'
  | 'feedback-ledger';

export type FlowKind = 'process' | 'information' | 'learning';

export interface ConceptNode {
  id: string;
  plainTitle: string;
  technicalLabel: string;
  symbol?: string;
  group: ConceptGroup;
  badge: ConceptRoleBadge;
  analogyBoundary?: string;
  anchor: { x: number; y: number };
  overviewLandmark?: boolean;
  oneSentence: string;
  bpmConnection: string;
  receives: string;
  produces: string;
  whyNeeded: string;
  avoidMisunderstanding: string;
  keepSeparate?: {
    title: string;
    detail: string;
  };
  technicalDetail?: string;
  equation?: string;
  sourceRef?: {
    label: string;
    url?: string;
  };
}

export interface ConceptEdge {
  id: string;
  from: string;
  to: string;
  verb: string;
  kind: FlowKind;
  pathD?: string;
  labelPos?: { x: number; y: number };
}

export type CaseOpportunityStatus =
  | 'not-yet-open'
  | 'eligible'
  | 'active'
  | 'completed'
  | 'expired';

export interface LoanCase {
  id: 'A' | 'B' | 'C' | 'D';
  label: string;
  applicantSummary: string;
  currentStageIndex: number;
  currentStageLabel: string;
  prefixEvents: string[];
  prefixLengthK: number;
  opNegativeProb: number;
  teImprovement: number;
  remainingCycleTimeHours: [number, number];
  iwBaseHours: {
    min: number;
    max: number;
  };
  iwRemainingHours: {
    min: number;
    max: number;
  };
  opportunityStatus: CaseOpportunityStatus;
  hasFirstOffer: boolean;
  trackPos: { x: number; y: number };
}

export interface ActiveIntervention {
  caseId: 'A' | 'B' | 'C' | 'D';
  startedAtHours: number;
  durationHours: number;
  endsAtHours: number;
}

export interface EpisodeRecord {
  id: string;
  timeHours: number;
  caseId: 'A' | 'B' | 'C' | 'D';
  action: 0 | 1;
  consequence: string;
  observedOutcome: 'Accepted' | 'Rejected';
  trainingRewardSignal: number;
  evaluatedBusinessGain: number;
}

export interface ConformalOutputs {
  copSet: Array<'Accepted' | 'Rejected'>;
  copDescription: string;
  cteIntervalPp: [number, number];
  ciwIntervalHours: [number, number];
}

export interface ResourceMetrics {
  totalStaffN: number;
  pendingStaffN: number | null;
  freeStaffN: number;
  busyStaffCount: number;
  freeShareEta: number;
  busyUtilization: number;
  wipCases: number;
  arrivalRatePerHour: number;
}

export interface SimulationState {
  elapsedHours: number;
  cases: LoanCase[];
  selectedCaseId: 'A' | 'B' | 'C' | 'D';
  totalStaffN: number;
  pendingStaffN: number | null;
  activeInterventions: ActiveIntervention[];
  arrivalRatePerHour: number;
  interventionDurationHours: number;
  uncertaintyScale: number;
  wipStock: number;
  cumulativeArrivals: number;
  cumulativeCompletions: number;
  decisionCount: number;
  episodeLedger: EpisodeRecord[];
  lastActionLog: string;
}

export interface ScriptedPolicyDecision {
  action: 1 | 0;
  actionLabel: string;
  summary: string;
  reasons: string[];
  opportunityCostNote: string;
  isFeasible: boolean;
}

export interface TourStep {
  id: string;
  stepNumber: number;
  title: string;
  subtitle: string;
  targetCaseId: 'A' | 'B' | 'C';
  targetStaffN: number;
  focusNodeIds: string[];
  focusEdgeIds: string[];
  relationshipLabel: string;
  explanation: string;
  takeaway: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  choices: string[];
  recommendedIndex: number;
  explanation: string;
  relatedConceptId: string;
}

export interface WorkedHistoricalStep {
  k: number;
  observedEvents: string[];
  excludedFutureEvents: string[];
  encodedFeatures: {
    elapsedMinutes: number;
    riskFlags: number;
    firstOfferSent: boolean;
    portalViews: number;
  };
  predictiveAnswer: string;
  causalAnswer: string;
  survivalAnswer: string;
}
