import inquirer from 'inquirer';
import chalk from 'chalk';

const examples = [
  { name: 'generate-keys', description: 'Generates new keys' },
  { name: 'admin-add-user', description: 'Adds a new user' },
  { name: 'get-balance', description: 'Checks the balance' },
  { name: 'create-transaction', description: 'Creates a transaction' },
  { name: 'list-transactions', description: 'Lists all transactions' },
  { name: 'handle-exceptions', description: 'Handles exceptions' },
  { name: 'custom-logger', description: 'Configures the internal logger' },
  { name: 'send-op-return', description: 'Sends an OP_RETURN transaction' },
  { name: 'admin-remove-user', description: 'Removes the user' }
];

const showExamples = async () => {
  console.log('\n\n' + chalk.green('Quick Guide on How to Run Examples\n'));
  console.log(chalk.blue('Pre-requisites:'));
  console.log(chalk.yellow('- You have access to the spv-wallet non-custodial wallet.'));
  console.log(chalk.yellow('- You have installed this package on your machine.'));
  console.log(chalk.yellow('- Ensure you have the correct adminKey and other keys configured.\n'));

  console.log(chalk.blue('Proposed Order of Executing Examples:\n'));
  examples.forEach((example, index) => {
    console.log(chalk.cyan(`${index + 1}. ${example.name}: ${example.description}`));
  });

  console.log('\n' + chalk.blue('How to Run an Example:'));
  console.log(chalk.yellow('1. cd examples'));
  console.log(chalk.yellow('2. yarn name-of-the-example\n'));
  console.log(chalk.yellow('See the package.json for the list of available examples and scripts.\n'));

  await pauseInterface();
  await mainMenu();
};

const pauseInterface = async () => {
  const pauseQuestion = [
    {
      type: 'input',
      name: 'continue',
      message: 'Press Enter to continue...'
    }
  ];
  await inquirer.prompt(pauseQuestion);
};

const startTutorial = async () => {
  console.log(chalk.green('Starting the tutorial...'));
  // Add your tutorial steps here
  await pauseInterface();
  await mainMenu();
};

const mainMenu = async () => {
  const mainChoices = ['Start the tutorial', 'List the examples'];

  const answer = await inquirer.prompt([
    {
      type: 'list',
      name: 'mainAction',
      message: "Hello, it's a tutorial on how to use our library. Choose an option:",
      choices: mainChoices
    }
  ]);

  if (answer.mainAction === 'Start the tutorial') {
    await startTutorial();
  } else if (answer.mainAction === 'List the examples') {
    await showExamples();
  }
};

mainMenu().then(r => "Tutorial completed.");
