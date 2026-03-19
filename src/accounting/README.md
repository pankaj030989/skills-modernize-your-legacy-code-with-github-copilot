# Accounting App (Node.js)

This folder contains the Node.js modernization of the legacy COBOL account management application.

## COBOL to Node.js Mapping

| Legacy COBOL Program | Responsibility | Node.js Module |
| --- | --- | --- |
| `src/cobol/main.cob` | Menu loop, user choice routing, exit handling | `lib/app.js` |
| `src/cobol/operations.cob` | Business operations (`TOTAL `, `CREDIT`, `DEBIT `) | `lib/operations.js` |
| `src/cobol/data.cob` | In-memory balance read/write storage | `lib/dataProgram.js` |

Supporting files:

- `index.js`: application entrypoint
- `lib/constants.js`: operation and menu constants preserving COBOL operation semantics
- `lib/io.js`: console input/output adapter for interactive and scripted execution

## Preserved Business Behavior

- Menu options remain `1` View Balance, `2` Credit Account, `3` Debit Account, `4` Exit.
- Starting balance is `1000.00` for each fresh run.
- `TOTAL ` displays the current balance only.
- `CREDIT` increases the current in-memory balance.
- `DEBIT ` only succeeds when balance is sufficient.
- Insufficient funds debits are rejected without changing balance.
- Invalid menu options show a validation message and return to the menu.
- Data is in-memory only and resets between runs.

## Run

From this directory:

```bash
npm install
npm start
```

## Test

The test suite includes both unit and integration tests aligned with the current business logic and migration expectations:

```bash
npm test
```

Test files:

- `test/operations.unit.test.js`
- `test/app.integration.test.js`
