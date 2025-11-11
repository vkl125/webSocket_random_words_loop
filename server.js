const express = require('express');
const cors = require('cors');
const path = require('path');
const WebSocket = require('ws');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Words array
const words = ['cat', 'dog', 'mouse', 'horse', 'fox'];

// Global variable to store current word
let currentWord = null;
let isLoopRunning = false;
let loopInterval = null;

// WebSocket server
const wss = new WebSocket.Server({ noServer: true });

// Store connected clients
const clients = new Set();

// WebSocket connection handler
wss.on('connection', async (ws) => {
    console.log('New WebSocket client connected');
    clients.add(ws);
    
    // Send current word immediately to new client
    if (currentWord) {
        try {
            await new Promise((resolve, reject) => {
                ws.send(JSON.stringify({
                    type: 'wordUpdate',
                    word: currentWord
                }), (error) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve();
                    }
                });
            });
        } catch (error) {
            console.error('Error sending initial word to client:', error);
        }
    }
    
    ws.on('close', () => {
        console.log('WebSocket client disconnected');
        clients.delete(ws);
    });
    
    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        clients.delete(ws);
    });
});

// Function to broadcast to all clients
async function broadcastToClients(data) {
    const message = JSON.stringify(data);
    const sendPromises = [];
    
    clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            sendPromises.push(new Promise((resolve, reject) => {
                client.send(message, (error) => {
                    if (error) {
                        console.error('Error sending message to client:', error);
                        reject(error);
                    } else {
                        resolve();
                    }
                });
            }));
        }
    });
    
    try {
        await Promise.allSettled(sendPromises);
    } catch (error) {
        console.error('Error broadcasting to clients:', error);
    }
}

// Function to get random word
function getRandomWord() {
    const randomIndex = Math.floor(Math.random() * words.length);
    return words[randomIndex];
}

// API endpoint to start the word loop
app.post('/api/start-loop', async (req, res) => {
    try {
        if (isLoopRunning) {
            return res.json({ 
                success: false, 
                message: 'Loop is already running' 
            });
        }

        // Start with a random word
        currentWord = getRandomWord();
        isLoopRunning = true;

        // Broadcast initial word to all clients
        await broadcastToClients({
            type: 'wordUpdate',
            word: currentWord
        });

        // Start the interval to change words every 5 seconds
        loopInterval = setInterval(async () => {
            try {
                currentWord = getRandomWord();
                console.log(`Current word @ (${new Date().toISOString()}): ${currentWord}`);
                
                // Broadcast new word to all clients
                await broadcastToClients({
                    type: 'wordUpdate',
                    word: currentWord
                });
            } catch (error) {
                console.error('Error in word loop interval:', error);
            }
        }, 5000);

        res.json({ 
            success: true, 
            message: 'Word loop started',
            initialWord: currentWord
        });
    } catch (error) {
        console.error('Error starting word loop:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
});

// API endpoint to get current word (kept for compatibility, but not used by frontend anymore)
app.get('/api/current-word', (req, res) => {
    res.json({ 
        currentWord: currentWord,
        isLoopRunning: isLoopRunning
    });
});



// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
const server = app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// Handle WebSocket upgrade
server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
    });
});

// Graceful shutdown handler
async function gracefulShutdown() {
    console.log('Shutting down gracefully...');
    
    // Clear the word loop interval
    if (loopInterval) {
        clearInterval(loopInterval);
        loopInterval = null;
    }
    
    // Close all WebSocket connections
    if (clients.size > 0) {
        console.log(`Closing ${clients.size} WebSocket connections...`);
        const closePromises = Array.from(clients).map(client => 
            new Promise(resolve => {
                client.close(1000, 'Server shutting down');
                resolve();
            })
        );
        await Promise.allSettled(closePromises);
    }
    
    // Close the WebSocket server
    await new Promise(resolve => {
        wss.close(() => {
            console.log('WebSocket server closed');
            resolve();
        });
    });
    
    // Close the HTTP server
    await new Promise(resolve => {
        server.close(() => {
            console.log('HTTP server closed');
            resolve();
        });
    });
    
    console.log('Graceful shutdown complete');
    process.exit(0);
}

// Handle shutdown signals
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);