"""
Bundle the site into single files (CSS and JS inlined).

  python tools/build_single.py

Writes:
  dist/portfolio-standalone.html  – one self-contained file you can email or open offline
                                    (keep assets/resume.pdf next to it for the resume button)
  dist/artifact-body.html         – same page without <html>/<head>/<body> wrappers,
                                    for hosts that add their own document skeleton
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / "dist"
DIST.mkdir(exist_ok=True)

html = (ROOT / "index.html").read_text(encoding="utf-8")

def inline_css(m):
    css = (ROOT / m.group(1)).read_text(encoding="utf-8")
    return f"<style>\n{css}\n</style>"

def inline_js(m):
    js = (ROOT / m.group(1)).read_text(encoding="utf-8").replace("</script", "<\\/script")
    return f"<script>\n{js}\n</script>"

html = re.sub(r'<link rel="stylesheet" href="(css/[^"]+)">', inline_css, html)
html = re.sub(r'<script src="(js/[^"]+)"></script>', inline_js, html)
(DIST / "portfolio-standalone.html").write_text(html, encoding="utf-8")

head = re.search(r"<head>(.*?)</head>", html, re.S).group(1)
body = re.search(r"<body>(.*?)</body>", html, re.S).group(1)
head = re.sub(r'\s*<meta charset="utf-8">', "", head)
head = re.sub(r'\s*<meta name="viewport"[^>]*>', "", head)
head = re.sub(r"<title>.*?</title>", "<title>Ajeet Sharma Portfolio</title>", head, count=1)
body = body.replace(' rel="noopener" download>', ' rel="noopener">')   # hosted viewers open the PDF in a new tab instead
(DIST / "artifact-body.html").write_text(head.strip() + "\n" + body.strip() + "\n", encoding="utf-8")
print("built", [p.name for p in DIST.iterdir()])
