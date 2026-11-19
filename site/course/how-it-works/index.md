// explanation · Evaluate

# How it works

One description, proved by Lean, produces the program. This page follows it from a sentence to a running app.

From a sentence to a running app. You write the first two steps. Prism writes the next three. Anyone who receives the file runs the last two.The data in this figure
| Step | What happens |
| --- | --- |
| 1. Sentence | or a JSON prompt |
| 2. Spec | you approve it |
| --- | --- |
| 3. LexLean model | one source |
| 4. Proofs and program | both from the model |
| --- | --- |
| 5. .holo file | sealed |
| 6. Verify | bytes, evidence, policy |
| --- | --- |
| 7. Run or share | run, serve, push, pull |

## Each step

SentenceDescribe what the app decides. On the agent path, ask something like “Build me a Prism app that decides whether a payment is approved.”SpecPurpose, fields, outcomes, ordered rules, properties and examples. Read the properties most carefully: they are the only part that is proved.LexLean modelPrism writes the spec as a model in LexLean. The proof and the program both come from it. So a proof about the model is a proof about what runs.Proofs and programEach property becomes a theorem the Lean kernel checks. The program is a WebAssembly guest with no imports: no clock, randomness, network or files..holo fileOne file with the program, the model, its build record, its permissions and a browser view. Its BLAKE3 fingerprint names it.VerifyThree questions. Are these the sealed bytes? Who signed what? Is that evidence enough to run it here?Run or shareRun one request, serve the view on a port, or push to a registry. A pull writes nothing until the checks pass.

## Evidence levels

Before an app runs, Prism works out how much signed evidence it carries. Only signing raises the level. Apps built today are unsigned, so they are P0.

| Level | Carries | Asked for by |
| --- | --- | --- |
| P0 | Nothing signed (bytes and examples are still verified) | pull by default |
| P1 | A signed build record | the provenance-only policy |
| --- | --- | --- |
| P2 | Also a signed proof | run and check by default |
| P3 | Also a signed replay | your own policy file |

A policy says which level is enough. To run an unsigned app on purpose, write {"minimum":"P0"} to a policy file a reviewer can see.

## Where your source goes

Until the SDK image is on your machine, proofs run on the hosted verifier at mcp.uor.foundation. It stores the files under src/ unlisted. Anyone with the draft ID can read them.

Never put secrets in a model.

## Check yourself

What does the .holo fingerprint protect against?Wrong rulesChanged bytesSlow requestsWhy does prism-code run refuse the sample app by default?It is brokenIt is P0, and the default policy asks for P2It needs a network connectionWhich parts of an app are proved, rather than tested?Rules and examplesPropertiesAll of them

explanationMarkdown

PreviousWhy PrismNextTry the sample app
