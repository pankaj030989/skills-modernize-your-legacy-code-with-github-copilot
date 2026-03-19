const { DATA_ACTIONS, INITIAL_BALANCE } = require('./constants');

function createDataProgram(initialBalance = INITIAL_BALANCE) {
  let storageBalance = initialBalance;

  function dataProgram(action, balance = storageBalance) {
    if (action === DATA_ACTIONS.READ) {
      return storageBalance;
    }

    if (action === DATA_ACTIONS.WRITE) {
      storageBalance = balance;
      return storageBalance;
    }

    throw new Error(`Unsupported data action: ${action}`);
  }

  return dataProgram;
}

module.exports = {
  createDataProgram,
};
