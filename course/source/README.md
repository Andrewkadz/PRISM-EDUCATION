# Prism onboarding course

The course is declared as data in `course.json` (`prism/course/1`). `build.mjs` writes every page from it. It then applies and measures the Prism-DevRel content standard, `prism/content-standard/1`, and refuses the site on any fault.

    npm install && npx playwright install chromium
    node build.mjs                # site/ + site/content-report.json
    python3 -m http.server 8000 --directory site   # open /course/

- `standard/` is a verbatim copy of afflom/prism-devrel `scripts/content` at commit ace153e37c7c29646f3efa6e273c3c4f8c9fb8bc.
- `root/` is what the standard reads:
  - `model/content.json` is the course's own file: its personas, terms and audience.
  - The stakeholders, compact window and brand are copied from Prism-DevRel.
- Set `live` in `course.json` to the published address before you deploy.
- Edit `course.json`, never `site/`.
