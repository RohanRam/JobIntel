import base64
from pathlib import Path

icon_path = Path("frontend/public/logo-icon.png")
if icon_path.exists():
    b64 = base64.b64encode(icon_path.read_bytes()).decode("utf-8")
    svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <image width="64" height="64" preserveAspectRatio="xMidYMid meet" href="data:image/png;base64,{b64}"/>
</svg>'''
    Path("frontend/public/favicon.svg").write_text(svg_content, encoding="utf-8")
    if Path("frontend/dist").exists():
        Path("frontend/dist/favicon.svg").write_text(svg_content, encoding="utf-8")
    print("Favicon SVG generated successfully.")

