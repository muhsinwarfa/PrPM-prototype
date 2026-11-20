import React from 'react';
import { ArrowUpRight, Download, Printer } from 'lucide-react';
import type { ConceptEdge, ConceptNode } from '../types/observatory';

interface TextOutlineViewProps {
  concepts: ConceptNode[];
  edges: ConceptEdge[];
  onInspectConceptOnMap: (id: string) => void;
  onExportSvg: () => void;
  onPrint: () => void;
}

const GROUP_HEADINGS: Array<{ key: ConceptNode['group']; title: string }> = [
  { key: 'outer-lifecycle', title: 'A. Outer Frame: Improve the process (BPM Lifecycle)' },
  { key: 'inner-track', title: 'B. Inner Track: Help a running case (Loan Process)' },
  { key: 'historical-workbench', title: 'C. Historical Workbench: Learn from past cases' },
  { key: 'significance', title: 'D1. Significance Instruments: Is help needed & helpful?' },
  { key: 'urgency', title: 'D2. Urgency Instrument: How long can we still act?' },
  { key: 'capacity', title: 'D3. Capacity Instrument: Can we help & what else waits?' },
  { key: 'decision-desk', title: 'E. Decision Desk: Choose an action' },
  { key: 'feedback-ledger', title: 'F. Feedback Ledger: Learn a policy (PPO)' },
];

export const TextOutlineView: React.FC<TextOutlineViewProps> = ({
  concepts,
  edges,
  onInspectConceptOnMap,
  onExportSvg,
  onPrint,
}) => {
  const titleById = (id: string) =>
    concepts.find((c) => c.id === id)?.plainTitle ?? id;

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#DCE1D9] pb-4">
        <div>
          <p className="text-xs font-medium text-[#52606D]">
            Accessible Structural Outline &amp; Export
          </p>
          <h2 className="font-display text-2xl font-bold text-[#24313A] mt-1">
            Labeled Text Outline of the Observatory
          </h2>
          <p className="text-sm text-[#475569] mt-1">
            Every concept node and directional relationship in plain English, paired with SVG export and print support.
          </p>
        </div>

        <div className="no-print flex items-center gap-2">
          <button
            type="button"
            onClick={onExportSvg}
            className="px-3.5 py-2 text-xs font-semibold border border-[#D4D9D0] bg-white text-[#24313A] hover:bg-[#F1F4EE] rounded-lg flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8]"
          >
            <Download className="w-3.5 h-3.5" />
            Download SVG
          </button>
          <button
            type="button"
            onClick={onPrint}
            className="px-3.5 py-2 text-xs font-semibold bg-[#24313A] text-white hover:bg-[#1E293B] rounded-lg flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8]"
          >
            <Printer className="w-3.5 h-3.5" />
            Print View
          </button>
        </div>
      </div>

      {/* Grouped Hierarchy */}
      <div className="space-y-4">
        {GROUP_HEADINGS.map((group) => {
          const items = concepts.filter((c) => c.group === group.key);
          if (items.length === 0) return null;
          return (
            <section
              key={group.key}
              className="bg-white border border-[#DCE1D9] rounded-xl p-5 space-y-3"
            >
              <h3 className="font-display text-base font-bold text-[#24313A]">
                {group.title}
              </h3>
              <ul className="divide-y divide-[#E6E9E2]">
                {items.map((node) => (
                  <li key={node.id} className="py-3 first:pt-0 last:pb-0 space-y-1">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <div>
                        <span className="font-semibold text-sm text-[#24313A]">
                          {node.plainTitle}
                        </span>
                        <span className="text-xs font-mono-tabular text-[#52606D] ml-2">
                          ({node.technicalLabel})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => onInspectConceptOnMap(node.id)}
                        className="no-print text-xs font-medium text-[#1D4ED8] hover:underline inline-flex items-center gap-1"
                      >
                        <span>Locate on map</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="text-xs text-[#475569] leading-relaxed">
                      {node.oneSentence}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>

      {/* Directional Relationships Table */}
      <section className="bg-white border border-[#DCE1D9] rounded-xl p-5 space-y-3">
        <h3 className="font-display text-base font-bold text-[#24313A]">
          Explicit Directional Relationships ({edges.length})
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#DCE1D9] text-[#52606D]">
                <th className="py-2 pr-3 font-semibold">From</th>
                <th className="py-2 pr-3 font-semibold">Directional Verb</th>
                <th className="py-2 pr-3 font-semibold">To</th>
                <th className="py-2 font-semibold">Flow Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6E9E2] text-[#24313A]">
              {edges.map((edge) => (
                <tr key={edge.id}>
                  <td className="py-2 pr-3 font-medium">{titleById(edge.from)}</td>
                  <td className="py-2 pr-3 text-[#475569]">{edge.verb}</td>
                  <td className="py-2 pr-3 font-medium">{titleById(edge.to)}</td>
                  <td className="py-2 capitalize text-[#52606D]">{edge.kind}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
};
