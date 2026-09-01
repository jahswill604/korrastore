# Build Prompt — Feature 05: Onboarding Flow & UI Redesign (KorraStore)

## Context files & visual references to read before implementing

1. **Desktop UI Reference**: `prompts/ui degine/05-onboarding/desktop-ui.png`
2. **Mobile UI Reference**: `prompts/ui degine/05-onboarding/mobile-ui.png`
3. **Backend Workflow Visual**: `prompts/backend-wookflow/05-onboarding/workflow.png`
4. **Implementation Guide**: `prompts/implementation/05-onboarding.md`
5. **Feature Prompt**: `prompts/05-onboarding.md`
6. **Design System Rules**: `AGENTS.md` (Feature 02 block)

## Implementation Instructions for AI Agent

- Inspect the generated mobile and desktop UI reference images (`prompts/ui degine/05-onboarding/desktop-ui.png` and `mobile-ui.png`) and backend workflow (`prompts/backend-wookflow/05-onboarding/workflow.png`).
- Implement the redesigned onboarding carousel in `components/onboarding/step-carousel.tsx` and `app/onboarding/page.tsx` following all design tokens and responsive constraints.
- Ensure first-time users experience a sleek, high-converting 3-step introduction (Buy Real Commodities, Own & Track Value, Resell / Buyback).
- Include inline code comments (file-level and block-level) for all created/modified files.
- Update `docs/overview.md` with table-based file documentation upon completion.
