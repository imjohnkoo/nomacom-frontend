#!/usr/bin/env python3
"""
이베리아 반도 지도 SVG 를 Natural Earth 데이터에서 생성한다.

왜 직접 만드나
--------------
기존 `iberia.svg` / `iberia-themed.svg` 는 Wikimedia Commons 의
`Iberian_Peninsula_location_map.svg` (NordNordWest 작) 파생물이고
**CC BY-SA 3.0 / GFDL 듀얼 — 둘 다 저작자 표시가 필수**다.
상세페이지에서 출처 줄을 빼려면 표시 의무가 없는 소스로 갈아타야 한다.

Natural Earth 는 **퍼블릭 도메인**이다 (naturalearthdata.com/about/terms-of-use):
  "All versions of Natural Earth raster + vector map data found on this
   website are in the public domain."
  "No permission is needed to use Natural Earth. Crediting the authors
   is unnecessary."
→ 상업적 이용·수정·재배포 모두 자유, 표시 의무 없음.

사용법
------
    # 원본 데이터 (13MB, 저장소에는 커밋하지 않는다)
    curl -sSL -o /tmp/ne.json \\
      https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_0_countries.geojson
    python3 build-iberia-map.py /tmp/ne.json

출력
----
  iberia-pd.svg        — 지도 (viewBox 는 기존과 동일한 1183×1015 비율 유지)
  city-pins.txt        — 도시 마커 left/top % (실좌표에서 계산)
"""

import json
import math
import sys
import pathlib

OUT = pathlib.Path(__file__).parent / "iberia-pd.svg"
PINS = pathlib.Path(__file__).parent / "city-pins.txt"

W, H = 1183.5554, 1015.8372  # 기존 SVG 와 동일 — 마커 % 좌표계·CSS aspect-ratio 유지

# 지도 범위 — 이베리아(경도 -9.5~3.3 / 위도 36~43.8)에 여백을 둔 값.
# 경도 폭을 고정하고, W/H 비율에 맞도록 위도 폭을 역산한다.
LON0, LON1 = -12.0, 5.5
LAT_C = 40.0
K = math.cos(math.radians(LAT_C))  # 경도 축소율 (equirectangular)
LAT_SPAN = (LON1 - LON0) * K / (W / H)
LAT0, LAT1 = LAT_C - LAT_SPAN / 2, LAT_C + LAT_SPAN / 2

FOCUS = {"Spain", "Portugal"}
CONTEXT = {"France", "Andorra", "Morocco", "Algeria", "Gibraltar", "Italy", "Switzerland"}

FILL_FOCUS = "#c7b6ff"  # --color-primary-200
FILL_CONTEXT = "#f5f5f5"  # --color-neutral-100
STROKE_FOCUS = "#a78bff"  # --color-primary-300
STROKE_CONTEXT = "#e5e5e5"  # --color-neutral-200


def project(lon, lat):
    x = (lon - LON0) / (LON1 - LON0) * W
    y = (LAT1 - lat) / (LAT1 - LAT0) * H
    return x, y


def rings(geom):
    t = geom["type"]
    if t == "Polygon":
        return geom["coordinates"]
    if t == "MultiPolygon":
        return [r for poly in geom["coordinates"] for r in poly]
    return []


def ring_visible(ring):
    """viewBox 밖 폴리곤(카나리아·아조레스·마데이라 등)은 버려 파일을 가볍게 유지."""
    lons = [c[0] for c in ring]
    lats = [c[1] for c in ring]
    return not (
        max(lons) < LON0 - 1 or min(lons) > LON1 + 1 or max(lats) < LAT0 - 1 or min(lats) > LAT1 + 1
    )


def path_d(ring):
    pts = []
    last = None
    for lon, lat in ring:
        x, y = project(lon, lat)
        # 0.1px 미만 이동은 버려 경로를 압축
        if last and abs(x - last[0]) < 0.1 and abs(y - last[1]) < 0.1:
            continue
        pts.append(f"{x:.1f},{y:.1f}")
        last = (x, y)
    if len(pts) < 3:
        return None
    return "M" + "L".join(pts) + "Z"


def main(src):
    data = json.load(open(src, encoding="utf-8"))
    layers = {"context": [], "focus": []}

    for feat in data["features"]:
        name = feat["properties"].get("NAME") or feat["properties"].get("name")
        if name in FOCUS:
            bucket = "focus"
        elif name in CONTEXT:
            bucket = "context"
        else:
            continue
        for ring in rings(feat["geometry"]):
            if not ring_visible(ring):
                continue
            d = path_d(ring)
            if d:
                layers[bucket].append(d)

    parts = [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W:.4f} {H:.4f}" '
        f'width="{W:.4f}" height="{H:.4f}" role="img" '
        f'aria-label="이베리아 반도 지도 — 스페인·포르투갈">',
        "<!-- Source: Natural Earth (naturalearthdata.com) — public domain, no attribution required. -->",
        f'<g fill="{FILL_CONTEXT}" stroke="{STROKE_CONTEXT}" stroke-width="1" '
        'stroke-linejoin="round">',
    ]
    parts += [f'<path d="{d}"/>' for d in layers["context"]]
    parts.append("</g>")
    parts.append(
        f'<g fill="{FILL_FOCUS}" stroke="{STROKE_FOCUS}" stroke-width="1.4" '
        'stroke-linejoin="round">'
    )
    parts += [f'<path d="{d}"/>' for d in layers["focus"]]
    parts.append("</g></svg>")

    OUT.write_text("\n".join(parts), encoding="utf-8")

    cities = {
        "마드리드": (40.4168, -3.7038),
        "바르셀로나": (41.3874, 2.1686),
        "세비야": (37.3891, -5.9845),
        "발렌시아": (39.4699, -0.3763),
        "그라나다": (37.1773, -3.5986),
        "말라가": (36.7213, -4.4214),
        "리스본": (38.7223, -9.1393),
        "포르투": (41.1579, -8.6291),
    }
    lines = [f"# {LON0:.3f}..{LON1:.3f} lon / {LAT0}..{LAT1} lat"]
    for nm, (lat, lon) in cities.items():
        x, y = project(lon, lat)
        lines.append(f"{nm}\tleft: {x / W * 100:.1f}%\ttop: {y / H * 100:.1f}%")
    PINS.write_text("\n".join(lines) + "\n", encoding="utf-8")

    print(f"{OUT.name}  {OUT.stat().st_size / 1024:.0f}KB  "
          f"focus {len(layers['focus'])} / context {len(layers['context'])} paths")
    print("\n".join(lines))


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "/tmp/ne.json")
