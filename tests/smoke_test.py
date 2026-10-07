"""Smoke + unit tests for Char's Writing Studio.  Run: python3 tests/smoke_test.py   (exit 1 on any failure)
Each metric in web/metrics.js is checked against examples whose answers were worked out BY HAND (shown in comments),
plus the published examples on Wikipedia's Flesch-Kincaid page."""
import json, os, re, subprocess, sys, tempfile, urllib.request
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FAILS, N = [], [0]
def check(ok, msg):
    N[0] += 1
    if not ok: FAILS.append(msg)
def near(a, b, tol=0.01): return a is not None and abs(a - b) <= tol

def run(calls):
    r = subprocess.run(["node", os.path.join(HERE, "tests", "harness.js")], input=json.dumps(calls), capture_output=True, text=True, timeout=60)
    if r.returncode: print(r.stderr); sys.exit(1)
    res = json.loads(r.stdout)
    for c, x in zip(calls, res):
        if not x["ok"]: FAILS.append(f"{c[0]} threw: {x['err']}")
    return [x.get("v") for x in res]

# ---------------- syllables: 101 common words, hand-counted
SYL = {"cat":1,"the":1,"a":1,"make":1,"hope":1,"table":2,"little":2,"whale":1,"smile":1,"smiles":1,"makes":1,"boxes":2,"wishes":2,"races":2,"tables":2,"jumped":1,"smiled":1,"played":1,
"wanted":2,"decided":3,"lonely":2,"careful":2,"statement":2,"going":2,"seeing":2,"radio":3,"video":3,"nation":2,"vision":2,"social":2,"region":2,"curious":3,"delicious":3,"actual":3,
"equal":2,"language":2,"argue":2,"true":1,"continue":3,"beyond":2,"player":2,"yellow":2,"beautiful":3,"reading":2,"different":3,"happy":2,"family":3,"important":3,"because":2,
"school":1,"friend":1,"through":1,"water":2,"however":3,"therefore":2,"example":3,"conclusion":3,"evidence":3,"paragraph":3,"sentence":2,"believe":2,"people":2,"students":2,
"homework":2,"library":3,"phone":1,"phones":1,"adventure":3,"decision":3,"opinion":3,"writing":2,"written":2,"mountain":2,"music":2,"animal":3,"government":3,"environment":4,
"technology":4,"education":4,"community":4,"responsible":4,"suddenly":3,"finally":3,"quickly":2,"afternoon":3,"something":2,"question":2,"quiet":2,"science":2,"period":3,
"violin":3,"geography":4,"theory":3,"previous":3,"platypus":3,"australian":4,"seemingly":3,"hybrid":2,"mammal":2,"reptilian":4,"creature":2}
got = run([["syllables", w] for w in SYL])
for (w, n), g in zip(SYL.items(), got): check(g == n, f"syllables('{w}') = {g}, hand count {n}")
check(run([["syllables", "1969"], ["syllables", "don't"], ["syllables", "Char's"]]) == [1, 1, 1], "syllables: number token = 1, contraction, possessive")

# ---------------- readability
r = run([["readability", "The cat sat on the mat."], ["flesch", 13, 1, 24], ["readability", "Go. See. Stop. Rest."],
         ["readability", "My dog likes to run. She runs very fast at the park."], ["readability", ""]])
# "The cat sat on the mat.": 6 words, 1 sentence, 6 syllables -> FKGL .39*6 + 11.8*1 - 15.59 = -1.45 ; FRE 206.835 - 6.09 - 84.6 = 116.145 (Wikipedia: "scores 116")
check((r[0]["words"], r[0]["sentences"], r[0]["syllables"]) == (6, 1, 6), "cat/mat counts 6/1/6")
check(near(r[0]["fkgl"], -1.45) and near(r[0]["fre"], 116.145), f"cat/mat FKGL -1.45, FRE 116.145 (got {r[0]['fkgl']}, {r[0]['fre']})")
# Wikipedia's platypus sentence: 13 words, 24 syllables -> grade 11.3, ease 37.5
check(near(r[1]["fkgl"], 11.2646) and round(r[1]["fkgl"], 1) == 11.3 and round(r[1]["fre"], 1) == 37.5, "formula matches Wikipedia platypus example (11.3 / 37.5)")
# "Go. See. Stop. Rest.": 4 words, 4 sentences, 4 syllables -> FKGL .39 + 11.8 - 15.59 = -3.40 (the theoretical minimum); FRE 206.835 - 1.015 - 84.6 = 121.22 (the maximum)
check(near(r[2]["fkgl"], -3.40) and near(r[2]["fre"], 121.22), "Go/See/Stop/Rest = -3.40 and 121.22 (Wikipedia's min/max)")
# 12 words, 2 sentences, 13 syllables (very=2) -> FKGL .39*6 + 11.8*13/12 - 15.59 = -0.4667 ; FRE 206.835 - 6.09 - 91.65 = 109.095
check((r[3]["words"], r[3]["sentences"], r[3]["syllables"]) == (12, 2, 13) and near(r[3]["fkgl"], -0.4667, .001) and near(r[3]["fre"], 109.095, .001), f"dog/park example (got {r[3]})")
check(r[4]["fkgl"] is None and r[4]["words"] == 0, "empty text has no score (no divide-by-zero)")

# ---------------- sentences / words / paragraphs
s = run([["sentences", 'Mr. Lee arrived at 3.5 p.m. on Friday! Was it late? "Yes," she said.'], ["sentences", "One two three\nFour five."],
         ["words", "don't well-known 3.5 p.m. U.S. Robert H. Goddard"], ["paragraphs", "A.\n\n\nB.\nC."]])
check([x["text"] for x in s[0]] == ["Mr. Lee arrived at 3.5 p.m. on Friday!", "Was it late?", '"Yes," she said.'], f"sentence split keeps Mr./3.5/p.m. together (got {[x['text'] for x in s[0]]})")
check(len(s[1]) == 2, "a line break ends a sentence/paragraph even without a period")
check([w["word"] for w in s[2]] == ["don't", "well-known", "3.5", "p.m.", "U.S.", "Robert", "H", "Goddard"], f"word tokens (got {[w['word'] for w in s[2]]})")
check([p["text"] for p in s[3]] == ["A.", "B.", "C."], "paragraphs split on line breaks, blank lines ignored")

# ---------------- sentence variety
v = run([["variety", "I ran. I ran far today. I ran very far down the long road."],
         ["variety", "Because it rained, we stayed inside. Quietly, the cat slept. Running late, Sam missed the bus. In the morning, we read. However, the bell rang. The end came."]])
a = v[0]
# lengths 2, 4, 8 -> mean 14/3 = 4.667 ; population SD = sqrt(((2-4.667)^2+(4-4.667)^2+(8-4.667)^2)/3) = sqrt(6.222) = 2.494
# openers i,i,i -> unique ratio 1/3 ; meter = round(50*min(1, 2.494/6) + 50*(1/3)) = round(20.79 + 16.67) = 37
check(a["lengths"] == [2, 4, 8] and near(a["mean"], 4.6667, .001) and near(a["sd"], 2.4944, .001), f"variety lengths/mean/SD (got {a['lengths']}, {a['mean']}, {a['sd']})")
check(near(a["uniqueOpenerRatio"], 1 / 3, .001) and a["topOpener"] == {"word": "i", "count": 3} and a["repeatsInARow"] == [1, 2], "opener variety + repeated openers")
check(a["score"] == 37 and (a["short"], a["medium"], a["long"]) == (2, 1, 0), f"variety meter = 37, mix 2/1/0 (got {a['score']})")
check(v[1]["types"] == {"clause": 1, "adverb": 1, "verbal": 1, "phrase": 1, "transition": 1, "subject": 1}, f"opener types (got {v[1]['types']})")
check(v[1]["topOpener"] is None and v[1]["uniqueOpenerRatio"] == 1, "all-different openers")

# ---------------- transitions
t = run([["transitions", "First, we planned. However, it rained. For example, the field flooded. As a result, we stayed home. In conclusion, plans change."],
         ["transitions", "Intro here.\nHowever, body.\nThe end."]])
x = t[0]
# hand: first=sequence, however=contrast, for example=example, as a result=cause, in conclusion=conclusion -> 5 found, 5 of 7 families; 21 words -> 23.81 per 100
check(x["count"] == 5 and sorted(x["categoriesUsed"]) == ["cause", "conclusion", "contrast", "example", "sequence"], f"transition families (got {x['categoriesUsed']}, {x['count']})")
check(near(x["coverage"], 5 / 7, .001) and near(x["per100"], 23.8095, .001), f"coverage 5/7 and 23.81 per 100 words (got {x['coverage']}, {x['per100']})")
check([f["phrase"] for f in x["found"]] == ["first", "however", "for example", "as a result", "in conclusion"], "longest-phrase matching, in text order, no double count")
check(t[1]["laterParagraphs"] == 2 and t[1]["paragraphsOpenedWithTransition"] == 1, "1 of 2 later paragraphs opens with a transition")

# ---------------- repeated words
rp = run([["repeats", "The garden was quiet. My garden has roses and tomatoes. Gardens need water, and the garden needs sun."], ["repeats", "We talked face to face."]])
# garden x4 (Gardens folds into garden) -> overused ; need/needs are 5 words apart -> close repeat ; marks = 4 garden + 2 need
check(rp[0]["overused"] == [{"word": "garden", "count": 4}], f"overused word (got {rp[0]['overused']})")
check(sorted({c["word"] for c in rp[0]["close"]}) == ["garden", "need"] and len(rp[0]["marks"]) == 6, f"close repeats + highlight marks (got {len(rp[0]['marks'])})")
check(rp[1]["close"] == [] and rp[1]["overused"] == [], "idiom 'face to face' is not flagged")

# ---------------- passive voice
p = run([["passive", "The window was broken by the storm. The cake is being eaten. She was excited. The team was surprised by the score. They are not invited. Mistakes were made."],
         ["passive", "He is tired. The red car is fast. We need help. She walked home."]])
check([h["phrase"] for h in p[0]["hits"]] == ["was broken", "is being eaten", "was surprised", "are not invited", "were made"], f"passive hits (got {[h['phrase'] for h in p[0]['hits']]})")
check(p[0]["hits"][0]["byAgent"] and not p[0]["hits"][4]["byAgent"], "'by ...' agent detection")
check(p[1]["count"] == 0, f"no false passive on adjectives/active verbs (got {p[1]['hits']})")

# ---------------- fillers
f = run([["fillers", "I think it is really very good. It was kind of fun and a lot of stuff happened."], ["fillers", "The experiment proved the hypothesis."]])
# i think, really, very, kind of, a lot, stuff = 6 ; 18 words -> 33.33 per 100
check(f[0]["count"] == 6 and f[0]["counts"] == {"i think": 1, "really": 1, "very": 1, "kind of": 1, "a lot": 1, "stuff": 1}, f"fillers (got {f[0]['counts']})")
check(near(f[0]["per100"], 33.333, .01) and f[1]["count"] == 0, "filler density + clean sentence")

# ---------------- paragraph structure
para = "This is a sentence. Here is another one. And a third one here."
good = "\n".join([para] * 4 + ["In conclusion, this works. It really does. The end is here."])
st = run([["structure", good, "argumentative"], ["structure", "Only one.\nTwo here.", "argumentative"], ["structure", "It began.\n\"Run!\" she yelled.\nThen we ran. It was fast. We made it.", "narrative"]])
check(st[0]["score"] == 100 and {n["key"] for n in st[0]["notes"]} == {"count", "concl"} and all(n["kind"] == "glow" for n in st[0]["notes"]), f"5-paragraph essay with conclusion = 100 (got {st[0]['score']}, {st[0]['notes']})")
# 2 paragraphs x 1 sentence: score = round(100 * 2/5 * (0.5 + 0.5*0/2)) = 20 ; notes: few + thin x2
check(st[1]["score"] == 20 and [n["key"] for n in st[1]["notes"]] == ["few", "thin", "thin"], f"thin essay (got {st[1]['score']}, {[n['key'] for n in st[1]['notes']]})")
check([n["key"] for n in st[2]["notes"]] == ["count"], f"narrative: dialogue line and 1-sentence opening are fine (got {[n['key'] for n in st[2]['notes']]})")

# ---------------- content: prompts, rubric, citations
js = open(os.path.join(HERE, "web", "content.js")).read()
mods = re.findall(r"\{ id: '([nae]\d)', mode: '(\w+)'", js)
check(len(mods) == 24 and all(sum(1 for _, m in mods if m == k) == 8 for k in ("narrative", "argumentative", "expository")), "24 original prompts, 8 per mode")
check("ORIGINAL, written for this app" in js, "prompts declared original in source")
stds = set(re.findall(r"'([WL]\.8\.\d(?:\.[a-f])?)': '", js)); used = set(re.findall(r"std: '([^']+)'", js))
check(used and used <= stds, f"every rubric line cites a stored CCSS standard (missing: {used - stds})")
check(all(k in js for k in ("thecorestandards.org/ELA-Literacy/W/8/", "thecorestandards.org/ELA-Literacy/L/8/", "Research Branch Report 8-75", "Journal of Applied Psychology, 32(3)", "0.39 × (words ÷ sentences) + 11.8 × (syllables ÷ words) − 15.59")), "standard URLs + readability formulas cited")
for fn in ("metrics.js", "app.js", "content.js"):
    src = open(os.path.join(HERE, "web", fn)).read()
    check(not re.search(r"\bfetch\(|XMLHttpRequest|WebSocket|sendBeacon|https?://(?!www\.thecorestandards|en\.wikipedia)", src), f"{fn}: no network calls / external URLs (offline, no AI/API)")

# ---------------- snapshot: self-contained and renders
snap = os.path.join(HERE, "dist", "writing-studio-snapshot.html")
check(os.path.exists(snap), "snapshot exists")
html = open(snap).read() if os.path.exists(snap) else ""
check(not re.search(r'<(script|link|img)[^>]+(src|href)=["\']https?://', html) and "@import" not in html, "snapshot loads nothing from the network")
check(html.count("data:font/woff;base64,") == 5, "fonts inlined")
PRIVATE = ["Millersville", "tutor", "Boyd", "Miranda", "HSPT score"]
check(not any(w.lower() in re.sub(r"<style>.*?</style>", "", html, flags=re.S).lower() for w in PRIVATE), "no family/tutoring data in the app")
def dom(q, size="1440,1000"):
    with tempfile.TemporaryDirectory() as prof:
        out = subprocess.run(["nice", "-n", "10", "google-chrome", "--headless=new", "--no-sandbox", "--disable-gpu", "--mute-audio", f"--user-data-dir={prof}", f"--window-size={size}",
                               "--virtual-time-budget=2000", "--dump-dom", f"file://{snap}?{q}"], capture_output=True, text=True, timeout=120).stdout
    return re.sub(r"<script>.*?</script>", "", out, flags=re.S)   # judge only what was rendered, not the inline source
d = dom("demo=write&mode=argumentative")
for k in ("Glow &amp; grow", "Sentence variety", "Transitions", "Repeated words", "Voice &amp; filler hints", "Readability", "Flesch-Kincaid grade level", "Read it aloud", "Research Branch Report 8-75", 'class="m-rep"', 'class="m-pas"', 'class="m-fil"'):
    check(k in d, f"write view renders: {k}")
d = dom(""); check("Pick a prompt" in d and "No drafts yet" in d, "fresh start (no demo, empty storage) opens the prompt picker")
d = dom("demo=prompts"); n = d.count('class="pill orig">Original prompt'); check(n == 24, f"prompt cards labelled original (got {n})")
d = dom("demo=plan&mode=narrative"); check('aria-label="Story arc"' in d and len(re.findall(r'data-plan="[a-z]+\d?"', d)) == 8, "narrative planner: story arc + 8 boxes")
d = dom("demo=plan&mode=argumentative"); check(len(re.findall(r'data-plan="[a-z]+\d?"', d)) == 11 and "My claim" in d and "Counterclaim" in d, "argument planner: claim/reasons/evidence/counterclaim")
d = dom("demo=check&mode=argumentative"); check(len(re.findall(r'data-rub="[a-z]+\d"', d)) == 27 and "CCSS W.8.1.a" in d and "Studio noticed" in d and "Introduce claim(s)" in d, "self-check rubric renders with standards")

try:
    body = urllib.request.urlopen("http://127.0.0.1:4257/healthz", timeout=3).read(); check(b'"ok"' in body, "server /healthz")
    check(b"Char's Writing Studio" in urllib.request.urlopen("http://127.0.0.1:4257/", timeout=5).read(), "server serves the app")
except OSError:
    print("(server not running on 4257; skipped server checks)")

print(f"{N[0] - len(FAILS)}/{N[0]} checks passed")
for x in FAILS[:50]: print("  FAIL", x)
sys.exit(1 if FAILS else 0)
