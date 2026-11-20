import test from 'node:test';
import assert from 'node:assert/strict';
import {
  INITIAL_CASES,
  INITIAL_SIMULATION_STATE,
  computeEntropyTU,
  computeIllustrativeConformalOutputs,
  computeResourceMetrics,
  computeToyIncrementalValue,
  evaluateScriptedTeachingPolicy,
  finishCaseIntervention,
  getConnectedGraph,
  startCaseIntervention,
  updateTotalStaff,
} from './prpmModel';
import type { ConceptEdge } from '../types/observatory';

test('computeEntropyTU derives Shannon entropy consistently from OP', () => {
  assert.equal(computeEntropyTU(0), 0);
  assert.equal(computeEntropyTU(1), 0);
  assert.equal(computeEntropyTU(0.5), 1);
  // Symmetric around 0.5
  assert.equal(computeEntropyTU(0.9), computeEntropyTU(0.1));
  // Case C (0.60) has higher uncertainty than Case A (0.90)
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

test('worker allocation prevents double allocation and allocation when n === 0', () => {
  const startB = startCaseIntervention(INITIAL_SIMULATION_STATE, 'B');
  assert.equal(startB.ok, true);
  assert.deepEqual(startB.nextState.busyCaseIds, ['B']);

  // Cannot allocate same case twice
  const doubleB = startCaseIntervention(startB.nextState, 'B');
  assert.equal(doubleB.ok, false);

  // Cannot allocate another case when N=1 and B is occupying the sole officer
  const startCWhileBusy = startCaseIntervention(startB.nextState, 'C');
  assert.equal(startCWhileBusy.ok, false);
  assert.deepEqual(startCWhileBusy.nextState.busyCaseIds, ['B']);

  // Finishing intervention returns officer
  const finishB = finishCaseIntervention(startB.nextState, 'B');
  assert.equal(finishB.ok, true);
  assert.deepEqual(finishB.nextState.busyCaseIds, []);

  // Now C can be allocated
  const startCNow = startCaseIntervention(finishB.nextState, 'C');
  assert.equal(startCNow.ok, true);
  assert.deepEqual(startCNow.nextState.busyCaseIds, ['C']);
});

test('updateTotalStaff clamps busy slots safely', () => {
  let state = updateTotalStaff(INITIAL_SIMULATION_STATE, 2);
  state = startCaseIntervention(state, 'B').nextState;
  state = startCaseIntervention(state, 'C').nextState;
  assert.equal(state.busyCaseIds.length, 2);

  const reduced = updateTotalStaff(state, 1);
  assert.equal(reduced.totalStaffN, 1);
  assert.equal(reduced.busyCaseIds.length, 1);
});

test('computeToyIncrementalValue matches Section 7 arithmetic (-22, +5, +5)', () => {
  const caseA = INITIAL_CASES.find((c) => c.id === 'A')!;
  const caseB = INITIAL_CASES.find((c) => c.id === 'B')!;
  const caseC = INITIAL_CASES.find((c) => c.id === 'C')!;

  assert.equal(computeToyIncrementalValue(caseA.teImprovement, 60, 25), -22);
  assert.equal(computeToyIncrementalValue(caseB.teImprovement, 60, 25), 5);
  assert.equal(computeToyIncrementalValue(caseC.teImprovement, 60, 25), 5);
});

test('evaluateScriptedTeachingPolicy distinguishes risk, benefit, urgency, and capacity', () => {
  const caseA = INITIAL_CASES[0];
  const caseB = INITIAL_CASES[1];
  const caseC = INITIAL_CASES[2];
  const freeMetrics = computeResourceMetrics(1, 0, 3);
  const busyMetrics = computeResourceMetrics(1, 1, 3);

  // Skips riskiest Case A because causal TE is only +5pp
  const decA = evaluateScriptedTeachingPolicy(caseA, INITIAL_CASES, freeMetrics, 1.0, 1.0);
  assert.equal(decA.action, 0);

  // Intervenes on Case B (+50pp, urgent 0.5-1.5h) when staff free
  const decB = evaluateScriptedTeachingPolicy(caseB, INITIAL_CASES, freeMetrics, 1.0, 1.0);
  assert.equal(decB.action, 1);

  // Defers Case C when only 1 officer is free and Case B is more urgent
  const decC = evaluateScriptedTeachingPolicy(caseC, INITIAL_CASES, freeMetrics, 1.0, 1.0);
  assert.equal(decC.action, 0);

  // Blocks Case B when n = 0
  const decBBusy = evaluateScriptedTeachingPolicy(caseB, INITIAL_CASES, busyMetrics, 1.0, 1.0);
  assert.equal(decBBusy.action, 0);
  assert.equal(decBBusy.isFeasible, false);
});

test('computeIllustrativeConformalOutputs reflects uncertainty scale', () => {
  const caseB = INITIAL_CASES[1];
  const standard = computeIllustrativeConformalOutputs(caseB, 1.0);
  const wide = computeIllustrativeConformalOutputs(caseB, 1.8);

  assert.ok(wide.cteIntervalPp[1] - wide.cteIntervalPp[0] > standard.cteIntervalPp[1] - standard.cteIntervalPp[0]);
  assert.ok(wide.ciwIntervalHours[1] - wide.ciwIntervalHours[0] > standard.ciwIntervalHours[1] - standard.ciwIntervalHours[0]);
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
