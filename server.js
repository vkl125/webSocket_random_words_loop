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
wss.on('connection', (ws) => {
    console.log('New WebSocket client connected');
    clients.add(ws);
    
    // Send current word immediately to new client
    if (currentWord) {
        ws.send(JSON.stringify({
            type: 'wordUpdate',
            word: currentWord
        }));
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
function broadcastToClients(data) {
    const message = JSON.stringify(data);
    clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

// Function to get random word
function getRandomWord() {
    const randomIndex = Math.floor(Math.random() * words.length);
    return words[randomIndex];
}

// API endpoint to start the word loop
app.post('/api/start-loop', (req, res) => {
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
    broadcastToClients({
        type: 'wordUpdate',
        word: currentWord
    });

    // Start the interval to change words every 5 seconds
    loopInterval = setInterval(() => {
        currentWord = getRandomWord();
        console.log(`Current word @ (${new Date().toISOString()}): ${currentWord}`);
        
        // Broadcast new word to all clients
        broadcastToClients({
            type: 'wordUpdate',
            word: currentWord
        });
    }, 5000);

    res.json({ 
        success: true, 
        message: 'Word loop started',
        initialWord: currentWord
    });
});

// API endpoint to get current word (kept for compatibility, but not used by frontend anymore)
app.get('/api/current-word', (req, res) => {
    res.json({ 
        currentWord: currentWord,
        isLoopRunning: isLoopRunning
    });
});

// API endpoint to stop the loop
app.post('/api/stop-loop', (req, res) => {
    if (!isLoopRunning) {
        return res.json({ 
            success: false, 
            message: 'Loop is not running' 
        });
    }

    clearInterval(loopInterval);
    isLoopRunning = false;
    currentWord = null;

    // Broadcast stop to all clients
    broadcastToClients({
        type: 'loopStopped'
    });

    res.json({ 
        success: true, 
        message: 'Word loop stopped'
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