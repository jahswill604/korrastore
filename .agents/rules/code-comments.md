---
trigger: always_on
---

# Code Documentation & Overview Rules

## 1. Inline Code Comments
Every file you generate or edit MUST include concise, informative inline comments.

### Rules:
- Add a **file-level comment block** at the top of every file explaining:
  - What the file/component is
  - Where it is used
  - What it renders or does at a high level
- Add a **block-level comment** above every major logical group (imports, constants, functions, components, JSX sections, API calls, hooks, etc.) explaining what that block does and WHY it exists
- Comments must be **detailed enough** that any developer reading the code understands its purpose without needing to trace other files
- Comments must NOT be so long that they clutter the code — aim for 1–3 lines per block
- Use `//` for single-line and `/* */` for multi-line comments in TypeScript/TSX
- Do NOT comment obvious things like `// increment counter` on `i++`

### Example style:
```tsx
// HeroSection — Main landing page hero. Renders the headline, animated AI badge,
// interactive topic prompt launcher, and gamification stat pills.
// Used in: app/page.tsx

// Quick-start prompt chips shown below the search input.
// Clicking a chip fills the input so the user can start learning immediately.
const QUICK_CHIPS = [ ... ];
```

## 2. Overview Documentation File
After implementing any feature (new files, edits to existing files), you MUST create or update the file:

**`docs/overview.md`**

### Overview file structure:
Each file section must include:
- **File path** (relative to project root)
- **Purpose** — what the file does and where it is used
- **Line-by-line / block-by-block breakdown** with the line number range (e.g., `L12–L28`) and a description of what that block does and why
- Any notable design decisions or dependencies

### Format per file:
```markdown
## `components/landing/hero-section.tsx`
**Purpose**: Renders the public homepage hero section...
**Used in**: `app/page.tsx`

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L3 | File comment | Top-level comment describing the component |
| L5–L12 | Imports | React, Link, icon imports used in this component |
| L14–L21 | QUICK_CHIPS | Array of prompt suggestion chips shown below the search bar |
| ...   | ...   | ... |
```

## 3. Update Rule
- If ANY code that is already documented in `docs/overview.md` is changed, you MUST update the corresponding section in `docs/overview.md` immediately after the change.
- When performing corrections or bug fixes, always load `docs/overview.md` as context BEFORE making changes so you know where to pinpoint the code.
- If implementing a new feature that adds or changes files, append the new files to `docs/overview.md`.
