#!/usr/bin/env node

// Entry point for the Figma MCP Server
// This file serves as the main entry point and delegates to the actual server implementation

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const serverPath = join(__dirname, 'src', 'figma_mcp', 'server.ts');

console.log('Starting Figma MCP Server...');
console.log('Server path:', serverPath);

// Run the TypeScript server directly using tsx
const child = spawn('npx', ['tsx', serverPath], {
    stdio: 'inherit',
    cwd: __dirname,
    shell: true
});

child.on('error', (error) => {
    console.error('Failed to start Figma MCP server:', error.message);
    process.exit(1);
});

child.on('exit', (code) => {
    console.log(`Server exited with code ${code}`);
    process.exit(code);
});
