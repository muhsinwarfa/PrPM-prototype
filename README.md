# The Process Observatory

An interactive museum-tabletop spatial concept map exploring **Prescriptive Process Monitoring Under Resource Constraints: A Reinforcement Learning Approach** (Shoush & Dumas, `arXiv:2307.06564v2`), grounded in foundational BPM lifecycle concepts (Dumas et al., 2018).

Runs completely locally in the browser with deterministic scripted teaching models—no backend server, login, or external API keys are required.

## Prerequisites

- Node.js 20+ and npm 10+

## Setup & Commands

```bash
# 1. Install dependencies
npm install

# 2. Start local dev server (http://localhost:3000)
npm run dev

# 3. Run unit tests (deterministic PrPM state, clock, resource, and policy checks)
npm test

# 4. Run TypeScript type check
npm run lint

# 5. Create production bundle
npm run build
```
