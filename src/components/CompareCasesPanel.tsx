import React, { useState } from 'react';
import { ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';
import type { LoanCase, ResourceMetrics } from '../types/observatory';
import {
  computeEntropyTU,
  computeIllustrativeConformalOutputs,
  computeToyIncrementalValue,
} from '../logic/prpmModel';

interface CompareCasesPanelProps {
  cases: LoanCase[];
  selectedCaseId: 'A' | 'B' | 'C';
  onSelectCase: (id: 'A' | 'B' | 'C') => void;
  busyCaseIds: Array<'A' | 'B' | 'C'>;
  metrics: ResourceMetrics;
  uncertaintyScale: number;
  onResetExercise: () => void;
}

export const CompareCasesPanel: React.FC<CompareCasesPanelProps> = ({
  cases,
  selectedCaseId,
  onSelectCase,
  busyCaseIds,
  metrics,
  uncertaintyScale,
  onResetExercise,
}) => {
  const [learnerChoice, setLearnerChoice] = useState<'A' | 'B' | 'C' | ''>('');
  const [learnerReasoning, setLearnerReasoning] = useState('');
  const [revealed, setRevealed] = useState(false);
  const [showToyArithmetic, setShowToyArithmetic] = useState(false);

  const handleReset = () => {
    setLearnerChoice('');
    setLearnerReasoning('');
    setRevealed(false);
    setShowToyArithmetic(false);
    onResetExercise();
  };

  return (
    <aside
      aria-label="Compare Cases A, B, and C"
      className="bg-white border border-[#DCE1D9] rounded-xl p-5 flex flex-col gap-4 h-full overflow-y-auto"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-medium text-[#52606D]">
            Three-Case Exercise · {metrics.freeStaffN} of {metrics.totalStaffN} officer free
          </p>
          <h2 className="font-display text-lg font-bold text-[#24313A] mt-0.5">
            Compare Cases A, B, and C
          </h2>
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="px-2.5 py-1 text-xs font-medium border border-[#D4D9D0] rounded-md text-[#475569] hover:text-[#24313A] flex items-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8]"
        >
          <RotateCcw className="w-3 h-3" />
          Reset
        </button>
      </div>

      <p className="text-xs text-[#475569] leading-relaxed">
        All three cases remain at their positions on the process track. Select any card to examine it on the tabletop instruments.
      </p>

      {/* Side-by-side cards */}
      <div className="grid grid-cols-1 gap-2.5">
        {cases.map((c) => {
          const isSelected = c.id === selectedCaseId;
          const isBusy = busyCaseIds.includes(c.id);
          const tu = computeEntropyTU(c.opNegativeProb);
          const conformal = computeIllustrativeConformalOutputs(c, uncertaintyScale);
          const baseAccept = Math.round((1 - c.opNegativeProb) * 100);
          const withAccept = Math.round((1 - c.opNegativeProb + c.teImprovement) * 100);
          const tePp = Math.round(c.teImprovement * 100);

          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelectCase(c.id)}
              className={`text-left p-3 rounded-lg border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8] ${
                isSelected
                  ? 'border-[#1D4ED8] bg-[#EFF6FF]/60'
                  : 'border-[#DCE1D9] bg-[#FAFBF9] hover:bg-[#F1F4EE]'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-display text-sm font-bold text-[#24313A]">
                  {c.label} · K = {c.prefixLengthK}
                </span>
                <span className="text-[11px] font-medium text-[#52606D]">
                  {isBusy ? 'Officer busy on this case' : isSelected ? 'Examined on map' : 'Click to inspect'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
                <div>
                  <div className="text-[11px] text-[#52606D]">Negative OP</div>
                  <div className="font-mono-tabular font-semibold text-[#9A3412]">
                    {Math.round(c.opNegativeProb * 100)}%
                  </div>
                  <div className="text-[10px] font-mono-tabular text-[#64748B]">
                    TU {tu.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-[#52606D]">Benefit TE</div>
                  <div className="font-mono-tabular font-semibold text-[#1D4ED8]">
                    +{tePp}pp
                  </div>
                  <div className="text-[10px] font-mono-tabular text-[#64748B]">
                    {baseAccept}% → {withAccept}%
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-[#52606D]">Window IW</div>
                  <div className="font-mono-tabular font-semibold text-[#B45309]">
                    {c.iwBaseHours.min}–{c.iwBaseHours.max}h
                  </div>
                  <div className="text-[10px] font-mono-tabular text-[#64748B]">
                    CIW [{conformal.ciwIntervalHours[0]}–{conformal.ciwIntervalHours[1]}h]
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Learner Prediction Prompt */}
      <div className="border-t border-[#E6E9E2] pt-3 space-y-3">
        <div>
          <h3 className="font-display text-sm font-semibold text-[#24313A]">
            Your prediction (1 free loan officer)
          </h3>
          <p className="text-xs text-[#52606D] mt-0.5">
            Which case deserves scarce help right now, and why?
          </p>
        </div>

        <div className="flex items-center gap-2" role="radiogroup" aria-label="Predict which case deserves help">
          {(['A', 'B', 'C'] as const).map((id) => (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={learnerChoice === id}
              onClick={() => setLearnerChoice(id)}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8] ${
                learnerChoice === id
                  ? 'bg-[#24313A] text-white border-[#24313A]'
                  : 'bg-white text-[#24313A] border-[#D4D9D0] hover:bg-[#F7F8F5]'
              }`}
            >
              Case {id}
            </button>
          ))}
        </div>

        <div>
          <label htmlFor="learner-reason" className="block text-[11px] font-medium text-[#52606D] mb-1">
            Explain your reasoning (optional)
          </label>
          <textarea
            id="learner-reason"
            rows={2}
            value={learnerReasoning}
            onChange={(e) => setLearnerReasoning(e.target.value)}
            placeholder="Compare risk, causal improvement, window, and the single officer..."
            className="w-full text-xs p-2.5 bg-[#FAFBF9] border border-[#D4D9D0] rounded-lg text-[#24313A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
          />
        </div>

        <button
          type="button"
          onClick={() => setRevealed(true)}
          className="w-full py-2 px-4 text-xs font-semibold text-white bg-[#1D4ED8] hover:bg-[#1E40AF] rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8] focus-visible:ring-offset-2"
        >
          Reveal distinction &amp; tradeoffs
        </button>

        {revealed && (
          <div className="bg-[#F7F8F5] border border-[#DCE1D9] rounded-lg p-3.5 space-y-2 text-xs text-[#24313A]">
            {learnerChoice && (
              <p className="font-semibold text-[#1D4ED8]">
                {learnerChoice === 'B'
                  ? 'Strong intuition on Case B — here is the full nuance:'
                  : `You picked Case ${learnerChoice} — notice why Case B typically takes priority when 1 officer is free:`}
              </p>
            )}
            <ul className="space-y-1.5 list-disc pl-4 text-[#334155] leading-relaxed">
              <li>
                <strong>Case A (90% risk, +5pp):</strong> Riskiest overall, yet this particular second offer changes little.
              </li>
              <li>
                <strong>Case B (70% risk, +50pp, 0.5–1.5h):</strong> Combines substantial estimated benefit with an urgent narrowing window.
              </li>
              <li>
                <strong>Case C (60% risk, +50pp, 4–8h):</strong> Also benefits (+50pp), but appears to leave more time before acting.
              </li>
              <li>
                <strong>Capacity &amp; uncertainty:</strong> Acting on any case occupies the only officer. Uncertainty (CTE, CIW) can shift confidence, and outcomes remain probabilistic—never guaranteed.
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* Expandable Toy Arithmetic */}
      <div className="border border-[#DCE1D9] rounded-lg">
        <button
          type="button"
          aria-expanded={showToyArithmetic}
          onClick={() => setShowToyArithmetic((v) => !v)}
          className="w-full px-3 py-2 text-left text-xs font-semibold text-[#475569] flex items-center justify-between gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8] rounded-lg"
        >
          <span>Optional arithmetic: Toy estimate of incremental value</span>
          {showToyArithmetic ? (
            <ChevronUp className="w-3.5 h-3.5 shrink-0" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 shrink-0" />
          )}
        </button>
        {showToyArithmetic && (
          <div className="px-3 pb-3 space-y-2 text-xs text-[#475569]">
            <div className="font-mono-tabular bg-[#F7F8F5] border border-[#E2E5DE] rounded p-2 text-[#24313A]">
              Toy incremental value = (Δ success probability × 60) − 25
            </div>
            <div className="grid grid-cols-3 gap-2 font-mono-tabular text-center">
              {cases.map((c) => {
                const val = computeToyIncrementalValue(c.teImprovement, 60, 25);
                return (
                  <div
                    key={c.id}
                    className="p-2 rounded border border-[#E2E5DE] bg-[#FAFBF9]"
                  >
                    <div className="text-[11px] text-[#52606D]">Case {c.id}</div>
                    <div
                      className={`font-semibold ${
                        val < 0 ? 'text-[#9A3412]' : 'text-[#0F766E]'
                      }`}
                    >
                      {val > 0 ? `+${val}` : val}
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-[11px] leading-relaxed text-[#64748B]">
              <strong>Important disclaimer:</strong> This toy arithmetic gives B (+5) and C (+5) identical values because it omits timing, uncertainty, and opportunity cost. It is neither the paper’s shaped RL reward nor the learned PPO policy.
            </p>
          </div>
        )}
      </div>
    </aside>
  );
};
