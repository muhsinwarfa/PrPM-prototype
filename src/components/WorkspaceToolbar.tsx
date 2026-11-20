import React, { useMemo, useState } from 'react';
import {
  Download,
  Pause,
  Play,
  Printer,
  RotateCcw,
  Search,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import type { ConceptNode, ObservatoryMode } from '../types/observatory';
import type { ActiveSurface } from './TopNav';

interface WorkspaceToolbarProps {
  mode: ObservatoryMode;
  onChangeMode: (mode: ObservatoryMode) => void;
  activeSurface: ActiveSurface;
  onSelectSurface: (surface: ActiveSurface) => void;
  concepts: ConceptNode[];
  onSelectConcept: (id: string) => void;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  isMotionPaused: boolean;
  onToggleMotion: () => void;
  onExportSvg: () => void;
  onPrint: () => void;
}

export const WorkspaceToolbar: React.FC<WorkspaceToolbarProps> = ({
  mode,
  onChangeMode,
  activeSurface,
  onSelectSurface,
  concepts,
  onSelectConcept,
  zoom,
  onZoomIn,
  onZoomOut,
  onResetView,
  isMotionPaused,
  onToggleMotion,
  onExportSvg,
  onPrint,
}) => {
  const [query, setQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeMatchIndex, setActiveMatchIndex] = useState(0);

  const matches = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return [];
    return concepts.filter(
      (c) =>
        c.plainTitle.toLowerCase().includes(trimmed) ||
        c.technicalLabel.toLowerCase().includes(trimmed) ||
        (c.symbol && c.symbol.toLowerCase().includes(trimmed)) ||
        c.oneSentence.toLowerCase().includes(trimmed)
    );
  }, [concepts, query]);

  const selectMatch = (id: string) => {
    onSelectSurface('map');
    onSelectConcept(id);
    setQuery('');
    setIsSearchOpen(false);
    setActiveMatchIndex(0);
  };

  const modes: Array<{ id: ObservatoryMode; label: string }> = [
    { id: 'explore', label: 'Explore' },
    { id: 'tour', label: 'Guided tour' },
    { id: 'compare', label: 'Compare cases' },
    { id: 'whatif', label: 'What if?' },
  ];

  return (
    <div className="no-print bg-[#FAFBF9] border-b border-[#E2E5DE] px-4 sm:px-6 py-2.5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Anchoring Question */}
        <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3 min-w-0">
          <h1 className="font-display text-sm sm:text-base font-semibold text-[#24313A] leading-snug">
            “Which running case should receive scarce help now?”
          </h1>
          <span className="text-xs text-[#52606D] hidden xl:inline">
            Risk ≠ benefit · Timing &amp; staff capacity constrain every decision
          </span>
        </div>

        {/* Mode & Utility Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Working Mode Segmented Control */}
          <div
            role="tablist"
            aria-label="Observatory learning modes"
            className="flex items-center gap-1 p-1 bg-[#EBEEE8] rounded-lg"
          >
            {modes.map((m) => {
              const active = activeSurface === 'map' && mode === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => {
                    onSelectSurface('map');
                    onChangeMode(m.id);
                  }}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8] ${
                    active
                      ? 'bg-white text-[#24313A] shadow-xs'
                      : 'text-[#52606D] hover:text-[#24313A]'
                  }`}
                >
                  {m.label}
                </button>
              );
            })}
          </div>

          {/* Search box with full keyboard navigation */}
          <div
            className="relative"
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
                setIsSearchOpen(false);
              }
            }}
          >
            <label htmlFor="observatory-search" className="sr-only">
              Search concepts
            </label>
            <Search
              aria-hidden="true"
              className="w-3.5 h-3.5 text-[#64748B] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
            />
            <input
              id="observatory-search"
              type="search"
              role="combobox"
              aria-expanded={isSearchOpen && query.trim().length > 0}
              aria-controls="observatory-search-listbox"
              aria-activedescendant={
                isSearchOpen && matches[activeMatchIndex]
                  ? `search-opt-${matches[activeMatchIndex].id}`
                  : undefined
              }
              value={query}
              onFocus={() => setIsSearchOpen(true)}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsSearchOpen(true);
                setActiveMatchIndex(0);
              }}
              onKeyDown={(e) => {
                if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  setIsSearchOpen(true);
                  setActiveMatchIndex((idx) =>
                    matches.length > 0 ? (idx + 1) % matches.length : 0
                  );
                } else if (e.key === 'ArrowUp') {
                  e.preventDefault();
                  setIsSearchOpen(true);
                  setActiveMatchIndex((idx) =>
                    matches.length > 0
                      ? (idx - 1 + matches.length) % matches.length
                      : 0
                  );
                } else if (e.key === 'Enter') {
                  if (matches.length > 0) {
                    e.preventDefault();
                    const picked = matches[activeMatchIndex] ?? matches[0];
                    selectMatch(picked.id);
                  }
                } else if (e.key === 'Escape') {
                  setIsSearchOpen(false);
                }
              }}
              placeholder="Search concepts..."
              className="w-44 sm:w-52 pl-8 pr-3 py-1.5 text-xs bg-white border border-[#D4D9D0] rounded-lg text-[#24313A] placeholder-[#7B8794] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
            />
            {isSearchOpen && query.trim().length > 0 && (
              <div
                id="observatory-search-listbox"
                role="listbox"
                aria-label="Matching concepts"
                className="absolute right-0 mt-1 w-72 bg-white border border-[#D4D9D0] rounded-lg shadow-lg z-40 max-h-64 overflow-y-auto py-1"
              >
                {matches.length === 0 ? (
                  <p className="px-3 py-2 text-xs text-[#64748B]">
                    No concepts match “{query}”.
                  </p>
                ) : (
                  matches.map((item, idx) => (
                    <button
                      key={item.id}
                      id={`search-opt-${item.id}`}
                      type="button"
                      role="option"
                      aria-selected={idx === activeMatchIndex}
                      onClick={() => selectMatch(item.id)}
                      className={`w-full text-left px-3 py-2 transition-colors flex flex-col gap-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8] ${
                        idx === activeMatchIndex ? 'bg-[#EFF6FF]' : 'hover:bg-[#F1F4EE]'
                      }`}
                    >
                      <span className="text-xs font-semibold text-[#24313A]">
                        {item.plainTitle}
                      </span>
                      <span className="text-[11px] text-[#52606D]">
                        {item.technicalLabel}
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Map Viewport Controls */}
          {activeSurface === 'map' && (
            <div className="flex items-center gap-1 border border-[#D4D9D0] bg-white rounded-lg px-1 py-0.5">
              <button
                type="button"
                onClick={onZoomOut}
                aria-label="Zoom out"
                title="Zoom out"
                className="p-1.5 text-[#475569] hover:text-[#24313A] rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8]"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-mono-tabular text-[#475569] px-1 min-w-[3rem] text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                type="button"
                onClick={onZoomIn}
                aria-label="Zoom in"
                title="Zoom in"
                className="p-1.5 text-[#475569] hover:text-[#24313A] rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8]"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={onResetView}
                aria-label="Reset view"
                title="Reset view"
                className="px-2 py-1 text-[11px] font-medium text-[#475569] hover:text-[#24313A] border-l border-[#E2E5DE] flex items-center gap-1 whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8]"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            </div>
          )}

          {/* Motion toggle */}
          <button
            type="button"
            onClick={onToggleMotion}
            aria-pressed={isMotionPaused}
            className="px-2.5 py-1.5 text-xs font-medium bg-white border border-[#D4D9D0] text-[#475569] hover:text-[#24313A] rounded-lg flex items-center gap-1.5 whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8]"
          >
            {isMotionPaused ? (
              <>
                <Play className="w-3.5 h-3.5" />
                Resume motion
              </>
            ) : (
              <>
                <Pause className="w-3.5 h-3.5" />
                Pause motion
              </>
            )}
          </button>

          {/* Export / Print */}
          <div className="hidden sm:flex items-center gap-1">
            <button
              type="button"
              onClick={onExportSvg}
              aria-label="Export SVG map"
              title="Download SVG diagram"
              className="px-2.5 py-1.5 text-xs font-medium bg-white border border-[#D4D9D0] text-[#475569] hover:text-[#24313A] rounded-lg flex items-center gap-1 whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8]"
            >
              <Download className="w-3.5 h-3.5" />
              SVG
            </button>
            <button
              type="button"
              onClick={onPrint}
              aria-label="Print view"
              title="Print view"
              className="p-1.5 bg-white border border-[#D4D9D0] text-[#475569] hover:text-[#24313A] rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8]"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile secondary navigation */}
      <div className="flex md:hidden items-center gap-3 mt-2 pt-2 border-t border-[#E2E5DE] overflow-x-auto text-xs font-medium text-[#475569]">
        <button
          type="button"
          onClick={() => onSelectSurface('map')}
          className={`whitespace-nowrap shrink-0 py-1 ${activeSurface === 'map' ? 'text-[#24313A] underline underline-offset-4' : ''}`}
        >
          Concept Map
        </button>
        <button
          type="button"
          onClick={() => onSelectSurface('quiz')}
          className={`whitespace-nowrap shrink-0 py-1 ${activeSurface === 'quiz' ? 'text-[#24313A] underline underline-offset-4' : ''}`}
        >
          Check Quiz
        </button>
        <button
          type="button"
          onClick={() => onSelectSurface('evidence')}
          className={`whitespace-nowrap shrink-0 py-1 ${activeSurface === 'evidence' ? 'text-[#24313A] underline underline-offset-4' : ''}`}
        >
          Study Evidence
        </button>
        <button
          type="button"
          onClick={() => onSelectSurface('outline')}
          className={`whitespace-nowrap shrink-0 py-1 ${activeSurface === 'outline' ? 'text-[#24313A] underline underline-offset-4' : ''}`}
        >
          Text Outline
        </button>
      </div>
    </div>
  );
};
