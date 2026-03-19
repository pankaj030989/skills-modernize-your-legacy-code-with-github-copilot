const test = require('node:test');
const assert = require('node:assert/strict');

const { runApp } = require('../lib/app');
const { createDataProgram } = require('../lib/dataProgram');

function createMockIO(answers = []) {
  const queue = [...answers];
  const logs = [];
  let closed = false;

  return {
    logs,
    get closed() {
      return closed;
    },
    async question(_promptText) {
      return queue.shift() ?? '';
    },
    print(message) {
      logs.push(message);
    },
    close() {
      closed = true;
    },
  };
}

async function runSession(answers) {
  const io = createMockIO(answers);
  const dataProgram = createDataProgram();
  await runApp(io, dataProgram);
  return { io, dataProgram };
}

function findLog(logs, text) {
  return logs.find((line) => line.includes(text));
}

function countLog(logs, text) {
  return logs.filter((line) => line.includes(text)).length;
}

test('TP-001: application starts and displays main menu', async () => {
  const { io } = await runSession(['4']);

  assert.ok(findLog(io.logs, 'Account Management System'));
  assert.ok(findLog(io.logs, '1. View Balance'));
  assert.ok(findLog(io.logs, '2. Credit Account'));
  assert.ok(findLog(io.logs, '3. Debit Account'));
  assert.ok(findLog(io.logs, '4. Exit'));
});

test('TP-002: fresh run starts with initial balance 1000.00', async () => {
  const { io } = await runSession(['1', '4']);

  assert.ok(findLog(io.logs, 'Current balance: 1000.00'));
});

test('TP-003: selecting option 4 exits the app', async () => {
  const { io } = await runSession(['4']);

  assert.ok(findLog(io.logs, 'Exiting the program. Goodbye!'));
  assert.equal(io.closed, true);
});

test('TP-004: invalid menu selections are rejected and return to menu', async () => {
  const { io } = await runSession(['9', '4']);

  assert.ok(findLog(io.logs, 'Invalid choice, please select 1-4.'));
  assert.ok(countLog(io.logs, 'Account Management System') >= 2);
});

test('TP-005: balance inquiry does not modify stored balance', async () => {
  const { io, dataProgram } = await runSession(['1', '1', '4']);

  assert.equal(countLog(io.logs, 'Current balance: 1000.00'), 2);
  assert.equal(dataProgram('READ'), 1000);
});

test('TP-006: credit transaction increases balance', async () => {
  const { io, dataProgram } = await runSession(['2', '200', '1', '4']);

  assert.ok(findLog(io.logs, 'Amount credited. New balance: 1200.00'));
  assert.ok(findLog(io.logs, 'Current balance: 1200.00'));
  assert.equal(dataProgram('READ'), 1200);
});

test('TP-007: multiple credit transactions are cumulative', async () => {
  const { io, dataProgram } = await runSession(['2', '100', '2', '50', '1', '4']);

  assert.ok(findLog(io.logs, 'Amount credited. New balance: 1100.00'));
  assert.ok(findLog(io.logs, 'Amount credited. New balance: 1150.00'));
  assert.ok(findLog(io.logs, 'Current balance: 1150.00'));
  assert.equal(dataProgram('READ'), 1150);
});

test('TP-008: debit transaction reduces balance when funds are available', async () => {
  const { io, dataProgram } = await runSession(['3', '100', '1', '4']);

  assert.ok(findLog(io.logs, 'Amount debited. New balance: 900.00'));
  assert.ok(findLog(io.logs, 'Current balance: 900.00'));
  assert.equal(dataProgram('READ'), 900);
});

test('TP-009: multiple debit transactions are cumulative with sufficient funds', async () => {
  const { io, dataProgram } = await runSession(['3', '100', '3', '50', '1', '4']);

  assert.ok(findLog(io.logs, 'Amount debited. New balance: 900.00'));
  assert.ok(findLog(io.logs, 'Amount debited. New balance: 850.00'));
  assert.ok(findLog(io.logs, 'Current balance: 850.00'));
  assert.equal(dataProgram('READ'), 850);
});

test('TP-010: debit equal to full available balance is allowed', async () => {
  const { io, dataProgram } = await runSession(['3', '1000', '1', '4']);

  assert.ok(findLog(io.logs, 'Amount debited. New balance: 0.00'));
  assert.ok(findLog(io.logs, 'Current balance: 0.00'));
  assert.equal(dataProgram('READ'), 0);
});

test('TP-011: insufficient debit is rejected and balance remains unchanged', async () => {
  const { io, dataProgram } = await runSession(['3', '1500', '1', '4']);

  assert.ok(findLog(io.logs, 'Insufficient funds for this debit.'));
  assert.ok(findLog(io.logs, 'Current balance: 1000.00'));
  assert.equal(dataProgram('READ'), 1000);
});

test('TP-012: failed debit does not affect subsequent successful operation', async () => {
  const { io, dataProgram } = await runSession(['3', '1500', '2', '100', '1', '4']);

  assert.ok(findLog(io.logs, 'Insufficient funds for this debit.'));
  assert.ok(findLog(io.logs, 'Amount credited. New balance: 1100.00'));
  assert.ok(findLog(io.logs, 'Current balance: 1100.00'));
  assert.equal(dataProgram('READ'), 1100);
});

test('TP-013: balance changes persist across menu actions in one session', async () => {
  const { io, dataProgram } = await runSession(['2', '75', '1', '4']);

  assert.ok(findLog(io.logs, 'Amount credited. New balance: 1075.00'));
  assert.ok(findLog(io.logs, 'Current balance: 1075.00'));
  assert.equal(dataProgram('READ'), 1075);
});

test('TP-014: balance is reset after application restart', async () => {
  const firstRun = await runSession(['2', '300', '4']);
  const secondRun = await runSession(['1', '4']);

  assert.ok(findLog(firstRun.io.logs, 'Amount credited. New balance: 1300.00'));
  assert.ok(findLog(secondRun.io.logs, 'Current balance: 1000.00'));
});

test('TP-015: app manages a single account only', async () => {
  const { io } = await runSession(['2', '10', '3', '5', '1', '4']);

  assert.ok(findLog(io.logs, 'Current balance: 1005.00'));
  assert.equal(findLog(io.logs, 'student id'), undefined);
  assert.equal(findLog(io.logs, 'account selector'), undefined);
});

test('TP-016: credit flow displays updated balance immediately', async () => {
  const { io } = await runSession(['2', '25', '4']);

  assert.ok(findLog(io.logs, 'Amount credited. New balance: 1025.00'));
});

test('TP-017: debit flow displays updated balance immediately', async () => {
  const { io } = await runSession(['3', '25', '4']);

  assert.ok(findLog(io.logs, 'Amount debited. New balance: 975.00'));
});

test('TP-018: app returns to menu after inquiry and transaction flows', async () => {
  const { io } = await runSession(['1', '2', '10', '3', '5', '4']);

  assert.ok(countLog(io.logs, 'Account Management System') >= 4);
});

test('TP-019: transaction ordering affects final balance', async () => {
  const { io, dataProgram } = await runSession(['2', '100', '3', '50', '1', '4']);

  assert.ok(findLog(io.logs, 'Current balance: 1050.00'));
  assert.equal(dataProgram('READ'), 1050);
});

test('TP-020: failed debit followed by restart leaves no residual state', async () => {
  const firstRun = await runSession(['3', '1500', '4']);
  const secondRun = await runSession(['1', '4']);

  assert.ok(findLog(firstRun.io.logs, 'Insufficient funds for this debit.'));
  assert.ok(findLog(secondRun.io.logs, 'Current balance: 1000.00'));
});
