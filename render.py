"""web/ -> dist/writing-studio-snapshot.html: one self-contained offline file (CSS, JS, content and subset fonts inlined)."""
import base64, os
HERE = os.path.dirname(os.path.abspath(__file__)); W = os.path.join(HERE, "web")
# (family, file, weight css, variable-axis pins)
FONTS = [("WS Serif", "Literata.ttf", "400", {"wght": 400, "opsz": 14}),
         ("WS Serif", "Literata-Italic.ttf", "400", {"wght": 400, "opsz": 14}, "italic"),
         ("WS UI", "AtkinsonHyperlegible-Regular.ttf", "400", None),
         ("WS UI", "AtkinsonHyperlegible-Bold.ttf", "700", None),
         ("WS Display", "Fraunces.ttf", "600", {"wght": 600, "opsz": 48, "SOFT": 50, "WONK": 0})]
UNI = list(range(0x20, 0x7F)) + list(range(0xA0, 0x180)) + [0x2013, 0x2014, 0x2018, 0x2019, 0x201C, 0x201D, 0x2022, 0x2026, 0x00B7, 0x2212, 0x00D7, 0x00F7, 0x2190, 0x2192, 0x25BC, 0x25A0, 0x2713, 0x270E, 0x273F, 0x279C, 0x2795, 0xFF0B, 0x2B07]

def font(spec):
    fam, fn, w, pins = spec[:4]
    src = os.path.join(W, "fonts", fn); out = src.replace(".ttf", ".subset.woff")
    if not os.path.exists(out) or os.path.getmtime(out) < os.path.getmtime(src):
        from fontTools.ttLib import TTFont
        from fontTools import subset
        f = TTFont(src)
        if pins and "fvar" in f:
            from fontTools.varLib import instancer
            axes = {a.axisTag for a in f["fvar"].axes}
            f = instancer.instantiateVariableFont(f, {k: v for k, v in pins.items() if k in axes})
        o = subset.Options(); o.flavor = "woff"; o.layout_features = ["kern", "liga", "calt", "onum", "lnum", "tnum"]
        s = subset.Subsetter(o); s.populate(unicodes=UNI); s.subset(f); f.flavor = "woff"; f.save(out)
    return base64.b64encode(open(out, "rb").read()).decode()

def page():
    ff = ""
    for spec in FONTS:
        style = spec[4] if len(spec) > 4 else "normal"
        ff += f"@font-face{{font-family:'{spec[0]}';src:url(data:font/woff;base64,{font(spec)}) format('woff');font-weight:{spec[2]};font-style:{style};font-display:swap}}\n"
    rd = lambda n: open(os.path.join(W, n)).read().replace("</script", "<\\/script")
    return f"""<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Char's Writing Studio</title><meta name="description" content="Calm, offline writing practice: prompts, planner, live rule-based feedback, self-check rubric.">
<style>{ff}{open(os.path.join(W, 'style.css')).read()}</style></head><body><div id="app"></div>
<script>{rd('content.js')}</script><script>{rd('metrics.js')}</script><script>{rd('app.js')}</script></body></html>"""

if __name__ == "__main__":
    out = os.path.join(HERE, "dist", "writing-studio-snapshot.html"); os.makedirs(os.path.dirname(out), exist_ok=True)
    html = page(); open(out + ".tmp", "w").write(html); os.replace(out + ".tmp", out); print(out, f"{len(html) / 1024:.0f} KB")
