const readline = require('node:readline/promises');
const { stdin, stdout } = require('node:process');

const INITIAL_BALANCE = 1000.0;

const MENU_CHOICES = {
  VIEW_BALANCE: '1',
  CREDIT_ACCOUNT: '2',
  DEBIT_ACCOUNT: '3',
  EXIT: '4',
};

const OPERATION_TYPES = {
  TOTAL: 'TOTAL ',
  CREDIT: 'CREDIT',
  DEBIT: 'DEBIT ',
};

const DATA_ACTIONS = {
  READ: 'READ',
  WRITE: 'WRITE',
};

function formatAmount(amount) {
  return amount.toFixed(2);
}

function displayMenu(io) {
  io.print('--------------------------------');
  io.print('Account Management System');
  io.print('1. View Balance');
  io.print('2. Credit Account');
  io.print('3. Debit Account');
  io.print('4. Exit');
  io.print('--------------------------------');
}

function createDataProgram() {
  let storageBalance = INITIAL_BALANCE;

  return function dataProgram(action, balance = storageBalance) {
    if (action === DATA_ACTIONS.READ) {
      return storageBalance;
    }

    if (action === DATA_ACTIONS.WRITE) {
      storageBalance = balance;
      return storageBalance;
    }

    throw new Error(`Unsupported data action: ${action}`);
  };
}

function createConsoleIO() {
  const rl = readline.createInterface({ input: stdin, output: stdout });

  return {
    async question(promptText) {
      return rl.question(promptText);
    },
    print(message) {
      console.log(message);
    },
    close() {
      rl.close();
    },
  };
}

async function promptForAmount(io, promptText) {
  const answer = await io.question(promptText);
  const amount = Number.parseFloat(answer.trim());

  // PIC 9(6)V99 semantics: unsigned numeric amount, up to 2 decimals.
  if (!Number.isFinite(amount) || amount < 0) {
    io.print('Invalid amount. Please enter a positive numeric value.');
    return null;
  }

  return amount;
}

async function handleCredit(io, dataProgram) {
  const amount = await promptForAmount(io, 'Enter credit amount: ');
  if (amount === null) {
    return;
  }

  const finalBalance = dataProgram(DATA_ACTIONS.READ) + amount;
  dataProgram(DATA_ACTIONS.WRITE, finalBalance);
  io.print(`Amount credited. New balance: ${formatAmount(finalBalance)}`);
}

async function handleDebit(io, dataProgram) {
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
}

async function operationsProgram(io, operationType, dataProgram) {
  if (operationType === OPERATION_TYPES.TOTAL) {
    const finalBalance = dataProgram(DATA_ACTIONS.READ);
    io.print(`Current balance: ${formatAmount(finalBalance)}`);
    return;
  }

  if (operationType === OPERATION_TYPES.CREDIT) {
    await handleCredit(io, dataProgram);
    return;
  }

  if (operationType === OPERATION_TYPES.DEBIT) {
    await handleDebit(io, dataProgram);
    return;
  }

  throw new Error(`Unsupported operation type: ${operationType}`);
}

async function runApp(io, dataProgram) {
  let continueFlag = true;

  try {
    while (continueFlag) {
      displayMenu(io);
      const userChoice = (await io.question('Enter your choice (1-4): ')).trim();

      switch (userChoice) {
        case MENU_CHOICES.VIEW_BALANCE:
          await operationsProgram(io, OPERATION_TYPES.TOTAL, dataProgram);
          break;
        case MENU_CHOICES.CREDIT_ACCOUNT:
          await operationsProgram(io, OPERATION_TYPES.CREDIT, dataProgram);
          break;
        case MENU_CHOICES.DEBIT_ACCOUNT:
          await operationsProgram(io, OPERATION_TYPES.DEBIT, dataProgram);
          break;
        case MENU_CHOICES.EXIT:
          continueFlag = false;
          break;
        default:
          io.print('Invalid choice, please select 1-4.');
      }
    }

    io.print('Exiting the program. Goodbye!');
  } finally {
    io.close();
  }
}

async function mainProgram() {
  const io = createConsoleIO();
  const dataProgram = createDataProgram();
  await runApp(io, dataProgram);
}

if (require.main === module) {
  mainProgram().catch((error) => {
    console.error('Application error:', error.message);
    process.exitCode = 1;
  });
}

module.exports = {
  createDataProgram,
  runApp,
  operationsProgram,
  handleCredit,
  handleDebit,
  createConsoleIO,
};