# COBOL Student Account Test Plan

This test plan covers the current business logic and observable implementation behavior of the COBOL application. It is intended for validation with business stakeholders before the behavior is reproduced in a Node.js implementation.

| Test Case ID | Test Case Description | Pre-conditions | Test Steps | Expected Result | Actual Result | Status (Pass/Fail) | Comments |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TP-001 | Verify the application starts and displays the main menu | The application is compiled and runnable | 1. Start the application.<br>2. Observe the first screen shown to the user. | The system displays the Account Management System menu with options for View Balance, Credit Account, Debit Account, and Exit. |  |  |  |
| TP-002 | Verify the initial account balance for a fresh application run | The application is not currently running | 1. Start the application.<br>2. Select View Balance. | The displayed balance is `1000.00`, confirming the initial starting balance for a new run. |  |  |  |
| TP-003 | Verify the user can exit the application | The application is running at the main menu | 1. Select menu option `4`. | The application ends the loop and displays the goodbye message before terminating. |  |  |  |
| TP-004 | Verify invalid menu selections are rejected | The application is running at the main menu | 1. Enter a menu choice outside `1` to `4`, such as `9`. | The application displays an invalid choice message and returns to the main menu without changing the balance. |  |  |  |
| TP-005 | Verify a balance inquiry does not change the stored balance | The application is running with the initial balance or another known balance | 1. Select View Balance.<br>2. Record the displayed balance.<br>3. Select View Balance again. | The same balance is displayed both times. No data is changed by a balance inquiry. |  |  |  |
| TP-006 | Verify a credit transaction increases the balance | The application is running and the current balance is known | 1. Select Credit Account.<br>2. Enter `200.00`.<br>3. Select View Balance. | The balance increases by `200.00` from the prior amount and the updated balance is displayed consistently. |  |  |  |
| TP-007 | Verify multiple credit transactions are cumulative | The application is running with a known balance | 1. Select Credit Account and enter `100.00`.<br>2. Select Credit Account and enter `50.00`.<br>3. Select View Balance. | The balance increases by the total of both credits, confirming cumulative updates within the same run. |  |  |  |
| TP-008 | Verify a debit transaction reduces the balance when funds are available | The application is running and the current balance is at least `100.00` | 1. Select Debit Account.<br>2. Enter `100.00`.<br>3. Select View Balance. | The balance decreases by `100.00` and the updated balance is displayed. |  |  |  |
| TP-009 | Verify multiple debit transactions are cumulative when funds remain available | The application is running with a known balance greater than the total debits | 1. Select Debit Account and enter `100.00`.<br>2. Select Debit Account and enter `50.00`.<br>3. Select View Balance. | The balance decreases by the total of both debits, confirming cumulative updates within the same run. |  |  |  |
| TP-010 | Verify a debit equal to the full available balance is allowed | The application is running and the balance is known | 1. Set or reach a known balance, such as `1000.00` on a fresh run.<br>2. Select Debit Account.<br>3. Enter the full available balance amount.<br>4. Select View Balance. | The debit succeeds because the available balance is greater than or equal to the debit amount. The resulting balance is `0.00`. |  |  |  |
| TP-011 | Verify a debit is rejected when funds are insufficient | The application is running and the balance is known | 1. Select Debit Account.<br>2. Enter an amount greater than the current balance, such as `1500.00` on a fresh run.<br>3. Select View Balance. | The system displays an insufficient funds message. The balance remains unchanged. |  |  |  |
| TP-012 | Verify a failed debit does not alter subsequent successful operations | The application is running and the balance is known | 1. Attempt a debit greater than the current balance.<br>2. Confirm the insufficient funds message.<br>3. Perform a valid credit or debit transaction.<br>4. View Balance. | The failed debit does not corrupt the stored balance. Subsequent valid transactions operate against the unchanged prior balance. |  |  |  |
| TP-013 | Verify balance changes persist across menu actions within the same application session | The application is running | 1. Perform a credit or debit transaction.<br>2. Return to the main menu.<br>3. Select View Balance. | The updated balance is retained during the current application session and shown correctly on later menu actions. |  |  |  |
| TP-014 | Verify the balance is not persisted after the application is restarted | The application can be started, stopped, and started again | 1. Start the application.<br>2. Perform a credit or debit transaction that changes the balance.<br>3. Exit the application.<br>4. Start the application again.<br>5. Select View Balance. | The balance is reset to `1000.00` on the new run, showing that storage is in-memory only and not persisted between executions. |  |  |  |
| TP-015 | Verify the application manages a single account balance only | The application is running | 1. Review available menu options and prompts.<br>2. Perform several balance changes.<br>3. Observe whether any student identifier or account selector is requested. | All transactions apply to one shared balance. The application does not support selecting or maintaining separate student accounts. |  |  |  |
| TP-016 | Verify the credit flow displays the updated balance immediately after processing | The application is running with a known balance | 1. Select Credit Account.<br>2. Enter `25.00`.<br>3. Observe the confirmation message. | The system confirms the credit and displays the new balance immediately after the transaction. |  |  |  |
| TP-017 | Verify the debit flow displays the updated balance immediately after processing | The application is running with a balance greater than `25.00` | 1. Select Debit Account.<br>2. Enter `25.00`.<br>3. Observe the confirmation message. | The system confirms the debit and displays the new balance immediately after the transaction. |  |  |  |
| TP-018 | Verify the system can return to the menu after inquiry and transaction flows | The application is running | 1. Select View Balance.<br>2. Return to the menu.<br>3. Select Credit Account or Debit Account.<br>4. Complete the transaction.<br>5. Observe the next screen. | After each operation, the system returns control to the main menu until the user explicitly chooses Exit. |  |  |  |
| TP-019 | Verify transaction ordering affects the final balance as expected | The application is running with the fresh starting balance | 1. Start with a fresh run.<br>2. Credit `100.00`.<br>3. Debit `50.00`.<br>4. View Balance. | The final balance is `1050.00`, showing that transactions are processed in the sequence entered by the user. |  |  |  |
| TP-020 | Verify a failed debit followed by restart does not leave residual state | The application can be started more than once | 1. Start the application.<br>2. Attempt an overdraw debit.<br>3. Exit the application.<br>4. Restart the application.<br>5. View Balance. | The restarted application shows the default `1000.00` balance, confirming that no failed or successful transaction state survives across runs. |  |  |  |

## Notes For Node.js Modernization

- These test cases intentionally capture both business expectations and current implementation behavior.
- Test cases `TP-014`, `TP-015`, and `TP-020` are especially important because they document current technical limitations that may change in the future Node.js design.
- The `Actual Result`, `Status (Pass/Fail)`, and `Comments` columns are left blank so business stakeholders and testers can complete them during validation sessions.

## Automation Traceability

The following table maps each business test case in this plan to its automated implementation in [src/accounting/test/accounting.test.js](src/accounting/test/accounting.test.js).

| Test Case ID | Automated Test Name |
| --- | --- |
| TP-001 | `TP-001: application starts and displays main menu` |
| TP-002 | `TP-002: fresh run starts with initial balance 1000.00` |
| TP-003 | `TP-003: selecting option 4 exits the app` |
| TP-004 | `TP-004: invalid menu selections are rejected and return to menu` |
| TP-005 | `TP-005: balance inquiry does not modify stored balance` |
| TP-006 | `TP-006: credit transaction increases balance` |
| TP-007 | `TP-007: multiple credit transactions are cumulative` |
| TP-008 | `TP-008: debit transaction reduces balance when funds are available` |
| TP-009 | `TP-009: multiple debit transactions are cumulative with sufficient funds` |
| TP-010 | `TP-010: debit equal to full available balance is allowed` |
| TP-011 | `TP-011: insufficient debit is rejected and balance remains unchanged` |
| TP-012 | `TP-012: failed debit does not affect subsequent successful operation` |
| TP-013 | `TP-013: balance changes persist across menu actions in one session` |
| TP-014 | `TP-014: balance is reset after application restart` |
| TP-015 | `TP-015: app manages a single account only` |
| TP-016 | `TP-016: credit flow displays updated balance immediately` |
| TP-017 | `TP-017: debit flow displays updated balance immediately` |
| TP-018 | `TP-018: app returns to menu after inquiry and transaction flows` |
| TP-019 | `TP-019: transaction ordering affects final balance` |
| TP-020 | `TP-020: failed debit followed by restart leaves no residual state` |