(function () {
'use strict';
const C = window.WS_CONTENT, STD = window.WS_STANDARDS, CITE = window.WS_CITES, M = window.WSMetrics;
const LS = 'char-writing-studio-v1';
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const Q = new URLSearchParams(location.search); const DEMO = Q.get('demo');
const app = $('#app');

// ---------------- state
function blank() { return { view: 'prompts', filter: 'all', drafts: [], cur: null, hl: { rep: true, pas: true, fil: true, tr: false, long: false }, goal: 350, focus: false, rate: 1, peek: true }; }
let S = load() || blank();
function load() { if (DEMO) return null; try { const x = JSON.parse(localStorage.getItem(LS)); return x && x.drafts ? Object.assign(blank(), x) : null; } catch (e) { return null; } }
let saveT = 0, lastSaved = 0;
function save(now) { if (DEMO) return; clearTimeout(saveT); const f = () => { try { localStorage.setItem(LS, JSON.stringify(S)); lastSaved = Date.now(); const el = $('#saved'); if (el) el.textContent = 'Saved on this device ✓'; } catch (e) { toast('Could not save: storage is full or blocked'); } }; now ? f() : (saveT = setTimeout(f, 400)); }
const cur = () => S.drafts.find(d => d.id === S.cur) || null;
const promptById = id => C.prompts.find(p => p.id === id);
function newDraft(mode, promptId, title, text) {
  const p = promptById(promptId);
  const d = { id: 'd' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), mode, promptId: promptId || null, title: title || (p ? p.title : 'Free write'), text: text || '', plan: {}, rubric: {}, goal: '', created: new Date().toISOString(), updated: new Date().toISOString() };
  S.drafts.unshift(d); S.cur = d.id; save(true); return d;
}
function touch(d) { d.updated = new Date().toISOString(); save(); }

// ---------------- rendering
function render() {
  document.body.classList.toggle('focus', !!S.focus && S.view === 'write');
  const d = cur();
  app.innerHTML = top(d) + `<main>${({ prompts: vPrompts, plan: vPlan, write: vWrite, check: vCheck })[S.view](d)}</main>` +
    `<div class="foot">Char's Writing Studio · works offline · drafts stay on this device · feedback is rule-based (no AI) · prompts are original</div>`;
  if (S.view === 'write') mountEditor(d);
}
function top(d) {
  const st = [['prompts', 'Prompt'], ['plan', 'Plan'], ['write', 'Write'], ['check', 'Self-check']];
  return `<div class="top"><div class="leaf">✎</div><div class="logo">Char's Writing Studio<small>calm practice · plan, write, check</small></div>
  <nav class="steps">${st.map(([k, n], i) => `<button data-view="${k}" class="${S.view === k ? 'on' : ''}"><b>${i + 1}</b>${n}</button>`).join('')}</nav><span class="sp"></span>
  <div class="draftsel">${S.drafts.length ? `<select id="dsel" aria-label="Current draft">${S.drafts.map(x => `<option value="${x.id}" ${x.id === S.cur ? 'selected' : ''}>${esc(x.title)} · ${M.words(x.text).length}w</option>`).join('')}</select>` : ''}
  <button class="btn" data-act="new">＋ New</button></div></div>`;
}
function modeColor(m) { return C.modes[m] ? C.modes[m].color : '#888'; }

function vPrompts(d) {
  const f = S.filter; const list = C.prompts.filter(p => f === 'all' || p.mode === f);
  return `<h1>Pick a prompt</h1><p class="lede">Choose a narrative, argumentative or expository prompt. Every prompt here is original, written for this studio. Plan first, then write. The feedback panel is a coach, not a grade.</p>
  <div class="pgrid"><div><div class="tabs">${[['all', 'All 24']].concat(Object.entries(C.modes).map(([k, m]) => [k, m.name])).map(([k, n]) => `<button data-filter="${k}" class="${f === k ? 'on' : ''}">${n}</button>`).join('')}</div>
  <div class="prompts">${list.map(p => `<div class="card prompt" style="--mc:${modeColor(p.mode)}"><div class="meta"><span class="mode-dot"></span><span class="pill">${C.modes[p.mode].name}</span><span class="pill orig">Original prompt</span></div>
    <h3>${esc(p.title)}</h3><p>${esc(p.text)}</p><button class="btn pri go" data-start="${p.id}">Start: plan it →</button></div>`).join('')}
    <div class="card prompt" style="--mc:#aaa"><div class="meta"><span class="pill">Your topic</span></div><h3>Free write</h3><p>Write about anything: a journal entry, a practice paragraph, or a topic from class.</p>
    <div style="display:flex;gap:6px;flex-wrap:wrap">${Object.entries(C.modes).map(([k, m]) => `<button class="btn" data-free="${k}">${m.name}</button>`).join('')}</div></div></div></div>
  <aside class="side"><h2>My drafts</h2>${S.drafts.length ? `<div class="dlist">${S.drafts.map(x => `<div class="ditem ${x.id === S.cur ? 'cur' : ''}" data-open="${x.id}"><span class="mode-dot" style="--mc:${modeColor(x.mode)}"></span><div><div class="t">${esc(x.title)}</div><div class="s">${C.modes[x.mode].name} · ${M.words(x.text).length} words · ${ago(x.updated)}</div></div><button class="x" title="Delete draft" data-del="${x.id}">×</button></div>`).join('')}</div>`
    : `<p class="empty">No drafts yet. Pick a prompt to start, or try a sample to see how the feedback works.</p>`}
    <div style="margin-top:12px;display:flex;gap:6px;flex-wrap:wrap"><button class="btn" data-sample="argumentative">Try a sample essay</button><label class="btn" style="cursor:pointer">Import .json<input type="file" id="imp" accept=".json,application/json" hidden></label></div>
    <div class="card tipbox"><b>Calm tip:</b> Good writers revise. A first draft only needs to exist. You can make it clear later.</div></aside></div>`;
}
function ago(iso) { const s = (Date.now() - new Date(iso)) / 1000; if (s < 60) return 'just now'; if (s < 3600) return Math.round(s / 60) + ' min ago'; if (s < 86400) return Math.round(s / 3600) + ' h ago'; return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }); }
function needDraft() { return `<div class="card" style="max-width:560px"><h2>No draft open</h2><p class="lede">Pick a prompt first, or start a free write.</p><button class="btn pri" data-view="prompts">Choose a prompt →</button></div>`; }
function banner(d) {
  const p = promptById(d.promptId);
  return `<div class="banner"><div style="flex:1"><div class="meta" style="display:flex;gap:6px;margin-bottom:4px"><span class="pill" style="background:${modeColor(d.mode)}22;color:${modeColor(d.mode)}">${C.modes[d.mode].name}</span>${p ? '<span class="pill orig">Original prompt</span>' : '<span class="pill">Free write</span>'}</div>
  <input class="title" id="dtitle" value="${esc(d.title)}" aria-label="Draft title"><div class="q">${p ? esc(p.text) : esc(C.modes[d.mode].blurb)}</div></div></div>`;
}

function field(d, f, extra = '') { return `<div class="f ${f.big ? 'big' : ''}" ${extra}><label>${f.arc != null ? `<b>${f.arc + 1}</b>` : ''}${esc(f.label)}${f.hint ? `<span>${esc(f.hint)}</span>` : ''}</label><textarea data-plan="${f.key}" rows="2">${esc(d.plan[f.key] || '')}</textarea></div>`; }
function vPlan(d) {
  if (!d) return needDraft();
  const P = C.planners[d.mode]; const F = k => P.find(x => x.key === k);
  let body;
  if (d.mode === 'argumentative') body = `${field(d, F('hook'))}${field(d, F('claim'))}<div class="arrow">▼ supported by ▼</div>
    <div class="argrid">${[1, 2, 3].map(i => `<div class="col">${field(d, F('r' + i))}${field(d, F('e' + i))}</div>`).join('')}</div>
    <div class="row2">${field(d, F('counter'))}${field(d, F('rebut'))}</div>${field(d, F('close'))}`;
  else if (d.mode === 'expository') body = `${field(d, F('hook'))}${field(d, F('thesis'))}<div class="arrow">▼ explained in ▼</div>
    <div class="argrid exp">${[1, 2, 3].map(i => `<div class="col">${field(d, F('s' + i))}${field(d, F('d' + i))}</div>`).join('')}</div>${field(d, F('close'))}`;
  else body = `<div class="row2">${field(d, F('who'))}${field(d, F('where'))}</div><div class="card arc" style="padding:8px 12px">${arcSvg(d)}</div>
    <div class="arcgrid">${P.filter(f => f.arc != null).map(f => field(d, f)).join('')}</div>`;
  const filled = P.filter(f => (d.plan[f.key] || '').trim()).length;
  return banner(d) + `<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px"><h2>Graphic organizer</h2><span class="pill">${filled}/${P.length} boxes</span><span class="sp"></span>
    <button class="btn" data-act="plan2draft" title="Adds your plan as starter notes at the top of the draft">Copy plan into draft</button><button class="btn pri" data-view="write">Start writing →</button></div>
    <div class="card plan">${body}</div>`;
}
function arcSvg(d) {
  const pts = [[30, 118], [170, 98], [330, 62], [470, 20], [610, 78], [770, 116]]; const P = C.planners.narrative.filter(f => f.arc != null);
  const path = 'M10,128 L30,120 C100,115 130,104 170,98 S290,72 330,62 S440,22 470,18 S560,58 610,78 S720,112 750,118 L790,124';
  return `<svg viewBox="0 0 800 150" preserveAspectRatio="xMidYMid meet" aria-label="Story arc"><path d="${path}" fill="none" stroke="#c8794a" stroke-width="3" stroke-linecap="round"/>
    ${pts.map(([x, y], i) => { const done = (d.plan[P[i].key] || '').trim(); return `<circle cx="${x}" cy="${y}" r="9" fill="${done ? '#c8794a' : '#fff'}" stroke="#c8794a" stroke-width="2.5"/><text x="${x}" y="${y + 4}" text-anchor="middle" font-size="11" font-weight="700" fill="${done ? '#fff' : '#c8794a'}">${i + 1}</text><text x="${x}" y="${Math.min(y + 27, 146)}" text-anchor="${i === 0 ? 'start' : i === 5 ? 'end' : 'middle'}" font-size="13" fill="#5d6468">${esc(P[i].label.split(' (')[0])}</text>`; }).join('')}</svg>`;
}

// ---------------- write view
function vWrite(d) {
  if (!d) return needDraft();
  const P = C.planners[d.mode]; const planned = P.filter(f => (d.plan[f.key] || '').trim());
  const H = [['rep', 'Repeated words', '#e0a64a'], ['pas', 'Passive voice', '#7c9cc8'], ['fil', 'Filler words', '#cf8a8a'], ['tr', 'Transitions', '#7fb07e'], ['long', 'Long sentences', '#b9a3d8']];
  const tts = 'speechSynthesis' in window;
  return banner(d) + `<div class="wgrid"><div>
   ${S.peek && planned.length ? `<div class="card peek"><div style="display:flex;align-items:center;margin-bottom:6px"><h3>My plan</h3><span class="sp"></span><button class="btn ghost" data-act="peek">Hide</button></div><dl>${planned.map(f => `<dt>${esc(f.label)}</dt><dd>${esc(d.plan[f.key])}</dd>`).join('')}</dl></div>` : ''}
   <div class="tools"><div class="grp">${H.map(([k, n, c]) => `<button class="hl ${S.hl[k] ? 'on' : 'off'}" data-hl="${k}"><i style="background:${c}"></i>${n}</button>`).join('')}</div>
   <div class="grp"><button class="btn" data-act="speak" ${tts ? '' : 'disabled title="Speech is not available in this browser"'}>🔊 Read it aloud</button><button class="btn" data-act="stop" id="stopbtn" hidden>■ Stop</button>
    <select id="rate" class="btn" aria-label="Reading speed">${[0.8, 0.9, 1, 1.1, 1.25].map(r => `<option value="${r}" ${S.rate == r ? 'selected' : ''}>${r}×</option>`).join('')}</select></div>
   <div class="grp"><button class="btn ${S.focus ? 'on' : ''}" data-act="focus">${S.focus ? 'Show feedback' : 'Focus mode'}</button>${!S.peek && planned.length ? '<button class="btn" data-act="peek">Show plan</button>' : ''}</div></div>
   <div class="paper"><div class="lines"></div><div class="ed"><div class="back" id="back"></div><textarea id="ta" spellcheck="true" placeholder="Start writing here. Press Enter to begin a new paragraph." aria-label="Draft">${esc(d.text)}</textarea></div></div>
   <div class="wstat"><span id="wc"></span><div class="goal" title="Word goal"><i id="goalbar"></i></div><label>Goal <select id="goalsel" class="btn" style="padding:3px 6px">${[150, 250, 350, 500, 750].map(g => `<option ${S.goal == g ? 'selected' : ''}>${g}</option>`).join('')}</select> words</label>
    <span class="timer" id="tmr"></span>${TM.end ? '<button class="btn ghost" data-act="timer">Stop timer</button>' : `<select id="tmsel" class="btn" aria-label="Timed practice"><option value="">⏱ Timed practice</option>${[10, 15, 20, 25, 30, 40].map(m => `<option value="${m}">${m} minutes</option>`).join('')}</select>`}<span class="sp"></span><span class="saved" id="saved">${DEMO ? 'Demo · not saved' : 'Saved on this device ✓'}</span></div>
  </div><div class="fb" id="fb"></div></div>`;
}

let anT = 0, A = null;
function mountEditor(d) {
  const ta = $('#ta'); if (!ta) return;
  const grow = () => { ta.style.height = 'auto'; ta.style.height = Math.max(520, ta.scrollHeight) + 'px'; };
  ta.addEventListener('input', () => { d.text = ta.value; touch(d); grow(); const s = $('#saved'); if (s && !DEMO) s.textContent = 'Saving…'; clearTimeout(anT); anT = setTimeout(() => analyzeNow(d), 220); });
  grow(); analyzeNow(d);
  if (!DEMO && !d.text) ta.focus();
}
function analyzeNow(d) {
  A = M.analyze(d.text, d.mode);
  paintBack(d.text); paintFeedback(d); paintCount(d);
}
function paintCount(d) {
  const n = A.readability.words; const g = +S.goal || 350;
  $('#wc').innerHTML = `<b>${n}</b> words · ${A.readability.sentences} sentences · ${A.structure.paragraphs.length} paragraphs`;
  $('#goalbar').style.width = Math.min(100, n / g * 100) + '%';
}
function ranges(text) {
  const R = [];
  if (S.hl.rep) A.repeats.marks.forEach(m => R.push([m.start, m.end, 'm-rep']));
  if (S.hl.pas) A.passive.hits.forEach(m => R.push([m.start, m.end, 'm-pas']));
  if (S.hl.fil) A.fillers.hits.forEach(m => R.push([m.start, m.end, 'm-fil']));
  if (S.hl.tr) A.transitions.found.forEach(m => R.push([m.start, m.end, 'm-tr']));
  if (S.hl.long) M.sentences(text).filter(s => s.words.length > 25).forEach(s => R.push([s.start, s.end, 'm-long']));
  if (SPK.range) R.push([SPK.range[0], SPK.range[1], 'm-speak']);
  return R;
}
function paintBack(text) {
  const R = ranges(text); const cuts = new Set([0, text.length]); R.forEach(([a, b]) => { cuts.add(a); cuts.add(b); });
  const pts = [...cuts].sort((a, b) => a - b); let html = '';
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1]; const cls = R.filter(r => r[0] <= a && r[1] >= b).map(r => r[2]);
    const seg = esc(text.slice(a, b)); html += cls.length ? `<mark class="${[...new Set(cls)].join(' ')}">${seg}</mark>` : seg;
  }
  $('#back').innerHTML = html + '\n ';
}

function fmt(n, d = 1) { return n == null ? '–' : (Math.round(n * 10 ** d) / 10 ** d).toFixed(d); }
function paintFeedback(d) {
  const el = $('#fb'); if (!el) return;
  const R = A.readability, V = A.variety, T = A.transitions, P = A.structure, RP = A.repeats, PS = A.passive, FL = A.fillers;
  if (R.words < 12) { el.innerHTML = `<div class="card wide"><h3>Coach</h3><p class="empty">Write a few sentences and feedback will appear here as you go. Everything is checked on this device by simple, consistent rules, the same way every time.</p></div>`; return; }
  const glows = [], grows = [];
  P.notes.forEach(n => (n.kind === 'glow' ? glows : grows).push(n.msg));
  if (V.sd >= 5) glows.push(`Nice mix of sentence lengths (${V.min}–${V.max} words).`); else if (V.count >= 4) grows.push('Your sentences are similar in length. Add one short, punchy sentence or combine two short ones.');
  if (V.topOpener && V.topOpener.count >= 3 && V.topOpener.count / V.count > 0.3) grows.push(`${V.topOpener.count} sentences start with "${cap(V.topOpener.word)}". Try starting one with a phrase like "After lunch," or "Because…".`);
  else if (V.count >= 4) glows.push('Your sentence openers are varied.');
  if (T.categoriesUsed.length >= 3) glows.push(`Transitions from ${T.categoriesUsed.length} different families connect your ideas.`); else grows.push(d.mode === 'narrative' ? 'Add time transitions ("Later," "Meanwhile," "By the time…") to move the story along.' : 'Add transitions ("For example," "However," "As a result,") so the reader can follow your thinking.');
  if (RP.overused.length) grows.push(`"${RP.overused[0].word}" appears ${RP.overused[0].count} times. Could a synonym or pronoun help?`);
  if (FL.per100 > 3) grows.push(`A few filler words (${Object.keys(FL.counts).slice(0, 3).map(x => '"' + x + '"').join(', ')}) could be cut or replaced with stronger words.`);
  if (PS.count && PS.count / Math.max(1, R.sentences) > 0.25) grows.push('Several sentences may be passive. Try naming who does the action.');
  const cards = [];
  cards.push(`<div class="card wide"><h3>Glow &amp; grow</h3>${glows.slice(0, 3).map(g => `<div class="glow">${esc(g)}</div>`).join('') || '<div class="empty">Keep going. Strengths will show up here.</div>'}${grows.slice(0, 3).map(g => `<div class="grow">${esc(g)}</div>`).join('')}</div>`);
  cards.push(`<div class="card"><h3>Paragraphs<span class="sc">${P.paragraphs.length} of ~${P.target}</span></h3><div class="paras">${P.paragraphs.map((p, i) => `<i class="${p.sentences < 2 || p.sentences > 9 ? 'w' : ''}" style="height:${Math.min(60, 14 + p.words / 3)}px" title="Paragraph ${i + 1}: ${p.sentences} sentences, ${p.words} words">${p.sentences}</i>`).join('')}</div>
    <div class="meter-l"><span>numbers = sentences per paragraph</span></div>${P.notes.filter(n => n.kind === 'grow').slice(0, 2).map(n => `<div class="grow">${esc(n.msg)}</div>`).join('')}</div>`);
  const tmax = Math.max(...V.lengths, 1);
  cards.push(`<div class="card"><h3>Sentence variety<span class="sc">${V.score}/100</span></h3><div class="meter"><i style="left:${V.score}%"></i></div><div class="meter-l"><span>all alike</span><span>nicely varied</span></div>
    <div class="bars" title="Each bar is one sentence, height = word count">${V.lengths.map(l => `<i class="${l < 8 ? 's' : l > 20 ? 'l' : ''}" style="height:${l / tmax * 100}%"></i>`).join('')}</div>
    <div class="kv"><span>Length spread</span><b>${V.min}–${V.max} words · avg ${fmt(V.mean)} · SD ${fmt(V.sd)}</b><span>Mix</span><b>${V.short} short · ${V.medium} medium · ${V.long} long</b><span>Openers</span><b>${Math.round(V.uniqueOpenerRatio * 100)}% different first words</b></div>
    <div class="chips">${Object.entries(V.types).map(([k, n]) => `<span class="chip">${({ subject: 'subject first', transition: 'transition', clause: 'because/when…', phrase: 'phrase (In…, At…)', adverb: '-ly word', verbal: '-ing word' })[k]} ${n}</span>`).join('')}${V.topOpener && V.topOpener.count >= 3 ? `<span class="chip warn">"${esc(cap(V.topOpener.word))}" ×${V.topOpener.count}</span>` : ''}</div></div>`);
  cards.push(`<div class="card"><h3>Transitions<span class="sc">${T.categoriesUsed.length}/${Object.keys(M.TRANSITIONS).length} families</span></h3>
    <div class="chips">${Object.keys(M.TRANSITIONS).map(c => `<span class="chip ${T.byCat[c] ? 'hit' : ''}" title="${esc(M.TRANSITIONS[c].slice(0, 6).join(', '))}">${c}${T.byCat[c] ? ' ×' + T.byCat[c] : ''}</span>`).join('')}</div>
    <div class="kv" style="margin-top:8px"><span>Found</span><b>${T.count} (${fmt(T.per100)} per 100 words)</b><span>Paragraph starts</span><b>${T.paragraphsOpenedWithTransition} of ${T.laterParagraphs} later paragraphs open with one</b></div>
    ${T.categoriesUsed.length < 4 ? `<div class="grow">Try one from: ${Object.keys(M.TRANSITIONS).filter(c => !T.byCat[c]).slice(0, 2).map(c => `<i>${c}</i> ("${M.TRANSITIONS[c][0]}", "${M.TRANSITIONS[c][1]}")`).join(' or ')}.</div>` : ''}</div>`);
  cards.push(`<div class="card"><h3>Repeated words<span class="sc">${RP.overused.length} words</span></h3>${RP.overused.length ? `<div class="chips">${RP.overused.slice(0, 10).map(o => `<span class="chip warn">${esc(o.word)} ×${o.count}</span>`).join('')}</div>` : '<div class="glow">No word is overused. Nice word choice!</div>'}
    <div class="meter-l" style="margin-top:6px"><span>Highlighted: a word (4+ letters) used 3+ times, or twice within 12 words. Names and key topic words are often fine to repeat.</span></div></div>`);
  cards.push(`<div class="card"><h3>Voice &amp; filler hints<span class="sc">${PS.count + FL.count} hints</span></h3>
    ${PS.count ? `<div style="font-size:13.5px;margin-bottom:4px"><b>Possible passive voice</b> (${PS.count}):</div><div class="chips">${PS.hits.slice(0, 6).map(h => `<span class="chip" style="background:#d7e3f3">${esc(h.phrase)}${h.byAgent ? ' by…' : ''}</span>`).join('')}</div><div class="meter-l" style="margin:4px 0 8px"><span>Passive isn't wrong (L.8.3.a), but active voice usually sounds stronger: "The team built it" instead of "It was built by the team."</span></div>` : '<div class="glow">No passive voice spotted.</div>'}
    ${FL.count ? `<div style="font-size:13.5px;margin-bottom:4px"><b>Filler / weak words</b> (${FL.count}):</div><div class="chips">${Object.entries(FL.counts).map(([w, n]) => `<span class="chip" style="background:#f2d6d6">${esc(w)}${n > 1 ? ' ×' + n : ''}</span>`).join('')}</div>` : '<div class="glow">No filler words. Every word is pulling its weight.</div>'}</div>`);
  cards.push(`<div class="card wide"><h3>Readability</h3><div class="read"><div><div class="big">${fmt(R.fkgl)}</div><small>Flesch-Kincaid grade level</small></div><div><div class="big">${fmt(R.fre, 0)}</div><small>Flesch reading ease (0–100+)</small></div>
    <div class="kv" style="margin-left:auto"><span>Words/sentence</span><b>${fmt(R.wps)}</b><span>Syllables/word</span><b>${fmt(R.spw, 2)}</b></div></div>
    <div class="meter-l"><span>${readNote(R)}</span></div>
    <details><summary>How it's calculated (formulas &amp; sources)</summary><div class="formula">${esc(CITE.fkgl.formula)}</div><div>${esc(CITE.fkgl.cite)}</div><div class="formula">${esc(CITE.fre.formula)}</div><div>${esc(CITE.fre.cite)}</div>
    <div style="margin-top:6px">Counts here: ${R.words} words, ${R.sentences} sentences, ${R.syllables} syllables. ${esc(CITE.note)} Overview: <a href="${CITE.overview}" target="_blank" rel="noopener">Wikipedia: Flesch–Kincaid readability tests</a></div></details></div>`);
  el.innerHTML = cards.join('');
}
function readNote(R) { if (R.fkgl == null) return ''; if (R.fkgl < 5) return 'Very simple sentences. For an essay, try combining a few ideas with "because," "although" or "which."'; if (R.fkgl <= 10) return 'Clear and readable. A comfortable range for an 8th-grade essay.'; return 'Long sentences or long words are making this harder to read. Is there a sentence you could split?'; }
const cap = s => s ? s[0].toUpperCase() + s.slice(1) : s;

// ---------------- read aloud (browser speech synthesis, sentence by sentence with highlight)
const SPK = { on: false, range: null, q: [] };
function speak(d) {
  if (!('speechSynthesis' in window)) return toast('Read-aloud is not available in this browser.');
  const ta = $('#ta'); const sel = ta && ta.selectionStart !== ta.selectionEnd ? [ta.selectionStart, ta.selectionEnd] : null;
  let ss = M.sentences(d.text); if (sel) ss = ss.filter(s => s.end > sel[0] && s.start < sel[1]);
  if (!ss.length) return toast('Nothing to read yet.');
  speechSynthesis.cancel(); SPK.on = true; SPK.q = ss.slice(); $('#stopbtn').hidden = false; next();
  function next() {
    const s = SPK.q.shift(); if (!s || !SPK.on) return stopSpeak();
    SPK.range = [s.start, s.end]; paintBack(d.text);
    const u = new SpeechSynthesisUtterance(s.text); u.rate = +S.rate || 1; u.lang = 'en-US';
    const v = speechSynthesis.getVoices().find(v => /en[-_]US/i.test(v.lang)); if (v) u.voice = v;
    u.onend = next; u.onerror = stopSpeak; speechSynthesis.speak(u);
  }
}
function stopSpeak() { SPK.on = false; SPK.range = null; try { speechSynthesis.cancel(); } catch (e) {} const b = $('#stopbtn'); if (b) b.hidden = true; const d = cur(); if (d && $('#back')) paintBack(d.text); }

// ---------------- timer
const TM = { end: 0, iv: 0 };
function timerToggle(m) {
  if (TM.end || !m) { TM.end = 0; clearInterval(TM.iv); render(); return; }
  TM.end = Date.now() + m * 60000; render(); tick(); TM.iv = setInterval(tick, 1000);
  function tick() { const el = $('#tmr'); const left = Math.max(0, TM.end - Date.now()); if (el) el.textContent = `⏱ ${Math.floor(left / 60000)}:${String(Math.floor(left / 1000) % 60).padStart(2, '0')} left`; if (!left) { clearInterval(TM.iv); TM.end = 0; toast('Time! Take a breath, then reread your last paragraph.'); render(); } }
}

// ---------------- self-check
function vCheck(d) {
  if (!d) return needDraft();
  const items = C.rubric[d.mode]; A = M.analyze(d.text, d.mode);
  const pts = items.reduce((a, it) => a + (d.rubric[it.id] || 0), 0), max = items.length * 2; const pct = max ? pts / max : 0;
  return banner(d) + `<div class="cgrid"><div class="card"><div style="display:flex;align-items:center;gap:10px;margin-bottom:4px"><h2>Self-check rubric</h2><span class="sp"></span><span class="pill">${C.modes[d.mode].name}</span></div>
   <p class="lede" style="margin:4px 0 6px;font-size:14.5px">Be honest and kind with yourself. For each line choose <b>Not yet</b>, <b>Getting there</b> or <b>Got it</b>. Each line is modeled on a Common Core Grade 8 standard (tap the code to read it). Green notes show what the studio's rule-based checks noticed.</p>
   ${items.map(it => `<div class="ritem"><div><div class="area">${esc(it.area)} <span class="pill std" data-std="${it.std}" title="${esc(STD.text[it.std])}">CCSS ${it.std}</span></div><div class="txt">${esc(it.text)}</div></div>
     <div class="tri">${['Not yet', 'Getting there', 'Got it'].map((n, v) => `<button class="${(d.rubric[it.id] ?? -1) === v ? 'on n' + v : ''}" data-rub="${it.id}" data-v="${v}">${n}</button>`).join('')}</div>
     ${it.auto ? `<div class="auto">Studio noticed: ${esc(autoNote(it.auto, d))}</div>` : ''}
     ${OPENSTD.has(it.id) ? `<div class="stdtext">CCSS.ELA-Literacy.${it.std}: “${esc(STD.text[it.std])}” <a href="${STD.urls[it.std[0]]}" target="_blank" rel="noopener">source</a></div>` : ''}</div>`).join('')}
   <div class="meter-l" style="margin-top:10px"><span>Standards text: ${esc(STD.source)}, ${STD.urls.W} and ${STD.urls.L} (retrieved ${STD.retrieved}). Checklist wording is original.</span></div></div>
   <aside class="fb"><div class="card center"><h3 style="justify-content:center">Check-in</h3>${ring(pct)}<div style="color:var(--ink2);font-size:14px">${Object.keys(d.rubric).length}/${items.length} lines rated</div></div>
    <div class="card goalbox"><h3>My next revision goal</h3><textarea id="rgoal" placeholder="One thing I will improve in my next draft…">${esc(d.goal || '')}</textarea></div>
    <div class="card"><h3>Save &amp; export</h3><p style="font-size:13.5px;color:var(--ink2);margin:0 0 8px">Drafts save automatically on this device. Export a copy to keep or share with a teacher.</p>
    <div class="exports"><button class="btn" data-act="txt">⬇ .txt</button><button class="btn" data-act="json">⬇ .json (this draft)</button><button class="btn" data-act="alljson">⬇ All drafts</button></div></div></aside></div>`;
}
const OPENSTD = new Set();
function autoNote(kind, d) {
  const T = A.transitions, P = A.structure, V = A.variety, F = A.fillers, PS = A.passive;
  if (!A.readability.words) return 'no text yet.';
  if (kind === 'transitions') return `${T.count} transitions from ${T.categoriesUsed.length} families (${T.categoriesUsed.join(', ') || 'none yet'}).`;
  if (kind === 'structure') { const n = P.paragraphs.length; const c = P.notes.find(x => x.key === 'concl'); return `${n} paragraph${n === 1 ? '' : 's'}${d.mode !== 'narrative' && c ? (c.kind === 'glow' ? '; the last one signals a conclusion' : '; no conclusion signal found yet') : ''}.`; }
  if (kind === 'variety') return `sentences run ${V.min}–${V.max} words; ${Math.round(V.uniqueOpenerRatio * 100)}% of openers are different (meter ${V.score}/100).`;
  if (kind === 'fillers') return F.count ? `${F.count} filler/weak word${F.count === 1 ? '' : 's'} (${Object.keys(F.counts).join(', ')}).` : 'no filler words found.';
  if (kind === 'passive') return PS.count ? `${PS.count} possible passive phrase${PS.count === 1 ? '' : 's'} (${PS.hits.slice(0, 3).map(h => '“' + h.phrase + '”').join(', ')}).` : 'no passive voice spotted.';
  return '';
}
function ring(p) { const r = 60, c = 2 * Math.PI * r; return `<svg class="ring" viewBox="0 0 150 150"><circle cx="75" cy="75" r="${r}" fill="none" stroke="#efe8da" stroke-width="14"/><circle cx="75" cy="75" r="${r}" fill="none" stroke="#6c9a6a" stroke-width="14" stroke-linecap="round" stroke-dasharray="${c * p} ${c}" transform="rotate(-90 75 75)"/><text x="75" y="83" text-anchor="middle" font-family="WS Display, Georgia" font-size="30" font-weight="600" fill="#2f3437">${Math.round(p * 100)}%</text></svg>`; }

// ---------------- export / import
function download(name, mime, body) { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([body], { type: mime })); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500); }
const slug = s => (s || 'draft').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'draft';
function exportTxt(d) { const p = promptById(d.promptId); download(slug(d.title) + '.txt', 'text/plain', `${d.title}\n${C.modes[d.mode].name}${p ? ' · Prompt: ' + p.text : ''}\n${'-'.repeat(40)}\n\n${d.text}\n`); }
function exportJson(list, name) { const R = list.map(d => ({ ...d, stats: (a => ({ words: a.readability.words, sentences: a.readability.sentences, fkgl: a.readability.fkgl, fre: a.readability.fre, varietyScore: a.variety.score, transitionFamilies: a.transitions.categoriesUsed.length }))(M.analyze(d.text, d.mode)) })); download(name, 'application/json', JSON.stringify({ app: "Char's Writing Studio", version: 1, exported: new Date().toISOString(), drafts: R }, null, 2)); }
function importJson(file) {
  const r = new FileReader(); r.onload = () => { try { const j = JSON.parse(r.result); const list = (j.drafts || [j]).filter(x => x && typeof x.text === 'string' && C.modes[x.mode]); let n = 0;
    list.forEach(x => { const id = S.drafts.some(d => d.id === x.id) ? x.id + '-imp' + Date.now().toString(36) : (x.id || 'd' + Date.now().toString(36) + n); delete x.stats; S.drafts.unshift({ plan: {}, rubric: {}, goal: '', ...x, id }); n++; });
    if (n) { S.cur = S.drafts[0].id; save(true); render(); toast(`Imported ${n} draft${n > 1 ? 's' : ''}`); } else toast('No drafts found in that file'); } catch (e) { toast('That file is not a Writing Studio .json'); } }; r.readAsText(file);
}
function toast(msg) { const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg; document.body.appendChild(t); setTimeout(() => t.remove(), 2600); }

// ---------------- events
document.addEventListener('click', e => {
  const t = e.target.closest('[data-view],[data-act],[data-filter],[data-start],[data-free],[data-open],[data-del],[data-sample],[data-hl],[data-rub],[data-std]'); if (!t) return;
  const d = cur();
  if (t.dataset.del) { e.stopPropagation(); const x = S.drafts.find(y => y.id === t.dataset.del); if (x && confirm(`Delete "${x.title}" from this device? (Export it first if you want a copy.)`)) { S.drafts = S.drafts.filter(y => y !== x); if (S.cur === x.id) S.cur = S.drafts[0] ? S.drafts[0].id : null; save(true); render(); } return; }
  if (t.dataset.view) { stopSpeak(); S.view = t.dataset.view; save(); render(); scrollTo(0, 0); return; }
  if (t.dataset.filter) { S.filter = t.dataset.filter; save(); render(); return; }
  if (t.dataset.start) { const p = promptById(t.dataset.start); newDraft(p.mode, p.id); S.view = 'plan'; save(); render(); return; }
  if (t.dataset.free) { newDraft(t.dataset.free, null, 'Free write · ' + C.modes[t.dataset.free].name); S.view = 'write'; save(); render(); return; }
  if (t.dataset.open) { S.cur = t.dataset.open; S.view = 'write'; save(); render(); return; }
  if (t.dataset.sample) { const s = C.samples[t.dataset.sample]; const p = promptById(s.promptId); newDraft(p.mode, p.id, s.title, s.text); S.view = 'write'; save(); render(); return; }
  if (t.dataset.hl) { S.hl[t.dataset.hl] = !S.hl[t.dataset.hl]; save(); t.classList.toggle('on'); t.classList.toggle('off'); if (d) paintBack(d.text); return; }
  if (t.dataset.rub) { const v = +t.dataset.v; if (d.rubric[t.dataset.rub] === v) delete d.rubric[t.dataset.rub]; else d.rubric[t.dataset.rub] = v; touch(d); render(); return; }
  if (t.dataset.std) { const id = t.closest('.ritem').querySelector('[data-rub]').dataset.rub; OPENSTD.has(id) ? OPENSTD.delete(id) : OPENSTD.add(id); render(); return; }
  const a = t.dataset.act;
  if (a === 'new') { S.view = 'prompts'; render(); return; }
  if (a === 'speak') return speak(d);
  if (a === 'stop') return stopSpeak();
  if (a === 'focus') { S.focus = !S.focus; save(); render(); return; }
  if (a === 'peek') { S.peek = !S.peek; save(); render(); return; }
  if (a === 'timer') return timerToggle(0);
  if (a === 'txt') return exportTxt(d);
  if (a === 'json') return exportJson([d], slug(d.title) + '.json');
  if (a === 'alljson') return exportJson(S.drafts, 'writing-studio-drafts.json');
  if (a === 'plan2draft') {
    const P = C.planners[d.mode].filter(f => (d.plan[f.key] || '').trim()); if (!P.length) return toast('Fill in a box or two first.');
    const notes = P.map(f => `[${f.label}] ${d.plan[f.key].trim()}`).join('\n');
    d.text = notes + '\n\n' + d.text; touch(d); S.view = 'write'; render(); toast('Plan copied as notes. Turn each note into sentences, then delete the brackets.'); return;
  }
});
document.addEventListener('input', e => {
  const d = cur(); const t = e.target;
  if (t.dataset.plan && d) { d.plan[t.dataset.plan] = t.value; touch(d); if (d.mode === 'narrative') { const a = $('.arc'); if (a) a.innerHTML = arcSvg(d); } return; }
  if (t.id === 'dtitle' && d) { d.title = t.value || 'Untitled'; touch(d); const o = $('#dsel option:checked'); if (o) o.textContent = d.title; return; }
  if (t.id === 'rgoal' && d) { d.goal = t.value; touch(d); }
});
document.addEventListener('change', e => {
  const t = e.target;
  if (t.id === 'dsel') { S.cur = t.value; save(); render(); }
  if (t.id === 'rate') { S.rate = +t.value; save(); }
  if (t.id === 'tmsel' && t.value) timerToggle(+t.value);
  if (t.id === 'goalsel') { S.goal = +t.value; save(); const d = cur(); if (d && A) paintCount(d); }
  if (t.id === 'imp' && t.files[0]) importJson(t.files[0]);
});
document.addEventListener('keydown', e => { if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); save(true); toast('Saved on this device'); } if (e.key === 'Escape' && SPK.on) stopSpeak(); });
window.addEventListener('beforeunload', () => save(true));

// ---------------- demo mode (screenshots / tests only; never touches saved drafts)
if (DEMO) {
  document.body.classList.add('demo');
  const mode = Q.get('mode') || 'argumentative'; const s = C.samples[mode]; const p = promptById(s.promptId);
  S = blank(); S.goal = 250;
  const d = { id: 'demo', mode, promptId: p.id, title: s.title, text: s.text, plan: {}, rubric: {}, goal: '', created: new Date().toISOString(), updated: new Date().toISOString() };
  if (mode === 'argumentative') Object.assign(d.plan, { hook: 'Imagine a classroom where every student is listening.', claim: 'Schools should lock phones away for the whole school day.', r1: 'Phones distract students during lessons.', e1: 'A buzz pulls attention away, even when the phone is silent.', r2: 'Students connect better face to face.', e2: 'New students get invited to sit with groups at lunch.', counter: 'Students need phones for emergencies.', rebut: 'Office phones and trained teachers handle emergencies.', close: 'Focus, friendship and safety: lock the phones away.' });
  if (mode === 'narrative') Object.assign(d.plan, { who: 'First person: an older sibling', where: 'Home during a thunderstorm at night: rain on windows, candle smell', start: 'A normal evening of screens', conflict: 'The power goes out and the little brother is scared', rise: 'Find candles; a deck of cards missing a queen; invent a game', climax: 'The game becomes the best part of the night' });
  if (mode === 'expository') Object.assign(d.plan, { thesis: 'Preparing in stages makes a big test manageable.', s1: 'Weeks before: make a calendar', s2: 'The night before: review lightly, pack, sleep', s3: 'The day of: breakfast, arrive early, skip hard questions' });
  if (Q.get('demo') === 'check') { const ids = C.rubric[mode].map(x => x.id); [2, 2, 1, 2, 2, 1, 2, 1].forEach((v, i) => ids[i] && (d.rubric[ids[i]] = v)); d.goal = 'Replace "very" and "students" repeats; add one more piece of evidence for reason 2.'; OPENSTD.add(ids[0]); }
  S.drafts = [d, { ...d, id: 'demo2', title: 'Free write · Narrative', mode: 'narrative', promptId: null, text: C.samples.narrative.text, updated: new Date(Date.now() - 86400000).toISOString() }]; S.cur = 'demo';
  S.view = ({ prompts: 'prompts', plan: 'plan', write: 'write', check: 'check' })[Q.get('demo')] || 'write';
  if (Q.get('hl') === 'all') S.hl = { rep: true, pas: true, fil: true, tr: true, long: false };
}
render();
window.WS = { state: () => S, analyze: () => A, render };
})();
