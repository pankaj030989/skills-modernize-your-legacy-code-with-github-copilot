const fs = require('node:fs');
const readline = require('node:readline/promises');
const { stdin: defaultInput, stdout: defaultOutput } = require('node:process');

function createConsoleIO(input = defaultInput, output = defaultOutput) {
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
      print(message) {
        output.write(`${message}\n`);
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
    print(message) {
      output.write(`${message}\n`);
    },
    close() {
      rl.close();
    },
  };
}

module.exports = {
  createConsoleIO,
};
