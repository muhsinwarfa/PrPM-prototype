import React, { useMemo, useRef, useState } from 'react';
import type {
  ConceptEdge,
  ConceptNode,
  ConformalOutputs,
  LoanCase,
  ObservatoryMode,
  ResourceMetrics,
  ScriptedPolicyDecision,
  SimulationState,
} from '../types/observatory';
import { computeEntropyTU } from '../logic/prpmModel';

interface ObservatoryCanvasProps {
  svgRef: React.RefObject<SVGSVGElement | null>;
  concepts: ConceptNode[];
  edges: ConceptEdge[];
  cases: LoanCase[];
  simState: SimulationState;
  selectedCase: LoanCase;
  conformal: ConformalOutputs;
  metrics: ResourceMetrics;
  policyDecision: ScriptedPolicyDecision;
  selectedNodeId: string | null;
  highlightedNodeIds: Set<string>;
  highlightedEdgeIds: Set<string>;
  mode: ObservatoryMode;
  zoom: number;
  pan: { x: number; y: number };
  isMotionPaused: boolean;
  onChangePan: (pan: { x: number; y: number }) => void;
  onZoomWheel: (deltaY: number) => void;
  onSelectNode: (id: string) => void;
  onSelectCase: (id: 'A' | 'B' | 'C') => void;
  onInterveneNow: (caseId: 'A' | 'B' | 'C') => void;
  onDoNotInterveneNow: (caseId: 'A' | 'B' | 'C') => void;
}

const EDGE_COLORS: Record<ConceptEdge['kind'], string> = {
  process: '#24313A',
  information: '#1D4ED8',
  learning: '#6D28D9',
};

export const ObservatoryCanvas: React.FC<ObservatoryCanvasProps> = ({
  svgRef,
  edges,
  cases,
  simState,
  selectedCase,
  conformal,
  metrics,
  policyDecision,
  selectedNodeId,
  highlightedNodeIds,
  highlightedEdgeIds,
  mode,
  zoom,
  pan,
  isMotionPaused,
  onChangePan,
  onZoomWheel,
  onSelectNode,
  onSelectCase,
  onInterveneNow,
  onDoNotInterveneNow,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<{
    startX: number;
    startY: number;
    origPanX: number;
    origPanY: number;
  } | null>(null);

  const hasSelectionFocus =
    selectedNodeId !== null || mode === 'tour';

  const tu = useMemo(
    () => computeEntropyTU(selectedCase.opNegativeProb),
    [selectedCase.opNegativeProb]
  );

  const baseAcceptPct = Math.round((1 - selectedCase.opNegativeProb) * 100);
  const withAcceptPct = Math.round(
    (1 - selectedCase.opNegativeProb + selectedCase.teImprovement) * 100
  );
  const tePp = Math.round(selectedCase.teImprovement * 100);
  const negPct = Math.round(selectedCase.opNegativeProb * 100);
  const isCurrentBusy = simState.busyCaseIds.includes(selectedCase.id);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest('[data-interactive-node="true"]')) {
      return;
    }
    setDragging({
      startX: e.clientX,
      startY: e.clientY,
      origPanX: pan.x,
      origPanY: pan.y,
    });
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    const dx = e.clientX - dragging.startX;
    const dy = e.clientY - dragging.startY;
    onChangePan({ x: dragging.origPanX + dx, y: dragging.origPanY + dy });
  };

  const handlePointerUp = () => {
    setDragging(null);
  };

  const nodeInteractiveProps = (id: string, label: string) => ({
    'data-interactive-node': 'true',
    role: 'button' as const,
    tabIndex: 0,
    'aria-label': label,
    className: 'cursor-pointer focus:outline-none',
    onClick: (e: React.MouseEvent) => {
      e.stopPropagation();
      onSelectNode(id);
    },
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        e.stopPropagation();
        onSelectNode(id);
      }
    },
  });

  const isHighlightedNode = (id: string) =>
    !hasSelectionFocus || highlightedNodeIds.has(id);

  const nodeOpacity = (id: string) => (isHighlightedNode(id) ? 1 : 0.35);

  const strokeHighlight = (id: string, defaultStroke: string) =>
    selectedNodeId === id ? '#1D4ED8' : defaultStroke;

  const strokeWidthHighlight = (id: string, base = 1.5) =>
    selectedNodeId === id ? base + 1.5 : base;

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onWheel={(e) => {
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          onZoomWheel(e.deltaY);
        }
      }}
      data-testid="observatory-canvas-viewport"
      className={`relative w-full aspect-[1600/1040] lg:aspect-auto lg:h-full lg:min-h-[660px] bg-[#F7F8F5] border border-[#DCE1D9] rounded-xl overflow-hidden select-none ${
        dragging ? 'cursor-grabbing' : 'cursor-grab'
      } ${isMotionPaused ? 'reduced-motion' : ''}`}
    >
      {/* Zoomable/Pannable SVG Surface */}
      <div
        className="w-full h-full flex items-center justify-center transition-transform duration-150 ease-out"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: 'center center',
        }}
      >
        <svg
          ref={svgRef}
          viewBox="0 0 1600 1040"
          className="w-full h-full max-w-[1600px] max-h-[1040px]"
          role="img"
          aria-label="The Process Observatory spatial concept map showing the outer BPM lifecycle, inner loan process track, historical workbench, significance/urgency/capacity instruments, dispatch desk, and PPO feedback ledger"
        >
          <defs>
            <pattern
              id="tabletop-grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="#E4E8DF"
                strokeWidth="0.75"
              />
            </pattern>
            <filter id="card-shadow" x="-4%" y="-4%" width="108%" height="112%">
              <feDropShadow
                dx="0"
                dy="2"
                stdDeviation="3"
                floodColor="#24313A"
                floodOpacity="0.06"
              />
            </filter>
            <marker
              id="arrow-process"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#24313A" />
            </marker>
            <marker
              id="arrow-info"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#1D4ED8" />
            </marker>
            <marker
              id="arrow-learning"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#6D28D9" />
            </marker>
          </defs>

          {/* Warm Tabletop Background */}
          <rect x="0" y="0" width="1600" height="1040" fill="#F7F8F5" />
          <rect x="0" y="0" width="1600" height="1040" fill="url(#tabletop-grid)" />

          {/* 1. OUTER LIFECYCLE FRAME ("Improve the process") */}
          <g
            opacity={nodeOpacity('bpm-lifecycle')}
            {...nodeInteractiveProps(
              'bpm-lifecycle',
              'Outer frame: BPM Lifecycle — Improve the process over time'
            )}
          >
            <rect
              x="24"
              y="18"
              width="1552"
              height="1004"
              rx="18"
              fill="none"
              stroke={strokeHighlight('bpm-lifecycle', '#CBD2C8')}
              strokeWidth={strokeWidthHighlight('bpm-lifecycle', 2)}
            />
            <rect
              x="36"
              y="26"
              width="1528"
              height="92"
              rx="12"
              fill="#FFFFFF"
              stroke="#DCE1D9"
              strokeWidth="1.2"
              filter="url(#card-shadow)"
            />
            <text
              x="56"
              y="48"
              fontSize="13"
              fontWeight="700"
              fill="#24313A"
              fontFamily="Plus Jakarta Sans, sans-serif"
            >
              Outer Frame · Improve the process (BPM Lifecycle)
            </text>
            <text
              x="56"
              y="66"
              fontSize="11"
              fill="#52606D"
              fontFamily="DM Sans, sans-serif"
            >
              Textbook anchor: Process owners manage the whole process over time.
            </text>
            <text
              x="56"
              y="81"
              fontSize="10.5"
              fill="#64748B"
              fontFamily="DM Sans, sans-serif"
            >
              Customer cases never move through these six phases.
            </text>

            {/* Six BPM Lifecycle Phases */}
            {[
              { x: 525, label: '1. Identification' },
              { x: 675, label: '2. Discovery' },
              { x: 815, label: '3. Analysis' },
              { x: 950, label: '4. Redesign' },
              { x: 1095, label: '5. Implementation' },
              { x: 1255, label: '6. Monitoring' },
            ].map((phase, idx, arr) => (
              <g key={phase.label}>
                <rect
                  x={phase.x}
                  y="44"
                  width="124"
                  height="34"
                  rx="7"
                  fill={idx === 5 ? '#EFF6FF' : '#F7F8F5'}
                  stroke={idx === 5 ? '#93C5FD' : '#CBD2C8'}
                  strokeWidth="1.2"
                />
                <text
                  x={phase.x + 62}
                  y="65"
                  textAnchor="middle"
                  fontSize="11.5"
                  fontWeight="600"
                  fill="#24313A"
                >
                  {phase.label}
                </text>
                {idx < arr.length - 1 && (
                  <line
                    x1={phase.x + 124}
                    y1="61"
                    x2={arr[idx + 1].x - 3}
                    y2="61"
                    stroke="#64748B"
                    strokeWidth="1.4"
                    markerEnd="url(#arrow-process)"
                  />
                )}
              </g>
            ))}

            {/* Iterative BPM feedback curve from Monitoring back to Discovery/Analysis/Redesign */}
            <path
              d="M 1317 78 C 1317 104, 737 104, 737 82"
              fill="none"
              stroke="#6D28D9"
              strokeWidth="1.4"
              strokeDasharray="4 4"
              markerEnd="url(#arrow-learning)"
            />
            <text
              x="1025"
              y="108"
              textAnchor="middle"
              fontSize="10.5"
              fontWeight="500"
              fill="#6D28D9"
            >
              Iterative feedback: Monitoring reveals issues → Discovery, Analysis, Redesign
            </text>
          </g>

          {/* Monitoring Bridge to Runtime Control */}
          <g
            opacity={nodeOpacity('monitoring-bridge')}
            {...nodeInteractiveProps(
              'monitoring-bridge',
              'Monitoring bridge to runtime prescriptive control'
            )}
          >
            <rect
              x="1398"
              y="44"
              width="148"
              height="68"
              rx="8"
              fill="#FAFBF9"
              stroke={strokeHighlight('monitoring-bridge', '#93C5FD')}
              strokeWidth={strokeWidthHighlight('monitoring-bridge', 1.4)}
            />
            <text
              x="1472"
              y="66"
              textAnchor="middle"
              fontSize="11"
              fontWeight="700"
              fill="#1E40AF"
            >
              Monitoring Bridge
            </text>
            <text
              x="1472"
              y="82"
              textAnchor="middle"
              fontSize="10"
              fill="#475569"
            >
              Adds runtime case control
            </text>
            <text
              x="1472"
              y="96"
              textAnchor="middle"
              fontSize="10"
              fill="#475569"
            >
              to textbook monitoring
            </text>
          </g>

          {/* 2. HISTORICAL RECORDS WORKBENCH ("Learn from past cases") */}
          <g
            opacity={nodeOpacity('historical-workbench')}
            {...nodeInteractiveProps(
              'historical-workbench',
              'Historical Workbench: Learn from past completed cases'
            )}
          >
            <rect
              x="54"
              y="142"
              width="580"
              height="324"
              rx="14"
              fill="#FAFBF8"
              stroke={strokeHighlight('historical-workbench', '#CBD2C8')}
              strokeWidth={strokeWidthHighlight('historical-workbench', 1.6)}
              filter="url(#card-shadow)"
            />
            <text
              x="74"
              y="168"
              fontSize="14"
              fontWeight="700"
              fill="#24313A"
              fontFamily="Plus Jakarta Sans, sans-serif"
            >
              Historical Workbench · Learn from past cases (Offline)
            </text>
            <text x="74" y="185" fontSize="11" fill="#52606D">
              Keep all prefixes from the same case in one split — future events never leak into live inputs.
            </text>

            {/* Pipeline stages 1, 2, 3 */}
            <rect x="74" y="200" width="160" height="46" rx="8" fill="#FFFFFF" stroke="#D4D9D0" />
            <text x="154" y="220" textAnchor="middle" fontSize="11.5" fontWeight="600" fill="#24313A">
              1. Completed Traces
            </text>
            <text x="154" y="236" textAnchor="middle" fontSize="10" fill="#64748B">
              Event logs (history)
            </text>

            <line x1="234" y1="223" x2="256" y2="223" stroke="#475569" strokeWidth="1.4" markerEnd="url(#arrow-process)" />

            <rect x="260" y="200" width="152" height="46" rx="8" fill="#FFFFFF" stroke="#D4D9D0" />
            <text x="336" y="220" textAnchor="middle" fontSize="11.5" fontWeight="600" fill="#24313A">
              2. Prefix Cutter
            </text>
            <text x="336" y="236" textAnchor="middle" fontSize="10" fill="#64748B">
              Partial snapshots hdᴷ(σ)
            </text>

            <line x1="412" y1="223" x2="434" y2="223" stroke="#475569" strokeWidth="1.4" markerEnd="url(#arrow-process)" />

            <rect x="438" y="200" width="176" height="46" rx="8" fill="#FFFFFF" stroke="#D4D9D0" />
            <text x="526" y="220" textAnchor="middle" fontSize="11.5" fontWeight="600" fill="#24313A">
              3. Feature Encoder
            </text>
            <text x="526" y="236" textAnchor="middle" fontSize="10" fill="#64748B">
              Prefix → model inputs
            </text>

            {/* Explicit Split Barrier */}
            <rect x="74" y="258" width="212" height="32" rx="6" fill="#EFF6FF" stroke="#BFDBFE" />
            <text x="180" y="278" textAnchor="middle" fontSize="11" fontWeight="600" fill="#1E40AF">
              Training Split (Fit 3 models)
            </text>

            <rect x="296" y="258" width="154" height="32" rx="6" fill="#F5F3FF" stroke="#DDD6FE" />
            <text x="373" y="278" textAnchor="middle" fontSize="11" fontWeight="600" fill="#5B21B6">
              Calibration Split
            </text>

            <rect x="460" y="258" width="154" height="32" rx="6" fill="#FFFFFF" stroke="#CBD2C8" strokeDasharray="3 2" />
            <text x="537" y="278" textAnchor="middle" fontSize="11" fontWeight="600" fill="#475569">
              Held-out Eval Tray
            </text>

            {/* Three Model-Training Stations */}
            <rect x="74" y="304" width="166" height="72" rx="8" fill="#FFFFFF" stroke="#93C5FD" strokeWidth="1.3" />
            <text x="157" y="324" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="#1E40AF">
              Predictive Station
            </text>
            <text x="157" y="341" textAnchor="middle" fontSize="10.5" fill="#475569">
              Estimates risk OP &amp;
            </text>
            <text x="157" y="356" textAnchor="middle" fontSize="10.5" fill="#475569">
              entropy uncertainty TU
            </text>

            <rect x="252" y="304" width="166" height="72" rx="8" fill="#FFFFFF" stroke="#93C5FD" strokeWidth="1.3" />
            <text x="335" y="324" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="#1E40AF">
              Causal Station
            </text>
            <text x="335" y="341" textAnchor="middle" fontSize="10.5" fill="#475569">
              Estimates intervention
            </text>
            <text x="335" y="356" textAnchor="middle" fontSize="10.5" fill="#475569">
              treatment effect TE
            </text>

            <rect x="430" y="304" width="184" height="72" rx="8" fill="#FFFFFF" stroke="#FCD34D" strokeWidth="1.3" />
            <text x="522" y="324" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="#B45309">
              Survival Station
            </text>
            <text x="522" y="341" textAnchor="middle" fontSize="10.5" fill="#475569">
              Estimates intervention
            </text>
            <text x="522" y="356" textAnchor="middle" fontSize="10.5" fill="#475569">
              window IW
            </text>
          </g>

          {/* Attached Conformal Calibration Tray */}
          <g
            opacity={nodeOpacity('conformal-calibration')}
            {...nodeInteractiveProps(
              'conformal-calibration',
              'Conformal Calibration Tray: Calibrates COP, CTE, and CIW'
            )}
          >
            <rect
              x="296"
              y="388"
              width="318"
              height="64"
              rx="8"
              fill="#FFFFFF"
              stroke={strokeHighlight('conformal-calibration', '#A78BFA')}
              strokeWidth={strokeWidthHighlight('conformal-calibration', 1.5)}
            />
            <text x="312" y="410" fontSize="12" fontWeight="700" fill="#5B21B6">
              Conformal Calibration Tray (Measuring Step)
            </text>
            <text x="312" y="427" fontSize="10.5" fill="#475569">
              OP → COP (set) · TE → CTE (interval) · IW → CIW (interval)
            </text>
            <text x="312" y="442" fontSize="10" fill="#64748B">
              Attached measuring procedure — does NOT choose actions.
            </text>
          </g>

          {/* 3. INNER PROCESS TRACK ("Help a running case") */}
          <g
            opacity={nodeOpacity('loan-track')}
            {...nodeInteractiveProps(
              'loan-track',
              'Inner Process Track: Running loan applications'
            )}
          >
            <rect
              x="662"
              y="142"
              width="886"
              height="244"
              rx="14"
              fill="#FFFFFF"
              stroke={strokeHighlight('loan-track', '#CBD2C8')}
              strokeWidth={strokeWidthHighlight('loan-track', 1.6)}
              filter="url(#card-shadow)"
            />
            <text
              x="682"
              y="168"
              fontSize="14"
              fontWeight="700"
              fill="#24313A"
              fontFamily="Plus Jakarta Sans, sans-serif"
            >
              Inner Track · Help a running loan application (Runtime)
            </text>
            <text x="682" y="185" fontSize="11" fill="#52606D">
              Incoming flow λ = {metrics.arrivalRatePerHour}/hr · Active stock WIP = {metrics.wipCases} cases · Click a case piece to inspect its prefix K
            </text>

            {/* Loan Track Backbone Stages */}
            {[
              { x: 682, w: 146, label: 'Application received' },
              { x: 848, w: 122, label: 'Assessment' },
              { x: 990, w: 118, label: 'Offer sent' },
              { x: 1128, w: 162, label: 'Await customer response' },
              { x: 1312, w: 152, label: 'Accepted / Rejected' },
            ].map((stage, idx, arr) => (
              <g key={stage.label}>
                <rect
                  x={stage.x}
                  y="200"
                  width={stage.w}
                  height="38"
                  rx="7"
                  fill={idx === 4 ? '#F7F8F5' : '#FAFBF9'}
                  stroke="#CBD2C8"
                  strokeWidth="1.2"
                />
                <text
                  x={stage.x + stage.w / 2}
                  y="223"
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="600"
                  fill="#24313A"
                >
                  {stage.label}
                </text>
                {idx < arr.length - 1 && (
                  <line
                    x1={stage.x + stage.w}
                    y1="219"
                    x2={arr[idx + 1].x - 3}
                    y2="219"
                    stroke="#24313A"
                    strokeWidth="1.5"
                    markerEnd="url(#arrow-process)"
                  />
                )}
              </g>
            ))}

            {/* Track rail */}
            <line
              x1="710"
              y1="286"
              x2="1320"
              y2="286"
              stroke="#DCE1D9"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <text x="682" y="372" fontSize="10" fill="#64748B">
              Teaching simplification: 1 piece per case (real BPMN tokens represent execution state and can multiply in parallel branches).
            </text>
          </g>

          {/* Movable Case Pieces A, B, C & Prefix Strips */}
          <g opacity={nodeOpacity('active-prefix')}>
            {cases.map((c) => {
              const isSelected = c.id === selectedCase.id;
              const isBusy = simState.busyCaseIds.includes(c.id);
              const px = c.id === 'C' ? 885 : c.id === 'A' ? 1045 : 1205;
              const py = 286;
              return (
                <g
                  key={c.id}
                  data-interactive-node="true"
                  role="button"
                  tabIndex={0}
                  aria-label={`Inspect ${c.label}, prefix length K equals ${c.prefixLengthK}, predicted risk ${Math.round(c.opNegativeProb * 100)}%`}
                  className="cursor-pointer focus:outline-none"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectCase(c.id);
                    onSelectNode('active-prefix');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      e.stopPropagation();
                      onSelectCase(c.id);
                      onSelectNode('active-prefix');
                    }
                  }}
                >
                  {isSelected && (
                    <circle
                      cx={px}
                      cy={py}
                      r="30"
                      fill="none"
                      stroke="#1D4ED8"
                      strokeWidth="2.5"
                      className="animate-pulse-ring"
                    />
                  )}
                  {/* History Strip */}
                  <rect
                    x={px - 62}
                    y={py + 22}
                    width="124"
                    height="36"
                    rx="6"
                    fill={isSelected ? '#EFF6FF' : '#FAFBF9'}
                    stroke={isSelected ? '#1D4ED8' : '#CBD2C8'}
                    strokeWidth={isSelected ? '1.6' : '1'}
                  />
                  <text
                    x={px}
                    y={py + 37}
                    textAnchor="middle"
                    fontSize="10.5"
                    fontWeight="700"
                    fill="#24313A"
                  >
                    {c.label} · K = {c.prefixLengthK}
                  </text>
                  <text
                    x={px}
                    y={py + 51}
                    textAnchor="middle"
                    fontSize="9.5"
                    fill="#475569"
                    fontFamily="IBM Plex Mono, monospace"
                  >
                    OP {Math.round(c.opNegativeProb * 100)}% · TE +{Math.round(c.teImprovement * 100)}pp
                  </text>

                  {/* Case Piece Token */}
                  <circle
                    cx={px}
                    cy={py}
                    r="21"
                    fill={isBusy ? '#FFF7ED' : isSelected ? '#1D4ED8' : '#FFFFFF'}
                    stroke={isBusy ? '#C2410C' : isSelected ? '#1E3A8A' : '#24313A'}
                    strokeWidth="2.2"
                    filter="url(#card-shadow)"
                  />
                  <text
                    x={px}
                    y={py + 5}
                    textAnchor="middle"
                    fontSize="14"
                    fontWeight="700"
                    fill={isBusy ? '#9A3412' : isSelected ? '#FFFFFF' : '#24313A'}
                    fontFamily="Plus Jakarta Sans, sans-serif"
                  >
                    {c.id}
                  </text>
                  {isBusy && (
                    <text
                      x={px}
                      y={py - 26}
                      textAnchor="middle"
                      fontSize="9.5"
                      fontWeight="700"
                      fill="#9A3412"
                    >
                      Officer helping
                    </text>
                  )}
                </g>
              );
            })}
          </g>

          {/* Intervention Side Activity */}
          <g
            opacity={nodeOpacity('intervention-activity')}
            {...nodeInteractiveProps(
              'intervention-activity',
              'Intervention side activity: Prepare and send second offer'
            )}
          >
            <path
              d="M 1210 238 C 1270 250, 1315 262, 1345 272"
              fill="none"
              stroke="#0F766E"
              strokeWidth="1.6"
              strokeDasharray="5 3"
              markerEnd="url(#arrow-process)"
            />
            <rect
              x="1338"
              y="264"
              width="192"
              height="84"
              rx="10"
              fill={simState.busyCaseIds.length > 0 ? '#FFF7ED' : '#F0FDFA'}
              stroke={strokeHighlight(
                'intervention-activity',
                simState.busyCaseIds.length > 0 ? '#FB923C' : '#5EEAD4'
              )}
              strokeWidth={strokeWidthHighlight('intervention-activity', 1.5)}
            />
            <text x="1434" y="286" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="#115E59">
              Side Intervention Activity
            </text>
            <text x="1434" y="303" textAnchor="middle" fontSize="10.5" fill="#24313A">
              Prepare &amp; send 2nd offer
            </text>
            <text x="1434" y="320" textAnchor="middle" fontSize="9.5" fill="#52606D">
              Duration: {simState.interventionDurationHours.toFixed(1)}h · No process redraw
            </text>
            <text
              x="1434"
              y="337"
              textAnchor="middle"
              fontSize="10"
              fontWeight="700"
              fill={simState.busyCaseIds.length > 0 ? '#9A3412' : '#0F766E'}
            >
              {simState.busyCaseIds.length > 0
                ? `Active on: Case ${simState.busyCaseIds.join(', ')}`
                : 'Idle — awaits Action 1'}
            </text>
          </g>

          {/* 4. THREE INSTRUMENT GROUPS ("Is help worthwhile, timely, and feasible?") */}
          {/* 4A. SIGNIFICANCE — Risk & Uncertainty (Blue) */}
          <g
            opacity={nodeOpacity('sig-outcome-risk')}
            {...nodeInteractiveProps(
              'sig-outcome-risk',
              'Significance Instrument: Negative-outcome probability OP, conformal set COP, and entropy TU'
            )}
          >
            <rect
              x="132"
              y="526"
              width="320"
              height="196"
              rx="12"
              fill="#FFFFFF"
              stroke={strokeHighlight('sig-outcome-risk', '#93C5FD')}
              strokeWidth={strokeWidthHighlight('sig-outcome-risk', 1.6)}
              filter="url(#card-shadow)"
            />
            <rect x="132" y="526" width="320" height="32" rx="12" fill="#EFF6FF" />
            <text x="148" y="547" fontSize="12" fontWeight="700" fill="#1E40AF">
              SIGNIFICANCE · Is help needed? ({selectedCase.label})
            </text>

            {/* OP Gauge Bar */}
            <text x="148" y="578" fontSize="11" fontWeight="600" fill="#24313A">
              Negative outcome risk (OP)
            </text>
            <text
              x="436"
              y="578"
              textAnchor="end"
              fontSize="12"
              fontWeight="700"
              fill="#9A3412"
              fontFamily="IBM Plex Mono, monospace"
            >
              {negPct}%
            </text>
            <rect x="148" y="586" width="288" height="12" rx="6" fill="#F1F5F9" />
            <rect
              x="148"
              y="586"
              width={Math.round(288 * selectedCase.opNegativeProb)}
              height="12"
              rx="6"
              fill="#C2410C"
            />

            {/* COP Outcome Set Tray */}
            <text x="148" y="620" fontSize="11" fontWeight="600" fill="#24313A">
              Conformal outcome set (COP)
            </text>
            <rect x="148" y="628" width="288" height="28" rx="6" fill="#F8FAFC" stroke="#CBD5E1" />
            <text
              x="292"
              y="646"
              textAnchor="middle"
              fontSize="11"
              fontWeight="700"
              fill="#1E3A8A"
              fontFamily="IBM Plex Mono, monospace"
            >
              {conformal.copSet.length > 0 ? `{ ${conformal.copSet.join(', ')} }` : '{ } (empty set)'}
            </text>

            {/* TU Entropy Readout */}
            <text x="148" y="678" fontSize="11" fontWeight="600" fill="#24313A">
              Prediction uncertainty (TU = H(OP))
            </text>
            <text
              x="436"
              y="678"
              textAnchor="end"
              fontSize="11.5"
              fontWeight="700"
              fill="#1D4ED8"
              fontFamily="IBM Plex Mono, monospace"
            >
              {tu.toFixed(2)} bits
            </text>
            <rect x="148" y="686" width="288" height="10" rx="5" fill="#EFF6FF" />
            <rect
              x="148"
              y="686"
              width={Math.round(288 * tu)}
              height="10"
              rx="5"
              fill="#2563EB"
            />
            <text x="148" y="712" fontSize="9.5" fill="#64748B">
              Aggregate model error ≠ case failure probability
            </text>
          </g>

          {/* 4B. SIGNIFICANCE — Causal Treatment Effect (Blue) */}
          <g
            opacity={nodeOpacity('sig-treatment-effect')}
            {...nodeInteractiveProps(
              'sig-treatment-effect',
              'Significance Instrument: Causal treatment effect TE and calibrated interval CTE'
            )}
          >
            <rect
              x="470"
              y="526"
              width="294"
              height="196"
              rx="12"
              fill="#FFFFFF"
              stroke={strokeHighlight('sig-treatment-effect', '#93C5FD')}
              strokeWidth={strokeWidthHighlight('sig-treatment-effect', 1.6)}
              filter="url(#card-shadow)"
            />
            <rect x="470" y="526" width="294" height="32" rx="12" fill="#EFF6FF" />
            <text x="486" y="547" fontSize="12" fontWeight="700" fill="#1E40AF">
              SIGNIFICANCE · Could help work?
            </text>

            <text x="486" y="576" fontSize="11" fontWeight="600" fill="#24313A">
              Estimated acceptance alternatives (TE)
            </text>

            {/* Without intervention */}
            <text x="486" y="599" fontSize="10.5" fill="#52606D">
              Without 2nd offer
            </text>
            <text
              x="748"
              y="599"
              textAnchor="end"
              fontSize="11"
              fontWeight="700"
              fill="#475569"
              fontFamily="IBM Plex Mono, monospace"
            >
              {baseAcceptPct}%
            </text>
            <rect x="486" y="605" width="262" height="10" rx="5" fill="#F1F5F9" />
            <rect
              x="486"
              y="605"
              width={Math.round(2.62 * baseAcceptPct)}
              height="10"
              rx="5"
              fill="#94A3B8"
            />

            {/* With intervention */}
            <text x="486" y="635" fontSize="10.5" fill="#1E40AF" fontWeight="600">
              With 2nd offer
            </text>
            <text
              x="748"
              y="635"
              textAnchor="end"
              fontSize="11"
              fontWeight="700"
              fill="#1D4ED8"
              fontFamily="IBM Plex Mono, monospace"
            >
              {withAcceptPct}% (+{tePp}pp)
            </text>
            <rect x="486" y="641" width="262" height="10" rx="5" fill="#EFF6FF" />
            <rect
              x="486"
              y="641"
              width={Math.round(2.62 * withAcceptPct)}
              height="10"
              rx="5"
              fill="#1D4ED8"
            />

            {/* CTE Interval */}
            <text x="486" y="675" fontSize="10.5" fontWeight="600" fill="#24313A">
              Treatment-effect band (CTE)
            </text>
            <text
              x="748"
              y="675"
              textAnchor="end"
              fontSize="11"
              fontWeight="700"
              fill="#1E3A8A"
              fontFamily="IBM Plex Mono, monospace"
            >
              [{conformal.cteIntervalPp[0]}pp, +{conformal.cteIntervalPp[1]}pp]
            </text>
            <text x="486" y="696" fontSize="9.5" fill="#64748B">
              Estimated alternatives — both cannot be observed
            </text>
            <text x="486" y="710" fontSize="9.5" fill="#64748B">
              for the same case. Requires causal assumptions.
            </text>
          </g>

          {/* 4C. URGENCY — Time Ruler (Amber) */}
          <g
            opacity={nodeOpacity('urgency-window')}
            {...nodeInteractiveProps(
              'urgency-window',
              'Urgency Instrument: Intervention window IW and conformal interval CIW'
            )}
          >
            <rect
              x="782"
              y="526"
              width="244"
              height="196"
              rx="12"
              fill="#FFFFFF"
              stroke={strokeHighlight('urgency-window', '#FCD34D')}
              strokeWidth={strokeWidthHighlight('urgency-window', 1.6)}
              filter="url(#card-shadow)"
            />
            <rect x="782" y="526" width="244" height="32" rx="12" fill="#FFFBEB" />
            <text x="798" y="547" fontSize="12" fontWeight="700" fill="#B45309">
              URGENCY · How long to act?
            </text>

            <text x="798" y="578" fontSize="11" fontWeight="600" fill="#24313A">
              Window IW: {selectedCase.iwBaseHours.min}–{selectedCase.iwBaseHours.max}h
            </text>
            <text
              x="798"
              y="594"
              fontSize="10.5"
              fontFamily="IBM Plex Mono, monospace"
              fill="#B45309"
            >
              CIW band: [{conformal.ciwIntervalHours[0]}h, {conformal.ciwIntervalHours[1]}h]
            </text>

            {/* Time Ruler 0..10h */}
            <line x1="800" y1="636" x2="1008" y2="636" stroke="#94A3B8" strokeWidth="1.5" />
            {[0, 2, 4, 6, 8, 10].map((hr) => {
              const rx = 800 + (hr / 10) * 200;
              return (
                <g key={hr}>
                  <line x1={rx} y1="631" x2={rx} y2="641" stroke="#64748B" strokeWidth="1" />
                  <text x={rx} y="655" textAnchor="middle" fontSize="9.5" fill="#64748B">
                    {hr}h
                  </text>
                </g>
              );
            })}
            {/* Shaded CIW band */}
            <rect
              x={800 + (Math.min(10, conformal.ciwIntervalHours[0]) / 10) * 200}
              y="624"
              width={Math.max(
                10,
                ((Math.min(10, conformal.ciwIntervalHours[1]) -
                  Math.min(10, conformal.ciwIntervalHours[0])) /
                  10) *
                  200
              )}
              height="24"
              rx="4"
              fill="#FDE68A"
              opacity="0.7"
            />
            {/* Core IW bar */}
            <rect
              x={800 + (selectedCase.iwBaseHours.min / 10) * 200}
              y="629"
              width={Math.max(
                8,
                ((selectedCase.iwBaseHours.max - selectedCase.iwBaseHours.min) / 10) * 200
              )}
              height="14"
              rx="3"
              fill="#D97706"
            />

            {/* Remaining cycle time contrast */}
            <text x="798" y="680" fontSize="10" fill="#475569">
              Total remaining cycle time: {selectedCase.remainingCycleTimeHours[0]}–
              {selectedCase.remainingCycleTimeHours[1]}h
            </text>
            <text x="798" y="698" fontSize="9.5" fill="#64748B">
              Opportunity window ≠ total time left
            </text>
            <text x="798" y="712" fontSize="9.5" fill="#64748B">
              CIW is uncertainty, not a guaranteed deadline
            </text>
          </g>

          {/* 4D. CAPACITY — Worker Slots & Queue Flow (Teal) */}
          <g
            opacity={nodeOpacity('capacity-resources')}
            {...nodeInteractiveProps(
              'capacity-resources',
              'Capacity Monitor: Free staff n, available share eta, WIP stock, and arrival flow lambda'
            )}
          >
            <rect
              x="1044"
              y="526"
              width="426"
              height="196"
              rx="12"
              fill="#FFFFFF"
              stroke={strokeHighlight('capacity-resources', '#5EEAD4')}
              strokeWidth={strokeWidthHighlight('capacity-resources', 1.6)}
              filter="url(#card-shadow)"
            />
            <rect x="1044" y="526" width="426" height="32" rx="12" fill="#F0FDFA" />
            <text x="1060" y="547" fontSize="12" fontWeight="700" fill="#0F766E">
              CAPACITY · Can we help, and what else is waiting?
            </text>

            {/* Physical Worker Slots */}
            <text x="1060" y="578" fontSize="11" fontWeight="600" fill="#24313A">
              Loan Officer Slots (N = {metrics.totalStaffN})
            </text>

            {metrics.totalStaffN === 0 ? (
              <text x="1060" y="605" fontSize="11" fill="#9A3412" fontWeight="600">
                No staff configured (N = 0)
              </text>
            ) : (
              Array.from({ length: metrics.totalStaffN }).map((_, idx) => {
                const busyCaseId = simState.busyCaseIds[idx];
                const isBusy = Boolean(busyCaseId);
                const sx = 1060 + idx * 96;
                return (
                  <g key={idx}>
                    <rect
                      x={sx}
                      y="588"
                      width="88"
                      height="52"
                      rx="8"
                      fill={isBusy ? '#FFF7ED' : '#F0FDFA'}
                      stroke={isBusy ? '#FB923C' : '#0F766E'}
                      strokeWidth="1.4"
                    />
                    <circle
                      cx={sx + 20}
                      cy="614"
                      r="9"
                      fill={isBusy ? '#C2410C' : '#0F766E'}
                    />
                    <text x={sx + 35} y="611" fontSize="10.5" fontWeight="700" fill="#24313A">
                      {isBusy ? 'Busy' : 'Free'}
                    </text>
                    <text x={sx + 35} y="626" fontSize="9.5" fill="#52606D">
                      {isBusy ? `Case ${busyCaseId}` : `Slot ${idx + 1}`}
                    </text>
                  </g>
                );
              })
            )}

            {/* Metrics n, eta, WIP, lambda */}
            <text
              x="1060"
              y="668"
              fontSize="11"
              fontWeight="600"
              fill="#0F766E"
              fontFamily="IBM Plex Mono, monospace"
            >
              n = {metrics.freeStaffN} free · η = n/N = {Math.round(metrics.freeShareEta * 100)}%
            </text>
            <text
              x="1060"
              y="688"
              fontSize="11"
              fill="#24313A"
              fontFamily="IBM Plex Mono, monospace"
            >
              WIP (stock) = {metrics.wipCases} · λ (flow) = {metrics.arrivalRatePerHour}/hr
            </text>
            <text x="1060" y="709" fontSize="9.5" fill="#64748B">
              Available share η ({Math.round(metrics.freeShareEta * 100)}%) ≠ busy utilization ({Math.round(metrics.busyUtilization * 100)}%)
            </text>
          </g>

          {/* 5. DECISION DESK ("Choose an action") */}
          <g
            opacity={nodeOpacity('decision-desk')}
            {...nodeInteractiveProps(
              'decision-desk',
              'Dispatch Desk: Eight state components and binary action 1 or 0'
            )}
          >
            <rect
              x="310"
              y="792"
              width="580"
              height="196"
              rx="14"
              fill="#FFFFFF"
              stroke={strokeHighlight('decision-desk', '#24313A')}
              strokeWidth={strokeWidthHighlight('decision-desk', 2)}
              filter="url(#card-shadow)"
            />
            <rect x="310" y="792" width="580" height="36" rx="14" fill="#24313A" />
            <text x="330" y="815" fontSize="12.5" fontWeight="700" fill="#FFFFFF">
              Dispatch Desk · Choose Action for {selectedCase.label}
            </text>
            <text x="870" y="815" textAnchor="end" fontSize="10.5" fill="#CBD5E1">
              Scripted teaching policy (not trained PPO)
            </text>

            {/* 8 State Component Sockets */}
            <text x="330" y="848" fontSize="11" fontWeight="600" fill="#475569">
              State Sₜ = (8 information components):
            </text>
            {[
              { sym: 'COP', val: conformal.copSet.length ? `{${conformal.copSet.map((s) => s[0]).join(',')}}` : '{}', color: '#1D4ED8', bg: '#EFF6FF' },
              { sym: 'TU', val: tu.toFixed(2), color: '#1D4ED8', bg: '#EFF6FF' },
              { sym: 'CTE', val: `${conformal.cteIntervalPp[0]}..+${conformal.cteIntervalPp[1]}`, color: '#1D4ED8', bg: '#EFF6FF' },
              { sym: 'CIW', val: `${conformal.ciwIntervalHours[0]}–${conformal.ciwIntervalHours[1]}h`, color: '#B45309', bg: '#FFFBEB' },
              { sym: 'n', val: `${metrics.freeStaffN}`, color: '#0F766E', bg: '#F0FDFA' },
              { sym: 'η', val: `${Math.round(metrics.freeShareEta * 100)}%`, color: '#0F766E', bg: '#F0FDFA' },
              { sym: 'WIP', val: `${metrics.wipCases}`, color: '#0F766E', bg: '#F0FDFA' },
              { sym: 'λ', val: `${metrics.arrivalRatePerHour}/h`, color: '#0F766E', bg: '#F0FDFA' },
            ].map((sock, idx) => {
              const sx = 330 + idx * 68;
              return (
                <g key={sock.sym}>
                  <rect
                    x={sx}
                    y="858"
                    width="62"
                    height="42"
                    rx="6"
                    fill={sock.bg}
                    stroke="#DCE1D9"
                  />
                  <text
                    x={sx + 31}
                    y="874"
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight="700"
                    fill={sock.color}
                  >
                    {sock.sym}
                  </text>
                  <text
                    x={sx + 31}
                    y="891"
                    textAnchor="middle"
                    fontSize="9.5"
                    fontWeight="600"
                    fill="#24313A"
                    fontFamily="IBM Plex Mono, monospace"
                  >
                    {sock.val}
                  </text>
                </g>
              );
            })}

            {/* Interactive Binary Action Switch */}
            <g
              data-interactive-node="true"
              role="button"
              tabIndex={0}
              aria-label={`Intervene now on ${selectedCase.label}`}
              className={
                isCurrentBusy || metrics.freeStaffN <= 0
                  ? 'cursor-not-allowed'
                  : 'cursor-pointer'
              }
              onClick={(e) => {
                e.stopPropagation();
                if (!isCurrentBusy && metrics.freeStaffN > 0) {
                  onInterveneNow(selectedCase.id);
                }
              }}
              onKeyDown={(e) => {
                if ((e.key === 'Enter' || e.key === ' ') && !isCurrentBusy && metrics.freeStaffN > 0) {
                  e.preventDefault();
                  e.stopPropagation();
                  onInterveneNow(selectedCase.id);
                }
              }}
            >
              <rect
                x="330"
                y="914"
                width="216"
                height="42"
                rx="8"
                fill={
                  isCurrentBusy || metrics.freeStaffN <= 0
                    ? '#E2E8F0'
                    : policyDecision.action === 1
                    ? '#0F766E'
                    : '#F0FDFA'
                }
                stroke={
                  isCurrentBusy || metrics.freeStaffN <= 0 ? '#CBD5E1' : '#0F766E'
                }
                strokeWidth="1.5"
              />
              <text
                x="438"
                y="939"
                textAnchor="middle"
                fontSize="11.5"
                fontWeight="700"
                fill={
                  isCurrentBusy || metrics.freeStaffN <= 0
                    ? '#64748B'
                    : policyDecision.action === 1
                    ? '#FFFFFF'
                    : '#0F766E'
                }
              >
                {isCurrentBusy
                  ? '1 — Officer already busy here'
                  : metrics.freeStaffN <= 0
                  ? '1 — Unavailable (n = 0)'
                  : '1 — Intervene now (Click)'}
              </text>
            </g>

            <g
              data-interactive-node="true"
              role="button"
              tabIndex={0}
              aria-label={`Do not intervene now on ${selectedCase.label}`}
              className="cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                onDoNotInterveneNow(selectedCase.id);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  e.stopPropagation();
                  onDoNotInterveneNow(selectedCase.id);
                }
              }}
            >
              <rect
                x="560"
                y="914"
                width="224"
                height="42"
                rx="8"
                fill={policyDecision.action === 0 ? '#FAFBF9' : '#FFFFFF'}
                stroke={policyDecision.action === 0 ? '#24313A' : '#CBD2C8'}
                strokeWidth="1.5"
              />
              <text
                x="672"
                y="939"
                textAnchor="middle"
                fontSize="11.5"
                fontWeight="700"
                fill="#24313A"
              >
                0 — Do not intervene now
              </text>
            </g>

            <text x="330" y="974" fontSize="9.5" fill="#64748B">
              Policy recommends Action {policyDecision.action} · Action 0 leaves a later chance open if window permits (no promise).
            </text>
          </g>

          {/* 6. FEEDBACK LEDGER ("Learn a policy") */}
          <g
            opacity={nodeOpacity('feedback-ledger')}
            {...nodeInteractiveProps(
              'feedback-ledger',
              'Feedback Ledger: Training rewards, evaluated business gain, and PPO policy learning'
            )}
          >
            <rect
              x="946"
              y="792"
              width="524"
              height="196"
              rx="14"
              fill="#FFFFFF"
              stroke={strokeHighlight('feedback-ledger', '#A78BFA')}
              strokeWidth={strokeWidthHighlight('feedback-ledger', 1.6)}
              filter="url(#card-shadow)"
            />
            <rect x="946" y="792" width="524" height="36" rx="14" fill="#F5F3FF" />
            <text x="966" y="815" fontSize="12.5" fontWeight="700" fill="#5B21B6">
              Feedback Ledger · Learn a Policy over Time (PPO)
            </text>

            <text x="966" y="846" fontSize="10.5" fontWeight="600" fill="#475569">
              Observe state → Choose action → Env changes → Feedback → Update policy
            </text>

            {/* Separate Ledger Compartments */}
            <rect x="966" y="858" width="236" height="84" rx="8" fill="#FAF5FF" stroke="#DDD6FE" />
            <text x="978" y="876" fontSize="11" fontWeight="700" fill="#6D28D9">
              Training Reward (RL Signal)
            </text>
            <text x="978" y="894" fontSize="10" fill="#475569">
              Shaped &amp; conditional per episode.
            </text>
            <text x="978" y="909" fontSize="10" fill="#475569">
              Captures capacity opportunity cost.
            </text>
            <text x="978" y="928" fontSize="9.5" fill="#6D28D9" fontWeight="600">
              Not a fixed “60 + 10 − 25” rule
            </text>

            <rect x="1214" y="858" width="236" height="84" rx="8" fill="#FAFBF9" stroke="#D4D9D0" />
            <text x="1226" y="876" fontSize="11" fontWeight="700" fill="#24313A">
              Evaluated Business Gain
            </text>
            <text x="1226" y="894" fontSize="10" fill="#475569">
              Final outcomes minus costs
            </text>
            <text x="1226" y="909" fontSize="10" fill="#475569">
              measured on held-out episodes.
            </text>
            <text x="1226" y="928" fontSize="9.5" fontFamily="IBM Plex Mono, monospace" fill="#52606D">
              Logged cycles: {simState.feedbackCount}
            </text>

            <text x="966" y="968" fontSize="9.5" fill="#64748B">
              Policy updates (PPO) are separate from fitting/calibrating the 3 historical models above.
            </text>
          </g>

          {/* 7. EXPLICIT DIRECTIONAL CONNECTIONS */}
          <g aria-label="Directional relationships">
            {edges.map((edge) => {
              if (!edge.pathD) return null;
              const isFocusedEdge = highlightedEdgeIds.has(edge.id);
              const opacity = hasSelectionFocus
                ? isFocusedEdge
                  ? 1
                  : 0.1
                : 0.42;
              const strokeColor = EDGE_COLORS[edge.kind];
              const marker =
                edge.kind === 'process'
                  ? 'url(#arrow-process)'
                  : edge.kind === 'information'
                  ? 'url(#arrow-info)'
                  : 'url(#arrow-learning)';
              const dashArray =
                edge.kind === 'process'
                  ? undefined
                  : edge.kind === 'information'
                  ? '6 4'
                  : '3 4';

              return (
                <g key={edge.id} opacity={opacity}>
                  <path
                    d={edge.pathD}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={isFocusedEdge ? 2.4 : 1.5}
                    strokeDasharray={dashArray}
                    markerEnd={marker}
                    className={
                      isFocusedEdge && !isMotionPaused && dashArray
                        ? 'animate-flow-dash'
                        : undefined
                    }
                  />
                  {isFocusedEdge && edge.labelPos && (
                    <text
                      x={edge.labelPos.x}
                      y={edge.labelPos.y}
                      textAnchor="middle"
                      fontSize="11"
                      fontWeight="700"
                      fill={strokeColor}
                      paintOrder="stroke"
                      stroke="#F7F8F5"
                      strokeWidth="5"
                      strokeLinejoin="round"
                    >
                      {edge.verb}
                    </text>
                  )}
                </g>
              );
            })}
          </g>

          {/* Compact Horizontal Legend placed in open tabletop corridor above instruments */}
          <g transform="translate(54, 476)">
            <rect
              x="0"
              y="0"
              width="580"
              height="34"
              rx="8"
              fill="#FFFFFF"
              stroke="#DCE1D9"
              strokeWidth="1.2"
            />
            <text x="14" y="21" fontSize="11" fontWeight="700" fill="#24313A">
              Legend:
            </text>
            <line x1="68" y1="17" x2="94" y2="17" stroke="#24313A" strokeWidth="2" markerEnd="url(#arrow-process)" />
            <text x="100" y="21" fontSize="10.5" fill="#334155">
              Process / resource
            </text>

            <line x1="218" y1="17" x2="244" y2="17" stroke="#1D4ED8" strokeWidth="2" strokeDasharray="5 3" markerEnd="url(#arrow-info)" />
            <text x="250" y="21" fontSize="10.5" fill="#334155">
              Model &amp; state info
            </text>

            <line x1="366" y1="17" x2="392" y2="17" stroke="#6D28D9" strokeWidth="2" strokeDasharray="3 3" markerEnd="url(#arrow-learning)" />
            <text x="398" y="21" fontSize="10.5" fill="#334155">
              Learning / lifecycle feedback
            </text>
          </g>
        </svg>
      </div>

      {/* Overview Minimap Navigator (shown in corner) */}
      <div
        aria-label="Overview navigator"
        className="no-print hidden sm:flex flex-col gap-1 absolute bottom-3 left-3 bg-white/95 border border-[#CBD2C8] rounded-lg p-2 shadow-sm text-[10px] text-[#52606D]"
      >
        <div className="flex items-center justify-between gap-3">
          <span className="font-semibold text-[#24313A]">Map Navigator</span>
          <span className="font-mono-tabular">{Math.round(zoom * 100)}%</span>
        </div>
        <div className="relative w-28 h-16 bg-[#F7F8F5] border border-[#DCE1D9] rounded overflow-hidden">
          <div className="absolute top-1 left-1 right-1 h-1.5 bg-[#E2E8F0] rounded-xs" />
          <div className="absolute top-3.5 left-1 w-9 h-4 bg-[#E2E8F0] rounded-xs" />
          <div className="absolute top-3.5 right-1 w-14 h-3 bg-[#DBEAFE] rounded-xs" />
          <div className="absolute top-8.5 left-2 w-10 h-3 bg-[#DBEAFE] rounded-xs" />
          <div className="absolute top-8.5 left-13 w-5 h-3 bg-[#FEF3C7] rounded-xs" />
          <div className="absolute top-8.5 right-1 w-7 h-3 bg-[#CCFBF1] rounded-xs" />
          <div className="absolute bottom-1 left-6 w-9 h-3 bg-[#334155] rounded-xs" />
          <div className="absolute bottom-1 right-1 w-8 h-3 bg-[#EDE9FE] rounded-xs" />
          {/* Viewport indicator */}
          <div
            className="absolute inset-0.5 border border-[#1D4ED8] rounded-xs pointer-events-none"
            style={{
              transform: `translate(${Math.max(-18, Math.min(18, -pan.x / 40))}px, ${Math.max(-10, Math.min(10, -pan.y / 40))}px) scale(${Math.min(1, 1 / zoom)})`,
            }}
          />
        </div>
      </div>
    </div>
  );
};
