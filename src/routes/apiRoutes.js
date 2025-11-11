// API route handlers
const express = require('express');

class ApiRoutes {
    constructor(wordManager, websocketManager) {
        this.router = express.Router();
        this.wordManager = wordManager;
        this.websocketManager = websocketManager;
        this.setupRoutes();
    }

    setupRoutes() {
        // API endpoint to start the word loop
        this.router.post('/start-loop', async (req, res) => {
            try {
                const initialWord = this.wordManager.startWordLoop(async (newWord) => {
                    // Broadcast new word to all clients when it changes
                    await this.websocketManager.broadcast({
                        type: 'wordUpdate',
                        word: newWord
                    });
                });

                // Broadcast initial word to all clients
                await this.websocketManager.broadcast({
                    type: 'wordUpdate',
                    word: initialWord
                });

                res.json({ 
                    success: true, 
                    message: 'Word loop started',
                    initialWord: initialWord
                });
            } catch (error) {
                console.error('Error starting word loop:', error);
                
                if (error.message === 'Loop is already running') {
                    res.json({ 
                        success: false, 
                        message: 'Loop is already running' 
                    });
                } else {
                    res.status(500).json({ 
                        success: false, 
                        message: 'Internal server error' 
                    });
                }
            }
        });

        // API endpoint to get current word (kept for compatibility)
        this.router.get('/current-word', (req, res) => {
            const state = this.wordManager.getCurrentState();
            res.json({ 
                currentWord: state.currentWord,
                isLoopRunning: state.isLoopRunning
            });
        });

        // API endpoint to get server status
        this.router.get('/status', (req, res) => {
            const state = this.wordManager.getCurrentState();
            res.json({
                wordLoop: {
                    isRunning: state.isLoopRunning,
                    currentWord: state.currentWord
                },
                websocket: {
                    connectedClients: this.websocketManager.getConnectedClientsCount()
                },
                server: {
                    uptime: process.uptime(),
                    timestamp: new Date().toISOString()
                }
            });
        });
    }

    getRouter() {
        return this.router;
    }
}

module.exports = ApiRoutes;