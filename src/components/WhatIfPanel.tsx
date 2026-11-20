import React from 'react';
import { AlertCircle, CheckCircle2, Clock, FastForward, RotateCcw } from 'lucide-react';
import type {
  LoanCase,
  ResourceMetrics,
  ScriptedPolicyDecision,
  SimulationState,
} from '../types/observatory';
import { computeEntropyTU, computeIllustrativeConformalOutputs } from '../logic/prpmModel';

interface WhatIfPanelProps {
  simState: SimulationState;
  cases: LoanCase[];
  selectedCase: LoanCase;
  metrics: ResourceMetrics;
  policyDecision: ScriptedPolicyDecision;
  onSelectCase: (id: 'A' | 'B' | 'C' | 'D') => void;
  onChangeStaffN: (n: number) => void;
  onChangeArrivalRate: (rate: number) => void;
  onChangeDuration: (hours: number) => void;
  onChangeUncertaintyScale: (scale: number) => void;
  onInterveneNow: (caseId: 'A' | 'B' | 'C' | 'D') => void;
  onDoNotInterveneNow: (caseId: 'A' | 'B' | 'C' | 'D') => void;
  onAdvanceTime: (deltaHours: number) => void;
  onAdvanceNextEvent: () => void;
  onApplyPreset: (preset: 'baseline' | 'demand-surge' | 'high-uncertainty') => void;
  onResetSimulation: () => void;
}

export const WhatIfPanel: React.FC<WhatIfPanelProps> = ({
  simState,
  cases,
  selectedCase,
  metrics,
  policyDecision,
  onSelectCase,
  onChangeStaffN,
  onChangeArrivalRate,
  onChangeDuration,
  onChangeUncertaintyScale,
  onInterveneNow,
  onDoNotInterveneNow,
  onAdvanceTime,
  onAdvanceNextEvent,
  onApplyPreset,
  onResetSimulation,
}) => {
  const conformal = computeIllustrativeConformalOutputs(
    selectedCase,
    simState.uncertaintyScale
  );
  const tu = computeEntropyTU(selectedCase.opNegativeProb);
  const canIntervene =
    selectedCase.opportunityStatus === 'eligible' &&
    selectedCase.hasFirstOffer &&
    metrics.freeStaffN > 0;

  return (
    <aside
      aria-label="What if simulation and dispatch desk"
      className="bg-white border border-[#DCE1D9] rounded-xl p-5 flex flex-col gap-4 h-full overflow-y-auto"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-medium text-[#52606D]">
            Interactive Sandbox · Scripted Teaching Policy
          </p>
          <h2 className="font-display text-lg font-bold text-[#24313A] mt-0.5">
            What if conditions change?
          </h2>
        </div>
        <button
          type="button"
          onClick={onResetSimulation}
          className="px-2.5 py-1 text-xs font-medium border border-[#D4D9D0] rounded-md text-[#475569] hover:text-[#24313A] flex items-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8]"
        >
          <RotateCcw className="w-3 h-3" />
          Reset
        </button>
      </div>

      {/* Logical Clock & Time Progression */}
      <div className="bg-[#FAFBF9] border border-[#DCE1D9] rounded-lg p-3 space-y-2">
        <div className="flex items-center justify-between gap-2 text-xs">
          <span className="font-semibold text-[#24313A] flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#B45309]" />
            Logical Clock: <span className="font-mono-tabular">t = {simState.elapsedHours.toFixed(1)}h</span>
          </span>
          <span className="text-[11px] font-mono-tabular text-[#52606D]">
            WIP: {metrics.wipCases} (+{simState.cumulativeArrivals} / −{simState.cumulativeCompletions})
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onAdvanceTime(0.5)}
            className="py-1.5 px-2.5 text-xs font-semibold rounded-md bg-white border border-[#D4D9D0] text-[#24313A] hover:bg-[#F1F4EE] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8]"
          >
            Advance +0.5h
          </button>
          <button
            type="button"
            onClick={onAdvanceNextEvent}
            className="py-1.5 px-2.5 text-xs font-semibold rounded-md bg-[#24313A] text-white hover:bg-[#1E293B] flex items-center justify-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8]"
          >
            <FastForward className="w-3.5 h-3.5" />
            Next Event
          </button>
        </div>
      </div>

      {/* Teaching Scenario Presets */}
      <div>
        <span className="block text-[11px] font-semibold text-[#52606D] mb-1.5">
          Teaching presets (see policy change):
        </span>
        <div className="grid grid-cols-3 gap-1.5">
          <button
            type="button"
            onClick={() => onApplyPreset('baseline')}
            className="py-1.5 px-2 text-[11px] font-medium rounded-md border border-[#D4D9D0] bg-[#FAFBF9] hover:bg-[#EBEEE8] text-[#24313A] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8]"
          >
            Baseline
          </button>
          <button
            type="button"
            onClick={() => onApplyPreset('demand-surge')}
            className="py-1.5 px-2 text-[11px] font-medium rounded-md border border-[#99F6E4] bg-[#F0FDFA] hover:bg-[#CCFBF1] text-[#0F766E] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E]"
          >
            Demand surge
          </button>
          <button
            type="button"
            onClick={() => onApplyPreset('high-uncertainty')}
            className="py-1.5 px-2 text-[11px] font-medium rounded-md border border-[#BFDBFE] bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#1D4ED8] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8]"
          >
            High uncertainty
          </button>
        </div>
      </div>

      {/* Examined case selector */}
      <div>
        <span className="block text-xs font-semibold text-[#52606D] mb-1.5">
          Currently examined case at Dispatch Desk
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
          {cases.map((c) => {
            const statusSuffix =
              c.opportunityStatus === 'active'
                ? ' (Busy)'
                : c.opportunityStatus === 'completed'
                ? ' (Done)'
                : c.opportunityStatus === 'expired'
                ? ' (Expired)'
                : c.opportunityStatus === 'not-yet-open'
                ? ' (Pending)'
                : '';
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => onSelectCase(c.id)}
                className={`py-2 px-2 text-xs font-semibold rounded-lg border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8] ${
                  selectedCase.id === c.id
                    ? 'bg-[#24313A] text-white border-[#24313A]'
                    : 'bg-[#FAFBF9] text-[#24313A] border-[#D4D9D0] hover:bg-[#F1F4EE]'
                }`}
              >
                {c.label}
                {statusSuffix}
              </button>
            );
          })}
        </div>
      </div>

      {/* Parameter Sliders */}
      <div className="space-y-3 border-t border-[#E6E9E2] pt-3">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <label htmlFor="slider-staff" className="font-medium text-[#24313A]">
              Total loan officers (N)
            </label>
            <span className="font-mono-tabular font-semibold text-[#0F766E]">
              N = {metrics.totalStaffN} ({metrics.freeStaffN} free · η = {Math.round(metrics.freeShareEta * 100)}%)
            </span>
          </div>
          <input
            id="slider-staff"
            type="range"
            min={0}
            max={4}
            step={1}
            value={metrics.pendingStaffN ?? metrics.totalStaffN}
            onChange={(e) => onChangeStaffN(Number(e.target.value))}
            className="w-full accent-[#0F766E]"
          />
          {metrics.pendingStaffN !== null && (
            <p className="text-[11px] text-[#9A3412] mt-0.5">
              Reduction to N = {metrics.pendingStaffN} scheduled once active interventions complete.
            </p>
          )}
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1">
            <label htmlFor="slider-arrival" className="font-medium text-[#24313A]">
              Incoming demand (λ)
            </label>
            <span className="font-mono-tabular font-semibold text-[#0F766E]">
              {metrics.arrivalRatePerHour} cases/hr (WIP = {metrics.wipCases})
            </span>
          </div>
          <input
            id="slider-arrival"
            type="range"
            min={1}
            max={8}
            step={1}
            value={simState.arrivalRatePerHour}
            onChange={(e) => onChangeArrivalRate(Number(e.target.value))}
            className="w-full accent-[#0F766E]"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1">
            <label htmlFor="slider-duration" className="font-medium text-[#24313A]">
              Intervention duration
            </label>
            <span className="font-mono-tabular font-semibold text-[#B45309]">
              {simState.interventionDurationHours.toFixed(1)} hours
            </span>
          </div>
          <input
            id="slider-duration"
            type="range"
            min={0.5}
            max={3.0}
            step={0.5}
            value={simState.interventionDurationHours}
            onChange={(e) => onChangeDuration(Number(e.target.value))}
            className="w-full accent-[#B45309]"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1">
            <label htmlFor="slider-uncertainty" className="font-medium text-[#24313A]">
              Illustrative uncertainty band width
            </label>
            <span className="font-mono-tabular font-semibold text-[#1D4ED8]">
              {simState.uncertaintyScale.toFixed(1)}×
            </span>
          </div>
          <input
            id="slider-uncertainty"
            type="range"
            min={0.5}
            max={1.8}
            step={0.1}
            value={simState.uncertaintyScale}
            onChange={(e) => onChangeUncertaintyScale(Number(e.target.value))}
            className="w-full accent-[#1D4ED8]"
          />
          <p className="text-[11px] text-[#64748B] mt-0.5">
            COP: {conformal.copSet.length > 0 ? `{${conformal.copSet.join(', ')}}` : '{}'} · TU (derived from OP): {tu.toFixed(2)} bits
          </p>
        </div>
      </div>

      {/* Scripted Teaching Policy Recommendation */}
      <div className="border border-[#DCE1D9] rounded-lg p-3.5 bg-[#FAFBF9] space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-[#24313A]">
            Scripted teaching policy ({selectedCase.label})
          </span>
          <span
            className={`text-xs font-mono-tabular font-semibold ${
              policyDecision.action === 1 ? 'text-[#0F766E]' : 'text-[#9A3412]'
            }`}
          >
            Action {policyDecision.action}
          </span>
        </div>
        <p className="text-xs font-medium text-[#24313A]">{policyDecision.actionLabel}</p>
        <p className="text-xs text-[#475569] leading-relaxed">{policyDecision.summary}</p>
        <ul className="text-[11px] text-[#52606D] space-y-1 list-disc pl-4">
          {policyDecision.reasons.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
        <p className="text-[11px] text-[#6D28D9] border-t border-[#E6E9E2] pt-2">
          <strong>Opportunity cost:</strong> {policyDecision.opportunityCostNote}
        </p>
        <p className="text-[10px] text-[#64748B]">
          Transparency note: Deterministic scripted teaching rule—not trained PPO or empirical paper output.
        </p>
      </div>

      {/* Live Worker Action Buttons */}
      <div className="border-t border-[#E6E9E2] pt-3 space-y-2">
        <span className="block text-xs font-semibold text-[#24313A]">
          Execute binary dispatch on {selectedCase.label}
        </span>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={!canIntervene}
            onClick={() => onInterveneNow(selectedCase.id)}
            className="py-2 px-3 text-xs font-semibold rounded-lg bg-[#0F766E] text-white hover:bg-[#0D5E57] disabled:bg-[#CBD5E1] disabled:text-[#64748B] disabled:cursor-not-allowed transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E]"
          >
            1 — Intervene now
          </button>
          <button
            type="button"
            onClick={() => onDoNotInterveneNow(selectedCase.id)}
            className="py-2 px-3 text-xs font-semibold rounded-lg border border-[#D4D9D0] bg-white text-[#24313A] hover:bg-[#F7F8F5] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8]"
          >
            0 — Do not intervene
          </button>
        </div>

        {/* Active Busy Workers List */}
        {simState.activeInterventions.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <div className="text-[11px] font-semibold text-[#9A3412] flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              Active commitments (occupying staff until completion):
            </div>
            {simState.activeInterventions.map((iv) => (
              <div
                key={iv.caseId}
                className="flex items-center justify-between gap-2 bg-[#FFF7ED] border border-[#FED7AA] rounded-md px-3 py-1.5 text-xs"
              >
                <div className="text-[#9A3412]">
                  <span className="font-semibold">Case {iv.caseId}</span>{' '}
                  <span className="font-mono-tabular text-[11px]">
                    ({iv.startedAtHours.toFixed(1)}h → {iv.endsAtHours.toFixed(1)}h)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onAdvanceNextEvent()}
                  className="px-2 py-1 text-[11px] font-semibold bg-white border border-[#FDBA74] text-[#9A3412] hover:bg-[#FFEDD5] rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B45309]"
                >
                  Advance to finish
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Latest state log */}
        <div className="text-[11px] text-[#475569] bg-[#F7F8F5] border border-[#E2E5DE] rounded-md px-2.5 py-2 flex items-start gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#0F766E] shrink-0 mt-0.5" />
          <span>{simState.lastActionLog}</span>
        </div>
      </div>
    </aside>
  );
};
