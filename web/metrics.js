/* Char's Writing Studio: deterministic writing metrics (no AI, no network).
   Every function is pure: same text in, same numbers out. Unit-tested by tests/smoke_test.py via node. */
(function (root) {
'use strict';

// ---------- tokenizing
const ABBR = ['mr', 'mrs', 'ms', 'dr', 'st', 'jr', 'sr', 'vs', 'etc', 'e.g', 'i.e', 'u.s', 'a.m', 'p.m', 'mt', 'prof'];
const WORD_RE = /(?:[A-Za-z]\.){2,}|\d+(?:[.,:]\d+)*(?:-[A-Za-z0-9]+)*|[A-Za-z]+(?:['’][A-Za-z]+)*(?:-[A-Za-z0-9]+)*/g;  // p.m., 3.5, don't, well-known

function paragraphs(text) {
  // a paragraph = a run of text separated by one or more line breaks (students often press Enter once)
  const out = []; let pos = 0;
  for (const raw of String(text).split(/\n/)) {
    const start = pos; pos += raw.length + 1;
    if (raw.trim()) out.push({ text: raw, start, end: start + raw.length });
  }
  return out;
}

function sentences(text) {
  // split each paragraph on . ! ? (plus closing quotes/brackets), but not after common abbreviations, single initials or inside numbers like 3.5
  const out = [];
  for (const p of paragraphs(text)) {
    const t = p.text; let s = 0;
    const re = /[.!?]+["'”’)\]]*(?=\s|$)/g; let m;
    while ((m = re.exec(t))) {
      const before = t.slice(s, m.index); const lastTok = (before.match(/([A-Za-z.]+)$/) || [''])[0].toLowerCase();
      if (m[0][0] === '.' && m[0].length === 1 && (ABBR.includes(lastTok.replace(/\.$/, '')) || /^[a-z]$/i.test(lastTok))) continue;
      const end = m.index + m[0].length; const seg = t.slice(s, end);
      if (seg.trim()) out.push(mk(seg, p.start + s));
      s = end;
    }
    if (t.slice(s).trim()) out.push(mk(t.slice(s), p.start + s));
  }
  return out;
  function mk(seg, off) { const lead = seg.length - seg.trimStart().length; const txt = seg.trim(); return { text: txt, start: off + lead, end: off + lead + txt.length, words: words(txt).map(w => w.word) }; }
}

function words(text) {
  const out = []; let m; WORD_RE.lastIndex = 0;
  while ((m = WORD_RE.exec(text))) out.push({ word: m[0], start: m.index, end: m.index + m[0].length });
  return out;
}

// ---------- syllables (rule-based estimate + small exception list; documented in README)
const SYL_EXC = { people: 2, idea: 3, ideas: 3, area: 3, areas: 3, create: 2, created: 3, creates: 2, creating: 3, creative: 3, simile: 3, recipe: 3, apostrophe: 4,
  every: 3, everything: 4, business: 2, different: 3, science: 2, quiet: 2, poem: 2, poems: 2, poet: 2, being: 2, lion: 2, giant: 2, real: 1, really: 2,
  cafe: 2, maybe: 2, someone: 2, sometimes: 2, something: 2, somewhere: 2, anyone: 3, everyone: 3, therefore: 2, homework: 2, somebody: 3, wherever: 3, whenever: 3, forever: 3, likewise: 2, hopeful: 2, inspire: 2, fire: 1, hour: 1, our: 1, video: 3, piano: 3 };
function syllables(word) {
  let w = String(word).toLowerCase().replace(/['’]s$/, '').replace(/[^a-z]/g, '');
  if (!w) return /\d/.test(word) ? 1 : 0;              // a number token counts as 1 syllable
  if (SYL_EXC[w] != null) return SYL_EXC[w];
  if (w.length <= 3) return 1;
  w = w.replace(/y(?=[aeiou])/g, '#');                  // y before a vowel acts as a consonant (beyond, player)
  let n = (w.match(/[aeiouy]+/g) || []).length;          // 1 per vowel group
  if (/[^aeiouy]le$/.test(w)) { /* table, little: final -le is its own syllable */ }
  else if (/[^aeiouy]e$/.test(w)) n--;                   // silent final e: make, hope, whale
  if (/[^aeiouy]es$/.test(w) && !/(s|x|z|ch|sh|c|g|[^aeiouy]l)es$/.test(w)) n--;   // makes, smiles (but boxes, wishes, races, tables)
  if (/[^aeiouy]ed$/.test(w) && !/[td]ed$/.test(w)) n--;   // jumped, smiled, played (but wanted, decided)
  if (/[^aeiouy]e(ly|ful|fully|ment|ments|ness)$/.test(w)) n--;   // lonely, careful, statement
  if (/[aeiou]ing$/.test(w)) n++;                        // going, seeing: the vowel before -ing is its own syllable
  n += (w.match(/i[ao]|eo|iu/g) || []).length - (w.match(/[stcg]i[ao]/g) || []).length - (/[^stcg][nl]ion$/.test(w) ? 1 : 0);  // radio, video, curious; not nation, vision, social, region
  n += (w.match(/[^qg]ua/g) || []).length;               // actual, usual; not equal, language
  return Math.max(1, n);
}

// ---------- readability (Flesch 1948; Kincaid et al. 1975)
function flesch(W, S, Y) {   // from raw counts: words, sentences, syllables
  return { fkgl: 0.39 * (W / S) + 11.8 * (Y / W) - 15.59, fre: 206.835 - 1.015 * (W / S) - 84.6 * (Y / W) };
}
function readability(text) {
  const ss = sentences(text); const ws = words(text);
  const W = ws.length, S = Math.max(ss.length, W ? 1 : 0), Y = ws.reduce((a, w) => a + syllables(w.word), 0);
  if (!W) return { words: 0, sentences: 0, syllables: 0, wps: 0, spw: 0, fkgl: null, fre: null };
  const wps = W / S, spw = Y / W;
  return { words: W, sentences: S, syllables: Y, wps, spw,
    fkgl: 0.39 * wps + 11.8 * spw - 15.59,          // Flesch-Kincaid Grade Level
    fre: 206.835 - 1.015 * wps - 84.6 * spw };      // Flesch Reading Ease
}

// ---------- sentence variety
const PREPS = ['about', 'above', 'across', 'after', 'against', 'along', 'among', 'around', 'at', 'before', 'behind', 'below', 'beneath', 'beside', 'between', 'beyond', 'by', 'despite', 'down', 'during', 'for', 'from', 'in', 'inside', 'into', 'near', 'of', 'off', 'on', 'onto', 'outside', 'over', 'past', 'since', 'through', 'throughout', 'to', 'toward', 'towards', 'under', 'until', 'up', 'upon', 'with', 'within', 'without'];
const SUBORD = ['because', 'although', 'though', 'when', 'whenever', 'while', 'if', 'unless', 'since', 'as', 'once', 'whereas', 'after', 'before', 'until'];
function openerType(firstWords) {
  const w = (firstWords[0] || '').toLowerCase(), two = firstWords.slice(0, 2).join(' ').toLowerCase(), three = firstWords.slice(0, 3).join(' ').toLowerCase();
  if (SUBORD.includes(w) && !transitionAt(two) && !transitionAt(three)) return 'clause';   // "Because it rained, …", "When …" (but "After that" is a transition)
  if (transitionAt(three) || transitionAt(two) || transitionAt(w)) return 'transition';
  if (PREPS.includes(w)) return 'phrase';           // "In the morning…"
  if (/^[a-z]{3,}ly$/.test(w) && !['only', 'family', 'early', 'holy', 'italy', 'july', 'reply', 'ugly', 'lovely', 'friendly'].includes(w)) return 'adverb';
  if (/^[a-z]{3,}ing$/.test(w) && !['nothing', 'something', 'everything', 'anything', 'thing', 'king', 'spring', 'morning', 'evening'].includes(w)) return 'verbal';
  return 'subject';
}
function variety(text) {
  const ss = sentences(text).filter(s => s.words.length);
  const lens = ss.map(s => s.words.length); const n = lens.length;
  if (!n) return { count: 0, lengths: [], mean: 0, sd: 0, min: 0, max: 0, short: 0, medium: 0, long: 0, openers: [], uniqueOpenerRatio: 0, topOpener: null, repeatsInARow: [], types: {}, score: 0 };
  const mean = lens.reduce((a, b) => a + b, 0) / n;
  const sd = Math.sqrt(lens.reduce((a, b) => a + (b - mean) ** 2, 0) / n);     // population standard deviation
  const openers = ss.map(s => s.words[0].toLowerCase().replace(/['’].*$/, ''));
  const counts = {}; openers.forEach(o => counts[o] = (counts[o] || 0) + 1);
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0];
  const uniq = Object.keys(counts).length / n;
  const rows = []; for (let i = 1; i < n; i++) if (openers[i] === openers[i - 1]) rows.push(i);
  const types = {}; ss.forEach(s => { const t = openerType(s.words); types[t] = (types[t] || 0) + 1; });
  const score = Math.round(50 * Math.min(1, sd / 6) + 50 * uniq);             // 0-100 meter: half length spread (SD 6+ words = full), half opener variety
  return { count: n, lengths: lens, mean, sd, min: Math.min(...lens), max: Math.max(...lens),
    short: lens.filter(l => l < 8).length, medium: lens.filter(l => l >= 8 && l <= 20).length, long: lens.filter(l => l > 20).length,
    openers, uniqueOpenerRatio: uniq, topOpener: top && top[1] > 1 ? { word: top[0], count: top[1] } : null, repeatsInARow: rows, types, score };
}

// ---------- transitions
const TRANSITIONS = {
  addition: ['also', 'in addition', 'additionally', 'furthermore', 'moreover', 'another', 'besides', 'as well as', 'not only'],
  contrast: ['however', 'on the other hand', 'although', 'even though', 'instead', 'nevertheless', 'in contrast', 'on the contrary', 'yet', 'still', 'despite', 'whereas', 'unlike'],
  cause: ['because', 'therefore', 'as a result', 'consequently', 'thus', 'so that', 'since', 'due to', 'for this reason', 'this means'],
  example: ['for example', 'for instance', 'such as', 'in particular', 'specifically', 'to illustrate', 'one example'],
  sequence: ['first', 'second', 'third', 'next', 'then', 'finally', 'after that', 'afterward', 'later', 'meanwhile', 'eventually', 'before long', 'suddenly', 'at first', 'soon', 'the next day', 'that night', 'by the time'],
  emphasis: ['most importantly', 'in fact', 'indeed', 'above all', 'especially', 'clearly', 'certainly'],
  conclusion: ['in conclusion', 'overall', 'in summary', 'to sum up', 'ultimately', 'in the end', 'all in all', 'to conclude'],
};
const T_FLAT = Object.entries(TRANSITIONS).flatMap(([cat, list]) => list.map(p => ({ p, cat }))).sort((a, b) => b.p.length - a.p.length);
function transitionAt(phrase) { const x = T_FLAT.find(t => t.p === phrase); return x ? x.cat : null; }
function transitions(text) {
  const lower = String(text).toLowerCase(); const taken = new Array(lower.length).fill(false); const found = [];
  for (const { p, cat } of T_FLAT) {     // longest phrases first so "for example" isn't also counted as something shorter
    const re = new RegExp('(^|[^a-z’\'])(' + p.replace(/ /g, '\\s+') + ')(?![a-z’\'])', 'g'); let m;
    while ((m = re.exec(lower))) {
      const st = m.index + m[1].length, en = st + m[2].length;
      if (taken.slice(st, en).some(Boolean)) continue;
      for (let i = st; i < en; i++) taken[i] = true;
      found.push({ phrase: p, cat, start: st, end: en });
    }
  }
  found.sort((a, b) => a.start - b.start);
  const byCat = {}; Object.keys(TRANSITIONS).forEach(c => byCat[c] = 0); found.forEach(f => byCat[f.cat]++);
  const used = Object.keys(byCat).filter(c => byCat[c]);
  const paras = paragraphs(text);
  const opens = paras.slice(1).map(p => found.some(f => f.start >= p.start && f.start <= p.start + (p.text.length - p.text.trimStart().length) + 1));
  const W = words(text).length;
  return { found, count: found.length, byCat, categoriesUsed: used, coverage: used.length / Object.keys(TRANSITIONS).length,
    per100: W ? found.length / W * 100 : 0, paragraphsOpenedWithTransition: opens.filter(Boolean).length, laterParagraphs: opens.length };
}

// ---------- repeated words
const STOP = new Set(('a an the and or but nor so for yet to of in on at by with from into onto over under about after before than then that this these those there their they them ' +
  'he she it its his her hers him we us our you your yours i me my mine is am are was were be been being have has had do does did will would can could should may might must ' +
  'not no yes very just also as if when while because what which who whom whose where why how all any some each every more most other such only own same too out up down off ' +
  'again once here both few many much one two three said says say get got go went like really thing things ' +
  'away even ever never always often well back upon within without while would could should might must make made very still almost').split(/\s+/));
function stem(w) { return w.toLowerCase().replace(/['’]s$/, '').replace(/[’']/g, "'"); }
function repeats(text, opts = {}) {
  const minCount = opts.minCount || 3, window = opts.window || 12;
  const ws = words(text).map((w, i) => ({ ...w, i, key: stem(w.word) })).filter(w => w.key.length >= 4 && !STOP.has(w.key) && !/^\d/.test(w.key));
  const keys = new Set(ws.map(w => w.key));
  ws.forEach(w => { if (w.key.endsWith('s') && keys.has(w.key.slice(0, -1))) w.key = w.key.slice(0, -1); });  // "dogs" + "dog" count together
  const counts = {}; ws.forEach(w => counts[w.key] = (counts[w.key] || 0) + 1);
  const overused = Object.entries(counts).filter(([, c]) => c >= minCount).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([word, count]) => ({ word, count }));
  const close = new Set();
  const all = words(text).map(w => w.word.toLowerCase());
  for (let a = 0; a < ws.length; a++) for (let b = a + 1; b < ws.length && ws[b].i - ws[a].i <= window; b++) {
    if (ws[a].key !== ws[b].key) continue;
    if (ws[b].i - ws[a].i === 2 && ['to', 'by', 'after', 'for', 'and'].includes(all[ws[a].i + 1])) continue;   // idioms: face to face, side by side, year after year
    close.add(a); close.add(b);
  }
  const closePairs = [...close].map(k => ({ word: ws[k].key, start: ws[k].start, end: ws[k].end }));
  const over = new Set(overused.map(o => o.word));
  return { overused, close: closePairs, marks: ws.filter((w, k) => over.has(w.key) || close.has(k)).map(w => ({ word: w.key, start: w.start, end: w.end })) };
}

// ---------- passive voice (hint only: be-verb + optional adverb/not + past participle)
const BE = new Set(['am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', "isn't", "aren't", "wasn't", "weren't"]);
const IRREG = new Set(('arisen awoken beaten become begun bent bitten blown broken brought built bought caught chosen come cut dealt done drawn driven drunk eaten fallen fed felt fought found ' +
  'forbidden forgotten forgiven frozen given gone grown hung heard hidden hit held hurt kept known laid led left lent let lost made meant met paid put quit read ridden rung risen run ' +
  'said seen sold sent set shaken shown shot shut sung sunk sat slept slid spoken spent spun spread stolen stuck stung struck sworn swept swum taken taught torn told thought thrown ' +
  'understood woken worn woven won written born').split(/\s+/));
const NOT_PART = new Set(('need seed feed speed indeed bleed breed hundred sacred naked wicked red bed shed sled led fled shred bred ' +
  'excited tired interested bored scared worried surprised amazed confused annoyed relaxed embarrassed exhausted frightened pleased satisfied ' +
  'supposed used married located involved related prepared determined talented crowded').split(/\s+/));
function passive(text) {
  const ws = words(text); const hits = [];
  for (let i = 0; i < ws.length - 1; i++) {
    if (!BE.has(ws[i].word.toLowerCase().replace('’', "'"))) continue;
    let j = i + 1; const mid = ws[j] && ws[j].word.toLowerCase();
    if (mid && (mid === 'not' || mid === 'never' || mid === 'also' || mid === 'often' || mid === 'always' || mid === 'being' || /^[a-z]{3,}ly$/.test(mid)) && ws[j + 1]) j++;
    const w = ws[j].word.toLowerCase();
    const by = ws.slice(j + 1, j + 5).some(x => x.word.toLowerCase() === 'by');   // "by ___" names the actor: a stronger hint
    if (NOT_PART.has(w) && !(ws[j + 1] && ws[j + 1].word.toLowerCase() === 'by')) continue;  // "was excited" is usually an adjective, "was surprised by" is passive
    if ((/^[a-z]{3,}ed$/.test(w)) || IRREG.has(w)) {
      hits.push({ phrase: text.slice(ws[i].start, ws[j].end), start: ws[i].start, end: ws[j].end, byAgent: by });
      i = j;   // don't re-match "being eaten" inside "is being eaten"
    }
  }
  return { count: hits.length, hits };
}

// ---------- filler / weak words
const FILLERS = ['very', 'really', 'just', 'actually', 'basically', 'literally', 'totally', 'definitely', 'honestly', 'kind of', 'sort of', 'a lot', 'lots of', 'stuff', 'things', 'thing', 'pretty much', 'i think', 'i feel like', 'i believe', 'in my opinion', 'you know'];
const F_SORT = FILLERS.slice().sort((a, b) => b.length - a.length);
function fillers(text) {
  const lower = String(text).toLowerCase(); const taken = new Array(lower.length).fill(false); const hits = [];
  for (const p of F_SORT) {
    const re = new RegExp('(^|[^a-z’\'])(' + p.replace(/ /g, '\\s+') + ')(?![a-z’\'])', 'g'); let m;
    while ((m = re.exec(lower))) { const st = m.index + m[1].length, en = st + m[2].length; if (taken.slice(st, en).some(Boolean)) continue; for (let i = st; i < en; i++) taken[i] = true; hits.push({ phrase: p, start: st, end: en }); }
  }
  hits.sort((a, b) => a.start - b.start);
  const counts = {}; hits.forEach(h => counts[h.phrase] = (counts[h.phrase] || 0) + 1);
  const W = words(text).length;
  return { count: hits.length, hits, counts, per100: W ? hits.length / W * 100 : 0 };
}

// ---------- paragraph structure
const CONCL = ['in conclusion', 'overall', 'in summary', 'to sum up', 'ultimately', 'in the end', 'all in all', 'to conclude', 'that is why', 'this is why', 'for these reasons'];
function structure(text, mode) {
  const ps = paragraphs(text).map(p => { const ss = sentences(p.text); return { start: p.start, end: p.end, sentences: ss.length, words: words(p.text).length, first: ss[0] ? ss[0].text : '' }; });
  const notes = []; const n = ps.length; const narrative = mode === 'narrative';
  const target = narrative ? 3 : 5;
  if (n === 0) return { paragraphs: ps, notes, target, score: 0 };
  if (n < 3) notes.push({ kind: 'grow', key: 'few', msg: narrative ? 'Try at least 3 paragraphs: beginning, middle and end. Start a new paragraph when time, place or speaker changes.' : 'Aim for an introduction, body paragraphs and a conclusion (usually 4–5 paragraphs).' });
  else if (!narrative && n < 4) notes.push({ kind: 'grow', key: 'body', msg: 'You have the shape! One more body paragraph would give you room for another reason or example.' });
  else notes.push({ kind: 'glow', key: 'count', msg: `${n} paragraphs: a clear ${narrative ? 'beginning, middle and end' : 'intro, body and conclusion'} shape.` });
  ps.forEach((p, i) => {
    const isDialogue = narrative && /^["“]/.test(p.first);
    if (p.sentences === 1 && !isDialogue && n > 1 && (i !== 0 || !narrative)) notes.push({ kind: 'grow', key: 'thin', para: i, msg: `Paragraph ${i + 1} has one sentence. Can you add a detail, example or explanation?` });
    if (p.sentences > 9 || p.words > 180) notes.push({ kind: 'grow', key: 'long', para: i, msg: `Paragraph ${i + 1} is long (${p.words} words). Look for a spot where the idea shifts and split it.` });
  });
  if (!narrative && n >= 3) {
    const last = paragraphs(text)[n - 1].text.toLowerCase();
    if (CONCL.some(c => last.includes(c))) notes.push({ kind: 'glow', key: 'concl', msg: 'Your last paragraph signals a conclusion.' });
    else notes.push({ kind: 'grow', key: 'concl', msg: 'Signal your conclusion (for example "In the end," or "For these reasons,") and restate your main idea in new words.' });
  }
  const good = ps.filter(p => p.sentences >= 3 && p.sentences <= 9).length;
  const score = Math.round(100 * Math.min(1, n / target) * (n ? (0.5 + 0.5 * good / n) : 0));
  return { paragraphs: ps, notes, target, score };
}

// ---------- everything at once
function analyze(text, mode) {
  return { readability: readability(text), variety: variety(text), transitions: transitions(text), repeats: repeats(text), passive: passive(text), fillers: fillers(text), structure: structure(text, mode) };
}

const API = { flesch, paragraphs, sentences, words, syllables, readability, variety, transitions, repeats, passive, fillers, structure, analyze, openerType, TRANSITIONS, FILLERS };
if (typeof module !== 'undefined' && module.exports) module.exports = API; else root.WSMetrics = API;
})(typeof window !== 'undefined' ? window : this);
