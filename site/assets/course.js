// The course's interactive parts. Each reads its data from a JSON script the
// generator wrote into the page, so the page and its twin say the same thing.
const KEY = 'prism-course-passed';
const passed = () => { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; } };

// Quiz answers are graded by the Prism course quiz app (../app.holo), a proved
// Prism app. Its request is the question number in course order and the option
// letter, such as `8 a`; it answers `correct` or `incorrect`. The runtime checks
// the holo's digests before the first answer. If it cannot load, the page says
// so and grades from its own answer key instead.
const ORDER = ['why', 'how-it-works', 'try-the-sample', 'first-app', 'patterns', 'ship'];
let grader = null;
const quizzes = document.querySelectorAll('.co-quiz');
if (quizzes.length) {
  grader = import(new URL('../vendor/prism-code/src/browser.mjs', import.meta.url).href)
    .then(({ load }) => load(new URL('../app.holo', import.meta.url).href))
    .catch(() => null);
}
const grade = async (number, option, fallback) => {
  const app = await grader;
  if (!app) return { right: fallback, by: 'the page' };
  const reply = new TextDecoder().decode(await app.dispatch(new TextEncoder().encode(`${number} ${'abc'[option]}`))).trim();
  return { right: reply === 'correct', by: 'the proved app', request: `${number} ${'abc'[option]}`, reply };
};

for (const quiz of quizzes) {
  const id = quiz.dataset.page;
  const base = ORDER.indexOf(id) * 3;
  const qs = JSON.parse(quiz.querySelector('script[type="application/json"]').textContent);
  const right = {};
  const total = quiz.querySelector('output.co-total');
  quiz.querySelectorAll('fieldset').forEach((fs, i) => {
    const out = fs.querySelector('output');
    fs.querySelectorAll('button').forEach((b, j) => b.addEventListener('click', async () => {
      fs.querySelectorAll('button').forEach((x, k) => { x.setAttribute('aria-pressed', String(k === j)); x.classList.remove('co-right', 'co-wrong'); });
      out.textContent = 'Grading...';
      const g = await grade(base + i + 1, j, j === qs[i].answer);
      if (fs.querySelector('[aria-pressed="true"]') !== b) return;
      right[i] = g.right;
      b.classList.add(g.right ? 'co-right' : 'co-wrong');
      const how = g.request ? ` (Graded by the proved app: \`${g.request}\` → ${g.reply}.)` : ' (The proved app did not load, so the page graded this.)';
      out.textContent = `${g.right ? 'Right.' : 'Not quite.'} ${qs[i].why}${how}`;
      const score = Object.values(right).filter(Boolean).length;
      if (Object.keys(right).length === qs.length) {
        total.textContent = `${score} of ${qs.length} right.${score === qs.length ? ' This module counts as done.' : ' Change an answer to try again.'}`;
        if (score === qs.length) { try { localStorage.setItem(KEY, JSON.stringify({ ...passed(), [id]: true })); } catch {} }
      }
    }));
  });
  if (passed()[id]) total.textContent = 'You have passed this quiz before.';
}

const progress = document.querySelector('output.co-progress');
if (progress) {
  const ids = JSON.parse(progress.dataset.modules);
  const done = ids.filter((m) => passed()[m]);
  progress.textContent = `Your progress: ${done.length} of ${ids.length} modules done${done.length ? ` (${done.join(', ')})` : ''}.`;
}

for (const play of document.querySelectorAll('.co-play')) {
  const spec = JSON.parse(play.querySelector('script[type="application/json"]').textContent);
  const enabled = Object.fromEntries(spec.rules.map((r) => [r.id, true]));
  const cond = (c, req) => {
    const v = req[c.field], w = c.value;
    return { is: v === w, 'is not': v !== w, '<': v < w, '<=': v <= w, '>': v > w, '>=': v >= w }[c.op] ?? false;
  };
  const parse = (text) => {
    const parts = text.trim().split(' ');
    if (parts.length !== spec.fields.length || parts.some((p) => p === '')) return null;
    const req = {};
    for (let i = 0; i < parts.length; i++) {
      const f = spec.fields[i], p = parts[i];
      if (f.kind === 'number') {
        if (!/^(0|[1-9][0-9]*)$/.test(p)) return null;
        const n = Number(p);
        if (n < f.min || n > f.max) return null;
        req[f.name] = n;
      } else {
        if (!f.values.includes(p)) return null;
        req[f.name] = p;
      }
    }
    return req;
  };
  const decide = (req) => {
    if (!req) return { answer: 'invalid', by: 'malformed' };
    for (const r of spec.rules) if (enabled[r.id] && r.when.every((c) => cond(c, req))) return { answer: r.then, by: r.id };
    return { answer: spec.otherwise, by: 'otherwise' };
  };
  const all = () => spec.fields.reduce((reqs, f) => {
    const vals = f.kind === 'number' ? Array.from({ length: f.max - f.min + 1 }, (_, i) => f.min + i) : f.values;
    return reqs.flatMap((r) => vals.map((v) => ({ ...r, [f.name]: v })));
  }, [{}]);
  const show = (req) => spec.fields.map((f) => req[f.name]).join(' ');
  const verdict = () => {
    for (const ex of spec.examples) {
      const d = decide(parse(ex.request));
      if (d.answer !== ex.response) {
        const because = d.by === 'otherwise' ? 'no rule matches (otherwise)' : `${d.by} decides it`;
        return [false, `refused: Your example \`${ex.request}\` expects ${ex.response}, but the rules answer ${d.answer}, because ${because}. Fix the example, or change the rules.`];
      }
    }
    const reqs = all();
    for (const p of spec.properties) for (const req of reqs) {
      if (!p.when.every((c) => cond(c, req))) continue;
      const d = decide(req);
      if (p.kind === 'never' ? d.answer === p.then : d.answer !== p.then) return [false, `refused: ${p.id} does not hold. The request \`${show(req)}\` meets "${p.says}", and the rules answer ${d.answer} (${d.by}). Change a rule, or restate the property.`];
    }
    return [true, `accepted: all ${spec.examples.length} examples agree with the rules, and all ${spec.properties.length} properties hold for every one of the ${reqs.length} possible requests.`];
  };
  const input = play.querySelector('input[type="text"]');
  const answer = play.querySelector('output.co-answer');
  const judged = play.querySelector('output.co-verdict');
  const update = () => {
    const d = decide(parse(input.value));
    answer.textContent = `answers ${d.answer} (${d.by === 'malformed' ? 'malformed request' : d.by === 'otherwise' ? 'no rule matched' : `${d.by} decides it`})`;
    play.querySelectorAll('tr[data-rule]').forEach((tr) => tr.classList.toggle('co-hit', tr.dataset.rule === d.by));
    const [ok, msg] = verdict();
    judged.textContent = msg;
    judged.classList.toggle('co-refused', !ok);
  };
  play.querySelectorAll('input[type="checkbox"]').forEach((box) => box.addEventListener('change', () => { enabled[box.dataset.rule] = box.checked; update(); }));
  input.addEventListener('input', update);
  play.querySelectorAll('button[data-request]').forEach((b) => b.addEventListener('click', () => { input.value = b.dataset.request; update(); }));
  update();
}
