const express = require('express');
const cors = require('cors');
const path = require('path');

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

    // Start the interval to change words every 5 seconds
    loopInterval = setInterval(() => {
        currentWord = getRandomWord();
        console.log(`Current word: ${currentWord}(${new Date().toISOString()})`);
    }, 5000);

    res.json({ 
        success: true, 
        message: 'Word loop started',
        initialWord: currentWord
    });
});

// API endpoint to get current word
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
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});