"""Seed a demo user with a filled portfolio.

Run with the backend server already running on localhost:8000:
    python scripts/seed_demo.py
"""

import io
import json
import struct
import sys
import urllib.request
import zlib

BASE = "http://localhost:8000/api/v1"


def png_bytes(width: int, height: int, top_rgb, bottom_rgb) -> bytes:
    """Generate a simple vertical-gradient PNG with pure stdlib."""

    def chunk(tag: bytes, data: bytes) -> bytes:
        return (
            struct.pack(">I", len(data))
            + tag
            + data
            + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)
        )

    rows = bytearray()
    for y in range(height):
        rows.append(0)  # filter: none
        t = y / max(height - 1, 1)
        r = int(top_rgb[0] + (bottom_rgb[0] - top_rgb[0]) * t)
        g = int(top_rgb[1] + (bottom_rgb[1] - top_rgb[1]) * t)
        b = int(top_rgb[2] + (bottom_rgb[2] - top_rgb[2]) * t)
        rows.extend(struct.pack("BBB", r, g, b) * width)
    return b"".join(
        [
            b"\x89PNG\r\n\x1a\n",
            chunk(b"IHDR", struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0)),
            chunk(b"IDAT", zlib.compress(bytes(rows))),
            chunk(b"IEND", b""),
        ]
    )


def call(method: str, path: str, token: str | None = None, body: dict | None = None):
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(
        f"{BASE}{path}",
        data=data,
        method=method,
        headers={
            "Content-Type": "application/json",
            **({"Authorization": f"Bearer {token}"} if token else {}),
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            payload = resp.read()
            return resp.status, json.loads(payload) if payload else None
    except urllib.error.HTTPError as e:
        payload = e.read()
        return e.code, json.loads(payload) if payload else None


def upload(path: str, token: str, filename: str, content: bytes):
    boundary = "----SeedBoundary7d1a2c"
    body = (
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="file"; filename="{filename}"\r\n'
        "Content-Type: image/png\r\n\r\n"
    ).encode() + content + f"\r\n--{boundary}--\r\n".encode()
    req = urllib.request.Request(
        f"{BASE}{path}",
        data=body,
        method="POST",
        headers={
            "Content-Type": f"multipart/form-data; boundary={boundary}",
            "Authorization": f"Bearer {token}",
        },
    )
    with urllib.request.urlopen(req, timeout=15) as resp:
        return json.loads(resp.read())


PROJECTS = [
    {
        "title": "Telegram CRM",
        "short_description": "CRM system for Telegram-based businesses.",
        "problem": "A small online school managed student leads manually in Telegram chats. "
        "Requests were getting lost and managers responded with delays of several hours.",
        "solution": "Built a centralized CRM with a Telegram bot for lead capture, "
        "a deals pipeline and automatic notifications for managers. "
        "Implemented the backend with FastAPI and an admin dashboard with React.",
        "role": "Full-Stack Developer (solo project)",
        "features": "Lead capture bot with inline buttons\nDeals pipeline (new / in progress / won)\n"
        "Manager notifications\nAdmin dashboard with statistics",
        "result": "Lead response time dropped from hours to minutes; all requests are now "
        "stored in one system instead of chat history.",
        "github_url": "https://github.com/example/telegram-crm",
        "live_url": "https://telegram-crm.example.com",
        "technologies": ["Python", "FastAPI", "PostgreSQL", "React"],
        "cover": (600, 400, (79, 70, 229), (129, 140, 248)),
    },
    {
        "title": "Analytics Dashboard",
        "short_description": "Real-time analytics dashboard for online stores.",
        "problem": "Store owners had no quick way to see sales dynamics — data was scattered "
        "between payment systems and spreadsheets.",
        "solution": "Developed a dashboard with interactive charts, filters by period and product "
        "categories, and a CSV export. Data aggregated on the backend with caching.",
        "role": "Frontend Developer",
        "features": "Interactive sales charts\nPeriod and category filters\nCSV export\nDark theme",
        "result": "Store owners review daily sales in one screen instead of merging spreadsheets manually.",
        "github_url": "https://github.com/example/analytics-dashboard",
        "live_url": "https://analytics.example.com",
        "technologies": ["TypeScript", "React", "PostgreSQL", "Tailwind CSS"],
        "cover": (600, 400, (5, 150, 105), (16, 185, 129)),
    },
    {
        "title": "Task Automator Bot",
        "short_description": "Telegram bot that automates routine file operations.",
        "problem": "The team manually renamed, converted and archived dozens of files every day.",
        "solution": "A bot that accepts files, applies rule-based operations (rename patterns, "
        "format conversion, archiving) and returns processed archives.",
        "role": "Backend Developer (solo project)",
        "features": "Rule-based file processing\nArchive packaging\nProcessing history",
        "result": "Daily routine file work reduced from ~40 minutes to under 2 minutes.",
        "github_url": "https://github.com/example/task-automator",
        "live_url": None,
        "technologies": ["Python", "Telegram Bot API", "SQLite"],
        "cover": (600, 400, (217, 119, 6), (245, 158, 11)),
    },
]


def main() -> int:
    print("== Seed demo user ==")

    status, data = call("POST", "/auth/register", body={
        "email": "demo@example.com", "username": "demo", "password": "demo12345"})
    if status == 409:
        status, data = call("POST", "/auth/login", body={
            "email": "demo@example.com", "password": "demo12345"})
    if status not in (200, 201):
        print(f"FAIL auth: {status} {data}")
        return 1
    token = data["access_token"]
    print("auth OK")

    status, _ = call("PUT", "/profile", token, {
        "display_name": "Dmitriy K.",
        "headline": "Full-Stack Developer",
        "bio": "I build automation tools and web applications. "
               "I like turning messy manual processes into working products.",
        "location": "Moscow",
        "website_url": "https://dmitriy.example.com",
        "github_url": "https://github.com/example",
        "telegram_url": "https://t.me/example",
    })
    print("profile:", "OK" if status == 200 else f"FAIL {status}")

    techs = call("GET", "/technologies")[1]
    tech_by_name = {t["name"]: t["id"] for t in techs}

    existing = call("GET", "/projects", token)[1]
    existing_slugs = {p["slug"] for p in existing["items"]}

    for project in PROJECTS:
        slug = project["title"].lower().replace(" ", "-")
        if slug in existing_slugs:
            print(f"project '{project['title']}': already exists, skip")
            continue
        status, created = call("POST", "/projects", token, {
            "title": project["title"],
            "short_description": project["short_description"],
            "problem": project["problem"],
            "solution": project["solution"],
            "features": project["features"],
            "result": project["result"],
            "role": project["role"],
            "github_url": project["github_url"],
            "live_url": project["live_url"],
        })
        if status != 201:
            print(f"project '{project['title']}': FAIL {status} {created}")
            continue
        tech_ids = [tech_by_name[n] for n in project["technologies"] if n in tech_by_name]
        call("PUT", f"/projects/{created['id']}/technologies", token,
             {"technology_ids": tech_ids})
        w, h, top, bottom = project["cover"]
        upload(f"/projects/{created['id']}/images", token,
               f"{slug}-cover.png", png_bytes(w, h, top, bottom))
        cover_url = call("GET", f"/projects/{created['id']}", token)[1]["images"][0]["url"]
        call("PUT", f"/projects/{created['id']}", token, {"cover_image_url": cover_url})
        call("POST", f"/projects/{created['id']}/publish", token)
        print(f"project '{project['title']}': created + published")

    print()
    print("Demo account ready:")
    print("  login:    demo@example.com / demo12345")
    print("  dashboard http://localhost:5173/dashboard")
    print("  public    http://localhost:5173/demo")
    return 0


if __name__ == "__main__":
    sys.exit(main())
