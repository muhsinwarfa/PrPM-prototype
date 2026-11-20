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
  INITIAL_CASES,
  INITIAL_SIMULATION_STATE,
  computeIllustrativeConformalOutputs,
  computeResourceMetrics,
  evaluateScriptedTeachingPolicy,
  finishCaseIntervention,
  getConnectedGraph,
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
      INITIAL_CASES.find((c) => c.id === simState.selectedCaseId) ?? INITIAL_CASES[1],
    [simState.selectedCaseId]
  );

  const metrics = useMemo(
    () =>
      computeResourceMetrics(
        simState.totalStaffN,
        simState.busyCaseIds.length,
        simState.arrivalRatePerHour
      ),
    [simState.totalStaffN, simState.busyCaseIds.length, simState.arrivalRatePerHour]
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
        INITIAL_CASES,
        metrics,
        simState.interventionDurationHours,
        simState.uncertaintyScale
      ),
    [
      selectedCase,
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

  const handleSelectConcept = (id: string | null) => {
    setSelectedNodeId(id);
    if (id) {
      setIsSidebarOpen(true);
      if (mode === 'tour') {
        setMode('explore');
      }
    }
  };

  const handleChangeMode = (nextMode: ObservatoryMode) => {
    setMode(nextMode);
    setIsSidebarOpen(true);
    if (nextMode === 'tour') {
      setSelectedNodeId(null);
    }
  };

  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setSelectedNodeId(null);
  };

  const handleResetExercise = () => {
    setSimState(INITIAL_SIMULATION_STATE);
  };

  const handleInterveneNow = (caseId: 'A' | 'B' | 'C') => {
    const res = startCaseIntervention(simState, caseId);
    setSimState(res.nextState);
    if (!res.ok && res.reason) {
      setSimState((prev) => ({ ...prev, lastActionLog: res.reason! }));
    }
  };

  const handleDoNotInterveneNow = (caseId: 'A' | 'B' | 'C') => {
    setSimState((prev) => ({
      ...prev,
      feedbackCount: prev.feedbackCount + 1,
      lastActionLog: `Action 0 chosen for Case ${caseId}: no intervention started now (capacity preserved; later chance remains unpromised).`,
    }));
  };

  const handleFinishIntervention = (caseId: 'A' | 'B' | 'C') => {
    const res = finishCaseIntervention(simState, caseId);
    setSimState(res.nextState);
  };

  const handleExportSvg = () => {
    if (!svgRef.current) return;
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svgRef.current);
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

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8F5] text-[#24313A]">
      <TopNav
        activeSurface={activeSurface}
        onSelectSurface={setActiveSurface}
        onStartTour={() => {
          setActiveSurface('map');
          setMode('tour');
          setTourIndex(0);
          setSelectedNodeId(null);
          setIsSidebarOpen(true);
        }}
        onCompareCases={() => {
          setActiveSurface('map');
          setMode('compare');
          setIsSidebarOpen(true);
        }}
      />

      <WorkspaceToolbar
        mode={mode}
        onChangeMode={handleChangeMode}
        activeSurface={activeSurface}
        onSelectSurface={setActiveSurface}
        concepts={CONCEPT_NODES}
        onSelectConcept={(id) => {
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

      {activeSurface === 'map' && (
        <main className="flex-1 px-4 sm:px-6 py-4 flex flex-col gap-4">
          {/* Central Insight Banner & Sidebar Collapse Toggle */}
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

          {/* Main Spatial Map + Collapsible Context Panel */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
            <div
              className={
                isSidebarOpen ? 'lg:col-span-8 xl:col-span-9 min-w-0' : 'lg:col-span-12 min-w-0'
              }
            >
              <ObservatoryCanvas
                svgRef={svgRef}
                concepts={CONCEPT_NODES}
                edges={CONCEPT_EDGES}
                cases={INITIAL_CASES}
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
                onZoomWheel={(deltaY) =>
                  setZoom((z) =>
                    deltaY < 0
                      ? Math.min(2, Number((z + 0.1).toFixed(2)))
                      : Math.max(0.7, Number((z - 0.1).toFixed(2)))
                  )
                }
                onSelectNode={(id) => {
                  if (mode === 'tour') {
                    setMode('explore');
                  }
                  setSelectedNodeId((prev) => (prev === id ? null : id));
                  setIsSidebarOpen(true);
                }}
                onSelectCase={(id) =>
                  setSimState((prev) => ({
                    ...prev,
                    selectedCaseId: id,
                    lastActionLog: `Examining Case ${id} at the Dispatch Desk.`,
                  }))
                }
                onInterveneNow={handleInterveneNow}
                onDoNotInterveneNow={handleDoNotInterveneNow}
              />
            </div>

            {isSidebarOpen && (
              <div className="lg:col-span-4 xl:col-span-3 min-w-0">
                {mode === 'tour' ? (
                  <GuidedTourBar
                    steps={GUIDED_TOUR_STEPS}
                    currentIndex={tourIndex}
                    onChangeIndex={setTourIndex}
                    onExitTour={() => setMode('explore')}
                  />
                ) : mode === 'compare' ? (
                  <CompareCasesPanel
                    cases={INITIAL_CASES}
                    selectedCaseId={simState.selectedCaseId}
                    onSelectCase={(id) =>
                      setSimState((prev) => ({ ...prev, selectedCaseId: id }))
                    }
                    busyCaseIds={simState.busyCaseIds}
                    metrics={metrics}
                    uncertaintyScale={simState.uncertaintyScale}
                    onResetExercise={handleResetExercise}
                  />
                ) : mode === 'whatif' ? (
                  <WhatIfPanel
                    simState={simState}
                    cases={INITIAL_CASES}
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
                    onFinishIntervention={handleFinishIntervention}
                    onResetSimulation={handleResetExercise}
                  />
                ) : (
                  <ConceptDetailPanel
                    concept={selectedConcept}
                    allConcepts={CONCEPT_NODES}
                    incomingEdges={connectedGraph.incomingEdges}
                    outgoingEdges={connectedGraph.outgoingEdges}
                    selectedCase={selectedCase}
                    allCases={INITIAL_CASES}
                    onSelectCase={(id) =>
                      setSimState((prev) => ({ ...prev, selectedCaseId: id }))
                    }
                    onSelectConcept={handleSelectConcept}
                    conformal={conformal}
                    metrics={metrics}
                  />
                )}
              </div>
            )}
          </div>

          {/* Mobile Guided Sequence preserving map relationships */}
          <MobileGuidedSequence
            concepts={CONCEPT_NODES}
            selectedNodeId={selectedNodeId}
            onSelectNode={(id) => {
              setMode('explore');
              handleSelectConcept(id);
            }}
          />
        </main>
      )}

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
