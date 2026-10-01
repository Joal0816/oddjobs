#!/usr/bin/env node

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const version = '1.1.0';

// Zero-dependency ANSI colors
const amber = '\x1b[38;5;214m';
const cyan = '\x1b[36m';
const green = '\x1b[32m';
const red = '\x1b[31m';
const gray = '\x1b[90m';
const reset = '\x1b[0m';
const bold = '\x1b[1m';

// Responsive terminal width detection
function termWidth() {
  return process.stdout.columns || 80;
}

function isNarrow() {
  return termWidth() < 60;
}

function wideBanner() {
  console.log(`${bold}${amber}
  ██████╗ ██████╗ ██████╗      ██╗ ██████╗ ██████╗ ███████╗
 ██╔═══██╗██╔══██╗██╔══██╗     ██║██╔═══██╗██╔══██╗██╔════╝
 ██║   ██║██║  ██║██║  ██║     ██║██║   ██║██████╔╝███████╗
 ██║   ██║██║  ██║██║  ██║██   ██║██║   ██║██╔══██╗╚════██║
 ╚██████╔╝██████╔╝██████╔╝╚█████╔╝╚██████╔╝██████╔╝███████║
  ╚═════╝ ╚═════╝ ╚═════╝  ╚════╝  ╚═════╝ ╚═════╝ ╚══════╝
  ${reset}`);
}

function narrowBanner() {
  console.log(`${bold}${amber}
   ██████╗ ██████╗ ██████╗
  ██╔═══██╗██╔══██╗██╔══██╗
  ██║   ██║██║  ██║██║  ██║
  ██║   ██║██║  ██║██║  ██║
  ╚██████╔╝██████╔╝██████╔╝
   ╚═════╝ ╚═════╝ ╚═════╝
  ${reset}`);
}

function printBanner() {
  if (isNarrow()) {
    narrowBanner();
  } else {
    wideBanner();
  }
  console.log(`${gray}  MSU-IIT Student Workforce Marketplace CLI v${version}${reset}`);
  console.log(`${gray}  Type "help" for available commands\n${reset}`);
}

function printHelp() {
  console.log(`${bold}\n  Available Commands:\n${reset}`);
  console.log(`${cyan}  browse [category]${reset}${gray}     - List available jobs${reset}`);
  console.log(`${cyan}  post${reset}${gray}                  - Post a new job (interactive)${reset}`);
  console.log(`${cyan}  profile${reset}${gray}               - View your profile & stats${reset}`);
  console.log(`${cyan}  connect${reset}${gray}               - Find random campus connections${reset}`);
  console.log(`${cyan}  escrow${reset}${gray}                - Check escrow status${reset}`);
  console.log(`${cyan}  search <query>${reset}${gray}       - Search jobs by keyword${reset}`);
  console.log(`${cyan}  notify${reset}${gray}                - Check notifications${reset}`);
  console.log(`${cyan}  clear${reset}${gray}                 - Clear terminal${reset}`);
  console.log(`${cyan}  help${reset}${gray}                  - Show this help${reset}`);
  console.log(`${cyan}  exit${reset}${gray}                  - Exit the CLI\n${reset}`);
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

  console.log(`${bold}\n  ═══ Available Jobs ═══\n${reset}`);
  if (filtered.length === 0) {
    console.log(`${gray}  No jobs found matching your criteria.\n${reset}`);
    return;
  }

  if (isNarrow()) {
    filtered.forEach(job => {
      console.log(`${cyan}  [${job.id}] ${job.title}${reset}`);
      console.log(`${gray}      ${job.category}${reset}`);
      console.log(`${green}      ₱${job.budget}\n${reset}`);
    });
  } else {
    filtered.forEach(job => {
      console.log(`${cyan}  [${job.id}] ${job.title}${reset}`);
      console.log(`${gray}      Category: ${job.category}${reset}`);
      console.log(`${green}      Budget: ₱${job.budget}${reset}`);
      console.log(`${gray}      Location: ${job.location}${reset}`);
      console.log(`${gray}      Status: ${job.status}\n${reset}`);
    });
  }
  console.log(`${gray}  Showing ${filtered.length} job(s)\n${reset}`);
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
      console.log(`${green}\r  ✓ Job posted successfully!          \n${reset}`);
      console.log(`${bold}  ═══ Job Posted ═══\n${reset}`);
      console.log(`${cyan}  Title: ${answers.title}${reset}`);
      console.log(`${gray}  Category: ${answers.category}${reset}`);
      console.log(`${green}  Budget: ₱${answers.budget}${reset}`);
      console.log(`${gray}  Description: ${answers.description}\n${reset}`);
      prompt();
      return;
    }

    const q = questions[qi];
    rl.question(`${amber}  ${q.message}${reset}`, (answer) => {
      if (q.validate && !q.validate(answer)) {
        console.log(`${red}  Invalid input, try again.${reset}`);
        askNext();
        return;
      }
      answers[q.name] = answer;
      qi++;
      askNext();
    });
  }

  console.log(`${bold}\n  ═══ Post a New Job ═══\n${reset}`);
  askNext();
}

function cmdProfile() {
  console.log(`${bold}\n  ═══ Your Profile ═══\n${reset}`);
  console.log(`${cyan}  Name: Charles Caballes${reset}`);
  console.log(`${gray}  Role: Student Worker${reset}`);
  console.log(`${gray}  University: MSU-IIT${reset}`);
  console.log(`${gray}  Course: BS Computer Applications${reset}`);
  console.log(`${gray}  Year: 3rd Year\n${reset}`);
  console.log(`${green}  Rating: 4.9/5.0 ★${reset}`);
  console.log(`${green}  Jobs Completed: 12${reset}`);
  console.log(`${green}  Total Earnings: ₱15,400${reset}`);
  console.log(`${green}  Campus Trust: 100%\n${reset}`);
}

function cmdConnect() {
  console.log(`${gray}\n  Finding connections...${reset}`);

  setTimeout(() => {
    const online = connections.filter(c => c.online);
    const match = online[Math.floor(Math.random() * online.length)];
    console.log(`${green}  ✓ Connection found!\n${reset}`);
    console.log(`${bold}  ═══ New Connection ═══\n${reset}`);
    console.log(`${cyan}  Name: ${match.name}${reset}`);
    console.log(`${gray}  Role: ${match.role}${reset}`);
    console.log(`${gray}  Interests: ${match.interests.join(', ')}${reset}`);
    console.log(`${green}  Status: Online\n${reset}`);
    prompt();
  }, 1500);
}

function cmdEscrow() {
  console.log(`${bold}\n  ═══ Escrow Status ═══\n${reset}`);
  console.log(`${green}  Active Escrows: 3${reset}`);
  console.log(`${green}  Total in Escrow: ₱4,350${reset}`);
  console.log(`${green}  Completed: 12${reset}`);
  console.log(`${green}  Total Paid Out: ₱15,400\n${reset}`);
  console.log(`${gray}  All transactions protected by${reset}`);
  console.log(`${gray}  MSU-IIT institutional verification.\n${reset}`);
}

function cmdSearch(args) {
  const query = args.join(' ').toLowerCase();
  if (!query) {
    console.log(`${amber}  Usage: search <keyword>\n${reset}`);
    return;
  }
  const results = jobs.filter(j =>
    j.title.toLowerCase().includes(query) ||
    j.category.toLowerCase().includes(query)
  );
  console.log(`${bold}\n  ═══ Search: "${args.join(' ')}" ═══\n${reset}`);
  if (results.length === 0) {
    console.log(`${gray}  No results found.\n${reset}`);
    return;
  }
  results.forEach(job => {
    console.log(`${cyan}  [${job.id}] ${job.title}${reset}`);
    console.log(`${gray}      ${job.category} • ₱${job.budget}\n${reset}`);
  });
}

function cmdNotify() {
  console.log(`${bold}\n  ═══ Notifications ═══\n${reset}`);
  console.log(`${green}  ● New job match: "Laravel Developer"${reset}`);
  console.log(`${green}  ● Payment received: ₱1,200 from SSC${reset}`);
  console.log(`${green}  ● New connection: Derrick Tan${reset}`);
  console.log(`${gray}  ● Reminder: Calculus 2 session tomorrow\n${reset}`);
}

function prompt() {
  rl.question(`${bold}${amber}  oddjobs> ${reset}`, (input) => {
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
        console.log(`${gray}\n  Goodbye! 👋\n${reset}`);
        rl.close();
        break;
      default:
        console.log(`${red}  Unknown command: ${command}${reset}`);
        console.log(`${gray}  Type "help" for available commands\n${reset}`);
        prompt();
    }
  });
}

printBanner();
prompt();
