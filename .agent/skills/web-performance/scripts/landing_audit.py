#!/usr/bin/env python3
"""
landing_audit.py — deterministic checks for the landing-page skills
(web-performance, responsive-design, seo-metadata). Pure stdlib, read-only.

Scans a Next.js App Router project (src/ + public/ + app/) for mechanical issues
the skills care about. It does NOT replace judgment — it catches the regex-able
tells so review effort goes to layout/taste. Exit code = HIGH-severity count, so
CI can gate on it.

Usage:
    python3 landing_audit.py <project-dir>            # default: .
    python3 landing_audit.py <dir> --severity high    # only strong signals
    python3 landing_audit.py <dir> --json             # machine-readable (CI)
"""
import os, re, sys, json, argparse

CODE_EXTS = {".ts", ".tsx", ".js", ".jsx", ".css"}
SKIP_DIRS = {"node_modules", ".git", ".next", "out", "dist", "build", "__pycache__"}
IMG_EXTS = {".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif"}
VID_EXTS = {".mp4", ".webm", ".mov"}
W = {"high": 3, "medium": 2, "low": 1}

# Per-line regex rules. id, label, severity, fix, patterns.
RULES = [
    {"id": "fixed-blend-overlay", "sev": "high",
     "label": "mix-blend-mode on a fixed/full-screen layer (scroll jank)",
     "fix": "Remove mix-blend-mode from fixed full-viewport layers (e.g. film grain). It forces a full-viewport recomposite every scroll frame.",
     # CSS property usage OR a real Tailwind blend class — not the bare words in prose/comments.
     "pats": [r"mix-blend-mode\s*:\s*(?!normal)",
              r"\bmix-blend-(multiply|screen|overlay|darken|lighten|color-dodge|color-burn|hard-light|soft-light|difference|exclusion|hue|saturation|color|luminosity)\b"]},
    {"id": "raw-img", "sev": "medium",
     "label": "Raw <img> instead of next/image (no lazy/sizing/CLS guard)",
     "fix": "Use next/image with width/height or sizes; reserve <img> for OG routes / data-URIs only.",
     "pats": [r"<img\s"]},
    {"id": "fixed-px-font", "sev": "medium",
     "label": "Hardcoded px font-size (not fluid/rem)",
     "fix": "Use clamp()/rem for type so it scales 4K→mobile (see responsive-design). px font-size doesn't respect zoom.",
     "pats": [r"font-size\s*:\s*\d+px"]},
    {"id": "deprecated-schema", "sev": "high",
     "label": "Deprecated/restricted JSON-LD type (HowTo / FAQPage on commercial site)",
     "fix": "Remove HowTo (rich results gone 2023). FAQPage is gov/health only — don't ship it on a commercial landing page.",
     "pats": [r'"@type"\s*:\s*"(HowTo|FAQPage|SpecialAnnouncement|ClaimReview)"']},
    {"id": "schema-http-context", "sev": "medium",
     "label": "JSON-LD @context uses http:// (should be https://schema.org)",
     "fix": 'Use "@context": "https://schema.org".',
     "pats": [r'"@context"\s*:\s*"http://schema\.org']},
    {"id": "missing-faststart-hint", "sev": "low",
     "label": "autoPlay video without muted (mobile browsers block it)",
     "fix": "autoPlay requires muted + playsInline on mobile; otherwise it won't start.",
     "pats": [r"autoPlay(?![^>]*muted)"]},
]

def compile_rules(min_sev):
    order = ["high", "medium", "low"]
    floor = order.index(min_sev)
    out = []
    for r in RULES:
        if order.index(r["sev"]) > floor:
            continue
        r = dict(r); r["rx"] = [re.compile(p, re.I) for p in r["pats"]]
        out.append(r)
    return out

def iter_code(root):
    for dirpath, dirs, files in os.walk(root):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
        for f in files:
            if f.endswith((".min.js", ".min.css")):
                continue
            if os.path.splitext(f)[1].lower() in CODE_EXTS:
                yield os.path.join(dirpath, f)

def scan_lines(root, rules):
    out = []
    for fp in iter_code(root):
        try:
            with open(fp, encoding="utf-8", errors="ignore") as fh:
                lines = fh.readlines()
        except Exception:
            continue
        for i, line in enumerate(lines, 1):
            if "audit-ignore" in line.lower():
                continue
            for r in rules:
                if any(rx.search(line) for rx in r["rx"]):
                    out.append({"rule": r["id"], "label": r["label"], "sev": r["sev"],
                                "fix": r["fix"], "file": fp, "line": i,
                                "snippet": line.strip()[:140]})
                    break
    return out

def project_checks(root):
    """Whole-project presence checks (not line-based)."""
    out = []
    def exists(*rel):
        return any(os.path.exists(os.path.join(root, p)) for p in rel)

    has_motion = False
    css = None
    for fp in iter_code(root):
        low = fp.lower()
        if low.endswith("globals.css"):
            try:
                css = open(fp, encoding="utf-8", errors="ignore").read()
            except Exception:
                css = ""
        if low.endswith((".tsx", ".ts", ".jsx", ".js")):
            try:
                t = open(fp, encoding="utf-8", errors="ignore").read()
            except Exception:
                continue
            if "motion/react" in t or "from \"lenis\"" in t or "from 'lenis'" in t:
                has_motion = True

    if has_motion and css is not None and "prefers-reduced-motion" not in css:
        out.append({"rule": "no-reduced-motion", "sev": "high",
                    "label": "Motion libs used but no prefers-reduced-motion rule in globals.css",
                    "fix": "Add the global reduced-motion kill-switch (see web-performance).",
                    "file": "globals.css", "line": 0, "snippet": ""})

    if not exists("public/llms.txt"):
        out.append({"rule": "no-llms-txt", "sev": "low",
                    "label": "No public/llms.txt (AI-search readiness)",
                    "fix": "Add public/llms.txt so AI crawlers can map the site (see seo-metadata GEO).",
                    "file": "public/llms.txt", "line": 0, "snippet": ""})

    if not exists("src/app/robots.ts", "app/robots.ts") or \
       not exists("src/app/sitemap.ts", "app/sitemap.ts"):
        out.append({"rule": "no-robots-sitemap", "sev": "low",
                    "label": "Missing native app/robots.ts or app/sitemap.ts",
                    "fix": "Add the native Next metadata routes (see seo-metadata).",
                    "file": "app/", "line": 0, "snippet": ""})
    return out

def asset_checks(root, budgets):
    out = []
    pub = os.path.join(root, "public")
    if not os.path.isdir(pub):
        return out
    for dp, dirs, files in os.walk(pub):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
        for f in files:
            ext = os.path.splitext(f)[1].lower()
            fp = os.path.join(dp, f)
            try:
                kb = os.path.getsize(fp) // 1024
            except OSError:
                continue
            if ext in IMG_EXTS and kb > budgets["img"]:
                out.append({"rule": "image-over-budget", "sev": "medium",
                            "label": f"Image over {budgets['img']}KB budget",
                            "fix": "Re-encode with media-optimize (WebP/AVIF, lower q or width).",
                            "file": fp, "line": 0, "snippet": f"{kb}KB"})
            if ext in {".jpg", ".jpeg", ".png"} and kb > 80:
                out.append({"rule": "unconverted-raster", "sev": "low",
                            "label": "Large JPG/PNG not converted to WebP/AVIF",
                            "fix": "Convert with media-optimize/optimize-images.sh.",
                            "file": fp, "line": 0, "snippet": f"{kb}KB"})
            if ext in VID_EXTS and kb > budgets["vid"]:
                out.append({"rule": "video-heavy", "sev": "low",
                            "label": f"Video over {budgets['vid']}KB (gate behind reduced-motion / poster)",
                            "fix": "Keep scrub clips short; serve a poster + lighter mobile source.",
                            "file": fp, "line": 0, "snippet": f"{kb}KB"})
    return out

def verdict(by_sev, score):
    if by_sev.get("high", 0) >= 3 or score >= 15: return "Needs work — multiple hard issues"
    if by_sev.get("high", 0) >= 1 or score >= 6:  return "Some issues to fix"
    if score > 0: return "Mostly clean, minor items"
    return "Clean"

def main():
    ap = argparse.ArgumentParser(description="Deterministic landing-page audit.")
    ap.add_argument("path", nargs="?", default=".")
    ap.add_argument("--severity", choices=["high", "medium", "low"], default="low")
    ap.add_argument("--json", action="store_true")
    ap.add_argument("--img-budget", type=int, default=300, help="per-image KB budget")
    ap.add_argument("--vid-budget", type=int, default=12000, help="per-video KB budget")
    args = ap.parse_args()
    if not os.path.exists(args.path):
        print(f"path not found: {args.path}", file=sys.stderr); sys.exit(2)

    rules = compile_rules(args.severity)
    findings = scan_lines(args.path, rules)
    findings += project_checks(args.path)
    findings += asset_checks(args.path, {"img": args.img_budget, "vid": args.vid_budget})
    order = {"high": 0, "medium": 1, "low": 2}
    findings = [f for f in findings if order[f["sev"]] <= order[args.severity]]

    by_sev = {}
    for f in findings:
        by_sev[f["sev"]] = by_sev.get(f["sev"], 0) + 1
    score = sum(W[s] * n for s, n in by_sev.items())

    if args.json:
        print(json.dumps({"path": args.path, "counts": by_sev, "score": score,
                          "verdict": verdict(by_sev, score), "findings": findings}, indent=2))
        sys.exit(by_sev.get("high", 0))

    print(f"\n  landing audit: {args.path}")
    print(f"  findings: {len(findings)}   score: {score}   verdict: {verdict(by_sev, score)}")
    print(f"  high: {by_sev.get('high',0)}  medium: {by_sev.get('medium',0)}  low: {by_sev.get('low',0)}\n")
    by_rule = {}
    for f in findings:
        by_rule.setdefault(f["rule"], []).append(f)
    for rid in sorted(by_rule, key=lambda r: order[by_rule[r][0]["sev"]]):
        items = by_rule[rid]; f0 = items[0]
        print(f"  [{f0['sev'].upper()}] {f0['label']}  ({len(items)})")
        print(f"        fix: {f0['fix']}")
        for it in items[:8]:
            loc = f"{it['file']}:{it['line']}" if it['line'] else it['file']
            print(f"        {loc}  {it['snippet']}")
        if len(items) > 8:
            print(f"        ... +{len(items)-8} more")
        print()
    if not findings:
        print("  Nothing flagged by regex. Layout/taste still need eyes.\n")
    sys.exit(by_sev.get("high", 0))

if __name__ == "__main__":
    main()
