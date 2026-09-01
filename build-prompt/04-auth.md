# Build Prompt: Auth Pages & Duplicate Email Validation (04-auth)

## Context Files
- Feature Prompt: [04-auth.md](file:///c:/Users/jwezu/OneDrive/Downloads/digitalfarm/korrastore/prompts/04-auth.md)
- Implementation Prompt: [04-auth.md](file:///c:/Users/jwezu/OneDrive/Downloads/digitalfarm/korrastore/prompts/implementation/04-auth.md)
- System Rules: [AGENTS.md](file:///c:/Users/jwezu/OneDrive/Downloads/digitalfarm/korrastore/AGENTS.md)

## Image References
- Mobile UI Reference: ![Mobile UI](file:///c:/Users/jwezu/OneDrive/Downloads/digitalfarm/korrastore/prompts/ui%20degine/04-auth/mobile-ui.png)
- Desktop UI Reference: ![Desktop UI](file:///c:/Users/jwezu/OneDrive/Downloads/digitalfarm/korrastore/prompts/ui%20degine/04-auth/desktop-ui.png)
- Backend Workflow Reference: ![Backend Workflow](file:///c:/Users/jwezu/OneDrive/Downloads/digitalfarm/korrastore/prompts/backend-wookflow/04-auth/workflow.png)

## Instructions
1. Read all the context files listed above (`AGENTS.md`, `prompts/04-auth.md`, `prompts/implementation/04-auth.md`).
2. Update `app/api/auth/signup/route.ts` and `components/auth/signup-form.tsx` to detect duplicate email registrations during signup.
3. If an email is already registered in `profiles` or Supabase Auth, prevent sending verification codes and return an explicit user error: `"An account with this email address already exists. Please log in instead or use a different email."`.
4. Render the inline error alert banner in Light Mode with warning icon and red error highlight styling.
5. Update `docs/overview.md` with file/line breakdown.
