/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useMemo, useRef, useState } from 'react';
import { PanelRightClose, PanelRightOpen } from 'lucide-react';
import { CONCEPT_NODES } from './data/concepts';
import { CONCEPT_EDGES } from './data/edges';
import { GUIDED_TOUR_STEPS } from './data/tourAndQuiz';
import {
  INITIAL_SIMULATION_STATE,
  advanceSimulationTime,
  advanceToNextEvent,
  computeIllustrativeConformalOutputs,
  computeResourceMetrics,
  evaluateScriptedTeachingPolicy,
  getConnectedGraph,
  recordDoNotInterveneDecision,
  startCaseIntervention,
  updateTotalStaff,
} from './logic/prpmModel';
import type { ObservatoryMode, SimulationState } from './types/observatory';
import { TopNav, type ActiveSurface } from './components/TopNav';
import { WorkspaceToolbar } from './components/WorkspaceToolbar';
import { ObservatoryCanvas } from './components/ObservatoryCanvas';
import { ConceptDetailPanel } from './components/ConceptDetailPanel';
import { GuidedTourBar } from './components/GuidedTourBar';
import { CompareCasesPanel } from './components/CompareCasesPanel';
import { WhatIfPanel } from './components/WhatIfPanel';
import { KnowledgeCheckView } from './components/KnowledgeCheckView';
import { StudyEvidenceView } from './components/StudyEvidenceView';
import { TextOutlineView } from './components/TextOutlineView';
import { MobileGuidedSequence } from './components/MobileGuidedSequence';

export default function App() {
  const svgRef = useRef<SVGSVGElement | null>(null);

  const [activeSurface, setActiveSurface] = useState<ActiveSurface>('map');
  const [mode, setMode] = useState<ObservatoryMode>('explore');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [tourIndex, setTourIndex] = useState(0);
  const [simState, setSimState] = useState<SimulationState>(INITIAL_SIMULATION_STATE);
  const [savedSandboxState, setSavedSandboxState] = useState<SimulationState | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMotionPaused, setIsMotionPaused] = useState(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  });

  const selectedCase = useMemo(
    () =>
      simState.cases.find((c) => c.id === simState.selectedCaseId) ??
      simState.cases[1] ??
      simState.cases[0],
    [simState.cases, simState.selectedCaseId]
  );

  const metrics = useMemo(
    () =>
      computeResourceMetrics(
        simState.totalStaffN,
        simState.activeInterventions.length,
        simState.arrivalRatePerHour,
        simState.wipStock,
        simState.pendingStaffN
      ),
    [
      simState.totalStaffN,
      simState.activeInterventions.length,
      simState.arrivalRatePerHour,
      simState.wipStock,
      simState.pendingStaffN,
    ]
  );

  const conformal = useMemo(
    () =>
      computeIllustrativeConformalOutputs(selectedCase, simState.uncertaintyScale),
    [selectedCase, simState.uncertaintyScale]
  );

  const policyDecision = useMemo(
    () =>
      evaluateScriptedTeachingPolicy(
        selectedCase,
        simState.cases,
        metrics,
        simState.interventionDurationHours,
        simState.uncertaintyScale
      ),
    [
      selectedCase,
      simState.cases,
      metrics,
      simState.interventionDurationHours,
      simState.uncertaintyScale,
    ]
  );

  const selectedConcept = useMemo(
    () => CONCEPT_NODES.find((c) => c.id === selectedNodeId) ?? null,
    [selectedNodeId]
  );

  const connectedGraph = useMemo(() => {
    if (!selectedNodeId) {
      return {
        incomingEdges: [],
        outgoingEdges: [],
        connectedNodeIds: new Set<string>(),
      };
    }
    return getConnectedGraph(selectedNodeId, CONCEPT_EDGES);
  }, [selectedNodeId]);

  const { highlightedNodeIds, highlightedEdgeIds } = useMemo(() => {
    if (mode === 'tour') {
      const step = GUIDED_TOUR_STEPS[tourIndex];
      return {
        highlightedNodeIds: new Set(step.focusNodeIds),
        highlightedEdgeIds: new Set(step.focusEdgeIds),
      };
    }
    if (selectedNodeId) {
      const edgeIds = new Set<string>([
        ...connectedGraph.incomingEdges.map((e) => e.id),
        ...connectedGraph.outgoingEdges.map((e) => e.id),
      ]);
      return {
        highlightedNodeIds: connectedGraph.connectedNodeIds,
        highlightedEdgeIds: edgeIds,
      };
    }
    return {
      highlightedNodeIds: new Set<string>(),
      highlightedEdgeIds: new Set<string>(),
    };
  }, [mode, tourIndex, selectedNodeId, connectedGraph]);

  const syncTourStepScenario = (idx: number) => {
    const step = GUIDED_TOUR_STEPS[idx];
    setTourIndex(idx);
    setSimState(() => ({
      ...INITIAL_SIMULATION_STATE,
      cases: INITIAL_SIMULATION_STATE.cases.map((c) => ({
        ...c,
        prefixEvents: [...c.prefixEvents],
        iwBaseHours: { ...c.iwBaseHours },
        iwRemainingHours: { ...c.iwRemainingHours },
        remainingCycleTimeHours: [...c.remainingCycleTimeHours] as [number, number],
        trackPos: { ...c.trackPos },
      })),
      selectedCaseId: step.targetCaseId,
      totalStaffN: step.targetStaffN,
    }));
  };

  const enterTourMode = () => {
    if (mode !== 'tour') {
      setSavedSandboxState(simState);
    }
    setActiveSurface('map');
    setMode('tour');
    setSelectedNodeId(null);
    setIsSidebarOpen(true);
    syncTourStepScenario(0);
  };

  const exitTourMode = () => {
    setMode('explore');
    if (savedSandboxState) {
      setSimState(savedSandboxState);
      setSavedSandboxState(null);
    }
  };

  const handleSelectConcept = (id: string | null) => {
    setSelectedNodeId(id);
    if (id) {
      setIsSidebarOpen(true);
      if (mode === 'tour') {
        exitTourMode();
      }
    }
  };

  const handleChangeMode = (nextMode: ObservatoryMode) => {
    if (nextMode === 'tour') {
      enterTourMode();
      return;
    }
    if (mode === 'tour') {
      exitTourMode();
    }
    setMode(nextMode);
    setIsSidebarOpen(true);
  };

  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setSelectedNodeId(null);
  };

  const handleResetExercise = () => {
    setSimState(INITIAL_SIMULATION_STATE);
  };

  const handleInterveneNow = (caseId: 'A' | 'B' | 'C' | 'D') => {
    const res = startCaseIntervention(simState, caseId);
    setSimState(res.nextState);
    if (!res.ok && res.reason) {
      setSimState((prev) => ({ ...prev, lastActionLog: res.reason! }));
    }
  };

  const handleDoNotInterveneNow = (caseId: 'A' | 'B' | 'C' | 'D') => {
    setSimState((prev) => recordDoNotInterveneDecision(prev, caseId));
  };

  const handleApplyPreset = (
    preset: 'baseline' | 'demand-surge' | 'high-uncertainty'
  ) => {
    if (preset === 'baseline') {
      setSimState({
        ...INITIAL_SIMULATION_STATE,
        selectedCaseId: 'B',
        lastActionLog:
          'Preset loaded: Baseline (N=1 officer free, λ=3/hr, 1.0× uncertainty). Case B recommended Action 1.',
      });
    } else if (preset === 'demand-surge') {
      setSimState({
        ...INITIAL_SIMULATION_STATE,
        selectedCaseId: 'C',
        arrivalRatePerHour: 7,
        wipStock: 21,
        cases: INITIAL_SIMULATION_STATE.cases.map((c) =>
          c.id === 'B'
            ? { ...c, opportunityStatus: 'completed', currentStageLabel: 'Completed (Accepted)' }
            : { ...c }
        ),
        lastActionLog:
          'Preset loaded: Demand Surge (λ=7/hr, Case B already done). Sole free officer reserved rather than tied up on wide-window Case C.',
      });
    } else {
      setSimState({
        ...INITIAL_SIMULATION_STATE,
        selectedCaseId: 'B',
        uncertaintyScale: 1.8,
        interventionDurationHours: 1.0,
        lastActionLog:
          'Preset loaded: High Uncertainty (1.8× band). CIW lower bound drops to 0.1h (< 1.0h duration), triggering scripted caution Action 0.',
      });
    }
  };

  const handleExportSvg = () => {
    if (!svgRef.current) return;
    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(svgRef.current);
    if (!source.includes('xmlns="http://www.w3.org/2000/svg"')) {
      source = source.replace(
        '<svg ',
        '<svg xmlns="http://www.w3.org/2000/svg" '
      );
    }
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'the-process-observatory.svg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  // Wider side column when comparing A, B, C side by side on desktop
  const mapColClass = !isSidebarOpen
    ? 'lg:col-span-12 min-w-0'
    : mode === 'compare'
    ? 'lg:col-span-7 xl:col-span-7 min-w-0'
    : 'lg:col-span-8 xl:col-span-9 min-w-0';

  const sideColClass =
    mode === 'compare'
      ? 'lg:col-span-5 xl:col-span-5 min-w-0'
      : 'lg:col-span-4 xl:col-span-3 min-w-0';

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8F5] text-[#24313A]">
      <TopNav
        activeSurface={activeSurface}
        onSelectSurface={setActiveSurface}
        onStartTour={enterTourMode}
        onCompareCases={() => {
          setActiveSurface('map');
          handleChangeMode('compare');
        }}
      />

      <WorkspaceToolbar
        mode={mode}
        onChangeMode={handleChangeMode}
        activeSurface={activeSurface}
        onSelectSurface={setActiveSurface}
        concepts={CONCEPT_NODES}
        onSelectConcept={(id) => {
          if (mode === 'tour') exitTourMode();
          setMode('explore');
          handleSelectConcept(id);
        }}
        zoom={zoom}
        onZoomIn={() => setZoom((z) => Math.min(2, Number((z + 0.15).toFixed(2))))}
        onZoomOut={() => setZoom((z) => Math.max(0.7, Number((z - 0.15).toFixed(2))))}
        onResetView={handleResetView}
        isMotionPaused={isMotionPaused}
        onToggleMotion={() => setIsMotionPaused((p) => !p)}
        onExportSvg={handleExportSvg}
        onPrint={handlePrint}
      />

      {/* Keep map canvas mounted even when viewing Text Outline / Quiz / Evidence so SVG export always works */}
      <main
        className={
          activeSurface === 'map'
            ? 'flex-1 px-4 sm:px-6 py-4 flex flex-col gap-4'
            : 'sr-only'
        }
        aria-hidden={activeSurface !== 'map'}
      >
        <div className="no-print flex flex-wrap items-center justify-between gap-2 text-xs text-[#475569]">
          <p>
            <strong className="text-[#24313A]">Central insight:</strong> A case can be risky without being worth intervening on. A useful intervention can still be too late, too uncertain, or infeasible because staff are busy.
          </p>
          <button
            type="button"
            onClick={() => setIsSidebarOpen((o) => !o)}
            className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-[#D4D9D0] rounded-lg text-xs font-medium text-[#24313A] hover:bg-[#F1F4EE] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8]"
          >
            {isSidebarOpen ? (
              <>
                <PanelRightClose className="w-3.5 h-3.5" />
                Hide side panel
              </>
            ) : (
              <>
                <PanelRightOpen className="w-3.5 h-3.5" />
                Show side panel
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch lg:h-[calc(100vh-244px)] lg:min-h-[520px] min-h-0">
          <div className={`${mapColClass} lg:h-full min-h-0`}>
            <ObservatoryCanvas
              svgRef={svgRef}
              concepts={CONCEPT_NODES}
              edges={CONCEPT_EDGES}
              cases={simState.cases}
              simState={simState}
              selectedCase={selectedCase}
              conformal={conformal}
              metrics={metrics}
              policyDecision={policyDecision}
              selectedNodeId={selectedNodeId}
              highlightedNodeIds={highlightedNodeIds}
              highlightedEdgeIds={highlightedEdgeIds}
              mode={mode}
              zoom={zoom}
              pan={pan}
              isMotionPaused={isMotionPaused}
              onChangePan={setPan}
              onChangeZoom={setZoom}
              onZoomWheel={(deltaY) =>
                setZoom((z) =>
                  deltaY < 0
                    ? Math.min(2, Number((z + 0.1).toFixed(2)))
                    : Math.max(0.7, Number((z - 0.1).toFixed(2)))
                )
              }
              onSelectNode={(id) => {
                if (mode === 'tour') {
                  exitTourMode();
                }
                setSelectedNodeId((prev) => (prev === id ? null : id));
                setIsSidebarOpen(true);
              }}
              onSelectCase={(id) => {
                if (mode === 'tour') {
                  exitTourMode();
                }
                setSimState((prev) => ({
                  ...prev,
                  selectedCaseId: id,
                  lastActionLog: `Examining Case ${id} at the Dispatch Desk.`,
                }));
                if (mode === 'explore' || mode === 'tour') {
                  setSelectedNodeId('active-prefix');
                }
                setIsSidebarOpen(true);
              }}
              onInterveneNow={handleInterveneNow}
              onDoNotInterveneNow={handleDoNotInterveneNow}
            />
          </div>

          {isSidebarOpen && (
            <div className={`${sideColClass} lg:h-full lg:overflow-y-auto min-h-0`}>
              {mode === 'tour' ? (
                <GuidedTourBar
                  steps={GUIDED_TOUR_STEPS}
                  currentIndex={tourIndex}
                  onChangeIndex={syncTourStepScenario}
                  onExitTour={exitTourMode}
                />
              ) : mode === 'compare' ? (
                <CompareCasesPanel
                  cases={simState.cases}
                  selectedCaseId={simState.selectedCaseId}
                  onSelectCase={(id) =>
                    setSimState((prev) => ({ ...prev, selectedCaseId: id }))
                  }
                  activeCaseIds={simState.activeInterventions.map((i) => i.caseId)}
                  metrics={metrics}
                  uncertaintyScale={simState.uncertaintyScale}
                  elapsedHours={simState.elapsedHours}
                  onResetExercise={handleResetExercise}
                />
              ) : mode === 'whatif' ? (
                <WhatIfPanel
                  simState={simState}
                  cases={simState.cases}
                  selectedCase={selectedCase}
                  metrics={metrics}
                  policyDecision={policyDecision}
                  onSelectCase={(id) =>
                    setSimState((prev) => ({ ...prev, selectedCaseId: id }))
                  }
                  onChangeStaffN={(n) =>
                    setSimState((prev) => updateTotalStaff(prev, n))
                  }
                  onChangeArrivalRate={(rate) =>
                    setSimState((prev) => ({
                      ...prev,
                      arrivalRatePerHour: rate,
                      lastActionLog: `Incoming arrival rate λ set to ${rate} cases/hr.`,
                    }))
                  }
                  onChangeDuration={(hours) =>
                    setSimState((prev) => ({
                      ...prev,
                      interventionDurationHours: hours,
                      lastActionLog: `Intervention duration set to ${hours.toFixed(1)}h.`,
                    }))
                  }
                  onChangeUncertaintyScale={(scale) =>
                    setSimState((prev) => ({
                      ...prev,
                      uncertaintyScale: scale,
                      lastActionLog: `Illustrative uncertainty band width set to ${scale.toFixed(1)}×.`,
                    }))
                  }
                  onInterveneNow={handleInterveneNow}
                  onDoNotInterveneNow={handleDoNotInterveneNow}
                  onAdvanceTime={(delta) =>
                    setSimState((prev) => advanceSimulationTime(prev, delta))
                  }
                  onAdvanceNextEvent={() =>
                    setSimState((prev) => advanceToNextEvent(prev))
                  }
                  onApplyPreset={handleApplyPreset}
                  onResetSimulation={handleResetExercise}
                />
              ) : (
                <ConceptDetailPanel
                  concept={selectedConcept}
                  allConcepts={CONCEPT_NODES}
                  incomingEdges={connectedGraph.incomingEdges}
                  outgoingEdges={connectedGraph.outgoingEdges}
                  selectedCase={selectedCase}
                  allCases={simState.cases}
                  onSelectCase={(id) =>
                    setSimState((prev) => ({ ...prev, selectedCaseId: id }))
                  }
                  onSelectConcept={handleSelectConcept}
                  conformal={conformal}
                  metrics={metrics}
                  episodeLedger={simState.episodeLedger}
                  decisionCount={simState.decisionCount}
                />
              )}
            </div>
          )}
        </div>

        <MobileGuidedSequence
          concepts={CONCEPT_NODES}
          selectedNodeId={selectedNodeId}
          onSelectNode={(id) => {
            if (mode === 'tour') exitTourMode();
            setMode('explore');
            handleSelectConcept(id);
          }}
        />
      </main>

      {activeSurface === 'quiz' && (
        <KnowledgeCheckView
          onInspectConceptOnMap={(conceptId) => {
            setActiveSurface('map');
            setMode('explore');
            handleSelectConcept(conceptId);
          }}
        />
      )}

      {activeSurface === 'evidence' && <StudyEvidenceView />}

      {activeSurface === 'outline' && (
        <TextOutlineView
          concepts={CONCEPT_NODES}
          edges={CONCEPT_EDGES}
          onInspectConceptOnMap={(id) => {
            setActiveSurface('map');
            setMode('explore');
            handleSelectConcept(id);
          }}
          onExportSvg={handleExportSvg}
          onPrint={handlePrint}
        />
      )}
    </div>
  );
}
