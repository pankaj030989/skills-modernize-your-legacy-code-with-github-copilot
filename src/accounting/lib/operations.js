const { DATA_ACTIONS, OPERATION_TYPES } = require('./constants');

function formatAmount(amount) {
  return amount.toFixed(2);
}

async function promptForAmount(io, promptText) {
  const answer = await io.question(promptText);
  const parsedAmount = Number.parseFloat(answer.trim());

  if (!Number.isFinite(parsedAmount) || parsedAmount < 0) {
    io.print('Invalid amount. Please enter a positive numeric value.');
    return null;
  }

  return parsedAmount;
}

async function operationsProgram(io, operationType, dataProgram) {
  if (operationType === OPERATION_TYPES.TOTAL) {
    const finalBalance = dataProgram(DATA_ACTIONS.READ);
    io.print(`Current balance: ${formatAmount(finalBalance)}`);
    return;
  }

  if (operationType === OPERATION_TYPES.CREDIT) {
    const amount = await promptForAmount(io, 'Enter credit amount: ');

    if (amount === null) {
      return;
    }

    const finalBalance = dataProgram(DATA_ACTIONS.READ) + amount;
    dataProgram(DATA_ACTIONS.WRITE, finalBalance);
    io.print(`Amount credited. New balance: ${formatAmount(finalBalance)}`);
    return;
  }

  if (operationType === OPERATION_TYPES.DEBIT) {
    const amount = await promptForAmount(io, 'Enter debit amount: ');

    if (amount === null) {
      return;
    }

    const finalBalance = dataProgram(DATA_ACTIONS.READ);

    if (finalBalance >= amount) {
      const updatedBalance = finalBalance - amount;
      dataProgram(DATA_ACTIONS.WRITE, updatedBalance);
      io.print(`Amount debited. New balance: ${formatAmount(updatedBalance)}`);
      return;
    }

    io.print('Insufficient funds for this debit.');
    return;
  }

  throw new Error(`Unsupported operation type: ${operationType}`);
}

module.exports = {
  formatAmount,
  operationsProgram,
};
