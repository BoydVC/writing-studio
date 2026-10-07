/* Content for Char's Writing Studio. All prompts and sample drafts are ORIGINAL, written for this app (not copied from any test or book). */
window.WS_CONTENT = {
modes: {
  narrative: { name: 'Narrative', blurb: 'Tell a story, real or imagined, with a clear beginning, middle and end.', color: '#c8794a' },
  argumentative: { name: 'Argumentative', blurb: 'Take a side, give reasons and evidence, and answer the other side.', color: '#5b7fa8' },
  expository: { name: 'Expository', blurb: 'Explain or inform: teach your reader something clearly and in order.', color: '#6c9a6a' },
},
prompts: [
  // narrative
  { id: 'n1', mode: 'narrative', title: 'The Wrong Bus', text: 'You step onto a bus you think will take you home, but after a few stops you realize nothing outside looks familiar. Write a story about where the bus goes and what you discover along the way.' },
  { id: 'n2', mode: 'narrative', title: 'The Last Five Minutes', text: 'Write a story that takes place entirely in the last five minutes before something important begins: a game, a recital, a test, or a big announcement. Show how the main character feels through what they notice, say and do.' },
  { id: 'n3', mode: 'narrative', title: 'Power Outage', text: 'A storm knocks out the power in your whole neighborhood for an evening. Write a story about how the night unfolds without screens or lights, and how it changes someone.' },
  { id: 'n4', mode: 'narrative', title: 'The Note in the Library Book', text: 'You open a used library book and find a folded note tucked between the pages. Write a story about what the note says and what you decide to do about it.' },
  { id: 'n5', mode: 'narrative', title: 'Switching Places', text: 'For one day, a student and a teacher accidentally switch roles. Tell the story from the point of view of one of them, including at least one moment of dialogue.' },
  { id: 'n6', mode: 'narrative', title: 'A Small Brave Thing', text: 'Write about a time (real or imagined) when a character did something small that took a lot of courage, like speaking up, apologizing, or trying something new. End by reflecting on what changed.' },
  { id: 'n7', mode: 'narrative', title: 'The Map', text: 'While cleaning out a closet, a character finds a hand-drawn map with an X on it. Write a story about following the map and what is really at the X.' },
  { id: 'n8', mode: 'narrative', title: 'Fifty Years From Now', text: 'Write a story set fifty years in the future in which a teenager experiences an ordinary school day. Use sensory details to show how the world has changed, and how it hasn\'t.' },
  // argumentative
  { id: 'a1', mode: 'argumentative', title: 'Phones at School', text: 'Should middle and high schools require students to keep their phones locked away for the whole school day? Take a position and support it with reasons and examples. Address the strongest argument on the other side.' },
  { id: 'a2', mode: 'argumentative', title: 'Later Start Times', text: 'Some people believe school should start an hour later so students can get more sleep. Others say it would cause problems for families and activities. Write an essay arguing for or against a later start time.' },
  { id: 'a3', mode: 'argumentative', title: 'Required Service Hours', text: 'Should students be required to complete community service hours to graduate from high school? State your claim and support it with at least two reasons and evidence.' },
  { id: 'a4', mode: 'argumentative', title: 'Homework on Weekends', text: 'Should teachers be allowed to assign homework over weekends and school breaks? Argue your position and explain why the opposing view is weaker.' },
  { id: 'a5', mode: 'argumentative', title: 'Participation Trophies', text: 'Some youth sports leagues give every player a trophy, while others reward only winners. Which approach is better for young athletes? Write an argument supporting your view.' },
  { id: 'a6', mode: 'argumentative', title: 'Video Games as a Sport', text: 'Should competitive video gaming (esports) be offered as an official school team, like soccer or track? Take a side and defend it with reasons and examples.' },
  { id: 'a7', mode: 'argumentative', title: 'Year-Round School', text: 'Should schools switch to a year-round calendar with shorter breaks spread across the year instead of a long summer vacation? Write an argument for or against.' },
  { id: 'a8', mode: 'argumentative', title: 'Cursive Handwriting', text: 'Should schools still teach cursive handwriting? Take a position, support it with logical reasons, and respond to a counterclaim.' },
  // expository
  { id: 'e1', mode: 'expository', title: 'A Skill You Could Teach', text: 'Think of a skill you know well, such as a sport move, a recipe, or a game strategy. Write an essay that explains how to do it so clearly that a beginner could follow your steps.' },
  { id: 'e2', mode: 'expository', title: 'What Makes a Good Friend', text: 'Explain the qualities that make someone a good friend. Organize your essay around two or three qualities and give examples that illustrate each one.' },
  { id: 'e3', mode: 'expository', title: 'How Technology Changed One Thing', text: 'Choose one everyday activity, such as listening to music, getting directions, or keeping in touch, and explain how technology has changed the way people do it.' },
  { id: 'e4', mode: 'expository', title: 'Preparing for a Big Day', text: 'Explain how a student can prepare for an important test or performance. Organize your advice into stages: weeks before, the night before, and the day of.' },
  { id: 'e5', mode: 'expository', title: 'A Place Worth Visiting', text: 'Explain why a particular place (a park, a museum, a city, or a natural landmark) is worth visiting. Describe what visitors can see, learn and do there.' },
  { id: 'e6', mode: 'expository', title: 'Causes and Effects of Stress', text: 'Explain some common causes of stress for middle school students and the effects stress can have. Then explain one or two healthy ways to manage it.' },
  { id: 'e7', mode: 'expository', title: 'An Invention That Matters', text: 'Choose an invention that changed daily life. Explain what problem it solved, how it works in simple terms, and what effects it has had.' },
  { id: 'e8', mode: 'expository', title: 'Teamwork', text: 'Explain what makes a team (in sports, music, school projects or anywhere else) work well together. Use examples to show each idea.' },
],
planners: {
  argumentative: [
    { key: 'hook', label: 'Hook', hint: 'A question, surprising fact or short scene to grab the reader' },
    { key: 'claim', label: 'My claim', hint: 'One clear sentence: what you believe and why it matters', big: true },
    { key: 'r1', label: 'Reason 1', hint: 'Your strongest reason' }, { key: 'e1', label: 'Evidence / example for reason 1', hint: 'Fact, example, or experience that proves it' },
    { key: 'r2', label: 'Reason 2', hint: '' }, { key: 'e2', label: 'Evidence / example for reason 2', hint: '' },
    { key: 'r3', label: 'Reason 3 (optional)', hint: '' }, { key: 'e3', label: 'Evidence / example for reason 3', hint: '' },
    { key: 'counter', label: 'Counterclaim', hint: 'What would someone who disagrees say?' }, { key: 'rebut', label: 'My response', hint: 'Why your side is still stronger' },
    { key: 'close', label: 'Conclusion', hint: 'Restate your claim in new words and leave the reader with a final thought' },
  ],
  expository: [
    { key: 'hook', label: 'Hook', hint: 'Make the reader curious about the topic' },
    { key: 'thesis', label: 'Main idea (thesis)', hint: 'What will you explain? Preview your 2–3 parts', big: true },
    { key: 's1', label: 'Part 1', hint: 'Topic sentence for body paragraph 1' }, { key: 'd1', label: 'Facts & details for part 1', hint: 'Definitions, examples, steps, numbers' },
    { key: 's2', label: 'Part 2', hint: '' }, { key: 'd2', label: 'Facts & details for part 2', hint: '' },
    { key: 's3', label: 'Part 3', hint: '' }, { key: 'd3', label: 'Facts & details for part 3', hint: '' },
    { key: 'close', label: 'Conclusion', hint: 'Sum up and explain why this matters' },
  ],
  narrative: [
    { key: 'who', label: 'Characters & point of view', hint: 'Who is the narrator? First person (I) or third person (she/he/they)?' },
    { key: 'where', label: 'Setting', hint: 'Where and when? One sensory detail for each sense you can' },
    { key: 'start', label: 'Exposition (beginning)', hint: 'What is normal life before things change?', arc: 0 },
    { key: 'conflict', label: 'Conflict', hint: 'What problem or want drives the story?', arc: 1 },
    { key: 'rise', label: 'Rising action', hint: '2–3 events that make things harder or more exciting', arc: 2 },
    { key: 'climax', label: 'Climax', hint: 'The turning point: the biggest moment', arc: 3 },
    { key: 'fall', label: 'Falling action', hint: 'What happens right after?', arc: 4 },
    { key: 'end', label: 'Resolution & reflection', hint: 'How does it end? What did the character learn or feel?', arc: 5 },
  ],
},
// Rubric checklist. Item wording is original; each item cites the Common Core standard it is modeled on (verbatim text in WS_STANDARDS).
rubric: {
  argumentative: [
    { id: 'ar1', area: 'Claim & focus', text: 'My introduction states a clear claim and I stay on that claim the whole time.', std: 'W.8.1.a', auto: 'structure' },
    { id: 'ar2', area: 'Claim & focus', text: 'I name an opposing claim and explain why my claim is stronger.', std: 'W.8.1.a' },
    { id: 'ar3', area: 'Evidence', text: 'Each reason is backed by specific evidence: facts, examples or details, not just opinions.', std: 'W.8.1.b' },
    { id: 'ar4', area: 'Organization', text: 'My reasons are in a logical order, each in its own body paragraph.', std: 'W.8.1.a', auto: 'structure' },
    { id: 'ar5', area: 'Cohesion', text: 'I use transitions to connect claim, reasons, counterclaim and evidence.', std: 'W.8.1.c', auto: 'transitions' },
    { id: 'ar6', area: 'Style', text: 'My style is formal: no slang, few "I think" phrases, precise words.', std: 'W.8.1.d', auto: 'fillers' },
    { id: 'ar7', area: 'Conclusion', text: 'My conclusion follows from my argument and restates my claim in new words.', std: 'W.8.1.e', auto: 'structure' },
    { id: 'ar8', area: 'Conventions', text: 'I mostly use active voice, and I chose passive voice on purpose when I used it.', std: 'L.8.3.a', auto: 'passive' },
    { id: 'ar9', area: 'Revision', text: 'I reread (or listened to) my essay and revised at least one part.', std: 'W.8.5' },
  ],
  expository: [
    { id: 'ex1', area: 'Focus', text: 'My introduction clearly introduces the topic and previews what is to follow.', std: 'W.8.2.a' },
    { id: 'ex2', area: 'Organization', text: 'My ideas are grouped into clear categories, one main idea per body paragraph.', std: 'W.8.2.a', auto: 'structure' },
    { id: 'ex3', area: 'Development', text: 'I develop each idea with relevant facts, definitions, concrete details or examples.', std: 'W.8.2.b' },
    { id: 'ex4', area: 'Cohesion', text: 'I use varied transitions to show how ideas connect.', std: 'W.8.2.c', auto: 'transitions' },
    { id: 'ex5', area: 'Language', text: 'I use precise words and topic vocabulary instead of vague words like "stuff" or "things."', std: 'W.8.2.d', auto: 'fillers' },
    { id: 'ex6', area: 'Style', text: 'My style is formal and stays that way.', std: 'W.8.2.e' },
    { id: 'ex7', area: 'Conclusion', text: 'My conclusion follows from and supports the information I explained.', std: 'W.8.2.f', auto: 'structure' },
    { id: 'ex8', area: 'Sentences', text: 'My sentences vary in length and in how they begin.', std: 'W.8.4', auto: 'variety' },
    { id: 'ex9', area: 'Revision', text: 'I reread (or listened to) my essay and revised at least one part.', std: 'W.8.5' },
  ],
  narrative: [
    { id: 'na1', area: 'Orientation', text: 'My opening sets the context and point of view and introduces the narrator or characters.', std: 'W.8.3.a' },
    { id: 'na2', area: 'Sequence', text: 'Events unfold naturally and logically from beginning to end.', std: 'W.8.3.a', auto: 'structure' },
    { id: 'na3', area: 'Technique', text: 'I use dialogue, pacing, description or reflection to develop the story.', std: 'W.8.3.b' },
    { id: 'na4', area: 'Transitions', text: 'I use a variety of transitions to show time order and shifts in time or setting.', std: 'W.8.3.c', auto: 'transitions' },
    { id: 'na5', area: 'Language', text: 'I use precise words, descriptive details and sensory language (sight, sound, smell, touch, taste).', std: 'W.8.3.d' },
    { id: 'na6', area: 'Conclusion', text: 'My ending follows from the events and reflects on what they meant.', std: 'W.8.3.e' },
    { id: 'na7', area: 'Sentences', text: 'My sentences vary in length and in how they begin.', std: 'W.8.4', auto: 'variety' },
    { id: 'na8', area: 'Revision', text: 'I reread (or listened to) my story and revised at least one part.', std: 'W.8.5' },
  ],
},
// Original sample drafts (used by the demo/screenshots and the "Try a sample" button). Intentionally imperfect so the feedback has something to say.
samples: {
  argumentative: { title: 'Sample: Phones at School', promptId: 'a1', text:
'Imagine a classroom where every student is actually listening. That is why I think schools should require phones to be locked away during the whole school day.\n\n' +
'First, phones are a very big distraction. When a phone buzzes, students stop paying attention to the lesson. Students check messages and students lose their place in the work. Even when the phone is silent, many students are thinking about what they might be missing.\n\n' +
'Second, locking phones away helps students connect with each other. At lunch, students who are not looking at screens talk, laugh and make plans. Friendships are built face to face. For example, a new student is more likely to be invited to sit with a group if nobody is staring at a phone.\n\n' +
'Some people argue that students need phones for emergencies. However, every school has office phones, and parents can always call the front desk. In a real emergency, teachers are trained to keep students safe.\n\n' +
'In conclusion, schools should lock away phones during the day. Students would focus better, connect more, and still be safe.' },
  narrative: { title: 'Sample: Power Outage', promptId: 'n3', text:
'The lights flickered once, then twice, and then the whole house went dark.\n\n' +
'At first, nobody moved. The refrigerator stopped humming, and the silence felt strangely loud. My little brother grabbed my sleeve. "Is it going to come back?" he whispered.\n\n' +
'We found two candles in the kitchen drawer and a deck of cards with one missing queen. Outside, the rain drummed on the windows. Because there was nothing else to do, we invented a new game where the missing queen was a secret rule.\n\n' +
'Hours later, the lights blinked back on. My brother groaned. For the first time all year, neither of us wanted the screens back.' },
  expository: { title: 'Sample: Preparing for a Big Day', promptId: 'e4', text:
'Preparing for an important test is easier when you break the work into stages.\n\n' +
'Weeks before the test, make a simple study calendar. Short practice sessions spread over many days work better than one long night of cramming. For example, twenty minutes of practice questions each afternoon adds up quickly.\n\n' +
'The night before, review your notes lightly and pack everything you need. Then go to bed on time, because a rested brain remembers more.\n\n' +
'On the day of the test, eat breakfast and arrive early. If a question seems hard, skip it and come back later.\n\n' +
'Overall, steady preparation turns a scary day into a manageable one.' },
},
};
window.WS_STANDARDS = {
  source: 'Common Core State Standards Initiative, English Language Arts Standards, Writing, Grade 8 and Language, Grade 8',
  urls: { W: 'https://www.thecorestandards.org/ELA-Literacy/W/8/', L: 'https://www.thecorestandards.org/ELA-Literacy/L/8/' },
  retrieved: '2026-10-07',
  text: {
    'W.8.1.a': 'Introduce claim(s), acknowledge and distinguish the claim(s) from alternate or opposing claims, and organize the reasons and evidence logically.',
    'W.8.1.b': 'Support claim(s) with logical reasoning and relevant evidence, using accurate, credible sources and demonstrating an understanding of the topic or text.',
    'W.8.1.c': 'Use words, phrases, and clauses to create cohesion and clarify the relationships among claim(s), counterclaims, reasons, and evidence.',
    'W.8.1.d': 'Establish and maintain a formal style.',
    'W.8.1.e': 'Provide a concluding statement or section that follows from and supports the argument presented.',
    'W.8.2.a': 'Introduce a topic clearly, previewing what is to follow; organize ideas, concepts, and information into broader categories; include formatting (e.g., headings), graphics (e.g., charts, tables), and multimedia when useful to aiding comprehension.',
    'W.8.2.b': 'Develop the topic with relevant, well-chosen facts, definitions, concrete details, quotations, or other information and examples.',
    'W.8.2.c': 'Use appropriate and varied transitions to create cohesion and clarify the relationships among ideas and concepts.',
    'W.8.2.d': 'Use precise language and domain-specific vocabulary to inform about or explain the topic.',
    'W.8.2.e': 'Establish and maintain a formal style.',
    'W.8.2.f': 'Provide a concluding statement or section that follows from and supports the information or explanation presented.',
    'W.8.3.a': 'Engage and orient the reader by establishing a context and point of view and introducing a narrator and/or characters; organize an event sequence that unfolds naturally and logically.',
    'W.8.3.b': 'Use narrative techniques, such as dialogue, pacing, description, and reflection, to develop experiences, events, and/or characters.',
    'W.8.3.c': 'Use a variety of transition words, phrases, and clauses to convey sequence, signal shifts from one time frame or setting to another, and show the relationships among experiences and events.',
    'W.8.3.d': 'Use precise words and phrases, relevant descriptive details, and sensory language to capture the action and convey experiences and events.',
    'W.8.3.e': 'Provide a conclusion that follows from and reflects on the narrated experiences or events.',
    'W.8.4': 'Produce clear and coherent writing in which the development, organization, and style are appropriate to task, purpose, and audience. (Grade-specific expectations for writing types are defined in standards 1-3 above.)',
    'W.8.5': 'With some guidance and support from peers and adults, develop and strengthen writing as needed by planning, revising, editing, rewriting, or trying a new approach, focusing on how well purpose and audience have been addressed. (Editing for conventions should demonstrate command of Language standards 1-3 up to and including grade 8 here.)',
    'L.8.1.b': 'Form and use verbs in the active and passive voice.',
    'L.8.3.a': 'Use verbs in the active and passive voice and in the conditional and subjunctive mood to achieve particular effects (e.g., emphasizing the actor or the action; expressing uncertainty or describing a state contrary to fact).',
  },
};
window.WS_CITES = {
  fkgl: { formula: 'Grade level = 0.39 × (words ÷ sentences) + 11.8 × (syllables ÷ words) − 15.59',
          cite: 'Kincaid, J. P., Fishburne, R. P., Rogers, R. L., & Chissom, B. S. (1975). Derivation of new readability formulas (Automated Readability Index, Fog Count and Flesch Reading Ease Formula) for Navy enlisted personnel. Research Branch Report 8-75. Naval Technical Training, U.S. Naval Air Station Memphis.' },
  fre:  { formula: 'Reading ease = 206.835 − 1.015 × (words ÷ sentences) − 84.6 × (syllables ÷ words)',
          cite: 'Flesch, R. (1948). A new readability yardstick. Journal of Applied Psychology, 32(3), 221–233.' },
  overview: 'https://en.wikipedia.org/wiki/Flesch%E2%80%93Kincaid_readability_tests',
  note: 'Syllables are estimated with spelling rules plus a short exception list, so scores can differ slightly from other tools. Use the number to compare your own drafts, not as a grade.',
};
