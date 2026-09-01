import os
from PIL import Image, ImageDraw

def create_desktop_ui(output_path):
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    width, height = 1200, 800
    img = Image.new("RGB", (width, height), "#F7F4EA")
    draw = ImageDraw.Draw(img)

    # Top Navigation / Header (height 64)
    draw.rectangle([0, 0, 1200, 64], fill="#FFFFFF", outline="#E4DCC8", width=1)
    draw.text((24, 22), "KORRASTORE ADMIN", fill="#21483A")
    draw.text((195, 24), "|  Operations Console", fill="#A88958")
    
    # Top Search & Profile
    draw.rectangle([480, 14, 820, 50], fill="#F7F4EA", outline="#E4DCC8", width=1)
    draw.text((495, 24), "Search orders, commodities, audits...", fill="#A88958")
    
    draw.rectangle([1020, 14, 1176, 50], fill="#F7F4EA", outline="#E4DCC8", width=1)
    draw.ellipse([1028, 20, 1058, 50], fill="#21483A")
    draw.text((1036, 27), "AD", fill="#F7F4EA")
    draw.text((1068, 24), "Super Admin", fill="#4A3828")

    # Left Admin Navigation Rail (width 220, from y=64 to 800)
    draw.rectangle([0, 64, 220, 800], fill="#FFFFFF", outline="#E4DCC8", width=1)
    
    nav_items = [
        ("Dashboard", True),
        ("Orders", False),
        ("Inventory & Silos", False),
        ("Pricing & Grades", False),
        ("Resale & Buybacks", False),
        ("Reports & Ledger", False),
        ("User Support", False),
        ("Admin Settings", False)
    ]
    
    for i, (item, is_active) in enumerate(nav_items):
        ny = 84 + i * 44
        if is_active:
            draw.rectangle([12, ny, 208, ny + 36], fill="#F7F4EA", outline="#D8B56A", width=1)
            draw.rectangle([12, ny, 16, ny + 36], fill="#D8B56A")
            draw.text((28, ny + 10), item, fill="#21483A")
        else:
            draw.text((28, ny + 10), item, fill="#4A3828")

    # Main Content Area
    # Header title
    draw.text((250, 88), "Admin Dashboard", fill="#4A3828")
    draw.text((250, 118), "Live operational metrics, inventory alerts, and recent audit activity", fill="#A88958")

    # 4-Card Stats Row (y: 150 to 240)
    stats = [
        ("OPEN ORDERS", "42", "+12% today", "#21483A", "#21483A"),
        ("PENDING BUYBACKS", "8", "NGN 4.25M volume", "#C7862B", "#C7862B"),
        ("ACTIVE RESALE", "19", "3,450 kg listed", "#303B63", "#303B63"),
        ("TOTAL INVENTORY", "58,200 kg", "NGN 84.6M val", "#4A3828", "#A88958")
    ]
    
    card_w = 215
    for i, (label, val, sub, val_col, border_col) in enumerate(stats):
        cx1 = 250 + i * (card_w + 20)
        cx2 = cx1 + card_w
        cy1 = 150
        cy2 = 240
        draw.rectangle([cx1, cy1, cx2, cy2], fill="#FFFFFF", outline="#E4DCC8", width=1)
        draw.rectangle([cx1, cy1, cx2, cy1 + 4], fill=border_col)
        draw.text((cx1 + 16, cy1 + 14), label, fill="#A88958")
        draw.text((cx1 + 16, cy1 + 36), val, fill=val_col)
        draw.text((cx1 + 16, cy1 + 64), sub, fill="#A88958")

    # Lower Two-Column Region (y: 260 to 760)
    # Left: Needs Attention List (x: 250 to 700)
    draw.rectangle([250, 260, 700, 760], fill="#FFFFFF", outline="#E4DCC8", width=1)
    draw.rectangle([250, 260, 700, 310], fill="#F7F4EA", outline="#E4DCC8", width=1)
    draw.text((268, 276), "Needs Attention", fill="#21483A")
    draw.rectangle([620, 274, 680, 298], fill="#B3432E")
    draw.text((630, 278), "3 Urgent", fill="#FFFFFF")

    attention_items = [
        ("LOW INVENTORY ALERT", "Kano White Rice (Grade A)", "Stock: 320 kg (Min threshold: 500 kg)", "Restock Silo", "#B3432E"),
        ("PENDING BUYBACK", "Request #BB-8402 - 1,500 kg Maize", "Submitted by J. Eze - NGN 1,425,000", "Review Request", "#C7862B"),
        ("SOURCING DELAY", "Order #ORD-9821 - 800 kg Soybeans", "In sourcing for > 48h - Action required", "Investigate", "#B3432E"),
        ("LOW INVENTORY ALERT", "Brown Beans (Grade B)", "Stock: 410 kg (Min threshold: 500 kg)", "Restock Silo", "#C7862B"),
        ("RESALE VERIFICATION", "Listing #RS-1049 - 2,000 kg Millet", "Bulk threshold check pending review", "Verify", "#303B63"),
    ]

    for i, (badge, title, desc, action, b_col) in enumerate(attention_items):
        ay1 = 320 + i * 85
        ay2 = ay1 + 75
        draw.rectangle([265, ay1, 685, ay2], fill="#F7F4EA", outline="#E4DCC8", width=1)
        draw.rectangle([275, ay1 + 10, 395, ay1 + 26], fill=b_col)
        draw.text((280, ay1 + 12), badge, fill="#FFFFFF")
        draw.text((275, ay1 + 32), title, fill="#4A3828")
        draw.text((275, ay1 + 52), desc, fill="#A88958")
        
        # Action button
        draw.rectangle([580, ay1 + 22, 675, ay1 + 52], fill="#D8B56A")
        draw.text((592, ay1 + 30), action, fill="#4A3828")

    # Right: Recent Activity / Audit Feed (x: 720 to 1170)
    draw.rectangle([720, 260, 1170, 760], fill="#FFFFFF", outline="#E4DCC8", width=1)
    draw.rectangle([720, 260, 1170, 310], fill="#F7F4EA", outline="#E4DCC8", width=1)
    draw.text((738, 276), "Recent Audit & System Activity", fill="#21483A")
    draw.text((1050, 276), "View All >", fill="#303B63")

    audit_logs = [
        ("Price Updated", "Admin updated Sesame Grade A to NGN 1,450/kg", "2 mins ago - admin@korrastore.ng"),
        ("Buyback Paid", "Payout of NGN 950,000 settled for #BB-8390", "14 mins ago - system_payout"),
        ("Inventory Inbound", "+5,000 kg White Garri added to Kano Silo B", "45 mins ago - warehouse_mgr"),
        ("Order Fulfilled", "Order #ORD-9804 status changed to 'stored'", "1 hour ago - logistics_bot"),
        ("Resale Executed", "Listing #RS-1022 (500kg) purchased by Buyer #88", "2 hours ago - p2p_engine"),
        ("Security Policy", "Admin access granted for new operator", "3 hours ago - superadmin"),
    ]

    for i, (action, detail, meta) in enumerate(audit_logs):
        ly = 325 + i * 70
        draw.ellipse([738, ly + 8, 750, ly + 20], fill="#D8B56A")
        draw.text((760, ly + 4), action, fill="#4A3828")
        draw.text((760, ly + 22), detail, fill="#21483A")
        draw.text((760, ly + 42), meta, fill="#A88958")
        draw.line([760, ly + 62, 1150, ly + 62], fill="#E4DCC8", width=1)

    img.save(output_path)
    print(f"Saved Desktop UI: {output_path}")

def create_mobile_ui(output_path):
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    width, height = 430, 920
    img = Image.new("RGB", (width, height), "#F7F4EA")
    draw = ImageDraw.Draw(img)

    # Mobile Header (0 to 60)
    draw.rectangle([0, 0, 430, 60], fill="#FFFFFF", outline="#E4DCC8", width=1)
    draw.text((16, 20), "KORRASTORE ADMIN", fill="#21483A")
    draw.ellipse([375, 15, 410, 50], fill="#21483A")
    draw.text((383, 24), "AD", fill="#F7F4EA")

    # Title & Subtitle
    draw.text((16, 75), "Admin Dashboard", fill="#4A3828")
    draw.text((16, 98), "Live operational summary & alerts", fill="#A88958")

    # 2x2 Metric Cards Grid (y: 125 to 265)
    stats = [
        ("OPEN ORDERS", "42", "+12%", "#21483A"),
        ("BUYBACKS", "8", "NGN 4.25M", "#C7862B"),
        ("ACTIVE RESALE", "19", "3,450 kg", "#303B63"),
        ("INVENTORY", "58.2T", "NGN 84.6M", "#4A3828")
    ]
    
    for i, (label, val, sub, col) in enumerate(stats):
        col_idx = i % 2
        row_idx = i // 2
        x1 = 16 + col_idx * 205
        x2 = x1 + 193
        y1 = 125 + row_idx * 68
        y2 = y1 + 60
        draw.rectangle([x1, y1, x2, y2], fill="#FFFFFF", outline="#E4DCC8", width=1)
        draw.rectangle([x1, y1, x2, y1 + 3], fill=col)
        draw.text((x1 + 10, y1 + 8), label, fill="#A88958")
        draw.text((x1 + 10, y1 + 24), val, fill=col)
        draw.text((x1 + 95, y1 + 26), sub, fill="#A88958")

    # Section 1: Needs Attention (y: 275 to 555)
    draw.rectangle([16, 275, 414, 555], fill="#FFFFFF", outline="#E4DCC8", width=1)
    draw.rectangle([16, 275, 414, 315], fill="#F7F4EA", outline="#E4DCC8", width=1)
    draw.text((28, 286), "Needs Attention (3)", fill="#21483A")

    alerts = [
        ("LOW STOCK", "Kano White Rice Grade A (320kg)", "#B3432E"),
        ("BUYBACK", "BB-8402 awaiting review (1,500kg)", "#C7862B"),
        ("DELAY", "Order #ORD-9821 sourcing delayed", "#B3432E"),
    ]

    for i, (badge, text, b_col) in enumerate(alerts):
        ay1 = 325 + i * 72
        draw.rectangle([24, ay1, 406, ay1 + 64], fill="#F7F4EA", outline="#E4DCC8", width=1)
        draw.rectangle([32, ay1 + 8, 100, ay1 + 24], fill=b_col)
        draw.text((36, ay1 + 10), badge, fill="#FFFFFF")
        draw.text((32, ay1 + 28), text, fill="#4A3828")
        draw.rectangle([310, ay1 + 20, 396, ay1 + 48], fill="#D8B56A")
        draw.text((325, ay1 + 27), "Review", fill="#4A3828")

    # Section 2: Recent Activity (y: 570 to 835)
    draw.rectangle([16, 570, 414, 835], fill="#FFFFFF", outline="#E4DCC8", width=1)
    draw.rectangle([16, 570, 414, 610], fill="#F7F4EA", outline="#E4DCC8", width=1)
    draw.text((28, 582), "Recent Activity", fill="#21483A")

    activities = [
        ("Price Updated", "Sesame Grade A: NGN 1,450/kg", "2m ago"),
        ("Buyback Paid", "NGN 950,000 for #BB-8390", "14m ago"),
        ("Inventory Added", "+5,000 kg Garri to Kano Silo", "45m ago"),
    ]

    for i, (title, sub, time_ago) in enumerate(activities):
        ly = 620 + i * 68
        draw.ellipse([28, ly + 8, 38, ly + 18], fill="#D8B56A")
        draw.text((46, ly + 4), title, fill="#4A3828")
        draw.text((46, ly + 22), sub, fill="#21483A")
        draw.text((46, ly + 40), time_ago, fill="#A88958")
        draw.line([28, ly + 58, 402, ly + 58], fill="#E4DCC8", width=1)

    # Mobile Bottom Tab Bar (y: 850 to 920)
    draw.rectangle([0, 850, 430, 920], fill="#FFFFFF", outline="#E4DCC8", width=1)
    tabs = ["Overview", "Orders", "Inventory", "Pricing", "More"]
    for i, tab in enumerate(tabs):
        tx = 20 + i * 82
        if i == 0:
            draw.rectangle([tx - 6, 856, tx + 66, 912], fill="#F7F4EA", outline="#D8B56A", width=1)
            draw.text((tx, 876), tab, fill="#21483A")
        else:
            draw.text((tx, 876), tab, fill="#4A3828")

    img.save(output_path)
    print(f"Saved Mobile UI: {output_path}")

def create_workflow(output_path):
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    width, height = 1200, 800
    img = Image.new("RGB", (width, height), "#F7F4EA")
    draw = ImageDraw.Draw(img)

    # Header
    draw.rectangle([0, 0, 1200, 70], fill="#21483A")
    draw.text((40, 24), "KORRASTORE ADMIN DASHBOARD — BACKEND & SECURITY ARCHITECTURE WORKFLOW", fill="#FFFFFF")

    # Layer 1: Multi-Tier Authorization & Defense in Depth
    draw.rectangle([60, 100, 1140, 240], fill="#FFFFFF", outline="#E4DCC8", width=2)
    draw.rectangle([60, 100, 1140, 135], fill="#F7F4EA")
    draw.text((80, 110), "1. THREE-TIER DEFENSE IN DEPTH ROLE ENFORCEMENT", fill="#21483A")

    tiers = [
        ("Tier 1: Middleware", "middleware.ts intercepts /admin/* requests.\nChecks session and verifies profile role == 'admin'.\nRedirects unauthorized buyers to /home.", "#303B63"),
        ("Tier 2: Layout Guard", "app/admin/layout.tsx calls supabase.auth.getUser()\nand queries profiles.role. Blocks any non-admin\nwith redirect or 403 even if middleware bypassed.", "#21483A"),
        ("Tier 3: Query Gating", "lib/supabase/queries/admin/* runs strictly on the\nserver-only service client. Explicit role validation\nprevents client leakage.", "#C7862B"),
    ]

    for i, (title, desc, col) in enumerate(tiers):
        tx1 = 80 + i * 350
        tx2 = tx1 + 330
        draw.rectangle([tx1, 150, tx2, 225], fill="#F7F4EA", outline="#E4DCC8", width=1)
        draw.rectangle([tx1, 150, tx2, 154], fill=col)
        draw.text((tx1 + 12, 160), title, fill="#4A3828")
        lines = desc.split("\n")
        for l_idx, line in enumerate(lines):
            draw.text((tx1 + 12, 178 + l_idx * 14), line, fill="#A88958")

    # Layer 2: Service-Role Data Aggregation Pipeline
    draw.rectangle([60, 260, 1140, 520], fill="#FFFFFF", outline="#E4DCC8", width=2)
    draw.rectangle([60, 260, 1140, 295], fill="#F7F4EA")
    draw.text((80, 270), "2. SERVICE-ROLE AGGREGATION & OPERATIONAL METRICS PIPELINE", fill="#21483A")

    sources = [
        ("Orders Table", "Aggregates open orders (pending_payment, sourcing, in_transit) + identifies stuck orders > 48h.", "#21483A"),
        ("Buyback Requests", "Counts pending buyback requests awaiting admin review and calculates total pending liquidation volume.", "#C7862B"),
        ("Resale Listings", "Counts active peer-to-peer listings and total kg listed in the marketplace.", "#303B63"),
        ("Inventory & Silos", "Scans available inventory vs commodity minimum thresholds to emit low-stock alert items.", "#B3432E"),
        ("Audit Logs", "Fetches recent system and administrator actions for transparency and live operational audit feed.", "#4A3828")
    ]

    for i, (src, desc, col) in enumerate(sources):
        sy1 = 310 + i * 38
        sy2 = sy1 + 32
        draw.rectangle([80, sy1, 280, sy2], fill="#F7F4EA", outline=col, width=1)
        draw.text((95, sy1 + 8), src, fill=col)
        draw.rectangle([290, sy1, 1120, sy2], fill="#F7F4EA", outline="#E4DCC8", width=1)
        draw.text((305, sy1 + 8), desc, fill="#4A3828")

    # Layer 3: Presentation & Admin Navigation Layer
    draw.rectangle([60, 540, 1140, 750], fill="#FFFFFF", outline="#E4DCC8", width=2)
    draw.rectangle([60, 540, 1140, 575], fill="#F7F4EA")
    draw.text((80, 550), "3. READ-ONLY DASHBOARD PRESENTATION & ACTION ROUTING", fill="#21483A")

    flow_boxes = [
        ("Admin Layout Shell", "app/admin/layout.tsx\nRenders AdminNavRail (Desktop) &\nAdminBottomTabBar (Mobile).", "#21483A"),
        ("Dashboard Server Page", "app/admin/page.tsx\nFetches stats in parallel:\n- getAdminDashboardStats()\n- getNeedsAttentionItems()\n- getRecentAuditActivity()", "#D8B56A"),
        ("Action Routing", "Clicking stat tiles & alerts routes to:\n- /admin/orders\n- /admin/inventory\n- /admin/pricing\n- /admin/buybacks", "#303B63")
    ]

    for i, (title, desc, col) in enumerate(flow_boxes):
        bx1 = 80 + i * 350
        bx2 = bx1 + 330
        draw.rectangle([bx1, 590, bx2, 730], fill="#F7F4EA", outline="#E4DCC8", width=1)
        draw.rectangle([bx1, 590, bx2, 594], fill=col)
        draw.text((bx1 + 12, 604), title, fill="#4A3828")
        lines = desc.split("\n")
        for l_idx, line in enumerate(lines):
            draw.text((bx1 + 12, 626 + l_idx * 16), line, fill="#A88958")

    img.save(output_path)
    print(f"Saved Workflow: {output_path}")

if __name__ == "__main__":
    create_desktop_ui("prompts/ui degine/17-admin-dashboard/desktop-ui.png")
    create_mobile_ui("prompts/ui degine/17-admin-dashboard/mobile-ui.png")
    create_workflow("prompts/backend-wookflow/17-admin-dashboard/workflow.png")
