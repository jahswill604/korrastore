import os
from PIL import Image, ImageDraw

def create_desktop_ui(output_path):
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    width, height = 1200, 800
    img = Image.new("RGB", (width, height), "#F6F3E7")
    draw = ImageDraw.Draw(img)

    # Header
    draw.rectangle([0, 0, 1200, 70], fill="#1E5E43")
    draw.text((40, 22), "🌾 KorraStore", fill="#FFFFFF")
    draw.text((180, 26), "— Own food. Earn value.", fill="#D4A017")
    draw.rectangle([1050, 20, 1160, 50], fill="#D4A017", outline=None)
    draw.text((1062, 28), "v0.1.0 Ready", fill="#1F2937")

    # Hero Banner
    draw.rectangle([60, 100, 1140, 220], fill="#182A55")
    draw.text((100, 130), "Project Foundation — KorraStore Architecture", fill="#FFFFFF")
    draw.text((100, 170), "Next.js 16 (App Router) + TypeScript + Supabase Client Infrastructure", fill="#F6F3E7")

    # Grid of Cards
    cards = [
        ("Browser Client (`client.ts`)", "Public Anon key access for Client Components & real-time listeners.", "#1E5E43"),
        ("Server Client (`server.ts`)", "SSR Session cookie binding via @supabase/ssr for Server Components & Actions.", "#8B6F47"),
        ("Service Client (`service.ts`)", "Strict 'server-only' service-role execution for administrative operations.", "#182A55"),
        ("Environment Config (`.env.example`)", "Canonical env validation matching AGENTS.md specs strictly.", "#D4A017")
    ]

    for i, (title, desc, color) in enumerate(cards):
        row = i // 2
        col = i % 2
        x1 = 60 + col * 550
        y1 = 250 + row * 230
        x2 = x1 + 530
        y2 = y1 + 200
        draw.rectangle([x1, y1, x2, y2], fill="#FFFFFF", outline="#D4A017", width=2)
        draw.rectangle([x1, y1, x2, y1 + 10], fill=color)
        draw.text((x1 + 30, y1 + 35), title, fill="#1F2937")
        draw.text((x1 + 30, y1 + 80), desc, fill="#8B6F47")
        draw.rectangle([x1 + 30, y1 + 140, x1 + 180, y1 + 170], fill="#F6F3E7", outline=color, width=1)
        draw.text((x1 + 45, y1 + 148), "STATUS: READY", fill="#1E5E43")

    # Footer
    draw.rectangle([0, 750, 1200, 800], fill="#1F2937")
    draw.text((40, 765), "KorraStore Foundation Skeleton | Ready for Design System (02-design-system.md)", fill="#F6F3E7")

    img.save(output_path)
    print(f"Saved: {output_path}")

def create_mobile_ui(output_path):
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    width, height = 430, 880
    img = Image.new("RGB", (width, height), "#F6F3E7")
    draw = ImageDraw.Draw(img)

    # Top Bar
    draw.rectangle([0, 0, 430, 80], fill="#1E5E43")
    draw.text((20, 35), "🌾 KorraStore", fill="#FFFFFF")
    draw.text((340, 38), "v0.1.0", fill="#D4A017")

    # Mobile Card 1
    draw.rectangle([20, 100, 410, 240], fill="#FFFFFF", outline="#1E5E43", width=2)
    draw.text((40, 120), "Welcome to KorraStore", fill="#1F2937")
    draw.text((40, 150), "Own food. Earn value.", fill="#8B6F47")
    draw.rectangle([40, 185, 390, 220], fill="#1E5E43")
    draw.text((140, 195), "Project Foundation Ready", fill="#FFFFFF")

    # System Statuses
    items = [
        ("App Router Structure", "app/ layout & routes stubbed"),
        ("Browser Supabase Client", "lib/supabase/client.ts"),
        ("Server Supabase Client", "lib/supabase/server.ts"),
        ("Service-Role Client Isolation", "lib/supabase/service.ts (server-only)")
    ]

    for i, (heading, subtitle) in enumerate(items):
        y = 260 + i * 110
        draw.rectangle([20, y, 410, y + 95], fill="#FFFFFF", outline="#D4A017", width=1)
        draw.rectangle([35, y + 15, 45, y + 80], fill="#1E5E43")
        draw.text((60, y + 20), heading, fill="#1F2937")
        draw.text((60, y + 50), subtitle, fill="#8B6F47")

    # Bottom Nav Bar
    draw.rectangle([0, 810, 430, 880], fill="#FFFFFF", outline="#8B6F47", width=1)
    navs = ["Home", "Browse", "Storage", "Profile"]
    for i, n in enumerate(navs):
        draw.text((35 + i * 105, 835), n, fill="#1E5E43" if i == 0 else "#8B6F47")

    img.save(output_path)
    print(f"Saved: {output_path}")

def create_workflow(output_path):
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    width, height = 1000, 650
    img = Image.new("RGB", (width, height), "#FFFFFF")
    draw = ImageDraw.Draw(img)

    # Title
    draw.rectangle([0, 0, 1000, 60], fill="#182A55")
    draw.text((30, 20), "KorraStore Backend & Client Architecture — 01-project-foundation", fill="#FFFFFF")

    # Nodes
    nodes = [
        ("Client Component / Browser UI", 50, 100, 300, 180, "#1E5E43"),
        ("lib/supabase/client.ts\n(Browser Client - Anon Key)", 50, 260, 300, 350, "#8B6F47"),
        ("Supabase Public Endpoint", 50, 430, 300, 520, "#D4A017"),

        ("Server Component / Route Handler", 370, 100, 630, 180, "#1E5E43"),
        ("lib/supabase/server.ts\n(@supabase/ssr - Cookies)", 370, 260, 630, 350, "#8B6F47"),
        ("Supabase Auth & DB Query", 370, 430, 630, 520, "#D4A017"),

        ("Server Action / Admin API", 700, 100, 950, 180, "#1E5E43"),
        ("lib/supabase/service.ts\n(import 'server-only' - Service Role)", 700, 260, 950, 350, "#182A55"),
        ("Bypass RLS / Admin System", 700, 430, 950, 520, "#1F2937")
    ]

    for text, x1, y1, x2, y2, color in nodes:
        draw.rectangle([x1, y1, x2, y2], fill=color, outline="#1F2937", width=2)
        lines = text.split("\n")
        if len(lines) == 1:
            draw.text((x1 + 15, y1 + 30), lines[0], fill="#FFFFFF")
        else:
            draw.text((x1 + 15, y1 + 20), lines[0], fill="#FFFFFF")
            draw.text((x1 + 15, y1 + 45), lines[1], fill="#F6F3E7")

        if y1 < 400:
            draw.line([ (x1 + x2)//2, y2, (x1 + x2)//2, y2 + 80 ], fill="#1F2937", width=3)

    # Footer note
    draw.rectangle([0, 580, 1000, 650], fill="#F6F3E7")
    draw.text((30, 600), "Security Enforcement: lib/supabase/service.ts is guarded by import 'server-only'.", fill="#1F2937")

    img.save(output_path)
    print(f"Saved: {output_path}")

if __name__ == "__main__":
    base_ui_dir = r"prompts/ui degine/01-project-foundation"
    base_wf_dir = r"prompts/backend-wookflow/01-project-foundation"
    create_desktop_ui(os.path.join(base_ui_dir, "desktop-ui.png"))
    create_mobile_ui(os.path.join(base_ui_dir, "mobile-ui.png"))
    create_workflow(os.path.join(base_wf_dir, "workflow.png"))
