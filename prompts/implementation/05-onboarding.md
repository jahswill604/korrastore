# Feature 05: Onboarding UI Redesign Implementation Plan

## Overview
Redesign the first-run Onboarding UI experience (`app/onboarding/page.tsx` and `components/onboarding/step-carousel.tsx`) to match the generated luxury UI mockups and design system specifications. Ensure a breathtaking, warm, premium first impression for new KorraStore buyers.

## Visual & UI Redesign Specifications

### 1. Step 1 Illustration: "Buy Real Commodities"
- **Grid Layout**: 2×2 grid of commodity cards (Rice 🌾, Garlic 🧄, Beans 🫘, Melon 🌱).
- **Styling**: Gradient background `from-[#FDF5E4] to-[#F0E2C0]`, golden border (`var(--border-color)`), subtle hover scale, and monospaced price tag in IBM Plex Mono.
- **Copy**: "Rice, garlic, beans, melon — buy in bulk at market price and own physical goods, stored securely in certified warehouses."

### 2. Step 2 Illustration: "Own It, Track Its Value"
- **Receipt Card**: Realistic mini `LedgerReceipt` component with warm paper gradient `from-[#FBF6E9] to-[#F2E9D5]`.
- **Seal**: Stamped green "STORED" seal in `var(--deep-grain-green)` at top right, rotated 8°.
- **Valuation Display**: Purchase price `₦130,000`, current valuation `₦138,600 ▲ 6.6%` in Deep Grain Green.
- **Progress Bar**: Animated value bar `from-[var(--border-color)] to-[var(--harvest-wheat)]`.
- **Copy**: "Your holdings live on a digital ledger receipt — watch your stored commodity value grow in real time."

### 3. Step 3 Illustration: "Resell or Request a Buyback"
- **Dual-Path Cards**: Side-by-side comparison cards:
  - Left card: Marketplace Resell (Trust Indigo accent `#303B63`, 🛒 icon).
  - Right card: Cash Buyback (Deep Grain Green accent `#21483A`, 💰 icon).
- **Copy**: "Sell your holdings to other buyers on the marketplace, or sell back to KorraStore anytime — flexible exit, your choice."

### 4. Layout & Responsive Framing
- **Desktop**: Centered card `max-w-[560px]` with `bg-[#FDFAF3]`, 20px rounded corners, soft shadow (`shadow-soil-lg`), golden border. "Skip" link in Trust Indigo at top-right.
- **Mobile (≤768px)**: Full-height immersive viewport, pinned "Skip" button, large touch targets for CTA.
- **Micro-Animations**: Smooth keyframe transitions (`fadeIn` with subtle `translateY(8px)` offset) on slide changes.
