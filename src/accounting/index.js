const { runApp } = require('./lib/app');
const { createDataProgram } = require('./lib/dataProgram');
const { createConsoleIO } = require('./lib/io');

async function main() {
  const io = createConsoleIO();
  const dataProgram = createDataProgram();
  await runApp(io, dataProgram);
}

main().catch((error) => {
  console.error('Application error:', error.message);
  process.exitCode = 1;
});