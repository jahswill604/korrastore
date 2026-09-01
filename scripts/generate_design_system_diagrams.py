import os
from PIL import Image, ImageDraw, ImageFont

def create_desktop_ui(output_path):
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    width, height = 1200, 920
    img = Image.new("RGB", (width, height), "#F7F4EA") # Paper background
    draw = ImageDraw.Draw(img)

    # Top Navigation Header
    draw.rectangle([0, 0, 1200, 70], fill="#4A3828") # Soil
    draw.text((40, 22), "🌾 KorraStore — Design System Showcase", fill="#D8B56A") # Harvest Wheat
    draw.text((450, 26), "Light Mode Only • Paper Ledger Tokens & Primitives", fill="#F7F4EA")
    draw.rectangle([1020, 20, 1160, 50], fill="#21483A", outline=None) # Deep Grain Green
    draw.text((1035, 28), "Showcase Live", fill="#FFFFFF")

    # Left NavRail Sidebar (240px)
    draw.rectangle([0, 70, 240, 870], fill="#FFFFFF", outline="#E4DCC8", width=1)
    draw.text((25, 95), "NAV RAIL (240px)", fill="#A88958")
    nav_items = [
        ("🎨 Color Swatches", True),
        ("🔤 Typography Scale", False),
        ("🔘 Buttons & Inputs", False),
        ("📜 Ledger Receipt", False),
        ("🏷️ Grade & Status", False),
        ("🧩 Layout Components", False),
    ]
    for i, (label, active) in enumerate(nav_items):
        y = 130 + i * 48
        bg = "#F7F4EA" if active else "#FFFFFF"
        tc = "#21483A" if active else "#4A3828"
        draw.rectangle([15, y, 225, y + 38], fill=bg, outline="#D8B56A" if active else None, width=1)
        draw.text((25, y + 10), label, fill=tc)

    # Section 1: Color Palette Swatches
    draw.text((270, 90), "1. DESIGN TOKEN PALETTE (Light Mode Only)", fill="#4A3828")
    swatches = [
        ("Harvest Wheat", "#D8B56A", "Primary Accent / CTAs"),
        ("Husk", "#A88958", "Muted Accent / Hover"),
        ("Soil", "#4A3828", "Primary Copy / Text"),
        ("Deep Grain Green", "#21483A", "Stored / Positive Change"),
        ("Trust Indigo", "#303B63", "Links / Info Badges"),
        ("Paper Base", "#F7F4EA", "Background / Surface"),
    ]
    for i, (name, hex_val, usage) in enumerate(swatches):
        col = i % 3
        row = i // 3
        x1 = 270 + col * 295
        y1 = 120 + row * 85
        draw.rectangle([x1, y1, x1 + 280, y1 + 75], fill="#FFFFFF", outline="#E4DCC8", width=1)
        draw.rectangle([x1 + 10, y1 + 10, x1 + 65, y1 + 65], fill=hex_val, outline="#4A3828" if hex_val=="#F7F4EA" else None, width=1)
        draw.text((x1 + 75, y1 + 15), name, fill="#4A3828")
        draw.text((x1 + 75, y1 + 35), hex_val, fill="#A88958")
        draw.text((x1 + 75, y1 + 52), usage, fill="#303B63")

    # Section 2: Signature Ledger Receipt Primitive
    draw.text((270, 310), "2. SIGNATURE LEDGER RECEIPT PRIMITIVE (`<LedgerReceipt />`)", fill="#4A3828")
    rx1, ry1 = 270, 340
    rx2, ry2 = 680, 580
    # Paper ticket box with perforated edges representation
    draw.rectangle([rx1, ry1, rx2, ry2], fill="#FFFFFF", outline="#D8B56A", width=2)
    # Perforated header band
    draw.rectangle([rx1, ry1, rx2, ry1 + 45], fill="#21483A")
    draw.text((rx1 + 20, ry1 + 12), "RECEIPT #KORRA-2026-0892 • OFFICIAL LEDGER TICKET", fill="#FFFFFF")
    draw.text((rx1 + 20, ry1 + 60), "Grade-A White Maize (Sokoto Silo)", fill="#4A3828")
    draw.text((rx1 + 20, ry1 + 85), "Quantity: 50 Metric Tons | Grade: A+", fill="#A88958")
    
    # Dashed divider line visual
    for dash in range(rx1 + 20, rx2 - 20, 12):
        draw.line([(dash, ry1 + 120), (dash + 6, ry1 + 120)], fill="#A88958", width=1)

    draw.text((rx1 + 20, ry1 + 135), "Purchase Price: ₦18,500,000", fill="#4A3828")
    draw.text((rx1 + 20, ry1 + 160), "Current Market Value: ₦21,250,000", fill="#21483A")
    draw.rectangle([rx2 - 140, ry1 + 150, rx2 - 20, ry1 + 185], fill="#21483A")
    draw.text((rx2 - 130, ry1 + 160), "+14.86% Gain", fill="#FFFFFF")

    # Section 3: Button & Primitive Showcase
    draw.text((710, 310), "3. CORE UI PRIMITIVES", fill="#4A3828")
    px1, py1 = 710, 340
    px2, py2 = 1170, 580
    draw.rectangle([px1, py1, px2, py2], fill="#FFFFFF", outline="#E4DCC8", width=1)
    
    # Buttons
    draw.text((px1 + 15, py1 + 15), "Button Variants:", fill="#4A3828")
    draw.rectangle([px1 + 15, py1 + 40, px1 + 130, py1 + 75], fill="#D8B56A") # Primary
    draw.text((px1 + 30, py1 + 50), "Primary CTA", fill="#4A3828")
    draw.rectangle([px1 + 145, py1 + 40, px1 + 260, py1 + 75], fill="#F7F4EA", outline="#A88958", width=1)
    draw.text((px1 + 160, py1 + 50), "Secondary", fill="#4A3828")
    draw.rectangle([px1 + 275, py1 + 40, px1 + 380, py1 + 75], fill="#B3432E")
    draw.text((px1 + 290, py1 + 50), "Destructive", fill="#FFFFFF")

    # Badges & Price Display
    draw.text((px1 + 15, py1 + 95), "Grade Badges & PriceDisplay (IBM Plex Mono):", fill="#4A3828")
    draw.rectangle([px1 + 15, py1 + 120, px1 + 90, py1 + 145], fill="#21483A")
    draw.text((px1 + 30, py1 + 126), "Grade A", fill="#FFFFFF")
    draw.rectangle([px1 + 105, py1 + 120, px1 + 180, py1 + 145], fill="#D8B56A")
    draw.text((px1 + 120, py1 + 126), "Grade B", fill="#4A3828")
    draw.rectangle([px1 + 195, py1 + 120, px1 + 270, py1 + 145], fill="#A88958")
    draw.text((px1 + 210, py1 + 126), "Grade C", fill="#FFFFFF")

    draw.rectangle([px1 + 15, py1 + 160, px1 + 380, py1 + 210], fill="#F7F4EA", outline="#E4DCC8", width=1)
    draw.text((px1 + 25, py1 + 175), "PriceDisplay: ₦450,000 / MT  ▲ +4.2%", fill="#21483A")

    # Section 4: Status Stepper
    draw.text((270, 600), "4. ORDER & BUYBACK STATUS STEPPER (`<StatusStepper />`)", fill="#4A3828")
    sx1, sy1 = 270, 630
    sx2, sy2 = 1170, 750
    draw.rectangle([sx1, sy1, sx2, sy2], fill="#FFFFFF", outline="#E4DCC8", width=1)
    
    steps = [
        ("1. Order Placed", True, "Completed"),
        ("2. Verification", True, "Completed"),
        ("3. Sourcing & Transit", True, "In Progress"),
        ("4. Stored in Silo", False, "Pending"),
    ]
    for i, (stitle, done, sstatus) in enumerate(steps):
        cx = sx1 + 50 + i * 260
        cy = sy1 + 50
        scolor = "#21483A" if done else "#E4DCC8"
        draw.ellipse([cx - 16, cy - 16, cx + 16, cy + 16], fill=scolor)
        draw.text((cx - 5, cy - 7), str(i + 1), fill="#FFFFFF" if done else "#4A3828")
        draw.text((cx - 50, cy + 25), stitle, fill="#4A3828")
        draw.text((cx - 40, cy + 45), sstatus, fill="#A88958")
        if i < 3:
            draw.line([(cx + 20, cy), (cx + 240, cy)], fill="#21483A" if i < 2 else "#E4DCC8", width=3)

    # Footer
    draw.rectangle([0, 870, 1200, 920], fill="#4A3828")
    draw.text((40, 885), "KorraStore Design System Baseline • All tokens verified & ready for App Router components.", fill="#F7F4EA")

    img.save(output_path)
    print(f"Saved: {output_path}")

def create_mobile_ui(output_path):
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    width, height = 430, 920
    img = Image.new("RGB", (width, height), "#F7F4EA") # Paper background
    draw = ImageDraw.Draw(img)

    # Mobile Header Bar
    draw.rectangle([0, 0, 430, 80], fill="#4A3828") # Soil
    draw.text((20, 35), "🌾 KorraStore UI", fill="#D8B56A")
    draw.text((310, 38), "Design System", fill="#F7F4EA")

    # Mobile Card 1: Token Summary
    draw.rectangle([20, 100, 410, 220], fill="#FFFFFF", outline="#D8B56A", width=2)
    draw.text((35, 115), "Mobile Viewport Preview", fill="#4A3828")
    draw.text((35, 140), "Light mode only • responsive tab bar", fill="#A88958")
    draw.rectangle([35, 170, 395, 205], fill="#21483A")
    draw.text((120, 180), "Paper & Soil Aesthetic", fill="#FFFFFF")

    # Mobile Card 2: Ledger Receipt Ticket Mobile Primitive
    draw.rectangle([20, 240, 410, 500], fill="#FFFFFF", outline="#E4DCC8", width=1)
    draw.rectangle([20, 240, 410, 280], fill="#21483A")
    draw.text((35, 252), "RECEIPT #KORRA-MOBILE-01", fill="#FFFFFF")
    draw.text((35, 295), "Commodity: Grade-A Paddy Rice", fill="#4A3828")
    draw.text((35, 320), "Quantity: 25 Metric Tons", fill="#A88958")
    
    # Dashed divider
    for dash in range(35, 395, 10):
        draw.line([(dash, 350), (dash + 5, 350)], fill="#A88958", width=1)

    draw.text((35, 365), "Purchase Price: ₦9,250,000", fill="#4A3828")
    draw.text((35, 395), "Current Value: ₦10,800,000", fill="#21483A")
    draw.rectangle([35, 435, 395, 485], fill="#D8B56A")
    draw.text((120, 452), "View Digital Receipt", fill="#4A3828")

    # Mobile Card 3: Button Primitives
    draw.rectangle([20, 520, 410, 680], fill="#FFFFFF", outline="#E4DCC8", width=1)
    draw.text((35, 535), "Mobile Primitive Controls", fill="#4A3828")
    draw.rectangle([35, 565, 395, 605], fill="#D8B56A")
    draw.text((140, 578), "Primary Button (CTAs)", fill="#4A3828")
    draw.rectangle([35, 615, 395, 655], fill="#F7F4EA", outline="#A88958", width=1)
    draw.text((135, 628), "Secondary Paper Button", fill="#4A3828")

    # Mobile Card 4: Swatch Chips
    draw.rectangle([20, 700, 410, 830], fill="#FFFFFF", outline="#E4DCC8", width=1)
    draw.text((35, 715), "Color Swatch Tokens", fill="#4A3828")
    chip_colors = [("#D8B56A", "Wheat"), ("#A88958", "Husk"), ("#4A3828", "Soil"), ("#21483A", "Green"), ("#303B63", "Indigo")]
    for i, (hex_c, label) in enumerate(chip_colors):
        cx = 35 + i * 72
        draw.rectangle([cx, 745, cx + 60, 795], fill=hex_c)
        draw.text((cx + 8, 802), label, fill="#4A3828")

    # Bottom Navigation Tab Bar (Mobile Shell Primitive)
    draw.rectangle([0, 850, 430, 920], fill="#FFFFFF", outline="#E4DCC8", width=1)
    tabs = ["Home", "Browse", "Portfolio", "Receipts"]
    for i, t in enumerate(tabs):
        tx = 25 + i * 102
        tc = "#21483A" if i == 0 else "#A88958"
        draw.text((tx, 880), t, fill=tc)

    img.save(output_path)
    print(f"Saved: {output_path}")

def create_workflow(output_path):
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    width, height = 1000, 700
    img = Image.new("RGB", (width, height), "#FFFFFF")
    draw = ImageDraw.Draw(img)

    # Workflow Title Header
    draw.rectangle([0, 0, 1000, 60], fill="#4A3828")
    draw.text((30, 20), "KorraStore Design System & UI Primitive Architecture (02-design-system)", fill="#D8B56A")

    # System Architecture Layers
    layers = [
        ("Layer 1: Design Tokens\napp/globals.css (CSS Vars) & app/layout.tsx (Google Fonts: DM Serif, Inter, IBM Plex)", 50, 90, 950, 180, "#21483A"),
        ("Layer 2: Core Utility Helper\nlib/utils.ts (cn() helper via clsx + tailwind-merge)", 50, 210, 950, 290, "#A88958"),
        ("Layer 3: UI Primitives & Signature Components\ncomponents/ui/ (Button, Card, LedgerReceipt, PriceDisplay, GradeBadge, QuantitySelector, StatusStepper)", 50, 320, 950, 430, "#D8B56A"),
        ("Layer 4: App Shell Navigation Layout\ncomponents/layout/ (NavRail desktop sidebar, BottomTabBar mobile navigation, AppShell wrapper)", 50, 460, 950, 560, "#303B63"),
        ("Layer 5: Design System Showcase Route\napp/design-system/page.tsx (Validates tokens & primitives across mobile/desktop viewports)", 50, 590, 950, 670, "#4A3828")
    ]

    for text, x1, y1, x2, y2, color in layers:
        draw.rectangle([x1, y1, x2, y2], fill=color, outline="#1F2937", width=2)
        lines = text.split("\n")
        draw.text((x1 + 25, y1 + 18), lines[0], fill="#FFFFFF")
        draw.text((x1 + 25, y1 + 45), lines[1], fill="#F7F4EA")

        # Down arrow connectors
        if y1 < 550:
            draw.line([(500, y2), (500, y2 + 30)], fill="#4A3828", width=3)

    img.save(output_path)
    print(f"Saved: {output_path}")

if __name__ == "__main__":
    ui_dir = r"prompts/ui degine/02-design-system"
    wf_dir = r"prompts/backend-wookflow/02-design-system"
    create_desktop_ui(os.path.join(ui_dir, "desktop-ui.png"))
    create_mobile_ui(os.path.join(ui_dir, "mobile-ui.png"))
    create_workflow(os.path.join(wf_dir, "workflow.png"))
