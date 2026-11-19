// how-to guide · Build

# Choose a pattern

Set pattern in the prompt to choose how the answer is read. Each pattern follows a published standard, and the builder checks the prompt against it.

Patterns in the example gallery. The 34 example prompts on Prism-DevRel, counted by pattern. Most apps are decision tables.The data in this figure
|  | examples |
| --- | --- |
| decisionTable | 22 |
| policyDecision | 6 |
| --- | --- |
| stateMachine | 6 |

## Pick a pattern

| pattern | Pick it when | Standard | Guide |
| --- | --- | --- | --- |
| decisionTable (default) | The answer is one of your outcomes, chosen by ordered rules | OMG DMN 1.5, hit policy FIRST | Decision table guide |
| policyDecision | The answer is permit, deny, not-applicable or indeterminate | OASIS XACML 3.0 | Policy decision guide |
| --- | --- | --- | --- |
| stateMachine | The answer is the next state, from the current state and an event | OMG UML 2.5.1 | State machine guide |

## Write a state machine

The state travels in the request, so the app keeps nothing between requests. Fill in the machine member:

- state is the field that holds the current state.
- initial is the state a run starts in.
- final lists the states a run never leaves.
- The outcomes must be exactly the values of the state field.

Here is a door lock, summarized from a prompt the builder accepted:

```
"pattern": "stateMachine", "machine": {"state": "state", "initial": "closed", "final": ["retired"]}, fields: state = closed | open | locked | retired event = push | shut | lock | unlock | retire rules (first match wins): state is retired -> retired event is retire -> retired state is closed and event is push -> open state is closed and event is lock -> locked state is open and event is shut -> closed state is locked and event unlock -> closed state is open -> open state is locked -> locked otherwise -> closed properties: never locked when state is open never open when state is locked and event is push
```

Check it the same way as any prompt:

```
Door lock: State machine (OMG UML 2.5.1 behavioral state machine), 82 files, 30 acceptance vectors machine: 4 states from closed; reachable closed, open, locked, retired; final retired; derived INV-003 DL-01: The app never answers locked when state is open DL-02: The app never answers open when state is locked and event is push DL-03: The app always answers retired when state is retired ...
```

The builder found which states can be reached. From final, it added INV-003: a retired lock stays retired.

## Check yourself

The answers must be exactly permit, deny, not-applicable and indeterminate. Which pattern?decisionTablepolicyDecisionstateMachineWhere does a state machine app keep its state between requests?In a databaseIn the request itselfIn the browserWhat does the builder prove in addition for a state machine?A final state is never left, and no run leaves the reachable statesIt runs fasterNothing more

how-to guideMarkdown

PreviousYour first appNextShip your app
