import test from 'node:test';
import assert from 'node:assert/strict';
import {
  INITIAL_CASES,
  INITIAL_SIMULATION_STATE,
  advanceSimulationTime,
  advanceToNextEvent,
  computeEntropyTU,
  computeIllustrativeConformalOutputs,
  computeResourceMetrics,
  computeToyIncrementalValue,
  evaluateScriptedTeachingPolicy,
  getConnectedGraph,
  recordDoNotInterveneDecision,
  startCaseIntervention,
  updateTotalStaff,
} from './prpmModel';
import type { ConceptEdge } from '../types/observatory';

test('computeEntropyTU derives Shannon entropy consistently from OP', () => {
  assert.equal(computeEntropyTU(0), 0);
  assert.equal(computeEntropyTU(1), 0);
  assert.equal(computeEntropyTU(0.5), 1);
  assert.equal(computeEntropyTU(0.9), computeEntropyTU(0.1));
  assert.ok(computeEntropyTU(0.6) > computeEntropyTU(0.9));
});

test('computeResourceMetrics preserves eta = n / N invariant', () => {
  const oneOfOne = computeResourceMetrics(1, 0, 3);
  assert.equal(oneOfOne.freeStaffN, 1);
  assert.equal(oneOfOne.freeShareEta, 1);

  const oneOfTwo = computeResourceMetrics(2, 1, 3);
  assert.equal(oneOfTwo.freeStaffN, 1);
  assert.equal(oneOfTwo.freeShareEta, 0.5);
  assert.equal(oneOfTwo.busyUtilization, 0.5);

  const zeroTotal = computeResourceMetrics(0, 0, 3);
  assert.equal(zeroTotal.freeStaffN, 0);
  assert.equal(zeroTotal.freeShareEta, 0);
});

test('worker commitment persists across elapsed time until duration completes', () => {
  // Start 1.0h intervention on Case B at t=0
  const startB = startCaseIntervention(INITIAL_SIMULATION_STATE, 'B');
  assert.equal(startB.ok, true);
  assert.equal(startB.nextState.activeInterventions.length, 1);
  assert.equal(startB.nextState.activeInterventions[0].endsAtHours, 1.0);

  // Double allocation blocked
  const doubleB = startCaseIntervention(startB.nextState, 'B');
  assert.equal(doubleB.ok, false);

  // Allocation when n=0 blocked
  const startCWhileBusy = startCaseIntervention(startB.nextState, 'C');
  assert.equal(startCWhileBusy.ok, false);

  // Advance 0.5h: officer STILL busy (0.5 < 1.0), Case C window shrinks by 0.5h
  const atHalfHour = advanceSimulationTime(startB.nextState, 0.5);
  assert.equal(atHalfHour.elapsedHours, 0.5);
  assert.equal(atHalfHour.activeInterventions.length, 1);
  const caseCAtHalf = atHalfHour.cases.find((c) => c.id === 'C')!;
  assert.equal(caseCAtHalf.iwRemainingHours.min, 3.5);
  assert.equal(caseCAtHalf.iwRemainingHours.max, 7.5);

  // Advance another 0.5h to t=1.0h: Case B completes, officer released, ledger records outcome
  const atOneHour = advanceSimulationTime(atHalfHour, 0.5);
  assert.equal(atOneHour.elapsedHours, 1.0);
  assert.equal(atOneHour.activeInterventions.length, 0);
  const caseBCompleted = atOneHour.cases.find((c) => c.id === 'B')!;
  assert.equal(caseBCompleted.opportunityStatus, 'completed');
  assert.equal(atOneHour.episodeLedger.length, 1);
  assert.equal(atOneHour.episodeLedger[0].caseId, 'B');

  // Completed Case B cannot receive a duplicate intervention
  const repeatB = startCaseIntervention(atOneHour, 'B');
  assert.equal(repeatB.ok, false);

  // Now that B is completed, Case C is no longer deferred for B under normal demand
  const caseCNow = atOneHour.cases.find((c) => c.id === 'C')!;
  const metricsNow = computeResourceMetrics(
    atOneHour.totalStaffN,
    atOneHour.activeInterventions.length,
    atOneHour.arrivalRatePerHour,
    atOneHour.wipStock
  );
  const decC = evaluateScriptedTeachingPolicy(
    caseCNow,
    atOneHour.cases,
    metricsNow,
    atOneHour.interventionDurationHours,
    atOneHour.uncertaintyScale
  );
  assert.equal(decC.action, 1);
});

test('updateTotalStaff preserves active commitments instead of silently dropping work', () => {
  let state = updateTotalStaff(INITIAL_SIMULATION_STATE, 2);
  state = startCaseIntervention(state, 'B').nextState;
  state = startCaseIntervention(state, 'C').nextState;
  assert.equal(state.activeInterventions.length, 2);

  // Request reducing staff from 2 to 1 while both are busy
  const reducedRequested = updateTotalStaff(state, 1);
  assert.equal(reducedRequested.activeInterventions.length, 2);
  assert.equal(reducedRequested.totalStaffN, 2);
  assert.equal(reducedRequested.pendingStaffN, 1);

  // When interventions finish via clock advance, pending staff N=1 takes effect
  const finished = advanceToNextEvent(reducedRequested);
  assert.equal(finished.activeInterventions.length, 0);
  assert.equal(finished.totalStaffN, 1);
  assert.equal(finished.pendingStaffN, null);
});

test('advanceToNextEvent jumps by exact 0.1h remainder and policy wording omits offset', () => {
  const halfHourState = {
    ...INITIAL_SIMULATION_STATE,
    interventionDurationHours: 0.5,
  };
  const started = startCaseIntervention(halfHourState, 'B').nextState;
  const atPointFour = advanceSimulationTime(started, 0.4);
  assert.equal(atPointFour.elapsedHours, 0.4);
  assert.equal(atPointFour.activeInterventions.length, 1);

  const exactCompletion = advanceToNextEvent(atPointFour);
  assert.equal(exactCompletion.elapsedHours, 0.5);
  assert.equal(exactCompletion.activeInterventions.length, 0);

  const metrics = computeResourceMetrics(1, 0, 3, 14);
  const dec = evaluateScriptedTeachingPolicy(
    INITIAL_CASES[1],
    INITIAL_CASES,
    metrics,
    1.0,
    1.0
  );
  assert.ok(dec.reasons.some((r) => r === 'Action occupies 1 officer for 1.0h, reducing free staff to 0.'));
});

test('recordDoNotInterveneDecision does not fabricate an observed outcome in episodeLedger', () => {
  const afterZero = recordDoNotInterveneDecision(INITIAL_SIMULATION_STATE, 'A');
  assert.equal(afterZero.decisionCount, 1);
  assert.equal(afterZero.episodeLedger.length, 0);
});

test('demand surge and high uncertainty produce meaningful scripted policy changes', () => {
  const caseC = INITIAL_CASES[2];
  const caseB = INITIAL_CASES[1];

  // With only Case C eligible (simulating B already completed), normal demand recommends Action 1
  const onlyCEligible = INITIAL_CASES.map((c) =>
    c.id === 'B' ? { ...c, opportunityStatus: 'completed' as const } : c
  );
  const normalMetrics = computeResourceMetrics(1, 0, 3, 14);
  const normalC = evaluateScriptedTeachingPolicy(caseC, onlyCEligible, normalMetrics, 1.0, 1.0);
  assert.equal(normalC.action, 1);

  // Under demand surge (lambda = 7/hr), scripted policy defers Case C to reserve sole officer
  const surgeMetrics = computeResourceMetrics(1, 0, 7, 18);
  const surgeC = evaluateScriptedTeachingPolicy(caseC, onlyCEligible, surgeMetrics, 1.0, 1.0);
  assert.equal(surgeC.action, 0);

  // Under standard uncertainty (1.0x), Case B at 1.0h duration recommends Action 1
  const normalB = evaluateScriptedTeachingPolicy(caseB, INITIAL_CASES, normalMetrics, 1.0, 1.0);
  assert.equal(normalB.action, 1);

  // Under wide uncertainty (1.8x), CIW lower bound drops below 1.0h duration -> scripted caution chooses 0
  const uncertainB = evaluateScriptedTeachingPolicy(caseB, INITIAL_CASES, normalMetrics, 1.0, 1.8);
  assert.equal(uncertainB.action, 0);
});

test('computeToyIncrementalValue matches Section 7 arithmetic (-22, +5, +5)', () => {
  assert.equal(computeToyIncrementalValue(INITIAL_CASES[0].teImprovement, 60, 25), -22);
  assert.equal(computeToyIncrementalValue(INITIAL_CASES[1].teImprovement, 60, 25), 5);
  assert.equal(computeToyIncrementalValue(INITIAL_CASES[2].teImprovement, 60, 25), 5);
});

test('computeIllustrativeConformalOutputs reflects uncertainty scale', () => {
  const caseB = INITIAL_CASES[1];
  const standard = computeIllustrativeConformalOutputs(caseB, 1.0);
  const wide = computeIllustrativeConformalOutputs(caseB, 1.8);

  assert.ok(
    wide.cteIntervalPp[1] - wide.cteIntervalPp[0] >
      standard.cteIntervalPp[1] - standard.cteIntervalPp[0]
  );
  assert.ok(
    wide.ciwIntervalHours[1] - wide.ciwIntervalHours[0] >
      standard.ciwIntervalHours[1] - standard.ciwIntervalHours[0]
  );
  assert.deepEqual(wide.copSet, ['Accepted', 'Rejected']);
});

test('getConnectedGraph isolates immediate inputs and outputs', () => {
  const sampleEdges: ConceptEdge[] = [
    { id: 'e1', from: 'prefix', to: 'pred', verb: 'informs', kind: 'information' },
    { id: 'e2', from: 'pred', to: 'state', verb: 'updates', kind: 'information' },
    { id: 'e3', from: 'unrelated', to: 'other', verb: 'flows', kind: 'process' },
  ];
  const graph = getConnectedGraph('pred', sampleEdges);
  assert.equal(graph.incomingEdges.length, 1);
  assert.equal(graph.outgoingEdges.length, 1);
  assert.equal(graph.connectedNodeIds.has('prefix'), true);
  assert.equal(graph.connectedNodeIds.has('state'), true);
  assert.equal(graph.connectedNodeIds.has('unrelated'), false);
});
