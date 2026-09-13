#!/usr/bin/env python3
"""
sections/01~15 을 하나의 상세페이지(full-page.html)로 이어붙인다.

각 섹션 파일에서
  - <style> 블록 (섹션 전용 CSS)
  - <div class="canvas"> 안쪽 (실제 섹션 마크업)
만 뽑아 하나의 canvas 에 쌓는다. dev-toolbar / export.js 는 제외.

상대경로는 sections/ 기준이므로 ../assets → assets, ../shared → shared 로 보정.

섹션을 고친 뒤 다시 돌리면 된다:
    python3 build-full-page.py
"""

import re
import pathlib

BASE = pathlib.Path(__file__).parent
SECTIONS = sorted((BASE / "sections").glob("[0-9][0-9]-*.html"))
OUT = BASE / "full-page.html"

STYLE_RE = re.compile(r"<style>(.*?)</style>", re.S)
TOOLBAR_RE = re.compile(r'<div class="dev-toolbar">.*?</button>\s*</div>', re.S)


def extract(path: pathlib.Path):
    raw = path.read_text(encoding="utf-8")

    styles = "\n".join(m.group(1).strip() for m in STYLE_RE.finditer(raw))

    start_tag = '<div class="canvas">'
    i = raw.index(start_tag) + len(start_tag)
    j = raw.index('<script src="../shared/export.js">')
    body = raw[i:j].rstrip()
    body = body[: body.rindex("</div>")]  # canvas 닫는 태그 제거

    body = TOOLBAR_RE.sub("", body)
    body = body.replace("../assets/", "assets/").replace("../shared/", "shared/")

    title = re.search(r"<title>(.*?)</title>", raw).group(1)
    name = title.split("·")[1].strip() if "·" in title else path.stem
    return path.stem, name, styles, body


parts = [extract(p) for p in SECTIONS]

# 앵커 id 는 "s" 를 붙인다 — 숫자로 시작하는 id 는 유효한 CSS 선택자가 아니라
# querySelector('#03-plan-picker') 가 터진다 (href 프래그먼트는 되지만 스크립트가 못 쓴다).
nav = "\n".join(
    f'        <a href="#s{slug}">{slug.split("-")[0]} {name}</a>' for slug, name, _, _ in parts
)
css = "\n\n".join(f"/* ===== {slug} ===== */\n{s}" for slug, _, s, _ in parts if s)
html = "\n".join(
    f'\n      <!-- ================= {slug} ================= -->\n'
    f'      <div id="s{slug}" class="fp-anchor"></div>\n{body}'
    for slug, _, _, body in parts
)

OUT.write_text(
    f"""<!doctype html>
<html lang="ko">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>ESIMmany 남유럽 상세페이지 — 전체 미리보기</title>
    <link
      rel="stylesheet"
      href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
    />
    <link rel="stylesheet" href="shared/tokens.css" />
    <link rel="stylesheet" href="shared/base.css" />
    <style>
      /* ---- 미리보기 크롬 (상세페이지 본체 아님) ---- */
      .fp-bar {{
        position: sticky;
        top: 0;
        z-index: 200;
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px 14px;
        background: rgba(23, 23, 23, 0.95);
        backdrop-filter: blur(8px);
        color: #fff;
        font-size: 12px;
        overflow-x: auto;
        white-space: nowrap;
      }}
      .fp-bar__t {{
        font-weight: 800;
        letter-spacing: 0.02em;
        flex: none;
        padding-right: 6px;
        border-right: 1px solid rgba(255, 255, 255, 0.22);
      }}
      .fp-bar a {{
        color: rgba(255, 255, 255, 0.66);
        text-decoration: none;
        padding: 3px 7px;
        border-radius: 5px;
        flex: none;
      }}
      .fp-bar a:hover {{
        color: #fff;
        background: rgba(255, 255, 255, 0.12);
      }}
      .fp-anchor {{
        scroll-margin-top: 44px;
      }}
      /* 이어붙인 canvas — 섹션 사이 간격 없이 한 장으로 */
      .canvas {{
        margin: 0 auto 40px;
        border-radius: 0;
      }}
      @media print {{
        .fp-bar {{
          display: none;
        }}
      }}

{css}
    </style>
  </head>
  <body>
    <nav class="fp-bar">
      <span class="fp-bar__t">남유럽 상세페이지 · 전체 미리보기</span>
{nav}
    </nav>

    <div class="canvas">
{html}
    </div>
  </body>
</html>
""",
    encoding="utf-8",
)

print(f"{OUT.name} 생성 — 섹션 {len(parts)}개")
for slug, name, _, _ in parts:
    print(f"  · {slug}  {name}")
