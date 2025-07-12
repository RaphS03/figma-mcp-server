import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';

// Store clients by channel
const channels = new Map<string, Set<WebSocket>>();

function handleConnection(ws: WebSocket) {
    console.log("New client connected");

    // Send welcome message to the new client
    ws.send(JSON.stringify({
        type: "system",
        message: "Please join a channel to start chatting",
    }));

    // Handle incoming messages
    ws.on('message', (message: Buffer) => {
        try {
            console.log("Received message from client:", message.toString());
            const data = JSON.parse(message.toString());

            if (data.type === "join") {
                const channelName = data.channel;
                if (!channelName || typeof channelName !== "string") {
                    ws.send(JSON.stringify({
                        type: "error",
                        message: "Channel name is required"
                    }));
                    return;
                }

                // Create channel if it doesn't exist
                if (!channels.has(channelName)) {
                    channels.set(channelName, new Set());
                }

                // Add client to channel
                const channelClients = channels.get(channelName)!;
                channelClients.add(ws);

                // Send response with matching ID if this is from MCP server
                if (data.id) {
                    ws.send(JSON.stringify({
                        type: "broadcast",
                        message: {
                            id: data.id,
                            result: `Successfully joined channel: ${channelName}`
                        },
                        channel: channelName
                    }));
                }

                // Notify client they joined successfully - First message
                ws.send(JSON.stringify({
                    type: "system",
                    message: `Joined channel: ${channelName}`,
                    channel: channelName
                }));

                console.log("Sending success message to client for channel:", channelName);

                // Send the success message that the plugin expects
                ws.send(JSON.stringify({
                    type: "system",
                    message: {
                        result: `Connected to channel: ${channelName}`
                    },
                    channel: channelName
                }));

                // Notify other clients in channel
                channelClients.forEach((client) => {
                    if (client !== ws && client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({
                            type: "system",
                            message: "A new user has joined the channel",
                            channel: channelName
                        }));
                    }
                });
                return;
            }

            // Handle regular messages
            if (data.type === "message") {
                const channelName = data.channel;
                if (!channelName || typeof channelName !== "string") {
                    ws.send(JSON.stringify({
                        type: "error",
                        message: "Channel name is required"
                    }));
                    return;
                }

                const channelClients = channels.get(channelName);
                if (!channelClients || !channelClients.has(ws)) {
                    ws.send(JSON.stringify({
                        type: "error",
                        message: "You must join the channel first"
                    }));
                    return;
                }

                // Broadcast to all clients in the channel
                channelClients.forEach((client) => {
                    if (client.readyState === WebSocket.OPEN) {
                        console.log("Broadcasting message to client:", data.message);
                        client.send(JSON.stringify({
                            type: "broadcast",
                            message: data.message,
                            sender: client === ws ? "You" : "User",
                            channel: channelName
                        }));
                    }
                });
            }
        } catch (err) {
            console.error("Error handling message:", err);
        }
    });

    // Handle client disconnection
    ws.on('close', () => {
        console.log("Client disconnected");

        // Remove client from their channel
        channels.forEach((clients, channelName) => {
            if (clients.has(ws)) {
                clients.delete(ws);

                // Notify other clients in same channel
                clients.forEach((client) => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({
                            type: "system",
                            message: "A user has left the channel",
                            channel: channelName
                        }));
                    }
                });
            }
        });
    });

    // Handle WebSocket errors
    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
}

// Create HTTP server
const server = createServer((req, res) => {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        res.writeHead(200, {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
        });
        res.end();
        return;
    }

    // Return response for non-WebSocket requests
    res.writeHead(200, {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "text/plain"
    });
    res.end("WebSocket server running");
});

// Create WebSocket server
const wss = new WebSocketServer({
    server,
    verifyClient: () => {
        // Add any verification logic here if needed
        return true;
    }
});

// Handle WebSocket connections
wss.on('connection', (ws, req) => {
    // Set CORS headers for WebSocket
    ws.send = ((originalSend) => {
        return function (this: WebSocket, data: any, options?: any, callback?: any) {
            return originalSend.call(this, data, options, callback);
        };
    })(ws.send);

    handleConnection(ws);
});

// Handle server errors
wss.on('error', (error) => {
    console.error('WebSocket Server error:', error);
});

const PORT = 3055;

// Start the server
server.listen(PORT, () => {
    console.log(`WebSocket server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('Shutting down server...');
    wss.close(() => {
        server.close(() => {
            console.log('Server closed');
            process.exit(0);
        });
    });
});

// Optional: Add process error handlers
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});
