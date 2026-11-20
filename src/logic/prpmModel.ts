import type {
  ActiveIntervention,
  ConceptEdge,
  ConformalOutputs,
  EpisodeRecord,
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
    iwRemainingHours: { min: 2.0, max: 4.0 },
    opportunityStatus: 'eligible',
    hasFirstOffer: true,
    trackPos: { x: 1045, y: 286 },
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
    iwRemainingHours: { min: 0.5, max: 1.5 },
    opportunityStatus: 'eligible',
    hasFirstOffer: true,
    trackPos: { x: 1205, y: 286 },
  },
  {
    id: 'C',
    label: 'Case C',
    applicantSummary: 'Moderate risk · Reviewing initial offer terms',
    currentStageIndex: 2,
    currentStageLabel: 'Offer sent',
    prefixEvents: [
      'Application received (10:40)',
      'Automated screening passed (10:55)',
      'Manual assessment completed (11:20)',
      'First offer sent (11:35)',
    ],
    prefixLengthK: 4,
    opNegativeProb: 0.6,
    teImprovement: 0.5,
    remainingCycleTimeHours: [8, 16],
    iwBaseHours: { min: 4.0, max: 8.0 },
    iwRemainingHours: { min: 4.0, max: 8.0 },
    opportunityStatus: 'eligible',
    hasFirstOffer: true,
    trackPos: { x: 925, y: 286 },
  },
];

export const INITIAL_SIMULATION_STATE: SimulationState = {
  elapsedHours: 0,
  cases: INITIAL_CASES.map((c) => ({
    ...c,
    prefixEvents: [...c.prefixEvents],
    iwBaseHours: { ...c.iwBaseHours },
    iwRemainingHours: { ...c.iwRemainingHours },
    remainingCycleTimeHours: [...c.remainingCycleTimeHours] as [number, number],
    trackPos: { ...c.trackPos },
  })),
  selectedCaseId: 'B',
  totalStaffN: 1,
  pendingStaffN: null,
  activeInterventions: [],
  arrivalRatePerHour: 3,
  interventionDurationHours: 1.0,
  uncertaintyScale: 1.0,
  wipStock: 14,
  cumulativeArrivals: 0,
  cumulativeCompletions: 0,
  decisionCount: 0,
  episodeLedger: [],
  lastActionLog:
    't = 0.0h: 1 loan officer free (n = 1/1). Cases A, B, and C have received their first offer and are eligible for review.',
};

/**
 * Computes binary Shannon entropy H(p) in bits [0, 1] strictly from OP.
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
 * Computes resource and stock-flow metrics consistently.
 * Guarantees eta = n / N when N > 0, and n <= N.
 */
export function computeResourceMetrics(
  totalStaffN: number,
  busyCount: number,
  arrivalRatePerHour: number,
  wipStock = 14,
  pendingStaffN: number | null = null
): ResourceMetrics {
  const safeTotal = Math.max(0, Math.floor(totalStaffN));
  const safeBusy = Math.min(safeTotal, Math.max(0, Math.floor(busyCount)));
  const freeStaffN = safeTotal - safeBusy;
  const freeShareEta = safeTotal > 0 ? Number((freeStaffN / safeTotal).toFixed(3)) : 0;
  const busyUtilization = safeTotal > 0 ? Number((safeBusy / safeTotal).toFixed(3)) : 0;

  return {
    totalStaffN: safeTotal,
    pendingStaffN,
    freeStaffN,
    busyStaffCount: safeBusy,
    freeShareEta,
    busyUtilization,
    wipCases: Math.max(0, Math.round(wipStock)),
    arrivalRatePerHour: Number(arrivalRatePerHour.toFixed(1)),
  };
}

/**
 * Produces illustrative conformal sets and intervals from remaining window & uncertainty scale.
 */
export function computeIllustrativeConformalOutputs(
  loanCase: LoanCase,
  uncertaintyScale: number
): ConformalOutputs {
  const scale = Math.max(0.4, Math.min(2.0, uncertaintyScale));
  const negProb = loanCase.opNegativeProb;
  const posProb = 1 - negProb;

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
    copDescription =
      'Empty set {} — neither outcome clears strict threshold (flags unusual case)';
  } else if (copSet.length === 1) {
    copDescription = `{${copSet[0]}} — single outcome remains plausible at this band`;
  } else {
    copDescription = '{Accepted, Rejected} — both outcomes remain plausible';
  }

  const baseTePp = Math.round(loanCase.teImprovement * 100);
  const cteHalfWidthPp = Math.round(14 * scale);
  const cteMin = Math.max(-100, baseTePp - cteHalfWidthPp);
  const cteMax = Math.min(100, baseTePp + cteHalfWidthPp);

  const iwMid = (loanCase.iwRemainingHours.min + loanCase.iwRemainingHours.max) / 2;
  const iwBaseHalf = Math.max(
    0.1,
    (loanCase.iwRemainingHours.max - loanCase.iwRemainingHours.min) / 2
  );
  const ciwHalf = iwBaseHalf * scale;
  const ciwMin = Number(Math.max(0, iwMid - ciwHalf).toFixed(2));
  const ciwMax = Number(Math.max(ciwMin, iwMid + ciwHalf).toFixed(2));

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
 * Evaluates only eligible opportunities and responds meaningfully to capacity,
 * competing urgent cases, arrival demand surge, and conformal uncertainty bounds.
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
  const iwMid =
    (currentCase.iwRemainingHours.min + currentCase.iwRemainingHours.max) / 2;

  if (currentCase.opportunityStatus === 'not-yet-open' || !currentCase.hasFirstOffer) {
    return {
      action: 0,
      actionLabel: '0 — Do not intervene now (First offer not sent yet)',
      summary: `${currentCase.label} has not received its first offer yet; a second-offer intervention is not open.`,
      reasons: [
        `Current stage: ${currentCase.currentStageLabel}.`,
        'Wait for the first offer event before evaluating a second offer.',
      ],
      opportunityCostNote: 'No capacity should be committed before an opportunity opens.',
      isFeasible: false,
    };
  }

  if (currentCase.opportunityStatus === 'active') {
    return {
      action: 0,
      actionLabel: '0 — Intervention already active here',
      summary: `A loan officer is already preparing a second offer for ${currentCase.label}.`,
      reasons: ['An ongoing intervention cannot be allocated twice.'],
      opportunityCostNote: 'This case already occupies one officer slot until completion.',
      isFeasible: false,
    };
  }

  if (currentCase.opportunityStatus === 'completed') {
    return {
      action: 0,
      actionLabel: '0 — Opportunity already completed',
      summary: `${currentCase.label} already completed its second-offer intervention.`,
      reasons: ['Completed opportunities are excluded unless a distinct new opportunity opens.'],
      opportunityCostNote: 'Available staff should focus on remaining open cases.',
      isFeasible: false,
    };
  }

  if (currentCase.opportunityStatus === 'expired') {
    return {
      action: 0,
      actionLabel: '0 — Intervention window expired',
      summary: `${currentCase.label}’s intervention window closed before action could be taken.`,
      reasons: ['Acting after window expiry consumes officer time without influencing the decision.'],
      opportunityCostNote: 'Preserve remaining capacity for open opportunities.',
      isFeasible: false,
    };
  }

  if (metrics.freeStaffN <= 0) {
    return {
      action: 0,
      actionLabel: '0 — Do not intervene now (Capacity blocked)',
      summary: 'No free loan officer is available (n = 0). Starting an intervention is infeasible.',
      reasons: [
        `Free resources n = 0 out of N = ${metrics.totalStaffN} (η = 0%).`,
        'Advance time until a busy officer finishes their current intervention.',
      ],
      opportunityCostNote: 'Capacity is already fully occupied by active interventions.',
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
        'High failure risk does not mean this specific second offer helps.',
        `Causal interval CTE is [${conformal.cteIntervalPp[0]}pp, +${conformal.cteIntervalPp[1]}pp] (crosses zero).`,
        'Reserving the free officer preserves capacity for cases where intervention changes the outcome.',
      ],
      opportunityCostNote: `Using an officer for ${interventionDurationHours.toFixed(
        1
      )}h here yields little gain while blocking other cases.`,
      isFeasible: true,
    };
  }

  // Uncertainty caution: if conformal CIW lower bound drops below required duration
  // under elevated uncertainty (scale >= 1.4), caution against risking a late finish
  if (
    uncertaintyScale >= 1.4 &&
    conformal.ciwIntervalHours[0] < interventionDurationHours &&
    iwMid <= interventionDurationHours + 0.5
  ) {
    return {
      action: 0,
      actionLabel: '0 — Do not intervene now (Uncertainty caution on window)',
      summary: `Wide uncertainty (${uncertaintyScale.toFixed(
        1
      )}×) pulls ${currentCase.label}’s CIW lower bound down to ${
        conformal.ciwIntervalHours[0]
      }h — below the ${interventionDurationHours.toFixed(1)}h intervention duration.`,
      reasons: [
        `CIW spans [${conformal.ciwIntervalHours[0]}h, ${conformal.ciwIntervalHours[1]}h], leaving substantial risk the window closes mid-task.`,
        `CTE spans [${conformal.cteIntervalPp[0]}pp, +${conformal.cteIntervalPp[1]}pp].`,
        `Under scarce capacity (n = ${metrics.freeStaffN}), this scripted caution rule avoids risking a wasted ${interventionDurationHours.toFixed(1)}h commitment.`,
      ],
      opportunityCostNote:
        'If the window closes mid-intervention, the officer’s occupied time yields zero benefit while blocking arriving cases.',
      isFeasible: true,
    };
  }

  if (currentCase.iwRemainingHours.max < interventionDurationHours) {
    return {
      action: 0,
      actionLabel: '0 — Do not intervene now (Window too narrow)',
      summary: `Intervention duration (${interventionDurationHours.toFixed(
        1
      )}h) exceeds the remaining window (${currentCase.iwRemainingHours.min.toFixed(
        1
      )}–${currentCase.iwRemainingHours.max.toFixed(1)}h).`,
      reasons: [
        'The officer is likely to finish too late to influence the customer’s decision.',
        `CIW spans [${conformal.ciwIntervalHours[0]}h, ${conformal.ciwIntervalHours[1]}h].`,
      ],
      opportunityCostNote: 'Spending capacity on a nearly-expired window sacrifices future feasible cases.',
      isFeasible: true,
    };
  }

  // Check only currently ELIGIBLE peer cases (never completed, busy, or expired peers!)
  const hasMoreUrgentEligiblePeer = allCases.some(
    (other) =>
      other.id !== currentCase.id &&
      other.opportunityStatus === 'eligible' &&
      other.hasFirstOffer &&
      other.teImprovement >= 0.35 &&
      (other.iwRemainingHours.min + other.iwRemainingHours.max) / 2 < iwMid
  );

  if (metrics.freeStaffN === 1 && hasMoreUrgentEligiblePeer && iwMid >= 2.5) {
    return {
      action: 0,
      actionLabel: '0 — Do not intervene now (Preserve scarce capacity)',
      summary: `${currentCase.label} could benefit (+${tePp}pp), but its window (${currentCase.iwRemainingHours.min.toFixed(
        1
      )}–${currentCase.iwRemainingHours.max.toFixed(
        1
      )}h) is wide while an eligible, more urgent high-benefit case needs attention.`,
      reasons: [
        `Only n = 1 officer is free (η = ${Math.round(metrics.freeShareEta * 100)}%).`,
        'Deferring leaves a later opportunity open if capacity frees up before the window closes (though never guaranteed).',
      ],
      opportunityCostNote:
        'Acting immediately occupies the sole officer and prevents helping the narrow-window eligible case.',
      isFeasible: true,
    };
  }

  // Demand pressure rule: high arrival rate (lambda >= 6/hr) with sole free officer
  // reserves capacity when the current case still has a long window (>= 3h)
  if (
    metrics.freeStaffN === 1 &&
    metrics.arrivalRatePerHour >= 6 &&
    currentCase.iwRemainingHours.min >= 2.5
  ) {
    return {
      action: 0,
      actionLabel: '0 — Do not intervene now (Reserve capacity for demand surge)',
      summary: `Arrival demand is high (λ = ${metrics.arrivalRatePerHour}/hr, WIP = ${metrics.wipCases}), and only n = 1 officer is free. Because ${currentCase.label} still has ${currentCase.iwRemainingHours.min.toFixed(
        1
      )}–${currentCase.iwRemainingHours.max.toFixed(1)}h left, waiting guards against missing urgent arrivals.`,
      reasons: [
        `High arrival flow (λ = ${metrics.arrivalRatePerHour}/hr) raises the chance a narrow-window high-benefit case arrives during a ${interventionDurationHours.toFixed(1)}h commitment.`,
        `${currentCase.label} still has breathing room before its window closes.`,
      ],
      opportunityCostNote:
        'Committing the sole officer during a demand surge carries high opportunity cost for incoming cases.',
      isFeasible: true,
    };
  }

  return {
    action: 1,
    actionLabel: '1 — Intervene now (Prepare & send second offer)',
    summary: `${currentCase.label} combines substantial causal benefit (+${tePp}pp) with a timely window (${currentCase.iwRemainingHours.min.toFixed(
      1
    )}–${currentCase.iwRemainingHours.max.toFixed(1)}h) and available staff (n = ${
      metrics.freeStaffN
    }).`,
    reasons: [
      `Estimated success rises from ${Math.round(
        (1 - currentCase.opNegativeProb) * 100
      )}% to ${Math.round(
        (1 - currentCase.opNegativeProb + currentCase.teImprovement) * 100
      )}% (+${tePp}pp).`,
      `Action occupies 1 officer for ${interventionDurationHours.toFixed(
        1
      )}h (until t = ${(0 + interventionDurationHours).toFixed(1)}h offset), reducing free staff to ${
        metrics.freeStaffN - 1
      }.`,
      `Uncertainty remains visible: CTE [${conformal.cteIntervalPp[0]}pp, +${conformal.cteIntervalPp[1]}pp], CIW [${conformal.ciwIntervalHours[0]}h, ${conformal.ciwIntervalHours[1]}h].`,
    ],
    opportunityCostNote:
      metrics.freeStaffN === 1
        ? 'Starting now occupies the last free officer until the intervention duration elapses.'
        : `Starting now leaves ${metrics.freeStaffN - 1} of ${
            metrics.totalStaffN
          } officers free.`,
    isFeasible: true,
  };
}

export interface AllocationResult {
  ok: boolean;
  reason?: string;
  nextState: SimulationState;
}

/**
 * Starts a timed intervention on an eligible case, keeping the officer busy
 * until elapsedHours >= startedAtHours + interventionDurationHours.
 */
export function startCaseIntervention(
  state: SimulationState,
  caseId: 'A' | 'B' | 'C' | 'D'
): AllocationResult {
  const targetCase = state.cases.find((c) => c.id === caseId);
  if (!targetCase) {
    return { ok: false, reason: `Case ${caseId} not found.`, nextState: state };
  }

  if (targetCase.opportunityStatus === 'not-yet-open' || !targetCase.hasFirstOffer) {
    return {
      ok: false,
      reason: `Cannot send a second offer to ${targetCase.label} before its first offer has been sent.`,
      nextState: state,
    };
  }

  if (targetCase.opportunityStatus === 'active') {
    return {
      ok: false,
      reason: `${targetCase.label} already has a loan officer assigned.`,
      nextState: state,
    };
  }

  if (targetCase.opportunityStatus === 'completed') {
    return {
      ok: false,
      reason: `${targetCase.label} has already completed this intervention opportunity.`,
      nextState: state,
    };
  }

  if (targetCase.opportunityStatus === 'expired') {
    return {
      ok: false,
      reason: `${targetCase.label}’s intervention window has expired.`,
      nextState: state,
    };
  }

  const metrics = computeResourceMetrics(
    state.totalStaffN,
    state.activeInterventions.length,
    state.arrivalRatePerHour,
    state.wipStock,
    state.pendingStaffN
  );

  if (metrics.freeStaffN <= 0) {
    return {
      ok: false,
      reason: `No free loan officers available (n = 0 of N = ${state.totalStaffN}). Advance time until an intervention finishes.`,
      nextState: state,
    };
  }

  const newIntervention: ActiveIntervention = {
    caseId,
    startedAtHours: state.elapsedHours,
    durationHours: state.interventionDurationHours,
    endsAtHours: Number((state.elapsedHours + state.interventionDurationHours).toFixed(2)),
  };

  const nextCases = state.cases.map((c) =>
    c.id === caseId
      ? {
          ...c,
          opportunityStatus: 'active' as const,
          currentStageLabel: '2nd offer in preparation (Officer busy)',
        }
      : c
  );

  const nextActive = [...state.activeInterventions, newIntervention];
  const nextFree = state.totalStaffN - nextActive.length;

  return {
    ok: true,
    nextState: {
      ...state,
      cases: nextCases,
      activeInterventions: nextActive,
      decisionCount: state.decisionCount + 1,
      lastActionLog: `t = ${state.elapsedHours.toFixed(
        1
      )}h: Action 1 started on ${targetCase.label}. 1 officer committed until t = ${newIntervention.endsAtHours.toFixed(
        1
      )}h (n = ${nextFree}/${state.totalStaffN}).`,
    },
  };
}

/**
 * Records Action 0 (do not intervene now) as a decision ONLY — never logs an observed outcome
 * or business gain until time actually advances and outcomes materialize.
 */
export function recordDoNotInterveneDecision(
  state: SimulationState,
  caseId: 'A' | 'B' | 'C' | 'D'
): SimulationState {
  return {
    ...state,
    decisionCount: state.decisionCount + 1,
    lastActionLog: `t = ${state.elapsedHours.toFixed(
      1
    )}h: Action 0 recorded for Case ${caseId} (no intervention started; officer capacity preserved).`,
  };
}

/**
 * Deterministic teaching outcome helper for completed interventions / expired cases.
 * Uses the case's underlying probabilities cleanly so ledger numbers are consistent and illustrative.
 */
function resolveDeterministicTeachingOutcome(
  loanCase: LoanCase,
  intervened: boolean
): { outcome: 'Accepted' | 'Rejected'; trainingSignal: number; businessGain: number } {
  if (intervened) {
    // Cases B (+50pp -> 80% accept) and C (+50pp -> 90% accept) illustrate successful intervention;
    // Case A (+5pp -> 15% accept) illustrates low lift even after spending 25 cost.
    const acceptProb = 1 - loanCase.opNegativeProb + loanCase.teImprovement;
    const accepted = acceptProb >= 0.5;
    const businessGain = accepted ? 35 : -25; // Illustrative net evaluation (60 value - 25 cost, or -25 cost)
    const trainingSignal = accepted ? 1.0 : -0.45;
    return {
      outcome: accepted ? 'Accepted' : 'Rejected',
      trainingSignal,
      businessGain,
    };
  }
  const acceptProb = 1 - loanCase.opNegativeProb;
  const accepted = acceptProb >= 0.5;
  return {
    outcome: accepted ? 'Accepted' : 'Rejected',
    trainingSignal: accepted ? 0.3 : -0.2,
    businessGain: accepted ? 60 : 0,
  };
}

/**
 * Advances the logical simulation clock by deltaHours:
 * - Completes any active interventions whose endsAtHours <= newTime, returning officers
 *   (and applying any pending staff reduction safely without dropping work).
 * - Shrinks remaining intervention windows on waiting cases; marks expired cases.
 * - Advances waiting cases' observed prefix events and spawns arriving Case D if demand >= 5/hr.
 * - Updates WIP stock from arrivals and completions.
 */
export function advanceSimulationTime(
  state: SimulationState,
  deltaHours: number
): SimulationState {
  if (deltaHours <= 0) return state;

  const newElapsed = Number((state.elapsedHours + deltaHours).toFixed(2));
  const completedInterventions = state.activeInterventions.filter(
    (iv) => iv.endsAtHours <= newElapsed
  );
  const stillActiveInterventions = state.activeInterventions.filter(
    (iv) => iv.endsAtHours > newElapsed
  );

  const newlyCompletedIds = new Set(completedInterventions.map((iv) => iv.caseId));
  const newLedgerEntries: EpisodeRecord[] = [];
  let completionsThisStep = completedInterventions.length;

  const nextCases: LoanCase[] = state.cases.map((c) => {
    if (newlyCompletedIds.has(c.id)) {
      const outcomeInfo = resolveDeterministicTeachingOutcome(c, true);
      const stamp = `${String(12 + Math.floor(newElapsed)).padStart(2, '0')}:${String(
        Math.round((newElapsed % 1) * 60)
      ).padStart(2, '0')}`;
      const newEvents = [
        ...c.prefixEvents,
        `2nd offer sent (${stamp})`,
        `Outcome observed: ${outcomeInfo.outcome}`,
      ];
      newLedgerEntries.push({
        id: `ep-${c.id}-${newElapsed}`,
        timeHours: newElapsed,
        caseId: c.id,
        action: 1,
        consequence: `Officer occupied for ${
          completedInterventions.find((i) => i.caseId === c.id)?.durationHours ??
          state.interventionDurationHours
        }h; released at t=${newElapsed.toFixed(1)}h`,
        observedOutcome: outcomeInfo.outcome,
        trainingRewardSignal: outcomeInfo.trainingSignal,
        evaluatedBusinessGain: outcomeInfo.businessGain,
      });

      return {
        ...c,
        opportunityStatus: 'completed',
        currentStageIndex: 4,
        currentStageLabel: `Completed (${outcomeInfo.outcome})`,
        prefixEvents: newEvents,
        prefixLengthK: newEvents.length,
        iwRemainingHours: { min: 0, max: 0 },
        trackPos: { x: 1365, y: 286 },
      };
    }

    if (c.opportunityStatus === 'active') {
      return c;
    }

    if (c.opportunityStatus === 'completed' || c.opportunityStatus === 'expired') {
      return c;
    }

    // Waiting eligible or not-yet-open case: advance remaining window
    const nextMin = Number(Math.max(0, c.iwRemainingHours.min - deltaHours).toFixed(2));
    const nextMax = Number(Math.max(0, c.iwRemainingHours.max - deltaHours).toFixed(2));
    const expiredNow = nextMax <= 0;

    if (expiredNow) {
      completionsThisStep += 1;
      const outcomeInfo = resolveDeterministicTeachingOutcome(c, false);
      newLedgerEntries.push({
        id: `ep-${c.id}-exp-${newElapsed}`,
        timeHours: newElapsed,
        caseId: c.id,
        action: 0,
        consequence: `Window closed at t=${newElapsed.toFixed(1)}h without intervention`,
        observedOutcome: outcomeInfo.outcome,
        trainingRewardSignal: outcomeInfo.trainingSignal,
        evaluatedBusinessGain: outcomeInfo.businessGain,
      });
      return {
        ...c,
        opportunityStatus: 'expired',
        currentStageIndex: 4,
        currentStageLabel: `Window expired (${outcomeInfo.outcome})`,
        iwRemainingHours: { min: 0, max: 0 },
        trackPos: { x: 1365, y: 286 },
      };
    }

    // Advance not-yet-open Case D to Offer sent once t >= 1.5h
    if (c.id === 'D' && c.opportunityStatus === 'not-yet-open' && newElapsed >= 1.5) {
      const updatedEvents = [
        ...c.prefixEvents,
        'Assessment completed',
        'First offer sent',
      ];
      return {
        ...c,
        opportunityStatus: 'eligible',
        hasFirstOffer: true,
        currentStageIndex: 2,
        currentStageLabel: 'Offer sent (Opportunity open)',
        prefixEvents: updatedEvents,
        prefixLengthK: updatedEvents.length,
        iwRemainingHours: { min: nextMin, max: nextMax },
        trackPos: { x: 1005, y: 286 },
      };
    }

    return {
      ...c,
      iwRemainingHours: { min: nextMin, max: nextMax },
    };
  });

  // Spawn an illustrative arriving Case D when time advances and D is not present yet
  let arrivalsThisStep = Math.round(state.arrivalRatePerHour * deltaHours);
  const hasCaseD = nextCases.some((c) => c.id === 'D');
  if (!hasCaseD && newElapsed >= 0.5) {
    arrivalsThisStep = Math.max(1, arrivalsThisStep);
    nextCases.push({
      id: 'D',
      label: 'Case D',
      applicantSummary: 'Newly arrived applicant · High sensitivity to speed',
      currentStageIndex: 1,
      currentStageLabel: 'Assessment (1st offer not sent yet)',
      prefixEvents: ['Application received', 'Initial screening queued'],
      prefixLengthK: 2,
      opNegativeProb: 0.75,
      teImprovement: 0.45,
      remainingCycleTimeHours: [3, 7],
      iwBaseHours: { min: 1.0, max: 2.5 },
      iwRemainingHours: { min: 1.0, max: 2.5 },
      opportunityStatus: 'not-yet-open',
      hasFirstOffer: false,
      trackPos: { x: 840, y: 286 },
    });
  }

  // Apply pending staff reduction only down to active interventions count
  let nextTotalStaffN = state.totalStaffN;
  let nextPendingStaffN = state.pendingStaffN;
  if (nextPendingStaffN !== null) {
    if (nextPendingStaffN >= stillActiveInterventions.length) {
      nextTotalStaffN = nextPendingStaffN;
      nextPendingStaffN = null;
    } else {
      nextTotalStaffN = Math.max(stillActiveInterventions.length, nextTotalStaffN);
    }
  }

  const nextWip = Math.max(
    nextCases.filter((c) => c.opportunityStatus !== 'completed' && c.opportunityStatus !== 'expired').length,
    state.wipStock + arrivalsThisStep - completionsThisStep
  );

  const summaryBits: string[] = [`Clock advanced to t = ${newElapsed.toFixed(1)}h.`];
  if (completedInterventions.length > 0) {
    summaryBits.push(
      `Finished ${completedInterventions
        .map((i) => `Case ${i.caseId}`)
        .join(', ')} — officer released.`
    );
  }
  if (stillActiveInterventions.length > 0) {
    summaryBits.push(
      `Still active: ${stillActiveInterventions
        .map((i) => `Case ${i.caseId} until ${i.endsAtHours.toFixed(1)}h`)
        .join(', ')}.`
    );
  }

  return {
    ...state,
    elapsedHours: newElapsed,
    cases: nextCases,
    totalStaffN: nextTotalStaffN,
    pendingStaffN: nextPendingStaffN,
    activeInterventions: stillActiveInterventions,
    wipStock: nextWip,
    cumulativeArrivals: state.cumulativeArrivals + arrivalsThisStep,
    cumulativeCompletions: state.cumulativeCompletions + completionsThisStep,
    episodeLedger: [...state.episodeLedger, ...newLedgerEntries],
    lastActionLog: summaryBits.join(' '),
  };
}

/**
 * Fast-forwards logical clock to the next scheduled event (either earliest
 * active intervention completion or +0.5h if none active).
 */
export function advanceToNextEvent(state: SimulationState): SimulationState {
  if (state.activeInterventions.length === 0) {
    return advanceSimulationTime(state, 0.5);
  }
  const earliestEnd = Math.min(...state.activeInterventions.map((i) => i.endsAtHours));
  const delta = Math.max(0.5, Number((earliestEnd - state.elapsedHours).toFixed(2)));
  return advanceSimulationTime(state, delta);
}

/**
 * Updates total staff N WITHOUT ever dropping active ongoing commitments.
 * If requested N < activeInterventions.length, schedules pendingStaffN and explains.
 */
export function updateTotalStaff(
  state: SimulationState,
  requestedTotalStaffN: number
): SimulationState {
  const clamped = Math.max(0, Math.min(5, Math.floor(requestedTotalStaffN)));
  const activeCount = state.activeInterventions.length;

  if (clamped < activeCount) {
    return {
      ...state,
      pendingStaffN: clamped,
      lastActionLog: `Staff reduction to N = ${clamped} scheduled: ${activeCount} officer(s) remain committed until active interventions finish.`,
    };
  }

  const freeNow = clamped - activeCount;
  return {
    ...state,
    totalStaffN: clamped,
    pendingStaffN: null,
    lastActionLog: `Total loan officers set to N = ${clamped} (${freeNow} free, ${activeCount} busy).`,
  };
}

export interface ConnectedGraph {
  incomingEdges: ConceptEdge[];
  outgoingEdges: ConceptEdge[];
  connectedNodeIds: Set<string>;
}

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
