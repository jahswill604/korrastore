# Build Prompt: 01-project-foundation

## Context & References
- **Feature Name**: `01-project-foundation`
- **Desktop UI Design**: `file:///c:/Users/jwezu/OneDrive/Downloads/digitalfarm/korrastore/prompts/ui%20degine/01-project-foundation/desktop-ui.png`
- **Mobile UI Design**: `file:///c:/Users/jwezu/OneDrive/Downloads/digitalfarm/korrastore/prompts/ui%20degine/01-project-foundation/mobile-ui.png`
- **Backend Workflow Diagram**: `file:///c:/Users/jwezu/OneDrive/Downloads/digitalfarm/korrastore/prompts/backend-wookflow/01-project-foundation/workflow.png`
- **Feature Requirements**: [01-project-foundation.md](file:///c:/Users/jwezu/OneDrive/Downloads/digitalfarm/korrastore/prompts/01-project-foundation.md)
- **Implementation Guide**: [01-project-foundation.md](file:///c:/Users/jwezu/OneDrive/Downloads/digitalfarm/korrastore/prompts/implementation/01-project-foundation.md)

## Agent Instructions
Read all above referenced files (`prompts/01-project-foundation.md`, `prompts/implementation/01-project-foundation.md`), inspect the UI designs and backend workflow diagrams, and upon user approval, execute the full project plumbing setup:
1. Configure environment variables in `.env.example`.
2. Implement Supabase client factories (`client.ts`, `server.ts`, `service.ts` with `import "server-only"`).
3. Set up npm scripts for `typecheck`, `lint`, `build`, and `test` (Vitest).
4. Stub `lib/types.ts` and verify folder hierarchy.
5. Include inline file and block comments on every created file and update `docs/overview.md`.
