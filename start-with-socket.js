#!/usr/bin/env node

// Combined entry point that starts both WebSocket server and MCP server
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import net from 'net';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Check if port 3055 is available
function checkPort(port) {
    return new Promise((resolve) => {
        const server = net.createServer();
        server.listen(port, () => {
            server.once('close', () => {
                resolve(false); // Port is available
            });
            server.close();
        });
        server.on('error', () => {
            resolve(true); // Port is already in use
        });
    });
}

async function startServices() {
    console.log('Starting Figma MCP Server with WebSocket...');
    
    const portInUse = await checkPort(3055);
    
    if (!portInUse) {
        console.log('Starting WebSocket server on port 3055...');
        
        // Start WebSocket server
        const socketServerPath = join(__dirname, 'src', 'socket.ts');
        const socketServer = spawn('npx', ['tsx', socketServerPath], {
            stdio: 'pipe',
            cwd: __dirname,
            shell: true
        });
        
        socketServer.stdout.on('data', (data) => {
            process.stderr.write(`[Socket Server] ${data}`);
        });
        
        socketServer.stderr.on('data', (data) => {
            process.stderr.write(`[Socket Server] ${data}`);
        });
        
        socketServer.on('error', (error) => {
            console.error('Failed to start WebSocket server:', error.message);
            process.exit(1);
        });
        
        // Wait a bit for socket server to start
        await new Promise(resolve => setTimeout(resolve, 2000));
    } else {
        console.log('WebSocket server already running on port 3055');
    }
    
    // Start MCP server
    const serverPath = join(__dirname, 'src', 'figma_mcp', 'server.ts');
    console.log('Starting MCP server...');
    
    const mcpServer = spawn('npx', ['tsx', serverPath], {
        stdio: 'inherit',
        cwd: __dirname,
        shell: true
    });
    
    mcpServer.on('error', (error) => {
        console.error('Failed to start MCP server:', error.message);
        process.exit(1);
    });
    
    mcpServer.on('exit', (code) => {
        console.log(`MCP server exited with code ${code}`);
        process.exit(code);
    });
}

startServices().catch(error => {
    console.error('Error starting services:', error);
    process.exit(1);
});
