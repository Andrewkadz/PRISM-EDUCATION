// tutorial · Learn

# Your first app

A prompt is one JSON document. Its app member is the spec, and the rest is optional. This page writes a prompt for a cinema ticket price, then checks it.

How the builder judges a prompt. The builder writes nothing until the examples agree and every property holds for all 242 possible requests.The data in this figure
| Step | What happens |
| --- | --- |
| 1. Read the prompt | fields and rules |
| 2. Replay examples | 5 of them |
| --- | --- |
| 3. Check properties | 242 requests |
| 4. Write the app | 82 files |

## The parts of a prompt

| app member | What to write | In the example |
| --- | --- | --- |
| purpose | What the app decides, in one sentence | the price band of one cinema ticket |
| fields | A request is these values in order, separated by spaces | age (0 to 120), member (no or yes) |
| --- | --- | --- |
| outcomes | Lower-case words; invalid is reserved | free, reduced, full |
| rules | when and then, in order; the first match decides | 4 rules |
| --- | --- | --- |
| otherwise | The answer when no rule matches | full |
| properties | never or always; each becomes a theorem | no child or senior pays full; under-3s are free |
| --- | --- | --- |
| examples | Requests and their answers; each becomes an acceptance vector | 5 examples |
| limits | What the app does not decide | a member under 3 still goes free |

## The whole prompt

Save it as ticket.prompt.json. The builder accepted it: 3 properties, 29 acceptance vectors and 82 files.

```
{ "schema": "prism/prompt/1", "pattern": "decisionTable", "goal": "Decide what a cinema ticket costs, so no child or senior is ever charged the full price.", "repository": "OWNER/prism-ticket-price", "app": { "name": "ticket-price", "title": "Ticket price", "purpose": "Decide the price band of one cinema ticket from the visitor's age and whether they hold a member card.", "fields": [ {"name": "age", "kind": "number", "min": 0, "max": 120, "means": "the visitor's age in whole years"}, {"name": "member", "kind": "choice", "values": ["no", "yes"], "means": "whether the visitor shows a member card"} ], "outcomes": ["free", "reduced", "full"], "meanings": {"free": "no charge", "reduced": "the reduced price", "full": "the full price"}, "rules": [ {"when": [{"field": "age", "op": "=", "value": 65}], "then": "reduced", "why": "seniors pay the reduced price"}, {"when": [{"field": "member", "op": "is", "value": "yes"}], "then": "reduced", "why": "members pay the reduced price"} ], "otherwise": "full", "otherwiseWhy": "an adult without a card pays full price", "properties": [ {"kind": "never", "when": [{"field": "age", "op": "=", "value": 65}], "then": "full", "why": "no senior pays full price"}, {"kind": "always", "when": [{"field": "age", "op": "
| On | Rule | When | Then |
| --- | --- | --- | --- |
|  | REQ-001 | age = 65 | reduced |
|  | REQ-004 | member is yes | reduced |
| --- | --- | --- | --- |
|  | otherwise | no rule matched | full |Request  2 yes10 yes30 no65 no30 maybe121 no07 no
- Switch off REQ-003. What does the builder refuse, and why?
- Switch it back on, then switch off REQ-001. Which example breaks first?
- Type 121 no, then 07 no. Why is each one invalid?

## Check it on the command line

```
git clone https://github.com/afflom/prism-devrel.git && cd prism-devrel node builder/cli.mjs check ticket.prompt.json node builder/cli.mjs build ticket.prompt.json --out my-app
```

```
Ticket price: Decision table (OMG DMN 1.5, hit policy FIRST), 82 files, 29 acceptance vectors TP-01: The app never answers full when age is below 16 TP-02: The app never answers full when age is at least 65 TP-03: The app always answers free when age is below 3 ...
```

With the senior rule removed, the real builder refused the prompt and named the request that breaks it:

```
refused: INV-002 does not hold. The request `65 no` meets "age is at least 65", and the rules answer full (otherwise). Change a rule, or restate the property. exit=2
```

## Build it in the browser

Open the builder at /start. Pick an example, edit the prompt and build the app. It runs in the page and sends nothing anywhere.

## Check yourself

Two rules match 10 yes: REQ-002 (age below 16) and REQ-004 (member). Which decides?The last oneThe first one in orderBoth are mergedYou remove the senior rule. What does the builder do?Builds anywayRefuses, and names 65 no as the request that breaks INV-002Asks Lean to fix itWhat does 30 maybe answer?fullinvalidreduced

tutorialMarkdown

PreviousTry the sample appNextChoose a pattern
