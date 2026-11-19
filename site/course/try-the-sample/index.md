// tutorial · Learn

# Try the sample app

The prism-code package ships a small Calculator app. These seven steps use it. Every output below is what prism-code 0.9.5 printed, with long digests shortened.

Seven commands on the sample app. Each step uses the same file. Nothing is built; you only read, judge and run it.The data in this figure
| Step | What happens |
| --- | --- |
| 1. Install | npm install |
| 2. Inspect | read, not run |
| --- | --- |
| 3. Vectors | replay examples |
| 4. Check | default policy |
| --- | --- |
| 5. Policy | accept P0 |
| 6. Run | three requests |
| --- | --- |
| 7. Push and pull | local store |

## 1. Install the package

The package bundles the sample app. Keep its path in a variable.

```
npm install prism-code H=node_modules/prism-code/fixtures/Calculator.holo
```

## 2. Look inside without running it

```
npx prism-code inspect $H
```

```
Name: Calculator Size: 24801 B Footer: 8408e089...21ba (BLAKE3 of the body) Model: Function: calculate Vectors: 22 Limits: request 52 B, response 27 B, guest allocation 65536 B World: Imports: none Purity: pure: no clock, random, socket or filesystem import Attestations: none Verification: Footer: ok Labels: ok Cross-references: ok
```

Nothing runs. Imports: none means the app cannot reach a clock, randomness, the network or files.

## 3. Replay every example

```
npx prism-code vectors $H
```

```
22 of 22 vectors passed (holo, Calculator, identities verified)
```

Each example is compared byte for byte. Exit code 0 means all of them passed.

## 4. Ask for a verdict

```
npx prism-code check $H; echo "exit=$?"
```

```
FAILED P0 unverified policy default requires P2 or above Reasons: provenance.statement (Verification, withholds P1) proof.statement (ProofMismatch, withholds P2) replay.statement (Replay, withholds P3) policy.level (PP5601, Verification, policy rule) The level is P0; the policy requires P2 or above. exit=1
```

This is the safety check working. The bytes are fine, but nothing is signed.

## 5. Accept P0 on purpose

```
echo '{"minimum":"P0"}' > policy.json npx prism-code check $H --policy policy.json --json
```

```
{"holo":"blake3:8408e089...21ba","level":"P0","passed":true, "policy":{"minimum":"P0","name":"policy.json"},"schema":"prism/verdict/1"}
```

--allow-unverified does the same, but warns on every start. A policy file is better, because a reviewer can see it.

## 6. Send requests

A request is tab-separated: version, operation, then the operands.

```
npx prism-code run $H "$(printf '1\tadd\t20\t22')" --policy policy.json --rm npx prism-code run $H "$(printf '1\tdivide\t1\t0')" --policy policy.json --rm; echo " exit=$?" npx prism-code run $H "$(printf '1\tmod\t1\t2')" --policy policy.json --rm
```

```
1 ok 42 1 error division-by-zero exit=0 1 error unknown-operation
```

The operations are add, subtract, multiply and divide. An error answer is still a successful run, so the exit code is 0. --rm keeps no run record.

## 7. Push and pull

```
npx prism-code push $H dir://./store:1.0 npx prism-code pull dir://./store:1.0 pulled.holo cmp $H pulled.holo && echo identical
```

```
1.0: digest: sha256:208bb91c...b5e4 size: 968 fingerprint: blake3:8408e089...21ba Verdict: P0, policy pull-default requires P0 Status: Verified and wrote pulled.holo identical
```

pull accepts P0, while run and check ask for P2. A failed check writes nothing.

## Exit codes

| Command | 0 | 1 | 2 |
| --- | --- | --- | --- |
| check | passed | failed the policy | no verdict: treat it as a failure |
| vectors | every example matched | a mismatch, or an altered file |  |
| --- | --- | --- | --- |
| replay | unchanged | diverged | could not replay |
| builder/cli.mjs check | accepted |  | refused (64 is a usage error) |

## Check yourself

What does prism-code inspect do to the app?Runs every exampleReads it without running itSigns itA divide by zero answers 1 error division-by-zero. What is the exit code?012prism-code check exits 2. What does that mean?Passed with warningsFailed the policyNo verdict: treat it as a failure

tutorialMarkdown

PreviousHow it worksNextYour first app
