# Accounting App (Node.js)

This folder contains the Node.js modernization of the legacy COBOL account management application.

## COBOL to Node.js Mapping

The modernization is consolidated into a single implementation file:

| Legacy COBOL Program | Responsibility | Node.js Implementation |
| --- | --- | --- |
| `src/cobol/main.cob` | Menu loop, user choice routing, exit handling | `index.js` (`runApp`) |
| `src/cobol/operations.cob` | Business operations (`TOTAL `, `CREDIT`, `DEBIT `) | `index.js` (`operationsProgram`) |
| `src/cobol/data.cob` | In-memory balance read/write storage | `index.js` (`createDataProgram`) |

Supporting behavior in `index.js`:

- `createConsoleIO`: console input/output adapter
- module exports for reuse in tests

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

- `test/accounting.test.js`
