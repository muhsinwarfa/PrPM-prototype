import React from 'react';
import { ChevronRight } from 'lucide-react';
import type { ConceptNode } from '../types/observatory';

interface MobileGuidedSequenceProps {
  concepts: ConceptNode[];
  selectedNodeId: string | null;
  onSelectNode: (id: string) => void;
}

const SEQUENCE_ORDER = [
  'bpm-lifecycle',
  'monitoring-bridge',
  'loan-track',
  'active-prefix',
  'historical-workbench',
  'conformal-calibration',
  'sig-outcome-risk',
  'sig-treatment-effect',
  'urgency-window',
  'capacity-resources',
  'decision-desk',
  'intervention-activity',
  'feedback-ledger',
];

export const MobileGuidedSequence: React.FC<MobileGuidedSequenceProps> = ({
  concepts,
  selectedNodeId,
  onSelectNode,
}) => {
  const ordered = SEQUENCE_ORDER.map((id) => concepts.find((c) => c.id === id)).filter(
    (c): c is ConceptNode => Boolean(c)
  );

  return (
    <section
      aria-label="Mobile readable guided sequence"
      className="lg:hidden bg-white border border-[#DCE1D9] rounded-xl p-4 space-y-3"
    >
      <div>
        <h2 className="font-display text-sm font-bold text-[#24313A]">
          Guided Map Sequence (Touch-Friendly)
        </h2>
        <p className="text-xs text-[#52606D] mt-0.5">
          Tap any step below to read its full explanation and highlight it on the map above.
        </p>
      </div>

      <ol className="space-y-2">
        {ordered.map((node, index) => {
          const isSelected = selectedNodeId === node.id;
          return (
            <li key={node.id}>
              <button
                type="button"
                onClick={() => onSelectNode(node.id)}
                className={`w-full text-left p-3 rounded-lg border flex items-center justify-between gap-2 transition-colors min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8] ${
                  isSelected
                    ? 'bg-[#EFF6FF] border-[#1D4ED8] text-[#1E3A8A]'
                    : 'bg-[#FAFBF9] border-[#DCE1D9] text-[#24313A]'
                }`}
              >
                <div className="min-w-0">
                  <div className="text-[11px] font-mono-tabular text-[#52606D]">
                    {String(index + 1).padStart(2, '0')}. {node.technicalLabel}
                  </div>
                  <div className="text-xs font-semibold truncate">{node.plainTitle}</div>
                </div>
                <ChevronRight className="w-4 h-4 shrink-0 text-[#64748B]" />
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
};
