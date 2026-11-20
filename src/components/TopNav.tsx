import React from 'react';

export type ActiveSurface = 'map' | 'quiz' | 'evidence' | 'outline';

interface TopNavProps {
  activeSurface: ActiveSurface;
  onSelectSurface: (surface: ActiveSurface) => void;
  onStartTour: () => void;
  onCompareCases: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeSurface,
  onSelectSurface,
  onStartTour,
  onCompareCases,
}) => {
  return (
    <header className="no-print bg-white border-b border-[#DCE1D9] px-4 sm:px-6 py-3 flex items-center justify-between gap-4 lg:gap-8">
      {/* Zone 1: Single-element Brand Wordmark */}
      <button
        type="button"
        onClick={() => onSelectSurface('map')}
        className="font-display text-base sm:text-lg font-bold tracking-tight text-[#24313A] hover:text-[#1D4ED8] transition-colors whitespace-nowrap shrink-0 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8] rounded"
      >
        The Process Observatory
      </button>

      {/* Zone 2: 5 concise single-line nav links */}
      <nav
        aria-label="Primary observatory views"
        className="hidden md:flex items-center gap-6 text-sm font-medium text-[#475569]"
      >
        <button
          type="button"
          onClick={() => onSelectSurface('map')}
          className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8] rounded-t ${
            activeSurface === 'map'
              ? 'border-[#24313A] text-[#24313A]'
              : 'border-transparent hover:text-[#24313A]'
          }`}
        >
          Concept Map
        </button>
        <button
          type="button"
          onClick={onCompareCases}
          className="py-1 border-b-2 border-transparent hover:text-[#24313A] transition-colors whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8] rounded-t"
        >
          Three-Case Lab
        </button>
        <button
          type="button"
          onClick={() => onSelectSurface('quiz')}
          className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8] rounded-t ${
            activeSurface === 'quiz'
              ? 'border-[#24313A] text-[#24313A]'
              : 'border-transparent hover:text-[#24313A]'
          }`}
        >
          Check Understanding
        </button>
        <button
          type="button"
          onClick={() => onSelectSurface('evidence')}
          className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8] rounded-t ${
            activeSurface === 'evidence'
              ? 'border-[#24313A] text-[#24313A]'
              : 'border-transparent hover:text-[#24313A]'
          }`}
        >
          Study Evidence
        </button>
        <button
          type="button"
          onClick={() => onSelectSurface('outline')}
          className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8] rounded-t ${
            activeSurface === 'outline'
              ? 'border-[#24313A] text-[#24313A]'
              : 'border-transparent hover:text-[#24313A]'
          }`}
        >
          Text Outline
        </button>
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={onStartTour}
          className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-[#24313A] hover:bg-[#1E293B] rounded-lg transition-colors whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8] focus-visible:ring-offset-2"
        >
          Guided Tour
        </button>
      </div>
    </header>
  );
};
