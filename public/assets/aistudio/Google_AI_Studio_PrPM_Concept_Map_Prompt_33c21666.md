# Build “The Process Observatory” — an interactive PrPM concept map

## 1. Your roles and expertise

Combine four perspectives in one coherent implementation:

- **BPM architect and teacher:** Deep knowledge of Dumas, La Rosa, Mendling, and Reijers’ *Fundamentals of Business Process Management*: the BPM lifecycle, process owners, process instances, BPMN tokens, performance, resources, queues, and event logs.
- **Prescriptive process monitoring researcher:** Expertise in outcome prediction, causal treatment effects, survival analysis, conformal prediction, and reinforcement learning, particularly PPO.
- **Learning scientist:** Expertise in analogies, spatial memory, progressive disclosure, worked examples, and teaching unfamiliar ideas through familiar ones.
- **Information designer and frontend engineer:** Expertise in elegant light themes, interactive concept maps, readable vector graphics, accessible interactions, and reliable application state.

Build the working application. Make reasonable implementation decisions and proceed.

## 2. Learner context and intended outcome

I understand the BPM textbook, but the machine-learning terminology in Shoush and Dumas’ *Prescriptive Process Monitoring Under Resource Constraints: A Reinforcement Learning Approach* is unfamiliar.

My goal is to build an intuitive mental model of **how the concepts depend on one another and why each exists**. Start with familiar BPM ideas, introduce the business problem, and then reveal the research concept that addresses it.

Use plain English first and technical names second. Use a loan application as the continuous example. Introduce equations only in expandable details.

The main question anchoring the whole experience is:

**“Which running case should receive scarce help now?”**

The central insight is:

**A case can be risky without being worth intervening on. A useful intervention can still be too late, too uncertain, or infeasible because staff are busy.**

Success means I can explain the system by pointing to objects and tracing their connections.

## 3. The physical concept: a tabletop Process Observatory

Create a spacious, tactile, interactive learning board viewed mostly from above, with subtle depth. Think of a carefully built museum teaching model: process tracks, movable case pieces, worker slots, instruments, a historical-records workbench, and a decision desk.

Use one consistent physical metaphor:

| Physical object | Concept it represents | What the physical behavior teaches |
|---|---|---|
| Outer lifecycle frame | Managing and improving the process | Changes concern the process as a whole |
| Inner process track | Execution of a particular process | Cases are already underway |
| Numbered case piece with a history strip | Active case and its observed prefix | We know what has happened so far |
| Instruments beside the track | Predictive, causal, and survival models | Different questions require different estimates |
| Calibrated bands and label trays | Conformal intervals and outcome sets | Uncertainty remains visible |
| Worker pieces in free/busy slots | Limited intervention resources | Helping one case occupies capacity |
| Dispatch desk | Intervention policy | Evidence and constraints inform an action |
| Feedback ledger | Rewards and policy learning | Decisions influence future behavior |

Every object must teach something. Use selective motion to explain events and consequences.

Make this a spatial concept map with meaningful cross-links. The primary screen should immediately reveal the model and its central question, with very little introductory text.

## 4. The map’s structure: two loops at different scales

### A. Outer frame: “Improve the process”

Show the familiar lifecycle:

Identification → Discovery → Analysis → Redesign → Implementation → Monitoring.

Make its iterative feedback visible: monitoring can reveal issues that lead back into discovery, analysis, and redesign.

Place a bridge from Monitoring into the observatory’s runtime control area.

Explain: “BPM manages the process over time. Prescriptive monitoring adds a specific way to influence cases while they are running.”

The textbook already includes monitoring and corrective action. Present this research as a specialized extension of those ideas.

**Never animate a customer case through the lifecycle phases.** Those phases describe managing a process, not the steps of a customer’s application.

### B. Inner track: “Help a running case”

Show a simplified loan process:

Application received → Assessment → Offer sent → Await customer response → Accepted or Rejected.

Use three identifiable case pieces, A, B, and C, at intermediate positions. Show the currently examined case clearly.

Clicking a case reveals its prefix: only events observed up to the current decision point. Define K as prefix length, not the identity of the case.

Intervention means preparing/sending a second offer, consuming a loan officer’s time and potentially changing the chance of acceptance.

Show an intervention side activity connected to the ongoing case. Explain that runtime intervention does not require redrawing the entire process.

The single-piece-per-case visualization is a teaching simplification; BPMN tokens represent execution state and can multiply under parallel execution.

### C. Historical workbench: “Learn from past cases”

Arrange these physical objects together:

1. Completed event-log traces.
2. A prefix cutter showing how a completed trace yields partial snapshots.
3. A feature encoder converting observed history into model inputs.
4. Three model-training stations.
5. A separate calibration tray.
6. A held-out evaluation tray.

Make the split between training, calibration, and evaluation visible. Keep prefixes from the same case within the appropriate split. Future events and final outcomes must not leak into a live prefix’s input features.

Show three model branches:

- **Predictive model:** estimates negative-outcome probability, OP, and prediction uncertainty, TU.
- **Causal model:** estimates how the intervention changes outcome probability, TE.
- **Survival model:** estimates time until the relevant event, used to estimate the intervention window, IW.

Conformal calibration connects to these outputs:

- OP → outcome prediction set, COP.
- TE → treatment-effect interval, CTE.
- IW → intervention-window interval, CIW.

Depict calibration as an attached measuring procedure, not another decision maker. TU remains a separate model-derived uncertainty measure.

### D. Three instrument groups: “Is help worthwhile, timely, and feasible?”

Keep these three groups visually distinct and consistently positioned around the decision desk.

**SIGNIFICANCE — “Is help needed, and could it help?”**

- OP: “How likely is an undesirable outcome?”
- COP: “Which outcomes remain plausible?”
- TU: “How uncertain is the outcome prediction?”
- TE / CTE: “How much could this intervention improve the outcome?”

Show risk and treatment effect on separate instruments.

For treatment effect, display two estimated success probabilities: without intervention and with intervention. Example: 30% → 80%, an increase of 50 percentage points. Label these as estimated alternatives; both cannot be observed for the same case.

**URGENCY — “How long can we still act?”**

- IW: estimated intervention window.
- CIW: an interval expressing uncertainty about that window.

Use a time ruler with a shaded interval. Teach that a narrowing opportunity to act differs from ordinary time remaining until process completion.

**CAPACITY — “Can we help, and what else needs attention?”**

- n: free intervention resources now.
- η: proportion of intervention resources currently free.
- WIP: active cases in the process.
- λ: incoming cases per unit of time.

Use worker slots, active case pieces, and incoming case markers. If total resources are N, keep η = n/N consistent for N > 0.

Explain: WIP is a stock; arrival rate is a flow. Available-resource share is different from busy-resource utilization.

### E. Decision desk: “Choose an action”

Bundle the state as:

Sₜ = (COP, TU, CTE, CIW, n, η, WIP, λ)

Call these **eight information components**, since sets and intervals are not single numbers.

Show two actions for the currently considered case:

- **1 — Intervene now**
- **0 — Do not intervene now**

“No intervention now” can leave open a later opportunity if the process and intervention window permit. It does not promise another chance.

The paper’s binary action concerns the currently considered case. Comparing cases helps teach competition for capacity; do not depict the method as directly choosing an arbitrary winner from a global ranked list.

When an intervention starts, a worker moves to a busy slot, availability drops, and that worker returns only when the intervention duration finishes. Show the effect on other cases.

### F. Feedback area: “Learn a policy”

Show the learning relationship:

Observe state → Choose action → Environment changes → Receive feedback → Update policy.

Explain:

- **State:** information available at the decision point.
- **Action:** intervene or do not intervene now.
- **Reward:** a training signal that encourages useful behavior.
- **Policy:** a learned way of choosing actions from states.
- **PPO:** the reinforcement-learning algorithm used to improve the policy.

Distinguish using a policy to decide from updating it through learning. Keep policy updates visually separate from fitting or recalibrating the three supporting models.

Explain opportunity cost: using a worker now can prevent a more valuable intervention later. Immediate gain alone does not capture this tradeoff.

Keep **training reward** and **evaluated business gain** in separate ledger compartments. The paper’s reward is shaped and conditional; it is not a universal “60 + 10 − 25” payment for each successful intervention.

## 5. Make relationships explicit

Every meaningful connection needs a directional verb, for example:

- Execution **produces** events.
- Observed history **forms** a prefix.
- Historical prefixes **train** models.
- Calibration data **calibrate** sets and intervals.
- Model outputs **inform** the state.
- Capacity monitoring **updates** the state.
- The policy **chooses** an action.
- An intervention **occupies** a resource.
- Resource occupancy **limits** other interventions.
- Feedback **updates** the policy.
- Monitoring insights **inform** process improvement.

Differentiate process movement, information flow, and learning feedback with labeled line styles and a compact legend.

Use proximity for related ideas, containment for membership, arrows for direction, and feedback curves for recurrence. Physical distance must not imply a numerical relationship unless explicitly labeled.

Selecting a node should highlight its immediate inputs and consequences while dimming unrelated connections. Avoid showing every edge at once.

## 6. Build learning into the interactions

Include these working modes on the same spatial map:

**Explore:** Pan, zoom, search, select concepts, and trace relationships. Keep landmark positions stable. Provide Reset View and a small overview navigator.

**Guided tour:** Use short steps: textbook lifecycle → running case → why prediction is insufficient → treatment benefit → urgency → uncertainty → scarce capacity → decision → learning → whole-system recap. Each step spotlights one relationship, gives a brief explanation, and offers Next/Back.

**Compare cases:** Show A, B, and C side by side while retaining their positions on the map.

**What if?:** Let me change available staff, incoming demand, intervention duration, and selected illustrative uncertainty bands. Highlight what changed and explain its consequences.

Each concept’s detail panel should answer:

1. What is it in one sentence?
2. What familiar BPM idea connects to it?
3. What does it receive and produce?
4. Why is it needed?
5. What common misunderstanding should I avoid?

Add optional technical detail and a source link below the plain-English explanation.

Use badges such as “Textbook anchor,” “Research concept,” and “Teaching analogy.” Make analogy boundaries explicit.

## 7. A concrete three-case exercise

Start with one free loan officer and these **synthetic teaching values**:

| Case | Predicted negative outcome | Estimated improvement in success probability | Illustrative intervention window |
|---|---:|---:|---|
| A | 90% | +5 percentage points | 2–4 hours |
| B | 70% | +50 percentage points | 0.5–1.5 hours |
| C | 60% | +50 percentage points | 4–8 hours |

Ask the learner to predict which case deserves attention and explain their reasoning.

Reveal the distinctions:

- A is riskiest, but this particular intervention may help little.
- B combines substantial estimated benefit with greater urgency.
- C may benefit too, but appears to allow more time.
- Acting on any case occupies the only worker.
- Uncertainty can change confidence in this comparison.
- An intervention remains probabilistic; no outcome is guaranteed.

For optional arithmetic, label this explicitly as a **toy estimate of incremental value**:

Expected incremental value = success-probability improvement × outcome value − intervention cost.

At an outcome value of 60 and cost of 25, this gives A: −22, B: +5, C: +5. Explain that the calculation omits timing, uncertainty, and opportunity cost, and is neither the full paper reward nor the PPO policy.

Use a clearly labeled, transparent scripted teaching policy for interactive recommendations. Do not represent it as trained PPO or a reproduction of the research experiments.

Keep arbitrary illustrative intervals distinguishable from actual calibrated outputs. If showing TU as entropy of the mean predicted probability, derive it consistently rather than making it an unrelated slider.

## 8. Accuracy requirements

Preserve these distinctions throughout the content and visuals:

- Aggregate error rate differs from a case’s predicted failure probability.
- Prediction of a bad outcome differs from evidence that a specific action can improve it.
- Estimated treatment effects require causal assumptions; ordinary observed correlation is insufficient.
- Remaining cycle time differs from the window in which an intervention is possible or useful.
- Conformal prediction expresses uncertainty; it does not eliminate it or reveal a guaranteed deadline.
- Standard conformal coverage is marginal across cases under assumptions such as exchangeability. A nominal 90% level is not a guarantee for every individual case. Causal and time-to-event settings need additional appropriate assumptions.
- COP can contain a single outcome, both outcomes, or sometimes no outcome. A set containing both outcomes does not itself mandate “never intervene.”
- The intervention policy combines evidence and constraints; conformal prediction does not choose the action.
- A learned policy can outperform a simple threshold without being guaranteed globally optimal.
- The process owner’s responsibilities extend beyond the decision supported by this system.
- The educational application demonstrates relationships; its animations do not establish real business effectiveness.

Introduce corrections gently where they matter, using short expandable “Keep these separate” explanations.

## 9. Visual direction

Use a light, calm, polished aesthetic:

- Warm off-white background: #F7F8F5.
- White or very pale surfaces.
- Dark, readable text: #24313A.
- Teal for capacity, blue for significance, amber for urgency, lavender for learning.
- Restrained coral for negative outcomes or unavailable actions.
- Fine borders, soft shadows, generous spacing, and crisp vector illustrations.
- Mostly top-down geometry, with shallow depth on physical objects and level, readable labels.

Use modern, legible typography. Plain-English labels should dominate; acronyms and notation belong beneath them.

At overview scale, show roughly seven major landmarks. Reveal detailed concepts through zoom or expansion. Keep a stable layout, avoiding continuous force-directed movement.

Animate only meaningful actions: a case advances, information reaches an instrument, a worker becomes busy, feedback returns. Provide pause and reduced-motion support.

Keep the map large and central. Place controls in a compact toolbar and explanations in a collapsible side panel. On small screens, offer a readable guided sequence preserving the same relationships.

## 10. Evidence and sources

Add a secondary “What the study evaluated” panel covering BPIC2012, BPIC2017, and TrafficFines, the intervention examples, resource scarcity, policy gain, and learning speed.

Describe empirical findings as findings under the study’s assumptions. Include exact monetary gains or convergence counts only after verifying the figure, metric, and paper version. Do not blend results from different versions.

Use these sources:

- [Research paper, 2023 preprint version](https://arxiv.org/abs/2307.06564v1)
- [Research paper, revised 2024 version](https://arxiv.org/abs/2307.06564v2)
- [Conformal prediction explanation by Angelopoulos and Bates](https://arxiv.org/abs/2107.07511)
- *Fundamentals of Business Process Management*, second edition, Dumas, La Rosa, Mendling, and Reijers, 2018.

If the textbook or paper is attached, use it to verify details. Do not invent chapter numbers, page references, experimental values, or quotations. Mark unavailable verification clearly and continue building the conceptual application.

## 11. Implementation and acceptance criteria

Use React and TypeScript with SVG or a suitable interactive graph renderer. Use the available project setup. Keep concept content, node relationships, and demonstration state structured and separate from rendering.

The core experience must run locally without authentication, backend services, or paid model calls. All visible controls must work. Use deterministic teaching data and provide a reset for the exercise.

Support keyboard navigation, visible focus, readable contrast, and touch interactions. Provide a labeled text outline of the map and an SVG export or print-friendly view.

Before finishing, verify that:

- The first screen communicates the central question and the two scales of control.
- A learner can trace an event into a prefix, model outputs, state, and action.
- Risk, benefit, urgency, uncertainty, and capacity remain distinguishable.
- Starting and finishing an intervention updates worker availability consistently.
- No worker is allocated twice or executed when none is available.
- The historical workbench and runtime loop remain visually distinct.
- Feedback animation points back to policy learning, while the teaching demo remains explicitly scripted.
- Demonstration behavior is labeled and never presented as trained research output.
- Pan, zoom, search, reset, tour controls, and detail panels work.
- Text and arrows remain readable at desktop and mobile sizes.

Include five short “Check my understanding” questions with revealable explanations:

1. Why might we skip the riskiest case?
2. Why do we need a causal model as well as a predictive model?
3. What can a conformal interval tell us, and what can it not promise?
4. How does helping one case affect other cases?
5. How does runtime intervention differ from process redesign?

Deliver the complete working learning aid with populated content and interactions.

