---
trigger: always_on
---

before you build anything, generate a UI image design for it and save it in `prompts/ui degine/<feature_name>/`. Inside this feature folder, generate both the mobile UI image (`mobile-ui.png`) and desktop UI image (`desktop-ui.png`) based on the image refrence on the ui refrence\ChatGPT Image Aug 30, 2026, 11_53_48 AM.png.
The user must approve the UI design before you proceed.

If you want to build the backend for any feature, generate a visual representation of the workflow that is easy to understand, and save the image or workflow visual in `prompts/backend-wookflow/<feature_name>/workflow.png`.
If you are asked to redesign an image or UI feature, ALWAYS redesign the backend workflow visual as well following the new instructions.

Write the implementation prompt in `prompts/implementation/<feature_name>.md`.

When you are asked to proceed to build, use the images in `prompts/ui degine/<feature_name>/` (both desktop-ui.png and mobile-ui.png) as reference and use `prompts/implementation/<feature_name>.md` as context.

Check in `prompts/` to see if a prompt file already exists for the feature you are working on (`prompts/<feature_name>.md`). If yes, add it as context alongside the implementation prompt to the short build prompt. If not, build a prompt file in `prompts/` first, then use it as context.

Create a short prompt adding all this context in `build-prompt/<feature_name>.md`. The prompt MUST contain the image references (desktop and mobile UI), the backend workflow reference, and when approved to proceed, start building. The build prompt should strictly instruct the AI agent to read all above files related to the feature to be implemented.

After implementing any feature:
- Add **inline comments** to every file created: file-level comment at top, block-level comments on each major section (imports, constants, hooks, JSX sections).
- Create or update `docs/overview.md` with a table-based breakdown of every new/changed file: purpose, line number ranges, and description of each block.
- If any previously documented code is changed, update `docs/overview.md` to match.