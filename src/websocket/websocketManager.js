// WebSocket connection management
const WebSocket = require('ws');
const { WEBSOCKET_CLOSE_CODE, WEBSOCKET_CLOSE_REASON } = require('../config/constants');
const Logger = require('../utils/logger');

class WebSocketManager {
    constructor() {
        this.clients = new Set();
        this.wss = null;
        this.closeCode = WEBSOCKET_CLOSE_CODE;
        this.closeReason = WEBSOCKET_CLOSE_REASON;
    }

    // Initialize WebSocket server
    initialize(server) {
        this.wss = new WebSocket.Server({ noServer: true });
        
        this.wss.on('connection', (ws) => {
            this.handleConnection(ws);
        });

        // Handle WebSocket upgrade
        server.on('upgrade', (request, socket, head) => {
            this.wss.handleUpgrade(request, socket, head, (ws) => {
                this.wss.emit('connection', ws, request);
            });
        });

        return this.wss;
    }

    // Handle new WebSocket connection
    async handleConnection(ws) {
        Logger.info('New WebSocket client connected');
        this.clients.add(ws);
        
        ws.on('close', () => {
            Logger.info('WebSocket client disconnected');
            this.clients.delete(ws);
        });
        
        ws.on('error', (error) => {
            Logger.error('WebSocket error:', error);
            this.clients.delete(ws);
        });
    }

    // Broadcast message to all connected clients
    async broadcast(data) {
        const message = JSON.stringify(data);
        const sendPromises = [];
        
        this.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                sendPromises.push(this.sendToClient(client, data));
            }
        });
        
        try {
            await Promise.allSettled(sendPromises);
        } catch (error) {
            Logger.error('Error broadcasting to clients:', error);
        }
    }

    // Send message to a specific client
    async sendToClient(ws, data) {
        if (ws.readyState === WebSocket.OPEN) {
            return new Promise((resolve, reject) => {
                ws.send(JSON.stringify(data), (error) => {
                    if (error) {
                        Logger.error('Error sending message to client:', error);
                        reject(error);
                    } else {
                        resolve();
                    }
                });
            });
        }
    }

    // Get connected clients count
    getConnectedClientsCount() {
        return this.clients.size;
    }

    // Close all WebSocket connections
    async closeAllConnections(closeCode = this.closeCode, closeReason = this.closeReason) {
        if (this.clients.size > 0) {
            Logger.info(`Closing ${this.clients.size} WebSocket connections...`);
            const closePromises = Array.from(this.clients).map(client => 
                new Promise(resolve => {
                    client.close(closeCode, closeReason);
                    resolve();
                })
            );
            await Promise.allSettled(closePromises);
        }
    }

    // Close WebSocket server
    async closeServer() {
        if (this.wss) {
            await new Promise(resolve => {
                this.wss.close(() => {
                    Logger.info('WebSocket server closed');
                    resolve();
                });
            });
        }
    }

    // Cleanup all resources
    async cleanup() {
        await this.closeAllConnections();
        await this.closeServer();
    }
}

module.exports = WebSocketManager;