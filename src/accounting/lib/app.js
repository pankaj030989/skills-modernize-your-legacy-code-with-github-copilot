const { MENU_CHOICES, OPERATION_TYPES } = require('./constants');
const { operationsProgram } = require('./operations');

function displayMenu(io) {
  io.print('--------------------------------');
  io.print('Account Management System');
  io.print('1. View Balance');
  io.print('2. Credit Account');
  io.print('3. Debit Account');
  io.print('4. Exit');
  io.print('--------------------------------');
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
          break;
      }
    }

    io.print('Exiting the program. Goodbye!');
  } finally {
    io.close();
  }
}

module.exports = {
  displayMenu,
  runApp,
};
