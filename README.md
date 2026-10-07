# Char's Writing Studio

A calm, offline writing-practice app for an 8th grader: **pick a prompt → plan → write with live feedback → self-check**. Everything runs in the browser. There is no AI, no API and no account, and drafts stay on the device.

## Run
- `./run.sh start`, then open **http://127.0.0.1:4257**. The server runs under setsid nohup, with its pid in `data/server.pid`.
- Offline: open `dist/writing-studio-snapshot.html`. It's one 260 KB file with fonts, prompts and code inlined, and it works without a network.
- `./run.sh build | stop | restart | status | shots | test | all`

## Features
1. **Prompts:** 24 original prompts, 8 each of narrative, argumentative and expository. Each one is labelled "Original prompt"; none is copied from a test or book. There's also a free-write option and a "Try a sample essay" button that loads an original, deliberately imperfect sample.
2. **Planner (graphic organizers):**
   - Argumentative: hook → claim → 3 reason + evidence columns → counterclaim / response → conclusion.
   - Expository: thesis → 3 parts with facts and details → conclusion.
   - Narrative: characters / point of view, setting, and a 6-point **story arc**: exposition, conflict, rising action, climax, falling action, resolution. The points fill in as you plan.
   - "Copy plan into draft" adds the plan as starter notes, and a "My plan" card stays above the editor while you write.
3. **Editor with live, deterministic feedback** (`web/metrics.js`; pure functions, same text gives the same result):
   - **Paragraph structure:** the paragraph count against a target (5 for essays, 3 for stories), sentences per paragraph, one-sentence and over-long paragraphs, and whether the essay signals a conclusion. Dialogue lines and a one-line story opening are allowed.
   - **Sentence-variety meter (0–100):**
     - The meter is 50 × min(1, SD of sentence lengths ÷ 6) + 50 × the share of different first words.
     - It also shows a bar chart of sentence lengths, the short/medium/long mix, repeated openers, and opener types: subject, transition, "because/when" clause, phrase, -ly word, -ing word.
   - **Transition coverage:** 7 families (addition, contrast, cause, example, sequence, emphasis, conclusion). Phrases are matched longest first. It shows the count per 100 words and how many paragraphs open with a transition.
   - **Repeated-word highlighter:** flags content words of 4+ letters used 3+ times, or twice within 12 words. Plurals fold into the singular, and idioms like "face to face" are ignored.
   - **Passive-voice hints:** a be-verb, an optional adverb or "not", then a past participle (-ed or one of about 120 irregular forms), noting "by …" when it names the actor. Common adjectives like "excited" or "tired" are skipped unless "by" follows.
   - **Filler-word hints:** very, really, just, kind of, a lot, stuff, things, I think…
   - **Readability:** Flesch-Kincaid Grade Level and Flesch Reading Ease, with the formulas and citations shown in the app:
     - Grade = 0.39 × (words ÷ sentences) + 11.8 × (syllables ÷ words) − 15.59. Source: Kincaid, Fishburne, Rogers & Chissom (1975), *Derivation of new readability formulas … for Navy enlisted personnel*, Research Branch Report 8-75.
     - Ease = 206.835 − 1.015 × (words ÷ sentences) − 84.6 × (syllables ÷ words). Source: Flesch (1948), *A new readability yardstick*, Journal of Applied Psychology 32(3).
     - Overview: https://en.wikipedia.org/wiki/Flesch%E2%80%93Kincaid_readability_tests
     - Syllables are estimated with spelling rules plus a short exception list, so numbers can differ a little from other tools.
   - **Highlights:** toggle repeated words, passive voice, filler words, transitions and long sentences, drawn as a layer behind the text.
   - **Glow & grow** summary: strengths first, then up to 3 next steps.
   - Word goal bar, an optional timed-practice countdown, and focus mode, which hides the feedback.
4. **Self-check rubric:** a three-level checklist (Not yet / Getting there / Got it) for each mode. Each line is modeled on a **Common Core Grade 8** standard (W.8.1–W.8.5, L.8.3.a):
   - Tap a code to see the standard's verbatim text and source link: https://www.thecorestandards.org/ELA-Literacy/W/8/ and /L/8/ (retrieved 2026-10-07).
   - Lines that can be measured show a green note with what the checks found.
   - There's a check-in ring and a "next revision goal" box.
5. **Read it aloud:** browser speech synthesis reads the draft (or the selected text) one sentence at a time and highlights the sentence being read. Speed is adjustable from 0.8× to 1.25×, with a Stop button or Esc.
6. **Drafts:**
   - Drafts autosave to localStorage (`char-writing-studio-v1`), and Ctrl/⌘+S saves immediately.
   - You can switch drafts from the header and delete one after a confirmation.
   - **Export** .txt, .json (this draft, with stats) or all drafts as .json; **import** .json.

## Privacy
The app is standalone. It reads no tutoring data and no accounts, and it never sends anything over the network; the smoke test checks for network calls. Prompts and samples are generic and contain nothing personal.

## Tests
`python3 tests/smoke_test.py` runs 162 checks.
- Every metric in `web/metrics.js` runs under node (`tests/harness.js`) against **hand-computed examples**, with the arithmetic in the comments:
  - 101 hand-counted syllable words
  - readability on "The cat sat on the mat." (116.1), Wikipedia's platypus example (11.3 / 37.5), "Go. See. Stop. Rest." (−3.40 / 121.22) and a worked 12-word example
  - sentence and word splitting (Mr., 3.5, p.m.)
  - variety (lengths 2, 4, 8 give SD 2.494 and a meter of 37)
  - transitions (5 of 7 families, 23.81 per 100 words)
  - repeats, passive voice (5 expected hits and no false hits), fillers (6), and paragraph-structure scores
- Content: 24 prompts, every rubric line cites a stored standard, and the formulas are cited.
- The snapshot is self-contained and renders every view in headless Chrome.
- The server check runs if the server is up.

## Files
- `web/`:
  - `metrics.js`: the metrics
  - `content.js`: prompts, planners, rubric, standards, citations
  - `app.js`: the UI
  - `style.css`
  - `fonts/`: Literata, Atkinson Hyperlegible, Fraunces
- `render.py`: builds the snapshot; fonts are subset and instanced to WOFF.
- `server.py`: stdlib server, 127.0.0.1:4257
- `tests/`:
  - `smoke_test.py`, `harness.js`
  - `shots.py`: desktop 1440 px and tablet 820 × 1180 / 1180 × 820 screenshots, made from demo mode with the built-in samples; demo mode never saves.
- `screenshots/`
- `dist/`


---
## Repo notes
- **Built:** 2026-10-07, by TokenMax (Boyd's Grok Bot) on the Grok Bot box.
- **Run:** `./run.sh` (then open the localhost URL it prints).
- Imported from `/workspace/tokenmax/writing-studio` on Oct 23, 2026. node_modules, virtualenvs, logs and files over 20 MB were left out.
