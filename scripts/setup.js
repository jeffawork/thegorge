#!/usr/bin/env node

import { execSync } from 'child_process';
import { writeFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Color codes
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';
const BLUE = '\x1b[34m';
const NC = '\x1b[0m'; // No Color

console.log(`${BLUE}🚀 The Gorge RPC Monitor - Simple Setup${NC}`);

// Default values
let environment = 'development';
let useDocker = false;
let cleanInstall = false;

// Parse arguments
const args = process.argv.slice(2);
for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  switch (arg) {
    case '-e':
    case '--environment':
      environment = args[++i];
      if (!['development', 'production'].includes(environment)) {
        console.error(`${RED}Invalid environment: ${environment}. Must be 'development' or 'production'.${NC}`);
        process.exit(1);
      }
      break;
    case '-d':
    case '--docker':
      useDocker = true;
      break;
    case '-c':
    case '--clean':
      cleanInstall = true;
      break;
    case '-h':
    case '--help':
      console.log(`\n${BLUE}Usage: node scripts/setup.js [OPTIONS]${NC}`);
      console.log(`\nOptions:`);
      console.log(`  -e, --environment ENV    Set environment (development|production)`);
      console.log(`  -d, --docker            Use Docker for setup`);
      console.log(`  -c, --clean             Clean install`);
      console.log(`  -h, --help              Show this help`);
      process.exit(0);
      break;
    default:
      console.error(`${RED}Unknown parameter: ${arg}${NC}`);
      process.exit(1);
  }
}

console.log(`${YELLOW}Setting up ${environment} environment...${NC}`);

function runCommand(command, options = {}) {
  try {
    execSync(command, { stdio: 'inherit', cwd: projectRoot, ...options });
  } catch (error) {
    console.error(`${RED}Command failed: ${command}${NC}`);
    process.exit(1);
  }
}

// Clean install (if requested)
if (cleanInstall) {
  console.log(`${BLUE}Cleaning up...${NC}`);
  runCommand('rm -rf node_modules dist');
  console.log(`${GREEN}Cleanup complete.${NC}`);
}

// Setup environment
if (useDocker) {
  console.log(`${BLUE}Building and starting Docker environment...${NC}`);
  runCommand('docker compose build');
  runCommand('docker compose up -d');
  console.log(`${GREEN}Docker environment started at http://localhost:3000${NC}`);
} else {
  // Only install and build locally if not using Docker
  console.log(`${BLUE}Installing dependencies...${NC}`);
  runCommand('npm install');
  console.log(`${GREEN}Dependencies installed.${NC}`);

  console.log(`${BLUE}Building application...${NC}`);
  runCommand('npm run build');
  console.log(`${GREEN}Application built.${NC}`);
  console.log(`${BLUE}Setting up local environment...${NC}`);
  const envFilePath = path.join(projectRoot, '.env');
  if (!existsSync(envFilePath)) {
    console.log(`${YELLOW}Creating .env file...${NC}`);
    const envContent = `NODE_ENV=${environment}
PORT=3000
LOG_LEVEL=debug
MOCK_DATABASE=true
JWT_SECRET=dev-jwt-secret-change-me
JWT_REFRESH_SECRET=dev-refresh-secret-change-me
CORS_ORIGIN=http://localhost:5173`;
    writeFileSync(envFilePath, envContent);
    console.log(`${GREEN}.env file created.${NC}`);
  }

  console.log(`${GREEN}Setup complete! Run 'npm run dev' to start the application.${NC}`);
  console.log(`${GREEN}Application will be available at http://localhost:3000${NC}`);
}

console.log(`${GREEN}✅ Setup finished!${NC}`);