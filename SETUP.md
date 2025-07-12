# Figma MCP Server Setup & Troubleshooting

## Overview
This MCP server enables GitHub Copilot to interact with Figma through a WebSocket connection. The architecture consists of:

1. **WebSocket Server** (`src/socket.ts`) - Runs on port 3055 to relay messages
2. **MCP Server** (`src/figma_mcp/server.ts`) - Connects to the WebSocket server
3. **Figma Plugin** (`src/github_copilot_mcp_plugin/`) - Connects to the WebSocket server

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Services
```bash
npm start
```

This will automatically start both the WebSocket server and the MCP server.

### 3. Install the Figma Plugin
1. Open Figma
2. Go to Plugins > Development > Import plugin from manifest
3. Select `src/github_copilot_mcp_plugin/manifest.json`
4. Run the plugin and click "Connect"

### 4. Configure GitHub Copilot
Add this to your MCP configuration file:
```json
{
    "servers": {
        "figma-mcp": {
            "type": "stdio",
            "command": "node",
            "args": ["C:\\path\\to\\figma-mcp-server\\start-with-socket.js"]
        }
    }
}
```

## Troubleshooting

### "Socket error: AggregateError" or Connection Issues

This error occurs when the WebSocket server is not running. Here are the solutions:

#### Solution 1: Use the Combined Startup Script
Make sure you're using `npm start` which runs `start-with-socket.js`. This automatically starts both services.

#### Solution 2: Start Services Manually
If you prefer to start services separately:

1. Start the WebSocket server:
```bash
npm run socket
```

2. In a separate terminal, start the MCP server:
```bash
npm run dev
```

#### Solution 3: Check Port 3055
Verify that port 3055 is available:
```bash
netstat -an | findstr :3055
```

If something else is using port 3055, you can:
- Change the port in `src/socket.ts`
- Update the port in `src/figma_mcp/server.ts`
- Update the port in the Figma plugin UI

### Connection Flow
1. WebSocket server starts on port 3055
2. MCP server connects to `ws://localhost:3055`
3. Figma plugin connects to `ws://localhost:3055`
4. Both clients join the same channel for communication

### Debug Tips
- Check if the WebSocket server is running: `netstat -an | findstr :3055`
- Look for "[Socket Server]" logs to see WebSocket server activity
- Check the Figma plugin console for connection status
- Verify that all three components (WebSocket server, MCP server, Figma plugin) are running

## Architecture Notes
- The WebSocket server acts as a message relay between the MCP server and Figma plugin
- Both clients join randomly generated channels for secure communication
- The MCP server provides tools that GitHub Copilot can use to interact with Figma
- The Figma plugin executes the actual Figma API calls and returns results

## Common Issues
- **Port conflicts**: Change the port if 3055 is already in use
- **Missing dependencies**: Run `npm install` to install all required packages
- **TypeScript errors**: Make sure you have TypeScript installed (`npm install -g typescript`)
- **Permission errors**: Make sure you have write permissions in the project directory
