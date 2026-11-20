import React from 'react';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import type { TourStep } from '../types/observatory';

interface GuidedTourBarProps {
  steps: TourStep[];
  currentIndex: number;
  onChangeIndex: (idx: number) => void;
  onExitTour: () => void;
}

export const GuidedTourBar: React.FC<GuidedTourBarProps> = ({
  steps,
  currentIndex,
  onChangeIndex,
  onExitTour,
}) => {
  const step = steps[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === steps.length - 1;

  return (
    <aside
      aria-label="Guided tour"
      className="bg-white border border-[#DCE1D9] rounded-xl p-5 flex flex-col gap-4 h-full overflow-y-auto"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-mono-tabular font-semibold text-[#1D4ED8]">
          Guided Tour · Step {step.stepNumber} of {steps.length}
        </span>
        <button
          type="button"
          onClick={onExitTour}
          className="text-xs font-medium text-[#52606D] hover:text-[#24313A] underline underline-offset-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8] rounded"
        >
          Return to Explore
        </button>
      </div>

      {/* Progress steps */}
      <div className="flex items-center gap-1" aria-label="Tour progress">
        {steps.map((s, idx) => (
          <button
            key={s.id}
            type="button"
            aria-label={`Jump to step ${s.stepNumber}: ${s.title}`}
            onClick={() => onChangeIndex(idx)}
            className={`h-1.5 flex-1 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8] ${
              idx === currentIndex
                ? 'bg-[#1D4ED8]'
                : idx < currentIndex
                ? 'bg-[#93C5FD]'
                : 'bg-[#E2E5DE]'
            }`}
          />
        ))}
      </div>

      <div>
        <p className="text-xs font-medium text-[#52606D]">{step.subtitle}</p>
        <h2 className="font-display text-xl font-bold text-[#24313A] mt-1">
          {step.title}
        </h2>
      </div>

      {/* Spotlighted relationship */}
      <div className="bg-[#F7F8F5] border border-[#DCE1D9] rounded-lg px-3.5 py-2.5 text-xs">
        <div className="font-semibold text-[#52606D]">Spotlighted relationship</div>
        <div className="text-[#24313A] font-medium mt-0.5">{step.relationshipLabel}</div>
      </div>

      <p className="text-sm text-[#24313A] leading-relaxed">{step.explanation}</p>

      <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-lg px-3.5 py-3 text-xs text-[#1E3A8A]">
        <span className="font-semibold">Key takeaway: </span>
        {step.takeaway}
      </div>

      {/* Next / Back controls */}
      <div className="mt-auto pt-4 border-t border-[#E6E9E2] flex items-center justify-between gap-2">
        <button
          type="button"
          disabled={isFirst}
          onClick={() => onChangeIndex(currentIndex - 1)}
          className="px-3.5 py-2 text-xs font-semibold border border-[#D4D9D0] rounded-lg bg-white text-[#24313A] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F7F8F5] flex items-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8]"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>

        {isLast ? (
          <button
            type="button"
            onClick={() => onChangeIndex(0)}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#24313A] text-white hover:bg-[#1E293B] flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restart tour
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onChangeIndex(currentIndex + 1)}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#1D4ED8] text-white hover:bg-[#1E40AF] flex items-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8]"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </aside>
  );
};
