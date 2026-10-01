#!/usr/bin/env node

const readline = require('readline');
const chalk = require('chalk');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const version = '1.1.0';

// Responsive terminal width detection
function termWidth() {
  return process.stdout.columns || 80;
}

function isNarrow() {
  return termWidth() < 60;
}

function separator() {
  return chalk.gray('  ' + '═'.repeat(Math.min(termWidth() - 4, 50)));
}

function wideBanner() {
  console.log(chalk.bold.amber(`
  ██████╗ ██████╗ ██████╗      ██╗ ██████╗ ██████╗ ███████╗
 ██╔═══██╗██╔══██╗██╔══██╗     ██║██╔═══██╗██╔══██╗██╔════╝
 ██║   ██║██║  ██║██║  ██║     ██║██║   ██║██████╔╝███████╗
 ██║   ██║██║  ██║██║  ██║██   ██║██║   ██║██╔══██╗╚════██║
 ╚██████╔╝██████╔╝██████╔╝╚█████╔╝╚██████╔╝██████╔╝███████║
  ╚═════╝ ╚═════╝ ╚═════╝  ╚════╝  ╚═════╝ ╚═════╝ ╚══════╝
  `));
}

function narrowBanner() {
  console.log(chalk.bold.amber(`
   ██████╗ ██████╗ ██████╗
  ██╔═══██╗██╔══██╗██╔══██╗
  ██║   ██║██║  ██║██║  ██║
  ██║   ██║██║  ██║██║  ██║
  ╚██████╔╝██████╔╝██████╔╝
   ╚═════╝ ╚═════╝ ╚═════╝
  `));
}

function printBanner() {
  if (isNarrow()) {
    narrowBanner();
  } else {
    wideBanner();
  }
  console.log(chalk.gray('  MSU-IIT Student Workforce Marketplace CLI v' + version));
  console.log(chalk.gray('  Type "help" for available commands\n'));
}

function printHelp() {
  console.log(chalk.bold('\n  Available Commands:\n'));
  console.log(chalk.cyan('  browse [category]') + chalk.gray('     - List available jobs'));
  console.log(chalk.cyan('  post') + chalk.gray('                  - Post a new job (interactive)'));
  console.log(chalk.cyan('  profile') + chalk.gray('               - View your profile & stats'));
  console.log(chalk.cyan('  connect') + chalk.gray('               - Find random campus connections'));
  console.log(chalk.cyan('  escrow') + chalk.gray('                - Check escrow status'));
  console.log(chalk.cyan('  search <query>') + chalk.gray('       - Search jobs by keyword'));
  console.log(chalk.cyan('  notify') + chalk.gray('                - Check notifications'));
  console.log(chalk.cyan('  clear') + chalk.gray('                 - Clear terminal'));
  console.log(chalk.cyan('  help') + chalk.gray('                  - Show this help'));
  console.log(chalk.cyan('  exit') + chalk.gray('                  - Exit the CLI\n'));
}

const jobs = [
  { id: 1, title: 'Laravel Lab Portal', category: 'Web Development', budget: 1200, location: 'MSU-IIT', status: 'open' },
  { id: 2, title: 'Intramurals Photo Coverage', category: 'Photography', budget: 1600, location: 'MSU-IIT', status: 'open' },
  { id: 3, title: 'Calculus 2 Tutoring', category: 'Academic Tutoring', budget: 1500, location: 'MSU-IIT', status: 'open' },
  { id: 4, title: 'Org T-Shirt Vector Design', category: 'Graphic Design', budget: 750, location: 'MSU-IIT', status: 'open' },
  { id: 5, title: 'Event Setup & Logistics', category: 'Event Support', budget: 2000, location: 'MSU-IIT', status: 'open' },
  { id: 6, title: 'Research Paper Encoder', category: 'Errands & Logistics', budget: 800, location: 'MSU-IIT', status: 'open' },
];

const connections = [
  { name: 'Andrea Mae Gomez', role: 'COET Student Freelancer', interests: ['Design', 'Photography'], online: true },
  { name: 'Derrick Tan', role: 'Silahis Photojournalist', interests: ['Photography', 'Events'], online: true },
  { name: 'Kaye Althea Lim', role: 'CASS Debating Union', interests: ['Debate', 'Public Speaking'], online: false },
  { name: 'Bea Villanueva', role: 'CSM Biological Society', interests: ['Tutoring', 'Biology'], online: true },
  { name: 'Engr. Kevin Vance Alcantara', role: 'FabLab Mindanao', interests: ['3D Printing', 'Prototyping'], online: true },
];

function cmdBrowse(args) {
  const category = args[0] ? args[0].toLowerCase() : null;
  const filtered = category
    ? jobs.filter(j => j.category.toLowerCase().includes(category) || j.title.toLowerCase().includes(category))
    : jobs;

  console.log(chalk.bold('\n  ═══ Available Jobs ═══\n'));
  if (filtered.length === 0) {
    console.log(chalk.gray('  No jobs found matching your criteria.\n'));
    return;
  }

  if (isNarrow()) {
    filtered.forEach(job => {
      console.log(chalk.cyan(`  [${job.id}] ${job.title}`));
      console.log(chalk.gray(`      ${job.category}`));
      console.log(chalk.green(`      ₱${job.budget}\n`));
    });
  } else {
    filtered.forEach(job => {
      console.log(chalk.cyan(`  [${job.id}] ${job.title}`));
      console.log(chalk.gray(`      Category: ${job.category}`));
      console.log(chalk.green(`      Budget: ₱${job.budget}`));
      console.log(chalk.gray(`      Location: ${job.location}`));
      console.log(chalk.gray(`      Status: ${job.status}\n`));
    });
  }
  console.log(chalk.gray(`  Showing ${filtered.length} job(s)\n`));
}

function cmdPost() {
  const questions = [
    { name: 'title', message: '  Job title: ', validate: (i) => i.length > 0 || 'Title is required' },
    { name: 'category', message: '  Category: ' },
    { name: 'budget', message: '  Budget (₱): ', validate: (i) => !isNaN(i) || 'Must be a number' },
    { name: 'description', message: '  Description: ' },
  ];

  let answers = {};
  let qi = 0;

  function askNext() {
    if (qi >= questions.length) {
      console.log(chalk.green('\r  ✓ Job posted successfully!          \n'));
      console.log(chalk.bold('  ═══ Job Posted ═══\n'));
      console.log(chalk.cyan(`  Title: ${answers.title}`));
      console.log(chalk.gray(`  Category: ${answers.category}`));
      console.log(chalk.green(`  Budget: ₱${answers.budget}`));
      console.log(chalk.gray(`  Description: ${answers.description}\n`));
      prompt();
      return;
    }

    const q = questions[qi];
    rl.question(chalk.yellow(q.message), (answer) => {
      if (q.validate && !q.validate(answer)) {
        console.log(chalk.red('  Invalid input, try again.'));
        askNext();
        return;
      }
      answers[q.name] = answer;
      qi++;
      askNext();
    });
  }

  console.log(chalk.bold('\n  ═══ Post a New Job ═══\n'));
  askNext();
}

function cmdProfile() {
  console.log(chalk.bold('\n  ═══ Your Profile ═══\n'));
  console.log(chalk.cyan('  Name: Charles Caballes'));
  console.log(chalk.gray('  Role: Student Worker'));
  console.log(chalk.gray('  University: MSU-IIT'));
  console.log(chalk.gray('  Course: BS Computer Applications'));
  console.log(chalk.gray('  Year: 3rd Year\n'));
  console.log(chalk.green('  Rating: 4.9/5.0 ★'));
  console.log(chalk.green('  Jobs Completed: 12'));
  console.log(chalk.green('  Total Earnings: ₱15,400'));
  console.log(chalk.green('  Campus Trust: 100%\n'));
}

function cmdConnect() {
  console.log(chalk.gray('\n  Finding connections...'));

  setTimeout(() => {
    const online = connections.filter(c => c.online);
    const match = online[Math.floor(Math.random() * online.length)];
    console.log(chalk.green('  ✓ Connection found!\n'));
    console.log(chalk.bold('  ═══ New Connection ═══\n'));
    console.log(chalk.cyan(`  Name: ${match.name}`));
    console.log(chalk.gray(`  Role: ${match.role}`));
    console.log(chalk.gray(`  Interests: ${match.interests.join(', ')}`));
    console.log(chalk.green(`  Status: Online\n`));
    prompt();
  }, 1500);
}

function cmdEscrow() {
  console.log(chalk.bold('\n  ═══ Escrow Status ═══\n'));
  console.log(chalk.green('  Active Escrows: 3'));
  console.log(chalk.green('  Total in Escrow: ₱4,350'));
  console.log(chalk.green('  Completed: 12'));
  console.log(chalk.green('  Total Paid Out: ₱15,400\n'));
  console.log(chalk.gray('  All transactions protected by'));
  console.log(chalk.gray('  MSU-IIT institutional verification.\n'));
}

function cmdSearch(args) {
  const query = args.join(' ').toLowerCase();
  if (!query) {
    console.log(chalk.yellow('  Usage: search <keyword>\n'));
    return;
  }
  const results = jobs.filter(j =>
    j.title.toLowerCase().includes(query) ||
    j.category.toLowerCase().includes(query)
  );
  console.log(chalk.bold(`\n  ═══ Search: "${args.join(' ')}" ═══\n`));
  if (results.length === 0) {
    console.log(chalk.gray('  No results found.\n'));
    return;
  }
  results.forEach(job => {
    console.log(chalk.cyan(`  [${job.id}] ${job.title}`));
    console.log(chalk.gray(`      ${job.category} • ₱${job.budget}\n`));
  });
}

function cmdNotify() {
  console.log(chalk.bold('\n  ═══ Notifications ═══\n'));
  console.log(chalk.green('  ● New job match: "Laravel Developer"'));
  console.log(chalk.green('  ● Payment received: ₱1,200 from SSC'));
  console.log(chalk.green('  ● New connection: Derrick Tan'));
  console.log(chalk.gray('  ● Reminder: Calculus 2 session tomorrow\n'));
}

function prompt() {
  rl.question(chalk.bold.amber('  oddjobs> '), (input) => {
    const trimmed = input.trim();
    if (!trimmed) {
      prompt();
      return;
    }

    const [cmd, ...args] = trimmed.split(' ');
    const command = cmd.toLowerCase();

    switch (command) {
      case 'browse': cmdBrowse(args); prompt(); break;
      case 'post': cmdPost(); break;
      case 'profile': cmdProfile(); prompt(); break;
      case 'connect': cmdConnect(); break;
      case 'escrow': cmdEscrow(); prompt(); break;
      case 'search': cmdSearch(args); prompt(); break;
      case 'notify': cmdNotify(); prompt(); break;
      case 'clear': console.clear(); printBanner(); prompt(); break;
      case 'help': printHelp(); prompt(); break;
      case 'exit': case 'quit':
        console.log(chalk.gray('\n  Goodbye! 👋\n'));
        rl.close();
        break;
      default:
        console.log(chalk.red(`  Unknown command: ${command}`));
        console.log(chalk.gray('  Type "help" for available commands\n'));
        prompt();
    }
  });
}

printBanner();
prompt();
