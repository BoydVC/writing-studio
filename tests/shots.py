"""Screenshots of the offline snapshot (demo mode: built-in original sample drafts, nothing saved) -> screenshots/. One Chrome at a time."""
import os, subprocess, sys, tempfile
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SNAP = "file://" + os.path.join(HERE, "dist", "writing-studio-snapshot.html")
DESK, TAB, TABL = "1440,1000", "820,1180", "1180,820"
SHOTS = [("01-desktop-write-feedback", "demo=write&mode=argumentative", DESK, 1600),
         ("02-desktop-prompts", "demo=prompts", DESK, 1000),
         ("03-desktop-plan-argument", "demo=plan&mode=argumentative", DESK, 1000),
         ("04-desktop-plan-story-arc", "demo=plan&mode=narrative", DESK, 1000),
         ("05-desktop-self-check", "demo=check&mode=argumentative", DESK, 1000),
         ("06-desktop-write-narrative-all-highlights", "demo=write&mode=narrative&hl=all", DESK, 1000),
         ("07-tablet-write", "demo=write&mode=expository", TAB, 1900),
         ("08-tablet-plan", "demo=plan&mode=argumentative", TAB, 1180),
         ("09-tablet-check", "demo=check&mode=expository", TAB, 1180),
         ("10-tablet-landscape-write", "demo=write&mode=argumentative", TABL, 820)]
def shot(name, q, size, h=None):
    out = os.path.join(HERE, "screenshots", name + ".png"); w = size.split(",")[0]
    with tempfile.TemporaryDirectory() as prof:
        subprocess.run(["nice", "-n", "10", "google-chrome", "--headless=new", "--no-sandbox", "--disable-gpu", "--hide-scrollbars", "--mute-audio", f"--user-data-dir={prof}",
                        f"--window-size={w},{h or size.split(',')[1]}", "--virtual-time-budget=2000", f"--screenshot={out}", f"{SNAP}?{q}"], capture_output=True, timeout=120)
    print(("ok  " if os.path.exists(out) else "MISSING ") + out)
if __name__ == "__main__":
    os.makedirs(os.path.join(HERE, "screenshots"), exist_ok=True)
    only = sys.argv[1:]
    for n, q, s, h in SHOTS:
        if not only or any(n.startswith(o) for o in only): shot(n, q, s, h)
