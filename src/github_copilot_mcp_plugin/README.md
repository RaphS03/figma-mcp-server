# GitHub Copilot MCP Figma Plugin

This plugin enables GitHub Copilot AI to communicate with Figma through the Model Context Protocol (MCP), allowing AI-assisted design operations.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build the plugin:
   ```bash
   npm run build
   ```

3. Install the plugin in Figma:
   - Go to Figma → Plugins → Development → Import plugin from manifest
   - Select the `manifest.json` file

## Usage

1. Open the plugin in Figma
2. Connect to the MCP server (default port: 3055)
3. Once connected, GitHub Copilot can interact with your Figma designs

## Features

- Real-time WebSocket communication with MCP server
- Document manipulation (create, modify, delete elements)
- Text processing with bulk operations
- Component and style management
- Progress tracking for long-running operations
- Export capabilities

## Files

- `code.js` - Main plugin logic
- `ui.html` - Plugin user interface
- `setcharacters.js` - Text manipulation utilities
- `manifest.json` - Plugin manifest
