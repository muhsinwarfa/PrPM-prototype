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
  /** Position in the 1600x1080 tabletop SVG coordinate space for spotlight & edge anchors */
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
  /** Optional SVG path override for clean museum-diagram curves */
  pathD?: string;
  labelPos?: { x: number; y: number };
}

export interface LoanCase {
  id: 'A' | 'B' | 'C';
  label: string;
  applicantSummary: string;
  currentStageIndex: number;
  currentStageLabel: string;
  prefixEvents: string[];
  /** Prefix length K (number of observed events so far) */
  prefixLengthK: number;
  /** Predicted negative outcome (rejection) probability OP in [0, 1] */
  opNegativeProb: number;
  /** Estimated improvement in acceptance probability TE (percentage points as decimal, e.g. 0.50) */
  teImprovement: number;
  /** Remaining ordinary process cycle time estimate in hours (distinct from IW) */
  remainingCycleTimeHours: [number, number];
  /** Illustrative intervention window IW midpoint & base half-width in hours */
  iwBaseHours: {
    min: number;
    max: number;
  };
  /** Position on the SVG process track */
  trackPos: { x: number; y: number };
}

export interface ConformalOutputs {
  copSet: Array<'Accepted' | 'Rejected'>;
  copDescription: string;
  cteIntervalPp: [number, number];
  ciwIntervalHours: [number, number];
}

export interface ResourceMetrics {
  totalStaffN: number;
  freeStaffN: number;
  busyStaffCount: number;
  freeShareEta: number;
  busyUtilization: number;
  wipCases: number;
  arrivalRatePerHour: number;
}

export interface SimulationState {
  selectedCaseId: 'A' | 'B' | 'C';
  totalStaffN: number;
  busyCaseIds: Array<'A' | 'B' | 'C'>;
  completedInterventionCaseIds: Array<'A' | 'B' | 'C'>;
  arrivalRatePerHour: number;
  interventionDurationHours: number;
  /** 0.5 = narrow illustrative band, 1.0 = standard illustrative band, 1.8 = wide conservative band */
  uncertaintyScale: number;
  lastActionLog: string;
  feedbackCount: number;
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
