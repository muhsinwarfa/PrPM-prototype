import React, { useState } from 'react';
import { ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { CHECK_UNDERSTANDING_QUESTIONS } from '../data/tourAndQuiz';

interface KnowledgeCheckViewProps {
  onInspectConceptOnMap: (conceptId: string) => void;
}

export const KnowledgeCheckView: React.FC<KnowledgeCheckViewProps> = ({
  onInspectConceptOnMap,
}) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});

  const revealAll = () => {
    const all: Record<string, boolean> = {};
    for (const q of CHECK_UNDERSTANDING_QUESTIONS) {
      all[q.id] = true;
    }
    setRevealedIds(all);
  };

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#DCE1D9] pb-4">
        <div>
          <p className="text-xs font-medium text-[#52606D]">
            Self-Check · Five Core Distinctions
          </p>
          <h2 className="font-display text-2xl font-bold text-[#24313A] mt-1">
            Check My Understanding
          </h2>
          <p className="text-sm text-[#475569] mt-1">
            Test whether you can trace why each component exists without confusing risk, causal benefit, uncertainty, and capacity.
          </p>
        </div>
        <button
          type="button"
          onClick={revealAll}
          className="px-4 py-2 text-xs font-semibold border border-[#D4D9D0] bg-white text-[#24313A] hover:bg-[#F1F4EE] rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8]"
        >
          Reveal all explanations
        </button>
      </div>

      <div className="space-y-4">
        {CHECK_UNDERSTANDING_QUESTIONS.map((item) => {
          const picked = selectedAnswers[item.id];
          const isRevealed = Boolean(revealedIds[item.id]);

          return (
            <section
              key={item.id}
              aria-labelledby={`heading-${item.id}`}
              className="bg-white border border-[#DCE1D9] rounded-xl p-5 space-y-3"
            >
              <h3
                id={`heading-${item.id}`}
                className="font-display text-base font-bold text-[#24313A]"
              >
                {item.question}
              </h3>

              <div className="space-y-2" role="radiogroup" aria-label={item.question}>
                {item.choices.map((choice, idx) => {
                  const isPicked = picked === idx;
                  const isCorrect = idx === item.recommendedIndex;

                  return (
                    <button
                      key={choice}
                      type="button"
                      role="radio"
                      aria-checked={isPicked}
                      onClick={() =>
                        setSelectedAnswers((prev) => ({ ...prev, [item.id]: idx }))
                      }
                      className={`w-full text-left px-3.5 py-2.5 text-sm rounded-lg border transition-colors flex items-start justify-between gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8] ${
                        isRevealed && isCorrect
                          ? 'bg-[#F0FDFA] border-[#0F766E] text-[#134E4A]'
                          : isPicked
                          ? 'bg-[#EFF6FF] border-[#1D4ED8] text-[#1E3A8A]'
                          : 'bg-[#FAFBF9] border-[#DCE1D9] text-[#24313A] hover:bg-[#F1F4EE]'
                      }`}
                    >
                      <span>{choice}</span>
                      {isRevealed && isCorrect && (
                        <CheckCircle2 className="w-4 h-4 text-[#0F766E] shrink-0 mt-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <button
                  type="button"
                  onClick={() =>
                    setRevealedIds((prev) => ({ ...prev, [item.id]: !isRevealed }))
                  }
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-[#24313A] text-white hover:bg-[#1E293B] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8]"
                >
                  {isRevealed ? 'Hide explanation' : 'Reveal explanation'}
                </button>

                <button
                  type="button"
                  onClick={() => onInspectConceptOnMap(item.relatedConceptId)}
                  className="text-xs font-medium text-[#1D4ED8] hover:underline inline-flex items-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8] rounded"
                >
                  <span>Point to concept on map</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {isRevealed && (
                <div className="bg-[#F7F8F5] border border-[#DCE1D9] rounded-lg p-3.5 text-sm text-[#24313A] leading-relaxed">
                  {item.explanation}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </main>
  );
};
