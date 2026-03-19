const fs = require('node:fs');
const readline = require('node:readline/promises');
const { stdin: input, stdout: output } = require('node:process');

const INITIAL_BALANCE = 1000.0;

const MENU_CHOICES = {
  VIEW_BALANCE: '1',
  CREDIT_ACCOUNT: '2',
  DEBIT_ACCOUNT: '3',
  EXIT: '4',
};

let storageBalance = INITIAL_BALANCE;

function formatAmount(amount) {
  return amount.toFixed(2);
}

function displayMenu() {
  console.log('--------------------------------');
  console.log('Account Management System');
  console.log('1. View Balance');
  console.log('2. Credit Account');
  console.log('3. Debit Account');
  console.log('4. Exit');
  console.log('--------------------------------');
}

function createPrompt() {
  if (!input.isTTY) {
    const scriptedAnswers = fs.readFileSync(0, 'utf8').split(/\r?\n/);
    let answerIndex = 0;

    return {
      async question(promptText) {
        output.write(promptText);
        const answer = scriptedAnswers[answerIndex] ?? '';
        answerIndex += 1;
        return answer;
      },
      close() {},
    };
  }

  const rl = readline.createInterface({
    input,
    output,
    terminal: true,
  });

  return {
    question(promptText) {
      return rl.question(promptText);
    },
    close() {
      rl.close();
    },
  };
}

async function promptForAmount(prompt, promptText) {
  const answer = await prompt.question(promptText);
  const parsedAmount = Number.parseFloat(answer.trim());

  if (!Number.isFinite(parsedAmount) || parsedAmount < 0) {
    console.log('Invalid amount. Please enter a positive numeric value.');
    return null;
  }

  return parsedAmount;
}

async function handleCredit(prompt) {
  const amount = await promptForAmount(prompt, 'Enter credit amount: ');
  if (amount === null) {
    return;
  }

  storageBalance += amount;
  console.log(`Amount credited. New balance: ${formatAmount(storageBalance)}`);
}

async function handleDebit(prompt) {
  const amount = await promptForAmount(prompt, 'Enter debit amount: ');
  if (amount === null) {
    return;
  }

  if (storageBalance >= amount) {
    storageBalance -= amount;
    console.log(`Amount debited. New balance: ${formatAmount(storageBalance)}`);
    return;
  }

  console.log('Insufficient funds for this debit.');
}

async function main() {
  const prompt = createPrompt();
  let continueFlag = true;

  try {
    while (continueFlag) {
      displayMenu();
      const userChoice = (await prompt.question('Enter your choice (1-4): ')).trim();

      switch (userChoice) {
        case MENU_CHOICES.VIEW_BALANCE:
          console.log(`Current balance: ${formatAmount(storageBalance)}`);
          break;
        case MENU_CHOICES.CREDIT_ACCOUNT:
          await handleCredit(prompt);
          break;
        case MENU_CHOICES.DEBIT_ACCOUNT:
          await handleDebit(prompt);
          break;
        case MENU_CHOICES.EXIT:
          continueFlag = false;
          break;
        default:
          console.log('Invalid choice, please select 1-4.');
          break;
      }
    }

    console.log('Exiting the program. Goodbye!');
  } finally {
    prompt.close();
  }
}

main().catch((error) => {
  console.error('Application error:', error.message);
  process.exitCode = 1;
});