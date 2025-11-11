// Main server setup and startup
const express = require('express');
const path = require('path');

const { PORT } = require('../config/constants');
const AppMiddleware = require('../middleware/appMiddleware');
const ApiRoutes = require('../routes/apiRoutes');
const WordManager = require('../utils/wordManager');
const WebSocketManager = require('../websocket/websocketManager');

class Server {
    constructor() {
        this.app = express();
        this.server = null;
        this.wordManager = new WordManager();
        this.websocketManager = new WebSocketManager();
        this.middleware = new AppMiddleware();
        this.apiRoutes = new ApiRoutes(this.wordManager, this.websocketManager);
    }

    // Initialize the server
    async initialize() {
        try {
            // Setup middleware
            this.middleware.setup(this.app);

            // Setup API routes
            this.app.use('/api', this.apiRoutes.getRouter());

            // Serve the main page
            this.app.get('/', (req, res) => {
                res.sendFile(path.join(__dirname, '../../public', 'index.html'));
            });

            // Health check endpoint
            this.app.get('/health', (req, res) => {
                res.json({
                    status: 'OK',
                    timestamp: new Date().toISOString(),
                    uptime: process.uptime()
                });
            });

            // 404 handler
            this.app.use('*', (req, res) => {
                res.status(404).json({
                    success: false,
                    message: 'Route not found'
                });
            });

            console.log('Server initialized successfully');
        } catch (error) {
            console.error('Error initializing server:', error);
            throw error;
        }
    }

    // Start the server
    async start() {
        try {
            // Create HTTP server
            this.server = this.app.listen(PORT, () => {
                console.log(`Server is running on http://localhost:${PORT}`);
            });

            // Initialize WebSocket server
            this.websocketManager.initialize(this.server);

            // Setup graceful shutdown handlers
            this.setupGracefulShutdown();

            return this.server;
        } catch (error) {
            console.error('Error starting server:', error);
            throw error;
        }
    }

    // Setup graceful shutdown
    setupGracefulShutdown() {
        const gracefulShutdown = async () => {
            console.log('Shutting down gracefully...');
            
            try {
                // Stop word loop
                this.wordManager.cleanup();
                
                // Close WebSocket connections
                await this.websocketManager.cleanup();
                
                // Close HTTP server
                if (this.server) {
                    await new Promise(resolve => {
                        this.server.close(() => {
                            console.log('HTTP server closed');
                            resolve();
                        });
                    });
                }
                
                console.log('Graceful shutdown complete');
                process.exit(0);
            } catch (error) {
                console.error('Error during graceful shutdown:', error);
                process.exit(1);
            }
        };

        // Handle shutdown signals
        process.on('SIGTERM', gracefulShutdown);
        process.on('SIGINT', gracefulShutdown);
    }

    // Get server instance
    getServer() {
        return this.server;
    }

    // Get app instance
    getApp() {
        return this.app;
    }

    // Stop the server
    async stop() {
        if (this.server) {
            await new Promise(resolve => {
                this.server.close(() => {
                    console.log('Server stopped');
                    resolve();
                });
            });
        }
    }
}

module.exports = Server;