// API route handlers
const express = require('express');
const ErrorHandler = require('../utils/errorHandler');
const Logger = require('../utils/logger');
const { MESSAGE_TYPES, MESSAGES } = require('../config/constants');

class ApiRoutes {
    constructor(wordManager, websocketManager) {
        this.router = express.Router();
        this.wordManager = wordManager;
        this.websocketManager = websocketManager;
        this.errorHandler = ErrorHandler;
        this.logger = Logger;
        this.messageTypes = MESSAGE_TYPES;
        this.messages = MESSAGES;
        this.setupRoutes();
    }

    setupRoutes() {
        // API endpoint to start the word loop
        this.router.post('/start-loop', async (req, res) => {
            try {
                const initialWord = this.wordManager.startWordLoop(async (newWord) => {
                    // Broadcast new word to all clients when it changes
                    await this.websocketManager.broadcast({
                        type: this.messageTypes.WORD_UPDATE,
                        word: newWord
                    });
                });

                // Broadcast initial word to all clients
                await this.websocketManager.broadcast({
                    type: this.messageTypes.WORD_UPDATE,
                    word: initialWord
                });

                res.json(this.errorHandler.createSuccessResponse(
                    this.messages.LOOP_STARTED,
                    { initialWord: initialWord }
                ));
            } catch (error) {
                this.errorHandler.handleApiError(error, res);
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