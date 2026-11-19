// explanation · Discover

# Why Prism

Tests check the cases someone thought of. With Prism you state what your app must never do and must always do. Lean then proves each statement for every possible request.

What Prism proves and what it tests. Left, three parts of an app description. Right, what each becomes. Only a property becomes a theorem.The data in this figure
| From | Link | To |
| --- | --- | --- |
| Property | proved | Theorem |
| Rule | generated | Program |
| --- | --- | --- |
| Example | tested | Acceptance vector |

The app ships as one sealed file. Anyone can check that file before they run it.

## Proved and tested are different claims

Proved means the Lean kernel checked a property for every request. Tested means the examples replayed correctly.

Rules, examples and the reading of requests are tested, not proved. Nothing proves that your rules are the right rules. That judgment stays with you.

| Part of the app | Proved or tested | How it is checked |
| --- | --- | --- |
| Property (never or always) | Proved | A theorem the Lean kernel checks for every request |
| Rule (when, then) | Tested | The examples, and the properties that constrain it |
| --- | --- | --- |
| Example | Tested | Replayed byte for byte as an acceptance vector |
| Reading a request | Tested | Malformed requests answer the reserved invalid |
| --- | --- | --- |
| The app file | Checked | Its BLAKE3 fingerprint is recomputed on load |

## Where Prism fits

Use Prism when a wrong answer is costly. Good first apps are approvals, eligibility, limits, access rules, and checks an agent relies on.

Today the guided path builds decision apps within these limits:

| Part | Limit today |
| --- | --- |
| Request | One line of up to 8 fields, separated by spaces |
| Field | A whole number, or a choice of 2 to 32 words |
| --- | --- |
| Answer | One of a fixed set of outcomes, plus the reserved invalid |
| Rules | Up to 24, tried in order; the first match decides |
| --- | --- |
| Conditions | Compare a field with a value or another field: is, is not, , >= |

Conditions do no arithmetic. A leap year app cannot test whether a year divides by 4. Pass the result in as a field instead, such as divisible-by-4: yes or no.

## Check yourself

A property says the app never answers full when age is below 16. What does Lean check?The examples you wroteEvery possible requestA random sample of requestsWhich of these is a good first Prism app?A photo editorA loan approval decisionA chat serverA leap year app must know whether a year divides by 4. How do you model that?Write year % 4 in a conditionAdd a field such as divisible-by-4: yes or noIt cannot be built

explanationMarkdown

PreviousPrism onboarding courseNextHow it works
