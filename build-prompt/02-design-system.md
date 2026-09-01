# Build Prompt: 02-design-system

## Context & References
- **Feature Name**: `02-design-system`
- **Desktop UI Design**: `file:///c:/Users/jwezu/OneDrive/Downloads/digitalfarm/korrastore/prompts/ui%20degine/02-design-system/desktop-ui.png`
- **Mobile UI Design**: `file:///c:/Users/jwezu/OneDrive/Downloads/digitalfarm/korrastore/prompts/ui%20degine/02-design-system/mobile-ui.png`
- **Backend Workflow Diagram**: `file:///c:/Users/jwezu/OneDrive/Downloads/digitalfarm/korrastore/prompts/backend-wookflow/02-design-system/workflow.png`
- **Feature Requirements**: [02-design-system.md](file:///c:/Users/jwezu/OneDrive/Downloads/digitalfarm/korrastore/prompts/02-design-system.md)
- **Implementation Guide**: [02-design-system.md](file:///c:/Users/jwezu/OneDrive/Downloads/digitalfarm/korrastore/prompts/implementation/02-design-system.md)

## Agent Instructions
Read all above referenced files (`prompts/02-design-system.md`, `prompts/implementation/02-design-system.md`), inspect the UI designs and backend workflow diagrams, and upon user approval, execute the full design system implementation:
1. Configure light mode design tokens in `app/globals.css` and Google fonts in `app/layout.tsx`.
2. Install `clsx` and `tailwind-merge` and export `cn()` in `lib/utils.ts`.
3. Implement core primitives in `components/ui/`: `Button`, `Card`, `LedgerReceipt`, `PriceDisplay`, `GradeBadge`, `QuantitySelector`, `StatusStepper`, `Avatar`, `Badge`, `Tabs`, `Modal`, `Toast`, `Skeleton`, `EmptyState`, `Pagination`.
4. Implement layout components in `components/layout/`: `NavRail` (desktop sidebar), `BottomTabBar` (mobile tab bar), `AppShell`.
5. Implement showcase page at `app/design-system/page.tsx`.
6. Add inline file and block comments on every created/edited file and update `docs/overview.md`.
7. Save full version progress snapshot in `version progress/02-design-system/`.
