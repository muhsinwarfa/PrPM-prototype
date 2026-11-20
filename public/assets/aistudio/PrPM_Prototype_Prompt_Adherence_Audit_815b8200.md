# PrPM Prototype — Prompt Adherence Audit

**Reviewed:** 20 November 2026  
**Prototype:** PrPM-prototype-main.zip  
**Reference:** Google_AI_Studio_PrPM_Concept_Map_Prompt.md

## Verdict

**The prototype does not comply 100% with the prompt.** It implements much of the requested content, color scheme, structure, and navigation. Its largest gaps concern the behavior that should make the concepts intuitive: elapsed time, worker commitment, evolving cases, uncertainty, demand, and learning feedback.

The implementation contains **13 concept groups, 23 directional relationships, a 10-step guided tour, and five knowledge-check questions**. The source also contains most of the requested conceptual qualifications. These are useful foundations to retain.

A percentage score would conceal the difference between covering a concept in text and demonstrating it correctly. This audit therefore identifies concrete satisfied, partial, and failed requirements rather than assigning an arbitrary percentage.

## What was verified, and what remains unverified

- Read the current original prompt and the uploaded source files.
- Confirmed that the prompt bundled with the prototype is byte-for-byte identical to the original: SHA-256 `33c2166682918b11a3150e31374809f4f060bce6cb392735bf7f163a8a2c1b0d`.
- Ran the TypeScript check: passed.
- Ran the production build: passed after a dependency-resolution workaround.
- Ran all eight bundled tests: passed.
- Ran additional executable logic checks for resource changes, completed-case handling, arrival rate, and uncertainty sensitivity.
- Rendered the React case-detail component to verify whether clicking a case would expose its actual prefix.
- Generated and inspected a static render of the map's SVG. This was an internal inspection artifact, not a screenshot of the live application. External page styling and web fonts were not reproduced by that render.
- Checked the paper's revised version for the study-baseline claim.
- **Live browser interaction, actual desktop/mobile layout, touch behavior, downloaded-file behavior, and print pagination could not be fully tested.** Local browser execution was unavailable, and the separate browser could not reach the local preview. Browser access was subsequently blocked by its URL policy. No browser-policy workaround was attempted.

The uploaded ZIP and application source were not edited. Installation and inspection took place in an extracted review copy.

## Requirement-by-requirement assessment

“Present” below means supported by source inspection, static rendering, or the relevant executed logic check; it is not a claim that every browser interaction has passed.

| Prompt requirement | Assessment | Evidence / implication |
|---|---|---|
| Light theme and dimension colors | Present | Requested off-white, blue, amber, teal, and lavender appear in the implementation. |
| Two scales: BPM lifecycle and running cases | Present | Both are explicit and separate; cases are not moved through management lifecycle stages. |
| Loan example and requested A/B/C numbers | Present | Risk, treatment-effect improvement, and window presets match the prompt. |
| Moving cases and evolving observed history | Incomplete | Case coordinates, stages, and prefix arrays remain fixed. |
| Clicking a case reveals its observed prefix | Defect | First selection opens a generic concept panel; actual event history appears in the unselected inspector. |
| Offline preprocessing, training, calibration, evaluation | Present, visually shallow | Stations and split labels exist, but the prefix cutter and model stations have no individual worked interaction. |
| Significance, urgency, capacity and eight state components | Present | All components appear; sets and intervals are treated as components rather than eight scalar numbers. |
| Distinguish risk from benefit and window from cycle time | Present | Separate instruments and explanatory content exist. |
| Correct conformal coverage qualifications | Mostly present | Marginal coverage and causal/survival assumptions are explained; generated bands are labeled illustrative. |
| Prevent concurrent double allocation and allocation at n = 0 | Pass in tested paths | Bundled and additional logic checks support this. |
| Preserve worker commitment until the intervention duration finishes | Defect / incomplete | No logical clock; manual finish ignores elapsed duration; reducing staff silently drops active assignments. |
| Meaningful demand and uncertainty “what-if” consequences | Partial | Displays change, but the supplied policy does not change actions with arrival rate or uncertainty in the tested presets. |
| Distinguish learning feedback from business gain | Present in text, incomplete in behavior | Separate ledger labels exist; a counter is used without modeled outcomes, rewards, or gain. |
| Guided tour with a coherent worked example | Partial | Ten steps exist, but the case shown is not synchronized with the case discussed. |
| Compare A, B, and C side by side | Partial | All three are present, but cards always use a single-column stack. |
| Detail panels, plain-language questions and misconception notes | Largely present | Strong structured explanations; some technical/model details are bundled into large groups. |
| Progressive disclosure and readable overview | Partial | Zoom scales the same dense SVG; it does not reveal different detail levels. |
| Directional verbs, connection styles, highlighting | Present | 23 relationships and three line categories exist. |
| Search, pan, zoom, reset, navigator | Partial | Main handlers exist; search lacks keyboard activation and navigator is only an indicator. |
| Keyboard, focus and mobile accessibility | Partial / browser-unverified | Text outline and mobile sequence exist; specific focus and search defects are visible in source. |
| SVG export or print-friendly view | Partial | Export is wired, but silently returns from the Text Outline surface; exported SVG styling also needs validation. |
| Research evidence and source accuracy | Partial | Sources and limits are included; the experimental baselines are incorrectly described. |
| Local operation without login or paid model calls | Present in application code | No active model-service calls were found; normal dependency installation currently fails. |
| Five requested understanding questions | Present | All five appear with explanations. |

## Prioritized constructive feedback

### 1. Preserve active interventions when staffing changes

**Priority: high — incorrect resource behavior**

**Observed:** Start interventions on B and C with two officers, then reduce total staff to one. The implementation removes C from the busy list without completing it, recording a cancellation, or advancing time. This teaches that an ongoing commitment can disappear when a slider changes.

**Source:** `src/logic/prpmModel.ts:382`, particularly the slice at line 387. The existing test titled “updateTotalStaff clamps busy slots safely” currently endorses this loss of work.

**Constructive fix:** Prevent total staff from being reduced below active commitments, or schedule the staffing decrease for when the relevant officers finish. If cancellation is intentionally supported, represent it as an explicit event with consequences.

**Acceptance check:** With B and C active, requesting N = 1 must not silently remove either assignment. The interface should explain the pending change or why it is unavailable.

### 2. Make intervention duration and case progression real within the teaching demo

**Priority: high — missing causal mechanism**

**Observed:** The state has no elapsed-time field or intervention start/end times. “Finish & release” immediately frees a worker regardless of the duration slider. Cases do not advance, prefixes do not grow, and intervention windows do not decrease. Their positions are hard-coded by case ID.

**Source:** `src/types/observatory.ts:98`; `src/logic/prpmModel.ts:307`; `src/logic/prpmModel.ts:349`; `src/components/WhatIfPanel.tsx:259`; `src/components/ObservatoryCanvas.tsx:650`.

**Constructive fix:** Add a deterministic teaching clock and “Next event” or “Advance 30 minutes.” Store when each intervention begins and ends. Advance case events, remaining opportunities, and resource occupancy together. “Finish & release” may fast-forward to the completion event; it should also update the rest of the simulated world.

**Acceptance check:** A one-hour intervention keeps its officer occupied through the first 30 minutes and releases them at completion. The other cases' clocks advance during that hour. No real-time waiting or trained ML is required.

### 3. Base recommendations on current case eligibility

**Priority: high — stale recommendation state**

**Observed:** After B's intervention finishes, C is still deferred to reserve capacity for a more urgent case. The policy always examines `INITIAL_CASES`, so B remains an urgent competitor. B can also be allocated another intervention after completion, without a distinct repeat-intervention opportunity.

Case C's prefix contains no first-offer event, yet with enough staff the app can recommend sending it a second offer.

**Source:** `src/App.tsx:75`; `src/logic/prpmModel.ts:194`; `src/logic/prpmModel.ts:307`; Case C's data at line 50.

**Constructive fix:** Track eligibility, active intervention, completion, and expiry separately. Evaluate only cases currently eligible for this intervention. Exclude busy, finished, and expired opportunities. Either move Case C to an appropriate stage or explain that its intervention opportunity is not yet open.

**Acceptance check:** Once B is helped and its opportunity is complete, C must not be deferred solely because of B. A completed opportunity cannot be repeated without an explicit new eligible event.

### 4. Give the demand and uncertainty controls an instructional consequence

**Priority: high — partial learning fidelity**

**Observed:** Changing arrival rate changes WIP through `round(12 + λ × 1.5)`. It does not create arrivals, account for departures, or influence the recommendation.

In additional checks, λ = 1, 3, and 8 produced WIP = 14, 17, and 24 while A/B/C actions stayed 0/1/0. Testing three uncertainty settings across 90 combinations of case, staff count, and intervention duration produced **zero action changes**. The intervals change visually, but the current policy does not use their uncertainty to change the decision.

Not every parameter adjustment should flip an action. The gap is that the sandbox has no supplied example showing why these inputs can matter.

**Source:** `src/logic/prpmModel.ts:100`, especially line 111; policy at line 194.

**Constructive fix:** Introduce one transparent scripted demand-pressure scenario and one uncertainty-sensitive scenario. Show both the changed evidence and the reasoning. Model WIP as active cases accumulating and completing, or label the current formula as an explicit illustrative scenario assumption rather than measured active stock.

**Acceptance check:** At least one preset demonstrates how future demand makes reserving capacity attractive; another shows how a sufficiently uncertain benefit estimate changes the policy's caution or choice. Continue labeling the rule as a teaching policy.

### 5. Make the first click on a case reveal its actual history

**Priority: high — direct mismatch with the prompt**

**Observed:** Clicking a case calls `onSelectNode('active-prefix')`. The detail component then displays the generic prefix definition. The list of that case's events exists only in the `!concept` branch, so it is hidden by the very selection that should reveal it.

A component-render check confirmed: selected prefix panel contains the real event list = false; unselected inspector contains it = true.

**Source:** `src/components/ObservatoryCanvas.tsx:660`; `src/components/ConceptDetailPanel.tsx:56`; `src/App.tsx:297`.

**Constructive fix:** Show the selected case's event strip in the prefix concept panel, or maintain a persistent case inspector alongside concept explanations.

**Acceptance check:** One click on B immediately reveals B's five observed events, K = 5, and the current decision point, with no future events.

### 6. Synchronize the guided tour with the case and settings it discusses

**Priority: high — conflicting teaching signals**

**Observed:** Tour step 3 discusses A's 90% risk, but the default instruments still display B's 70% risk. Tour navigation changes focus nodes and text but does not set a corresponding case or scenario. Starting a tour after modifying the sandbox can also leave non-default staffing behind a one-officer explanation.

**Source:** `src/data/tourAndQuiz.ts:29`; `src/App.tsx:108`; `src/App.tsx:205`.

**Constructive fix:** Add a case/scenario reference to each tour step. Load or clearly identify the illustrative state needed for the explanation. Restore the learner's sandbox state after the tour if useful.

**Acceptance check:** When a step explains Case A, the highlighted case, risk gauge, treatment estimate, and prefix all show A. Steps discussing one free officer should display that scenario.

### 7. Reduce overview density and strengthen the physical teaching metaphor

**Priority: medium — design drift**

**Observed:** The map uses the requested light palette, rails, case circles, worker slots, and shallow shadows. However, much of the experience is a fixed instrument diagram. The initial SVG contains 131 text objects, with text sizes from 9.5 to 14 SVG units, inside a 1600-unit-wide drawing. At an illustrative 1000-pixel drawing width, these scale to approximately 5.9–8.8 pixels. Actual browser sizing remains unverified.

All relationships are drawn at the overview level, although dimmed. Zoom changes the scale without changing the information shown.

**Source:** `src/components/ObservatoryCanvas.tsx:164`; line 1438; fixed text sizes throughout.

**Constructive fix:** Use a simple overview with large plain-language labels. Selecting a landmark should reveal the detailed readings and nearby labeled edges. Let case pieces advance and worker pieces visibly occupy jobs. Add an auto-focus view for tour steps and search results.

**Acceptance check:** The central question and main relationships are readable at a normal laptop viewport without zooming. Fine detail appears on selection. The entire map retains stable spatial landmarks.

### 8. Turn the historical workbench into a worked example

**Priority: medium — concepts named but mechanism under-explained**

**Observed:** The historical area names “Completed Traces,” “Prefix Cutter,” “Feature Encoder,” three model stations, and data splits. These are largely labels inside one concept group. The learner cannot individually inspect a model station or see a trace being shortened and encoded.

**Source:** `src/components/ObservatoryCanvas.tsx:412`; line 490; `src/data/concepts.ts:140`.

**Constructive fix:** Add an expandable sequence: a completed trace → its first K observed events → a small feature card → the three different questions/models. Show which full cases belong to training, calibration, and evaluation.

**Acceptance check:** A learner can point to one historical case, select a prefix, see the inputs available at that moment, and explain why future events are excluded.

### 9. Show an actual teaching sequence in the feedback ledger

**Priority: medium — outcome feedback is only represented by a counter**

**Observed:** The ledger correctly separates training reward from business gain in its text. Operationally, “Do not intervene” increments `feedbackCount` immediately; manually finishing an intervention also increments it. The log says an outcome was recorded, but the state contains no observed case outcome, numerical reward, or business-gain record.

**Source:** `src/App.tsx:168`; `src/logic/prpmModel.ts:349`; `src/components/ObservatoryCanvas.tsx:1404`.

**Constructive fix:** Provide a labeled deterministic episode showing action, time/resource consequence, observed outcome, illustrative training signal, and evaluated gain as separate items. Animate feedback returning to a policy-learning explanation. A narrated policy adjustment is sufficient; actual PPO training was not requested.

**Acceptance check:** Clicking Action 0 records a decision, not a completed outcome. Outcome feedback appears only after a simulated outcome event. The ledger clearly distinguishes decision count, reward, and gain.

### 10. Correct the research and textbook framing

**Priority: high — factual drift**

**Observed:** The evidence panel says the uncertainty-aware RL approach achieved higher gain than “fixed-threshold baselines.” The revised paper identifies the comparison methods as RL-based baselines, BL1 and BL2. It also reports qualifications, including similar TrafficFines results and unstable positive-gain behavior in some BPIC2017 settings.

The monitoring bridge describes textbook monitoring as “passive dashboards and post-hoc corrective action,” even though the prompt explicitly says the textbook already includes monitoring and corrective action.

The map's phrase “aggregate model error” also blurs the intended BPM anchor: historical process failures are different from prediction-model mistakes.

**Source:** `src/data/tourAndQuiz.ts:238`; `src/components/StudyEvidenceView.tsx:18`; `src/data/concepts.ts:44`; `src/components/ObservatoryCanvas.tsx:898`.

**Constructive fix:**
- Replace the fixed-threshold comparison with an accurately versioned description of the RL baselines.
- Keep a threshold rule only as a clearly labeled teaching comparator.
- Describe PrPM as specializing an existing monitoring/corrective-action loop.
- Distinguish process negative-outcome rate, model prediction error, and a particular case's predicted risk.
- Add the TrafficFines intervention example, not just the dataset name.
- Qualify “verified summary”: a valid source link alone does not verify the claim attached to it.

**Acceptance check:** Every empirical claim identifies the paper version and relevant section or figure. Remove universal superiority implications and unsupported “verified” labels.

**Primary reference:** [Revised paper, Introduction and Evaluation](https://arxiv.org/html/2307.06564v2).

### 11. Complete keyboard and touch interaction support

**Priority: medium — source-confirmed accessibility gaps; live behavior unverified**

**Observed:** Search results are buttons whose selection handler is attached only to `onMouseDown`; keyboard activation is not handled. Search also closes on blur after 180 ms, which can remove results while a keyboard user is entering them. SVG node classes suppress focus outlines without supplying an equivalent focus indicator.

The app includes a useful text outline and mobile sequence, which should be retained. Its actual mobile/touch behavior still needs testing.

**Source:** `src/components/WorkspaceToolbar.tsx:129`; line 152; `src/components/ObservatoryCanvas.tsx:116`.

**Constructive fix:** Use standard activation semantics, maintain keyboard focus in results, support appropriate result navigation, and add a visible SVG focus treatment. Test the map and its readable alternative with keyboard and touch.

**Acceptance check:** A user can search, select a result with Enter, follow a relationship, and return without a pointer. Focus remains visible. On a narrow screen, choosing a mobile step makes its explanation easy to reach.

### 12. Repair export and make the navigator functional

**Priority: medium — incomplete utility controls**

**Observed:** The Text Outline surface offers “Download SVG,” but the map is unmounted on that surface. Its SVG ref is therefore null, and the export handler silently returns. The toolbar exposes the same export action on other non-map surfaces.

The Map Navigator displays a viewport rectangle but has no click, drag, or keyboard navigation handler. It is an indicator rather than the requested navigation control.

Raw SVG serialization also omits inherited page styles and may change fonts when reopened; this needs explicit export verification.

**Source:** `src/App.tsx:181`; line 239; `src/components/TextOutlineView.tsx:50`; `src/components/ObservatoryCanvas.tsx:1531`.

**Constructive fix:** Render/export an SVG independently of the active screen, or disable the action with a clear explanation when unavailable. Include the necessary SVG styles. Connect the navigator to pan/zoom state, with an accessible alternative.

**Acceptance check:** SVG export succeeds from every location offering it and reopens with readable labels. Clicking a navigator region moves to that part of the map.

### 13. Make comparison an actual side-by-side comparison

**Priority: medium — literal layout and scenario mismatch**

**Observed:** The three case cards use `grid-cols-1` at every breakpoint. They are vertically stacked even on desktop. The exercise heading also says “1 free loan officer” after staff settings have changed.

**Source:** `src/components/CompareCasesPanel.tsx:70`; line 146.

**Constructive fix:** Use a compact A/B/C comparison table or three aligned columns on desktop, retaining stacking on mobile. Either reset to the specified one-officer exercise or adapt its question and explanation to the current state.

**Acceptance check:** Risk, benefit, uncertainty, and timing can be compared across A, B, and C without remembering values from separate cards. The exercise's stated conditions match the displayed state.

### 14. Make a clean local installation reproducible

**Priority: medium — delivery defect**

**Observed:** Ordinary dependency installation failed with ERESOLVE. The project declares esbuild ^0.25.0, whereas the resolved Vite 8.3.8 declares an optional esbuild peer requirement of ^0.27.0 or ^0.28.0. The archive has no lockfile.

For review only, installation succeeded using `--legacy-peer-deps --ignore-scripts --no-package-lock`. Build, type checking, and the eight tests then passed. The workaround is not a delivery fix.

**Source:** `package.json:20`; line 30.

**Constructive fix:** Align dependencies, generate a lockfile, document startup, and add a test command. Remove unused service dependencies if they are not needed. Update tests to protect active work when staffing changes and to cover completed-case eligibility.

**Acceptance check:** A clean checkout installs with the documented normal command, passes type checking/build/tests, and runs without credentials or API keys.

## Recommended order of revision

1. **Correct the teaching behavior:** preserve busy work, add logical time, fix eligibility, and make case history accessible.
2. **Align the narrative with the state:** synchronize tour steps and fix research/textbook framing.
3. **Demonstrate consequences:** add demand/uncertainty scenarios and a concrete feedback episode.
4. **Improve the learning surface:** simplify the overview, expand the workbench example, align comparisons.
5. **Complete delivery quality:** keyboard navigation, navigator, export, responsive testing, and clean installation.

Preserve the existing separation of content, edges, and logic; the requested colors; the core A/B/C values; the uncertainty qualifications; and the five understanding questions.

## Copy-ready feedback for Google AI Studio

> Revise the current Process Observatory against the original prompt, retaining its content structure, light theme, concept data, and A/B/C teaching values.
>
> First fix resource and case state: active interventions must survive staffing changes; use a logical clock or Next Event control so duration, worker release, case events, and intervention windows advance together. Exclude completed/ineligible opportunities from recommendations, and do not offer a second loan offer before the first exists.
>
> Make the first click on a case reveal its actual observed event history. Synchronize every tour step with the case and resource scenario it describes.
>
> Add at least one explicit teaching scenario where demand pressure matters and another where uncertainty changes caution or a decision. Treat WIP as a stock or clearly label any illustrative formula. Keep all policy behavior labeled scripted; real PPO training is unnecessary.
>
> Show one complete feedback episode with distinct decisions, outcomes, training signals, and evaluated gain. Do not count an immediate “do nothing” click as an observed outcome.
>
> Correct the evidence panel: the research compares RL-based baselines, not fixed-threshold baselines. Explain that the textbook already includes monitoring and corrective action. Version empirical claims and retain appropriate limitations.
>
> Simplify the map overview and reveal detailed readings progressively. Add a worked trace-to-prefix-to-features example. Provide a genuine side-by-side desktop comparison.
>
> Repair keyboard search, visible node focus, the noninteractive navigator, and SVG export from the Text Outline surface. Resolve the dependency conflict and supply a lockfile.
>
> Validate with state-transition checks and actual browser tests at desktop and mobile widths. Report what passes and what remains incomplete; do not claim full compliance from feature presence or passing unit tests alone.

