// reference · Build

# Reference

Look up a term or a command. Nothing here needs to be read in order.

Signed statements at each evidence level. Each level adds one signed statement to the one before it. P0 carries none.The data in this figure
|  | signed statements |
| --- | --- |
| P0 | 0 |
| P1 | 1 |
| --- | --- |
| P2 | 2 |
| P3 | 3 |

## Terms

RuleA when and then line. Rules are tried in order, and the first match decides. Tested, not proved.ExampleA request with its exact expected answer. It becomes an acceptance vector carried in the app.WorldWhat the program may use. Today that is hologram:guest/core-wasm@1, which allows nothing.VerdictThe result of a policy check: the level, pass or fail, and every reason (prism/verdict/1).Hosted verifierThe service at mcp.uor.foundation. It checks and proves models when the SDK image is not on your machine.just vvThe complete acceptance gate of a template repository, run in the pinned SDK image.

Words marked on any page, such as property and policy, are defined at the foot of that page.

## Commands

```
# Set up the agent path (preview first) npx prism-code@latest setup --dry-run npx prism-code@latest setup # Look, replay, judge, run npx prism-code inspect app.holo npx prism-code vectors app.holo npx prism-code check app.holo --policy policy.json [--json] npx prism-code run app.holo "" --policy policy.json --rm npx prism-code run app.holo --port 8080 --policy policy.json # Catch changed answers between builds npx prism-code record app.holo --output history.json npx prism-code replay history.json --image new.holo # Share npx prism-code push app.holo dir://./store:1.0 npx prism-code pull dir://./store:1.0 pulled.holo # Prompt path, from a clone of afflom/prism-devrel node builder/cli.mjs check prompt.json node builder/cli.mjs build prompt.json --out my-app node builder/cli.mjs schema
```

## Where to go next

- The 34 example prompts: copy the closest one and change it.
- The prompt reference: every member, the CLI and the MCP tool.
- Give an agent the prism_prompt tool.
- Case studies: whole projects, read record by record.
- Use an app from JavaScript and catch changed answers.
- The CLI reference and the concepts page.

referenceMarkdown

PreviousShip your app
