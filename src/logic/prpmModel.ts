import type {
  ConceptEdge,
  ConformalOutputs,
  LoanCase,
  ResourceMetrics,
  ScriptedPolicyDecision,
  SimulationState,
} from '../types/observatory';

export const INITIAL_CASES: LoanCase[] = [
  {
    id: 'A',
    label: 'Case A',
    applicantSummary: 'High-risk profile · Standard loan request',
    currentStageIndex: 2,
    currentStageLabel: 'Offer sent → Await customer response',
    prefixEvents: [
      'Application received (09:00)',
      'Credit check & risk flags (09:20)',
      'Initial assessment: high risk (10:05)',
      'First offer sent (10:30)',
    ],
    prefixLengthK: 4,
    opNegativeProb: 0.9,
    teImprovement: 0.05,
    remainingCycleTimeHours: [6, 12],
    iwBaseHours: { min: 2.0, max: 4.0 },
    trackPos: { x: 1085, y: 270 },
  },
  {
    id: 'B',
    label: 'Case B',
    applicantSummary: 'Price-sensitive applicant · Competing offer likely',
    currentStageIndex: 3,
    currentStageLabel: 'Await customer response',
    prefixEvents: [
      'Application received (08:15)',
      'Income verified (08:45)',
      'Assessment completed (09:10)',
      'First offer sent (09:25)',
      'Customer opened portal twice (11:10)',
    ],
    prefixLengthK: 5,
    opNegativeProb: 0.7,
    teImprovement: 0.5,
    remainingCycleTimeHours: [4, 9],
    iwBaseHours: { min: 0.5, max: 1.5 },
    trackPos: { x: 1215, y: 270 },
  },
  {
    id: 'C',
    label: 'Case C',
    applicantSummary: 'Moderate risk · Waiting on documents & terms review',
    currentStageIndex: 1,
    currentStageLabel: 'Assessment → Offer preparation',
    prefixEvents: [
      'Application received (10:40)',
      'Automated screening passed (10:55)',
      'Manual assessment started (11:20)',
    ],
    prefixLengthK: 3,
    opNegativeProb: 0.6,
    teImprovement: 0.5,
    remainingCycleTimeHours: [8, 16],
    iwBaseHours: { min: 4.0, max: 8.0 },
    trackPos: { x: 940, y: 270 },
  },
];

export const INITIAL_SIMULATION_STATE: SimulationState = {
  selectedCaseId: 'B',
  totalStaffN: 1,
  busyCaseIds: [],
  completedInterventionCaseIds: [],
  arrivalRatePerHour: 3,
  interventionDurationHours: 1.0,
  uncertaintyScale: 1.0,
  lastActionLog: 'Ready at dispatch desk: 1 loan officer available to consider Case B.',
  feedbackCount: 0,
};

/**
 * Computes binary Shannon entropy H(p) in bits (range [0, 1]) from the mean
 * predicted negative-outcome probability OP. Derived strictly from OP rather than
 * an independent arbitrary slider.
 */
export function computeEntropyTU(opNegativeProb: number): number {
  const p = Math.min(1, Math.max(0, opNegativeProb));
  if (p <= 0 || p >= 1) {
    return 0;
  }
  const entropy = -(p * Math.log2(p) + (1 - p) * Math.log2(1 - p));
  return Number(entropy.toFixed(3));
}

/**
 * Computes consistent resource and flow metrics.
 * Guarantees eta = n / N when N > 0, and n <= N.
 */
export function computeResourceMetrics(
  totalStaffN: number,
  busyCount: number,
  arrivalRatePerHour: number,
  activeQueueBase = 12
): ResourceMetrics {
  const safeTotal = Math.max(0, Math.floor(totalStaffN));
  const safeBusy = Math.min(safeTotal, Math.max(0, Math.floor(busyCount)));
  const freeStaffN = safeTotal - safeBusy;
  const freeShareEta = safeTotal > 0 ? Number((freeStaffN / safeTotal).toFixed(3)) : 0;
  const busyUtilization = safeTotal > 0 ? Number((safeBusy / safeTotal).toFixed(3)) : 0;
  const wipCases = Math.max(3, Math.round(activeQueueBase + arrivalRatePerHour * 1.5));

  return {
    totalStaffN: safeTotal,
    freeStaffN,
    busyStaffCount: safeBusy,
    freeShareEta,
    busyUtilization,
    wipCases,
    arrivalRatePerHour: Number(arrivalRatePerHour.toFixed(1)),
  };
}

/**
 * Produces clearly labeled illustrative conformal prediction sets and intervals
 * for teaching. Demonstrates how COP can contain {Rejected}, {Accepted}, both,
 * or {} under extreme mismatch/tightness, and how CTE/CIW expand with uncertaintyScale.
 */
export function computeIllustrativeConformalOutputs(
  loanCase: LoanCase,
  uncertaintyScale: number
): ConformalOutputs {
  const scale = Math.max(0.4, Math.min(2.0, uncertaintyScale));
  const negProb = loanCase.opNegativeProb;
  const posProb = 1 - negProb;

  // Illustrative nonconformity threshold shrinks as uncertaintyScale widens (higher coverage)
  const threshold = Math.max(0.05, Math.min(0.62, 0.36 / scale));

  const copSet: Array<'Accepted' | 'Rejected'> = [];
  if (posProb >= threshold) {
    copSet.push('Accepted');
  }
  if (negProb >= threshold) {
    copSet.push('Rejected');
  }

  let copDescription = '';
  if (copSet.length === 0) {
    copDescription = 'Empty set {} — neither outcome clears strict threshold (flags unusual case)';
  } else if (copSet.length === 1) {
    copDescription = `{${copSet[0]}} — single outcome remains plausible at this band`;
  } else {
    copDescription = '{Accepted, Rejected} — both outcomes remain plausible';
  }

  const baseTePp = Math.round(loanCase.teImprovement * 100);
  const cteHalfWidthPp = Math.round(12 * scale);
  const cteMin = Math.max(-100, baseTePp - cteHalfWidthPp);
  const cteMax = Math.min(100, baseTePp + cteHalfWidthPp);

  const iwMid = (loanCase.iwBaseHours.min + loanCase.iwBaseHours.max) / 2;
  const iwBaseHalf = (loanCase.iwBaseHours.max - loanCase.iwBaseHours.min) / 2;
  const ciwHalf = iwBaseHalf * scale;
  const ciwMin = Number(Math.max(0.1, iwMid - ciwHalf).toFixed(2));
  const ciwMax = Number((iwMid + ciwHalf).toFixed(2));

  return {
    copSet,
    copDescription,
    cteIntervalPp: [cteMin, cteMax],
    ciwIntervalHours: [ciwMin, ciwMax],
  };
}

/**
 * Toy estimate of incremental value from Section 7:
 * Expected incremental value = success-probability improvement * outcome value - intervention cost.
 * Explicitly omits timing, uncertainty, and opportunity cost.
 */
export function computeToyIncrementalValue(
  teImprovement: number,
  outcomeValue = 60,
  interventionCost = 25
): number {
  return Number((teImprovement * outcomeValue - interventionCost).toFixed(1));
}

/**
 * Transparent scripted teaching policy (NOT trained PPO).
 * Evaluates binary action (1 = Intervene now, 0 = Do not intervene now) for the
 * currently considered case given resource constraints and competing cases.
 */
export function evaluateScriptedTeachingPolicy(
  currentCase: LoanCase,
  allCases: LoanCase[],
  metrics: ResourceMetrics,
  interventionDurationHours: number,
  uncertaintyScale: number
): ScriptedPolicyDecision {
  const conformal = computeIllustrativeConformalOutputs(currentCase, uncertaintyScale);
  const tePp = Math.round(currentCase.teImprovement * 100);
  const iwMid = (currentCase.iwBaseHours.min + currentCase.iwBaseHours.max) / 2;
  const hasMoreUrgentHighBenefitPeer = allCases.some(
    (other) =>
      other.id !== currentCase.id &&
      other.teImprovement >= 0.35 &&
      (other.iwBaseHours.min + other.iwBaseHours.max) / 2 < iwMid
  );

  if (metrics.freeStaffN <= 0) {
    return {
      action: 0,
      actionLabel: '0 — Do not intervene now (Capacity blocked)',
      summary: 'No free loan officer is available (n = 0). Starting an intervention is infeasible.',
      reasons: [
        `Free resources n = 0 out of N = ${metrics.totalStaffN} (η = 0%).`,
        'Wait until a busy officer finishes or process demand shifts.',
      ],
      opportunityCostNote:
        'Capacity is already fully occupied by an active intervention.',
      isFeasible: false,
    };
  }

  if (currentCase.teImprovement < 0.15) {
    return {
      action: 0,
      actionLabel: '0 — Do not intervene now (Low causal benefit)',
      summary: `${currentCase.label} has high risk (${Math.round(
        currentCase.opNegativeProb * 100
      )}%), but estimated improvement is only +${tePp} percentage points.`,
      reasons: [
        `High failure risk does not mean this specific second offer helps.`,
        `Causal interval CTE is [${conformal.cteIntervalPp[0]}pp, +${conformal.cteIntervalPp[1]}pp].`,
        `Reserving the free officer preserves capacity for cases where intervention changes the outcome.`,
      ],
      opportunityCostNote:
        `Using an officer for ${interventionDurationHours.toFixed(1)}h here yields little gain while blocking other cases.`,
      isFeasible: true,
    };
  }

  if (conformal.ciwIntervalHours[0] < interventionDurationHours && iwMid < interventionDurationHours) {
    return {
      action: 0,
      actionLabel: '0 — Do not intervene now (Window too narrow)',
      summary: `Intervention duration (${interventionDurationHours.toFixed(
        1
      )}h) exceeds the estimated window (${currentCase.iwBaseHours.min}–${currentCase.iwBaseHours.max}h).`,
      reasons: [
        `The officer may finish too late to influence the customer's decision.`,
        `CIW spans ${conformal.ciwIntervalHours[0]}h to ${conformal.ciwIntervalHours[1]}h.`,
      ],
      opportunityCostNote:
        'Spending capacity on a likely-expired window sacrifices future feasible cases.',
      isFeasible: true,
    };
  }

  if (metrics.freeStaffN === 1 && hasMoreUrgentHighBenefitPeer && iwMid >= 3.0) {
    return {
      action: 0,
      actionLabel: '0 — Do not intervene now (Preserve scarce capacity)',
      summary: `${currentCase.label} could benefit (+${tePp}pp), but its window (${currentCase.iwBaseHours.min}–${currentCase.iwBaseHours.max}h) is wide while a more urgent high-benefit case needs attention.`,
      reasons: [
        `Only n = 1 officer is free (η = ${Math.round(metrics.freeShareEta * 100)}%).`,
        `Deferring leaves an opportunity open if capacity remains later (though never guaranteed).`,
      ],
      opportunityCostNote:
        'Acting immediately occupies the sole officer and prevents helping the narrow-window case.',
      isFeasible: true,
    };
  }

  return {
    action: 1,
    actionLabel: '1 — Intervene now (Prepare & send second offer)',
    summary: `${currentCase.label} combines substantial causal benefit (+${tePp}pp) with a timely window (${currentCase.iwBaseHours.min}–${currentCase.iwBaseHours.max}h) and available staff (n = ${metrics.freeStaffN}).`,
    reasons: [
      `Estimated success rises from ${Math.round(
        (1 - currentCase.opNegativeProb) * 100
      )}% to ${Math.round((1 - currentCase.opNegativeProb + currentCase.teImprovement) * 100)}% (+${tePp}pp).`,
      `Action occupies 1 officer for ${interventionDurationHours.toFixed(1)}h, reducing n to ${
        metrics.freeStaffN - 1
      }.`,
      `Uncertainty remains visible: CTE [${conformal.cteIntervalPp[0]}pp, +${conformal.cteIntervalPp[1]}pp], CIW [${conformal.ciwIntervalHours[0]}h, ${conformal.ciwIntervalHours[1]}h].`,
    ],
    opportunityCostNote:
      metrics.freeStaffN === 1
        ? 'Starting now occupies the last free officer until the intervention finishes.'
        : `Starting now leaves ${metrics.freeStaffN - 1} of ${metrics.totalStaffN} officers free.`,
    isFeasible: true,
  };
}

export interface AllocationResult {
  ok: boolean;
  reason?: string;
  nextState: SimulationState;
}

/**
 * Allocates one free worker to the specified case if capacity permits.
 * Prevents double allocation and prevents allocation when n === 0.
 */
export function startCaseIntervention(
  state: SimulationState,
  caseId: 'A' | 'B' | 'C'
): AllocationResult {
  if (state.busyCaseIds.includes(caseId)) {
    return {
      ok: false,
      reason: `Case ${caseId} already has a loan officer assigned.`,
      nextState: state,
    };
  }

  const metrics = computeResourceMetrics(
    state.totalStaffN,
    state.busyCaseIds.length,
    state.arrivalRatePerHour
  );

  if (metrics.freeStaffN <= 0) {
    return {
      ok: false,
      reason: `No free loan officers available (n = 0 of N = ${state.totalStaffN}). Finish an active intervention or increase staff first.`,
      nextState: state,
    };
  }

  const nextBusy = [...state.busyCaseIds, caseId];
  const nextFree = state.totalStaffN - nextBusy.length;
  return {
    ok: true,
    nextState: {
      ...state,
      busyCaseIds: nextBusy,
      lastActionLog: `Action 1 applied to Case ${caseId}: 1 officer moved to busy slot (n = ${nextFree}/${state.totalStaffN}).`,
    },
  };
}

/**
 * Completes an active intervention on a case, returning the worker to the free pool
 * and recording a feedback cycle on the ledger.
 */
export function finishCaseIntervention(
  state: SimulationState,
  caseId: 'A' | 'B' | 'C'
): AllocationResult {
  if (!state.busyCaseIds.includes(caseId)) {
    return {
      ok: false,
      reason: `Case ${caseId} does not currently occupy a worker.`,
      nextState: state,
    };
  }

  const nextBusy = state.busyCaseIds.filter((id) => id !== caseId);
  const nextCompleted = state.completedInterventionCaseIds.includes(caseId)
    ? state.completedInterventionCaseIds
    : [...state.completedInterventionCaseIds, caseId];
  const nextFree = Math.max(0, state.totalStaffN - nextBusy.length);

  return {
    ok: true,
    nextState: {
      ...state,
      busyCaseIds: nextBusy,
      completedInterventionCaseIds: nextCompleted,
      feedbackCount: state.feedbackCount + 1,
      lastActionLog: `Intervention on Case ${caseId} finished: officer returned to free slot (n = ${nextFree}/${state.totalStaffN}), outcome logged to feedback ledger.`,
    },
  };
}

/**
 * Adjusts total staff N safely so busyCaseIds never exceeds N (or trims excess if reduced).
 */
export function updateTotalStaff(
  state: SimulationState,
  nextTotalStaffN: number
): SimulationState {
  const clamped = Math.max(0, Math.min(5, Math.floor(nextTotalStaffN)));
  const trimmedBusy = state.busyCaseIds.slice(0, clamped);
  const freeNow = clamped - trimmedBusy.length;
  return {
    ...state,
    totalStaffN: clamped,
    busyCaseIds: trimmedBusy,
    lastActionLog: `Total loan officers set to N = ${clamped} (${freeNow} free, ${trimmedBusy.length} busy).`,
  };
}

export interface ConnectedGraph {
  incomingEdges: ConceptEdge[];
  outgoingEdges: ConceptEdge[];
  connectedNodeIds: Set<string>;
}

/**
 * Computes immediate inputs and consequences for a selected concept node.
 */
export function getConnectedGraph(nodeId: string, edges: ConceptEdge[]): ConnectedGraph {
  const incomingEdges = edges.filter((e) => e.to === nodeId);
  const outgoingEdges = edges.filter((e) => e.from === nodeId);
  const connectedNodeIds = new Set<string>([nodeId]);

  for (const edge of incomingEdges) {
    connectedNodeIds.add(edge.from);
  }
  for (const edge of outgoingEdges) {
    connectedNodeIds.add(edge.to);
  }

  return { incomingEdges, outgoingEdges, connectedNodeIds };
}
