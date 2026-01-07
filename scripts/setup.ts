#!/usr/bin/env npx tsx
// scripts/setup.ts
// Interactive setup wizard for Google Workspace MCP Server

import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

const ROOT_DIR = path.resolve(import.meta.dirname, '..');
const CREDENTIALS_PATH = path.join(ROOT_DIR, 'credentials.json');
const TOKEN_PATH = path.join(ROOT_DIR, 'token.json');

// ANSI colors
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

function log(message: string, color = RESET) {
  console.log(`${color}${message}${RESET}`);
}

function checkMark(condition: boolean): string {
  return condition ? `${GREEN}[OK]${RESET}` : `${RED}[X]${RESET}`;
}

async function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function checkEnvironment() {
  log('\n=== Environment Check ===\n', CYAN);

  // Check Node.js version
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  log(`${checkMark(majorVersion >= 18)} Node.js ${nodeVersion} (requires v18+)`);

  // Check npm
  const hasNpm = fs.existsSync(path.join(ROOT_DIR, 'node_modules'));
  log(`${checkMark(hasNpm)} node_modules installed`);

  // Check build
  const hasBuild = fs.existsSync(path.join(ROOT_DIR, 'dist', 'server.js'));
  log(`${checkMark(hasBuild)} TypeScript compiled (dist/server.js)`);

  // Check credentials
  const hasCredentials = fs.existsSync(CREDENTIALS_PATH);
  log(`${checkMark(hasCredentials)} credentials.json exists`);

  // Check token
  const hasToken = fs.existsSync(TOKEN_PATH);
  log(`${checkMark(hasToken)} token.json exists (authorized)`);

  return { hasNpm, hasBuild, hasCredentials, hasToken };
}

function generateMcpConfig(): string {
  const serverPath = path.join(ROOT_DIR, 'dist', 'server.js').replace(/\\/g, '\\\\');

  return JSON.stringify({
    mcpServers: {
      "google-workspace": {
        command: "node",
        args: [serverPath]
      }
    }
  }, null, 2);
}

function getConfigPath(): string {
  const platform = process.platform;
  if (platform === 'win32') {
    return path.join(process.env.APPDATA || '', 'Claude', 'mcp_config.json');
  } else if (platform === 'darwin') {
    return path.join(process.env.HOME || '', 'Library', 'Application Support', 'Claude', 'mcp_config.json');
  } else {
    return path.join(process.env.HOME || '', '.config', 'Claude', 'mcp_config.json');
  }
}

async function runSetup() {
  log(`${BOLD}${CYAN}
  =============================================
   Google Workspace MCP Server - Setup Wizard
  =============================================
  ${RESET}`);

  const status = await checkEnvironment();

  // Step 1: Install dependencies
  if (!status.hasNpm) {
    log('\n[Step 1] Installing dependencies...', YELLOW);
    const { execSync } = await import('child_process');
    try {
      execSync('npm install', { cwd: ROOT_DIR, stdio: 'inherit' });
      log('Dependencies installed!', GREEN);
    } catch (e) {
      log('Failed to install dependencies. Please run: npm install', RED);
      process.exit(1);
    }
  }

  // Step 2: Build
  if (!status.hasBuild) {
    log('\n[Step 2] Building TypeScript...', YELLOW);
    const { execSync } = await import('child_process');
    try {
      execSync('npm run build', { cwd: ROOT_DIR, stdio: 'inherit' });
      log('Build complete!', GREEN);
    } catch (e) {
      log('Build failed. Please check for TypeScript errors.', RED);
      process.exit(1);
    }
  }

  // Step 3: Check credentials
  if (!status.hasCredentials) {
    log(`\n${YELLOW}[Step 3] credentials.json not found${RESET}`);
    log(`
Please follow these steps:
1. Go to ${CYAN}https://console.cloud.google.com/${RESET}
2. Create/select a project
3. Enable APIs: Docs, Sheets, Drive, Apps Script
4. Go to Credentials > Create Credentials > OAuth client ID
5. Select "Desktop app"
6. Download JSON and save as: ${CYAN}${CREDENTIALS_PATH}${RESET}
`);
    await prompt('Press Enter after placing credentials.json...');

    if (!fs.existsSync(CREDENTIALS_PATH)) {
      log('credentials.json still not found. Please add it and run setup again.', RED);
      process.exit(1);
    }
  }

  // Step 4: Authorize
  if (!status.hasToken) {
    log(`\n${YELLOW}[Step 4] Authorization required${RESET}`);
    log('Starting authorization flow...\n');

    const { execSync } = await import('child_process');
    try {
      execSync('node dist/server.js', {
        cwd: ROOT_DIR,
        stdio: 'inherit',
        timeout: 120000 // 2 minutes for auth
      });
    } catch (e) {
      // Server exits after auth, this is normal
    }

    if (fs.existsSync(TOKEN_PATH)) {
      log('Authorization successful!', GREEN);
    }
  }

  // Step 5: Generate MCP config
  log(`\n${CYAN}[Step 5] Claude Code CLI Configuration${RESET}`);
  const mcpConfig = generateMcpConfig();
  const configPath = getConfigPath();

  log(`\nAdd this to your ${CYAN}${configPath}${RESET}:\n`);
  log(mcpConfig, YELLOW);

  const autoConfig = await prompt('\nAuto-update config file? (y/N): ');
  if (autoConfig.toLowerCase() === 'y') {
    try {
      const configDir = path.dirname(configPath);
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }

      let existingConfig: any = {};
      if (fs.existsSync(configPath)) {
        existingConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      }

      existingConfig.mcpServers = existingConfig.mcpServers || {};
      existingConfig.mcpServers['google-workspace'] = {
        command: 'node',
        args: [path.join(ROOT_DIR, 'dist', 'server.js')]
      };

      fs.writeFileSync(configPath, JSON.stringify(existingConfig, null, 2));
      log(`Config updated: ${configPath}`, GREEN);
    } catch (e) {
      log(`Could not update config automatically. Please update manually.`, YELLOW);
    }
  }

  // Done
  log(`
${GREEN}${BOLD}
  =============================================
   Setup Complete!
  =============================================
${RESET}
${CYAN}Next steps:${RESET}
1. Restart Claude Code CLI
2. Try: "List my Google Docs"

${CYAN}Test the server:${RESET}
  npm test

${CYAN}Manual start:${RESET}
  node dist/server.js
`);
}

// Run
runSetup().catch(console.error);
