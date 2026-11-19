// how-to guide · Scale

# Ship your app

A Prism app is one model with several facets, such as architecture, security and quality. Every facet but behavior follows from the behavior by fixed rules.

From a prompt to a live site. You do the first four steps. The repository's Pages workflow does the last two on every push.The data in this figure
| Step | What happens |
| --- | --- |
| 1. Build the zip | from the prompt |
| 2. New repository | from the template |
| --- | --- |
| 3. Turn on Pages | workflow build |
| 4. Unzip and push | to main |
| --- | --- |
| 5. Gate | just vv proves it |
| 6. Publish | GitHub Pages |

## What the builder writes

Leave the optional prompt members out and you still get every facet, with defaults. Add them to describe your real system.

| Prompt member | Facet | Records | Checked against |
| --- | --- | --- | --- |
| app (the spec) | Behavior | The model, a theorem per property, acceptance vectors | LexLean, Lean kernel |
| stakeholders, concerns, components | Architecture | Stakeholders, concerns, components, edges, views | ISO/IEC/IEEE 42010:2022 |
| --- | --- | --- | --- |
| (derived from app) | Design views | An OPM view; UML component, sequence and state views | ISO/PAS 19450, UML 2.5.1 |
| journeys | Features and journeys | A feature per rule and property, a journey per stakeholder | PrismPM features |
| --- | --- | --- | --- |
| threats | Security and threat model | Assets, STRIDE threats, risks, controls with evidence | ISO/IEC 27034, 27005 |
| quality | Quality | Characteristics, requirements, measures with thresholds | ISO/IEC 25010:2023 |
| --- | --- | --- | --- |
| license | Compliance | An obligation per standard, each naming its evidence | SPDX |
| repository | System and release | prism.toml, site/app.json, tests, OpenSpec | UOR-Foundation/template gate |

## Put it on GitHub Pages

Set repository in the prompt to OWNER/prism-NAME, where NAME is app.name. Build the zip, then run:

```
gh repo create OWNER/prism-NAME --template UOR-Foundation/template --public gh api -X POST repos/OWNER/prism-NAME/pages -f build_type=workflow git -c core.autocrlf=false clone https://github.com/OWNER/prism-NAME.git cd prism-NAME git rm -q app/src/Contract.lex.tex crates/conformance/tests/contract.rs features/suites/contract.feature unzip -o ../prism-NAME.zip git add -A && git commit -m "Build the app from its prompt" && git push
```

The push starts the Pages workflow. It runs the gate, just vv, which proves the app with the Lean kernel. Then it publishes the site.

To run the same gate first, follow How to verify an app.

## House rules of a template repository

- The model is the single source. Change the prompt, not the generated files.
- just vv is the whole acceptance boundary. It runs in the SDK image that prismpm.lock pins.
- A gate counts as evidence only after a planted defect shows it can fail.
- Nothing is stubbed or hidden behind a flag.

## Check yourself

Which prompt member becomes the security and threat model facet?threatsqualityjourneysWhat is the complete acceptance gate of a template repository?npm testjust vv, in the SDK image that prismpm.lock pinsThe GitHub Pages buildYou want to change a generated facet file. What should you do?Edit the fileChange the prompt and build againDelete the facet

how-to guideMarkdown

PreviousChoose a patternNextReference
