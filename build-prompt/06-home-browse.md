# Detailed Build Prompt: Feature 06 — Home / Marketplace Browse Exact UI Redesign

## Image References & Context Documents
- **Desktop UI Image Reference**: [desktop-ui.png](file:///c:/Users/jwezu/OneDrive/Downloads/digitalfarm/korrastore/prompts/ui%20degine/06-home-browse/desktop-ui.png)
- **Mobile UI Image Reference**: [mobile-ui.png](file:///c:/Users/jwezu/OneDrive/Downloads/digitalfarm/korrastore/prompts/ui%20degine/06-home-browse/mobile-ui.png)
- **Backend Workflow Diagram**: [workflow.png](file:///c:/Users/jwezu/OneDrive/Downloads/digitalfarm/korrastore/prompts/backend-wookflow/06-home-browse/workflow.png)
- **Specification Document**: [06-home-browse.md](file:///c:/Users/jwezu/OneDrive/Downloads/digitalfarm/korrastore/prompts/06-home-browse.md)
- **Implementation Architecture**: [06-home-browse.md](file:///c:/Users/jwezu/OneDrive/Downloads/digitalfarm/korrastore/prompts/implementation/06-home-browse.md)

## Strict AI Agent Directives
Read all of the above prompt files and inspect both `desktop-ui.png` and `mobile-ui.png` carefully. Rebuild the buyer marketplace home page strictly matching the visual reference images without deviation:

1. **Typography & Styling**:
   - `DM Serif Display` for headings ("Welcome back, Amara 👋", logo, commodity titles).
   - `Inter` for body labels, category pills, nav items, search placeholder.
   - `IBM Plex Mono` for prices (`₦68,500 / bag`), stock quantities, and numbers.
2. **Top Header**:
   - KorraStore logo ("🌾 KorraStore"), floating rounded search bar ("Search commodities..."), notification bell icon, and user profile avatar.
3. **Collapsible Sidebar (`NavRail`)**:
   - Collapsible desktop sidebar with 9 vertical navigation action items.
   - Active Home item rendered with solid filled gold rounded square container (`#D8B56A`) and dark soil icon.
4. **Greeting Banner**:
   - Desktop: "Welcome back, Amara 👋" + "Real commodities. Real ownership." subtext.
   - Mobile: "Good morning, Amara 👋".
5. **Market Ticker Cards**:
   - Desktop: 3-column grid featuring Rice, Garlic, Beans with live prices, trend pills (`↑ 2.4%`, `↓ 0.3%`), and green/red SVG sparkline graph curves.
   - Mobile: Horizontally scrollable strip of market pills.
6. **Filter & Sort Bar**:
   - Filter chips: `All` (solid gold filled pill `#D8B56A`), `Rice`, `Garlic`, `Beans`, `Melon` (outlined rounded pills).
   - Dropdown: `Sort: Price ∨` button on right. Synchronized with `?type=...&sort=...`.
7. **Commodity Card Redesign**:
   - Desktop Grid (4 columns × 2 rows): White rounded card (`rounded-2xl`), border `#E4DCC8`, warm beige thumbnail box (`#F5EFE0`) with 3D commodity graphic, top-right `[ Premium ]` dark green badge (`#21483A`), DM Serif title, IBM Plex Mono price (`₦68,500 / bag`), green trend badge (`+2.4% this month`), stock count (`1,250 bags available`), and dual action buttons (`[ View Details ]` outlined + `[ Buy Now ]` gold `#D8B56A`).
   - Mobile List: Horizontal split layout, square thumbnail with `G#` grade overlay tag, DM Serif title + Premium badge, IBM Plex Mono price + trend pill, stock info, and full-width `[ Buy Now ]` gold button.
8. **Mobile Bottom Nav (`BottomTabBar`)**:
   - Sticky bottom navigation with 5 items (active gold icon `#D8B56A`).
9. **Documentation**:
   - Add inline file & block comments to all modified files.
   - Record line-by-line breakdown in `docs/overview.md`.
