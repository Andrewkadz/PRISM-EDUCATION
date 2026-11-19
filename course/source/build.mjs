#!/usr/bin/env node
/**
 * Writes the Prism onboarding course from course.json alone, then applies and
 * measures the content standard (standard/, prism/content-standard/1 copied
 * unchanged from afflom/prism-devrel scripts/content):
 *
 *   node build.mjs            write site/, enrich it, measure it
 *
 * It refuses a page whose summary or prose breaks a text rule before any page
 * is written, so the gate only ever sees pages that could pass.
 */
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { grade, longest } from './standard/text.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const C = JSON.parse(readFileSync(join(here, 'course.json'), 'utf8'));
const STANDARD = JSON.parse(readFileSync(join(here, 'standard/standard.json'), 'utf8'));
const rule = Object.fromEntries(STANDARD.rules.map((r) => [r.id, r]));
const SITE = join(here, 'site');
const ROOT = join(here, 'root');

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
/** Our own words: `code`, **bold** and [text](url); everything else escaped. */
const inline = (s) => esc(s)
  .replace(/`([^`]+)`/g, '<code>$1</code>')
  .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (a, t, u) => `<a href="${u}">${t}</a>`);
const plain = (s) => String(s).replace(/`[^`]+`/g, '\u2063').replace(/\*\*|\[|\]\([^)]*\)/g, '');

const faults = [];
const prose = (where, s) => {
  const l = longest(plain(s));
  if (l.words > rule['CS-03'].bound.max) faults.push(`${where}: CS-03 ${l.words} words: "${l.sentence}"`);
  for (const f of STANDARD.fillers) if (new RegExp(`\\b${f}\\b`, 'i').test(plain(s))) faults.push(`${where}: CS-10 "${f}"`);
};

/** The ticket app as the playground runs it, read from the prompt the builder accepted. */
function playData(file) {
  const app = JSON.parse(readFileSync(join(here, file), 'utf8')).app;
  const says = (when) => when.map((c) => `${c.field} ${{ '<': 'is below', '<=': 'is at most', '>': 'is above', '>=': 'is at least', is: 'is', 'is not': 'is not' }[c.op]} ${c.value}`).join(' and ');
  return {
    fields: app.fields, otherwise: app.otherwise, examples: app.examples,
    rules: app.rules.map((r, i) => ({ id: `REQ-00${i + 1}`, ...r })),
    properties: app.properties.map((p, i) => ({ id: `INV-00${i + 1}`, kind: p.kind, when: p.when, then: p.then, says: says(p.when) })),
  };
}

function playground(name) {
  const spec = playData(`${name}.prompt.json`);
  const rows = spec.rules.map((r) => `<tr data-rule="${r.id}"><td><input type="checkbox" checked data-rule="${r.id}" id="on-${r.id}" aria-label="Rule ${r.id} on"></td><td><code>${r.id}</code></td><td>${esc(r.when.map((c) => `${c.field} ${c.op} ${c.value}`).join(' and '))}</td><td>${esc(r.then)}</td></tr>`).join('');
  const tries = ['2 yes', '10 yes', '30 no', '65 no', '30 maybe', '121 no', '07 no'];
  return `<div class="co-play" data-prose="data"><script type="application/json">${JSON.stringify(spec).replace(/</g, '\\u003c')}</script>`
    + `<div class="table"><table><thead><tr><th scope="col">On</th><th scope="col">Rule</th><th scope="col">When</th><th scope="col">Then</th></tr></thead><tbody>${rows}<tr data-rule="otherwise"><td></td><td><code>otherwise</code></td><td>no rule matched</td><td>${esc(spec.otherwise)}</td></tr></tbody></table></div>`
    + `<label>Request <input type="text" value="10 yes" aria-label="Request: age, then member"></label> <output class="co-answer" aria-live="polite"></output>`
    + `<div>${tries.map((t) => `<button type="button" data-request="${t}">${t}</button>`).join('')}</div>`
    + `<output class="co-verdict" aria-live="polite"></output></div>`;
}

function block(b, page) {
  const where = `${page.slug || 'home'}`;
  if (b.h2) return `<h2 id="${b.id}">${inline(b.h2)}</h2>`;
  if (b.p) { prose(where, b.p); return `<p>${inline(b.p)}</p>`; }
  if (b.list) { b.list.forEach((s) => prose(where, s)); return `<ul>${b.list.map((s) => `<li>${inline(s)}</li>`).join('')}</ul>`; }
  if (b.dl) { b.dl.forEach(([, d]) => prose(where, d)); return `<dl>${b.dl.map(([t, d]) => `<dt>${inline(t)}</dt><dd>${inline(d)}</dd>`).join('')}</dl>`; }
  if (b.table) return `<div class="table"><table><thead><tr>${b.table.head.map((h) => `<th scope="col">${inline(h)}</th>`).join('')}</tr></thead><tbody>${b.table.rows.map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  if (b.code !== undefined) return `<pre><code>${esc(b.code)}</code></pre>`;
  if (b.output !== undefined) return `<pre class="co-output" aria-label="Output"><code>${esc(b.output)}</code></pre>`;
  if (b.file) return `<pre><code>${esc(readFileSync(join(here, b.file), 'utf8').trimEnd())}</code></pre>`;
  if (b.playground) return playground(b.playground);
  if (b.progress) return `<p><output class="co-progress" data-modules="${esc(JSON.stringify(C.pages.filter((p) => p.quiz).map((p) => p.slug)))}">Your progress shows here once you pass a quiz.</output></p>`;
  throw new Error(`${where}: unknown block ${JSON.stringify(b).slice(0, 80)}`);
}

function quiz(page) {
  if (!page.quiz) return '';
  const qs = page.quiz.map((q, i) => `<fieldset><legend>${esc(q.q)}</legend>${q.options.map((o) => `<button type="button" aria-pressed="false">${esc(o)}</button>`).join('')}<output class="co-out" aria-live="polite"></output></fieldset>`).join('');
  return `<h2 id="quiz">Check yourself</h2><section class="co-quiz" data-page="${page.slug}" aria-label="Quiz"><script type="application/json">${JSON.stringify(page.quiz).replace(/</g, '\\u003c')}</script>${qs}<output class="co-out co-total" aria-live="polite"></output></section>`;
}

const DIATAXIS = { tutorial: 'tutorial', howToGuide: 'how-to guide', reference: 'reference', explanation: 'explanation' };
const STAGE = { discover: 'Discover', evaluate: 'Evaluate', learn: 'Learn', build: 'Build', scale: 'Scale' };

function render(page, i) {
  const depth = page.slug ? 2 : 1;
  const root = '../'.repeat(depth);
  const href = (p) => `${root}course/${p.slug ? `${p.slug}/` : ''}`;
  for (const s of [page.summary]) {
    const g = grade(plain(s));
    if (g > rule['CS-02'].bound.max) faults.push(`${page.slug || 'home'}: CS-02 summary grade ${g.toFixed(1)}: "${s}"`);
  }
  prose(page.slug || 'home', page.lead);
  prose(page.slug || 'home', page.figure.caption);
  const meta = `${page.diataxis ? `<meta name="diataxis" content="${page.diataxis}">` : ''}<meta name="developer-journey" content="${page.journey}"><meta name="audience" content="${page.audience}">`;
  const nav = C.pages.map((p) => `<a href="${href(p)}"${p === page ? ' class="dc-active" aria-current="page"' : ''}>${esc(p.nav)}</a>`).join('');
  const toc = page.blocks.filter((b) => b.h2).map((b) => `<a href="#${b.id}">${inline(b.h2)}</a>`).join('') + (page.quiz ? '<a href="#quiz">Check yourself</a>' : '');
  const prev = C.pages[i - 1], next = C.pages[i + 1];
  const pager = `<nav class="dc-pager" aria-label="Course">${prev ? `<a class="dc-card" href="${href(prev)}"><span>Previous</span><strong>${esc(prev.title)}</strong></a>` : '<span></span>'}${next ? `<a class="dc-card dc-next" href="${href(next)}"><span>Next</span><strong>${esc(next.title)}</strong></a>` : ''}</nav>`;
  const kind = page.diataxis ? DIATAXIS[page.diataxis] : 'course';
  const figure = `<figure class="cs-figure"><script type="application/vnd.prism.figure+json">${JSON.stringify(page.figure).replace(/</g, '\\u003c')}</script></figure>`;
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="color-scheme" content="dark"><title>${esc(page.title)} · ${esc(C.title)}</title><meta name="description" content="${esc(page.summary)}">${meta}<script type="importmap">{ "imports": { "node:crypto": "${root}vendor/node-crypto-shim.mjs" } }</script><link rel="stylesheet" href="${root}assets/docs.css"><link rel="stylesheet" href="${root}assets/devrel.css"><link rel="stylesheet" href="${root}assets/course.css"></head><body class="foundation dc-root"><a class="skip" href="#main">Skip to content</a><header class="dc-header"><div class="dc-topbar"><a href="${root}course/" class="dc-brand"><span class="fd-head">${esc(C.brand)}</span><span class="fd-mono">Course</span></a></div><nav class="dc-tabs" aria-label="Modules">${nav}</nav><span aria-hidden="true" class="fd-header-line"></span></header><div class="dc-layout"><nav class="dc-side" aria-label="Modules"><div><p>Modules</p>${nav}</div></nav><main id="main" class="dc-article"><p class="eyebrow">// ${kind} · ${STAGE[page.journey]}</p><h1>${esc(page.title)}</h1><p class="lead">${inline(page.lead)}</p>${figure}${page.blocks.map((b) => block(b, page)).join('')}${quiz(page)}<p class="dc-meta">${page.diataxis ? `<a class="dc-tag" href="https://diataxis.fr/">${kind}</a>` : ''}<a class="dc-tag" href="index.md">Markdown</a></p>${pager}</main><aside class="dc-toc" aria-label="On this page"><p>On this page</p>${toc}</aside></div><footer class="dc-foot"><p class="dc-foot-note">${inline(C.provenance)}</p></footer><script type="module" src="${root}assets/course.js"></script></body></html>
`;
}

const pages = C.pages.map((p, i) => [p, render(p, i)]);
if (faults.length) { console.error(faults.join('\n')); process.exit(1); }
rmSync(SITE, { recursive: true, force: true });
for (const [p, html] of pages) {
  const dir = join(SITE, 'course', p.slug);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), html);
}
cpSync(join(here, 'assets'), join(SITE, 'assets'), { recursive: true });
cpSync(join(here, 'ticket.prompt.json'), join(SITE, 'course/first-app/ticket.prompt.json'));
writeFileSync(join(SITE, 'index.html'), '<!doctype html><meta http-equiv="refresh" content="0; url=course/"><title>Prism onboarding course</title><a href="course/">Prism onboarding course</a>\n');
writeFileSync(join(SITE, 'app.json'), `${JSON.stringify({ live: C.live })}\n`);
writeFileSync(join(SITE, 'llms.txt'), `# ${C.title}\n\n> ${C.pages[0].summary}\n\n${C.pages.map((p) => `- [${p.title}](${C.live}course/${p.slug ? `${p.slug}/` : ''}): ${p.summary}`).join('\n')}\n`);
console.log(`build: ${pages.length} pages written from course.json`);
if (process.argv.includes('--no-gate')) process.exit(0);
execFileSync('node', [join(here, 'standard/enrich.mjs'), SITE, ROOT], { stdio: 'inherit' });
execFileSync('node', [join(here, 'standard/check.mjs'), SITE, ROOT], { stdio: 'inherit' });
