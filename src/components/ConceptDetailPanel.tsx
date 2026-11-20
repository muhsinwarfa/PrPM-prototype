import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, ChevronDown, ChevronUp, ExternalLink, X } from 'lucide-react';
import type {
  ConceptEdge,
  ConceptNode,
  ConformalOutputs,
  LoanCase,
  ResourceMetrics,
} from '../types/observatory';
import { computeEntropyTU } from '../logic/prpmModel';

interface ConceptDetailPanelProps {
  concept: ConceptNode | null;
  allConcepts: ConceptNode[];
  incomingEdges: ConceptEdge[];
  outgoingEdges: ConceptEdge[];
  selectedCase: LoanCase;
  allCases: LoanCase[];
  onSelectCase: (id: 'A' | 'B' | 'C') => void;
  onSelectConcept: (id: string | null) => void;
  conformal: ConformalOutputs;
  metrics: ResourceMetrics;
}

const GROUP_COLOR_LABEL: Record<string, string> = {
  'outer-lifecycle': 'Outer BPM Lifecycle · Slate',
  'inner-track': 'Runtime Process Track · Slate',
  'historical-workbench': 'Historical Workbench · Stone',
  significance: 'Significance Instrument · Blue',
  urgency: 'Urgency Instrument · Amber',
  capacity: 'Capacity Instrument · Teal',
  'decision-desk': 'Dispatch Desk · Ink',
  'feedback-ledger': 'Feedback Ledger · Lavender',
};

export const ConceptDetailPanel: React.FC<ConceptDetailPanelProps> = ({
  concept,
  allConcepts,
  incomingEdges,
  outgoingEdges,
  selectedCase,
  allCases,
  onSelectCase,
  onSelectConcept,
  conformal,
  metrics,
}) => {
  const [showSeparate, setShowSeparate] = useState(true);
  const [showTechnical, setShowTechnical] = useState(false);

  const findConceptTitle = (id: string) =>
    allConcepts.find((c) => c.id === id)?.plainTitle ?? id;

  if (!concept) {
    const tu = computeEntropyTU(selectedCase.opNegativeProb);
    return (
      <aside
        aria-label="Observatory Inspector"
        className="bg-white border border-[#DCE1D9] rounded-xl p-5 flex flex-col gap-5 h-full overflow-y-auto"
      >
        <div>
          <p className="text-xs font-medium text-[#52606D]">
            Observatory Guide · {selectedCase.label} Examined
          </p>
          <h2 className="font-display text-lg font-semibold text-[#24313A] mt-1">
            Point to any object on the table
          </h2>
          <p className="text-sm text-[#475569] mt-2 leading-relaxed">
            Click any landmark, instrument, or case piece on the map to trace what it receives, what it produces, and how it connects to your BPM foundation.
          </p>
        </div>

        {/* Active Case Prefix Inspector */}
        <div className="border-t border-[#E6E9E2] pt-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-display text-sm font-semibold text-[#24313A]">
              Running Case Prefix (K = {selectedCase.prefixLengthK})
            </h3>
            <div className="flex items-center gap-1 p-0.5 bg-[#EBEEE8] rounded-md">
              {allCases.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => onSelectCase(c.id)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors ${
                    selectedCase.id === c.id
                      ? 'bg-white text-[#24313A] shadow-xs'
                      : 'text-[#52606D] hover:text-[#24313A]'
                  }`}
                >
                  {c.id}
                </button>
              ))}
            </div>
          </div>
          <p className="text-xs text-[#52606D] mt-1">
            {selectedCase.applicantSummary} · Stage: {selectedCase.currentStageLabel}
          </p>
          <p className="text-xs text-[#52606D] mt-2">
            <strong>Observed history so far</strong> (K = {selectedCase.prefixLengthK} events; future events cannot leak):
          </p>
          <ol className="mt-2 space-y-1.5 text-xs text-[#24313A]">
            {selectedCase.prefixEvents.map((ev, idx) => (
              <li
                key={ev}
                className="flex items-start gap-2 bg-[#F7F8F5] border border-[#E6E9E2] rounded-md px-2.5 py-1.5"
              >
                <span className="font-mono-tabular text-[#64748B] shrink-0">
                  e{idx + 1}
                </span>
                <span>{ev}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Live Instrument Readout Summary */}
        <div className="border-t border-[#E6E9E2] pt-4 space-y-2.5">
          <h3 className="font-display text-sm font-semibold text-[#24313A]">
            Eight State Components Sₜ for {selectedCase.label}
          </h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE]">
              <div className="text-[#1E40AF] font-medium">COP · Outcome Set</div>
              <div className="font-mono-tabular font-semibold text-[#1E3A8A] mt-0.5">
                {conformal.copSet.length > 0 ? `{${conformal.copSet.join(', ')}}` : '{}'}
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE]">
              <div className="text-[#1E40AF] font-medium">TU · Entropy</div>
              <div className="font-mono-tabular font-semibold text-[#1E3A8A] mt-0.5">
                {tu.toFixed(2)} bits
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE]">
              <div className="text-[#1E40AF] font-medium">CTE · Benefit Band</div>
              <div className="font-mono-tabular font-semibold text-[#1E3A8A] mt-0.5">
                [{conformal.cteIntervalPp[0]}pp, +{conformal.cteIntervalPp[1]}pp]
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-[#FFFBEB] border border-[#FDE68A]">
              <div className="text-[#92400E] font-medium">CIW · Window Band</div>
              <div className="font-mono-tabular font-semibold text-[#78350F] mt-0.5">
                [{conformal.ciwIntervalHours[0]}h, {conformal.ciwIntervalHours[1]}h]
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-[#F0FDFA] border border-[#99F6E4]">
              <div className="text-[#115E59] font-medium">n &amp; η · Staff Free</div>
              <div className="font-mono-tabular font-semibold text-[#134E4A] mt-0.5">
                n = {metrics.freeStaffN}/{metrics.totalStaffN} ({Math.round(metrics.freeShareEta * 100)}%)
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-[#F0FDFA] border border-[#99F6E4]">
              <div className="text-[#115E59] font-medium">WIP &amp; λ · Load</div>
              <div className="font-mono-tabular font-semibold text-[#134E4A] mt-0.5">
                {metrics.wipCases} cases · {metrics.arrivalRatePerHour}/hr
              </div>
            </div>
          </div>
          <p className="text-[11px] text-[#64748B]">
            Note: COP, CTE, and CIW here are illustrative teaching bands so you can see how uncertainty behaves.
          </p>
        </div>
      </aside>
    );
  }

  return (
    <aside
      aria-label={`Concept details: ${concept.plainTitle}`}
      className="bg-white border border-[#DCE1D9] rounded-xl p-5 flex flex-col gap-4 h-full overflow-y-auto"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs text-[#52606D] flex flex-wrap items-center gap-1.5">
            <span className="font-semibold text-[#24313A]">{concept.badge}</span>
            <span aria-hidden="true">·</span>
            <span>{GROUP_COLOR_LABEL[concept.group] ?? concept.group}</span>
          </div>
          <h2 className="font-display text-lg font-bold text-[#24313A] mt-1 leading-snug">
            {concept.plainTitle}
          </h2>
          <p className="text-xs font-mono-tabular text-[#52606D] mt-0.5">
            {concept.technicalLabel}
            {concept.symbol ? ` · ${concept.symbol}` : ''}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onSelectConcept(null)}
          aria-label="Clear concept selection"
          className="p-1.5 text-[#64748B] hover:text-[#24313A] rounded-md border border-[#E2E5DE] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8]"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Analogy boundary if applicable */}
      {concept.analogyBoundary && (
        <div className="text-xs bg-[#F7F8F5] border border-[#DCE1D9] rounded-lg px-3 py-2 text-[#475569]">
          <span className="font-semibold text-[#24313A]">Analogy boundary: </span>
          {concept.analogyBoundary}
        </div>
      )}

      {/* Five structured pedagogical questions */}
      <dl className="space-y-3 text-sm border-t border-[#E6E9E2] pt-3">
        <div>
          <dt className="text-xs font-semibold text-[#52606D]">
            1. What is it in one sentence?
          </dt>
          <dd className="text-[#24313A] mt-0.5 leading-relaxed">{concept.oneSentence}</dd>
        </div>

        <div>
          <dt className="text-xs font-semibold text-[#52606D]">
            2. What familiar BPM idea connects to it?
          </dt>
          <dd className="text-[#24313A] mt-0.5 leading-relaxed">{concept.bpmConnection}</dd>
        </div>

        <div>
          <dt className="text-xs font-semibold text-[#52606D]">
            3. What does it receive and produce?
          </dt>
          <dd className="text-[#24313A] mt-1 space-y-1 text-xs leading-relaxed">
            <div>
              <span className="font-semibold text-[#475569]">Receives: </span>
              {concept.receives}
            </div>
            <div>
              <span className="font-semibold text-[#475569]">Produces: </span>
              {concept.produces}
            </div>
          </dd>
        </div>

        <div>
          <dt className="text-xs font-semibold text-[#52606D]">4. Why is it needed?</dt>
          <dd className="text-[#24313A] mt-0.5 leading-relaxed">{concept.whyNeeded}</dd>
        </div>

        <div>
          <dt className="text-xs font-semibold text-[#9A3412]">
            5. What common misunderstanding should I avoid?
          </dt>
          <dd className="text-[#24313A] mt-0.5 leading-relaxed">
            {concept.avoidMisunderstanding}
          </dd>
        </div>
      </dl>

      {/* Expandable: Keep these separate */}
      {concept.keepSeparate && (
        <div className="border border-[#DCE1D9] rounded-lg bg-[#FAFBF9]">
          <button
            type="button"
            aria-expanded={showSeparate}
            onClick={() => setShowSeparate((v) => !v)}
            className="w-full px-3 py-2 text-left text-xs font-semibold text-[#24313A] flex items-center justify-between gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8] rounded-lg"
          >
            <span>Keep these separate: {concept.keepSeparate.title}</span>
            {showSeparate ? (
              <ChevronUp className="w-3.5 h-3.5 shrink-0" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 shrink-0" />
            )}
          </button>
          {showSeparate && (
            <p className="px-3 pb-2.5 text-xs text-[#475569] leading-relaxed">
              {concept.keepSeparate.detail}
            </p>
          )}
        </div>
      )}

      {/* Expandable: Technical detail & equations */}
      {(concept.technicalDetail || concept.equation) && (
        <div className="border border-[#DCE1D9] rounded-lg">
          <button
            type="button"
            aria-expanded={showTechnical}
            onClick={() => setShowTechnical((v) => !v)}
            className="w-full px-3 py-2 text-left text-xs font-semibold text-[#475569] flex items-center justify-between gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8] rounded-lg"
          >
            <span>Technical detail &amp; notation</span>
            {showTechnical ? (
              <ChevronUp className="w-3.5 h-3.5 shrink-0" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 shrink-0" />
            )}
          </button>
          {showTechnical && (
            <div className="px-3 pb-3 space-y-2">
              {concept.equation && (
                <div className="font-mono-tabular text-xs bg-[#F7F8F5] border border-[#E2E5DE] rounded px-2.5 py-2 text-[#24313A]">
                  {concept.equation}
                </div>
              )}
              {concept.technicalDetail && (
                <p className="text-xs text-[#475569] leading-relaxed">
                  {concept.technicalDetail}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Clickable Immediate Connections */}
      <div className="border-t border-[#E6E9E2] pt-3 space-y-2">
        <h3 className="text-xs font-semibold text-[#52606D]">
          Trace immediate connections
        </h3>
        {incomingEdges.length > 0 && (
          <div className="space-y-1">
            <div className="text-[11px] text-[#64748B]">Inputs into this object:</div>
            {incomingEdges.map((edge) => (
              <button
                key={edge.id}
                type="button"
                onClick={() => onSelectConcept(edge.from)}
                className="w-full text-left px-2.5 py-1.5 text-xs bg-[#F7F8F5] hover:bg-[#EBEEE8] border border-[#E2E5DE] rounded-md flex items-center justify-between gap-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8]"
              >
                <span className="truncate">
                  <strong className="font-medium text-[#24313A]">
                    {findConceptTitle(edge.from)}
                  </strong>{' '}
                  <span className="text-[#52606D]">— {edge.verb}</span>
                </span>
                <ArrowLeft className="w-3 h-3 text-[#64748B] shrink-0" />
              </button>
            ))}
          </div>
        )}
        {outgoingEdges.length > 0 && (
          <div className="space-y-1">
            <div className="text-[11px] text-[#64748B]">Consequences from this object:</div>
            {outgoingEdges.map((edge) => (
              <button
                key={edge.id}
                type="button"
                onClick={() => onSelectConcept(edge.to)}
                className="w-full text-left px-2.5 py-1.5 text-xs bg-[#F7F8F5] hover:bg-[#EBEEE8] border border-[#E2E5DE] rounded-md flex items-center justify-between gap-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8]"
              >
                <span className="truncate">
                  <span className="text-[#52606D]">{edge.verb} → </span>
                  <strong className="font-medium text-[#24313A]">
                    {findConceptTitle(edge.to)}
                  </strong>
                </span>
                <ArrowRight className="w-3 h-3 text-[#64748B] shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Source Link */}
      {concept.sourceRef && (
        <div className="border-t border-[#E6E9E2] pt-2.5 text-[11px] text-[#64748B]">
          {concept.sourceRef.url ? (
            <a
              href={concept.sourceRef.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[#1D4ED8] hover:underline"
            >
              <span>Source: {concept.sourceRef.label}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          ) : (
            <span>Source: {concept.sourceRef.label}</span>
          )}
        </div>
      )}
    </aside>
  );
};
