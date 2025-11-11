// Main application module
import { DisplayManager } from './modules/displayManager.js';
import { WebSocketClient } from './modules/websocketClient.js';
import { ApiClient } from './modules/apiClient.js';

class Application {
    constructor() {
        this.displayManager = new DisplayManager();
        this.websocketClient = new WebSocketClient(this.displayManager);
        this.apiClient = new ApiClient(this.displayManager);
        this.isInitialized = false;
    }

    // Initialize the application
    async init() {
        if (this.isInitialized) {
            console.warn('Application already initialized');
            return;
        }

        try {
            // Setup WebSocket message handlers
            this.setupWebSocketHandlers();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Connect to WebSocket
            await this.websocketClient.connect();
            
            this.isInitialized = true;
            console.log('Application initialized successfully');
            
        } catch (error) {
            console.error('Error initializing application:', error);
            this.displayManager.showNotification('Failed to initialize application', 'error');
        }
    }

    // Setup WebSocket message handlers
    setupWebSocketHandlers() {
        // Handle word updates from WebSocket
        this.websocketClient.on('wordUpdate', (data) => {
            this.displayManager.updateDisplay(data.word, true);
            this.displayManager.setStartButtonState(true);
        });

        // You can add more message handlers here
        // this.websocketClient.on('otherMessageType', (data) => {
        //     // Handle other message types
        // });
    }

    // Setup event listeners
    setupEventListeners() {
        const startButton = document.getElementById('startButton');
        
        startButton.addEventListener('click', async () => {
            await this.startLoop();
        });

        // Add keyboard shortcuts
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' && !startButton.disabled) {
                this.startLoop();
            }
        });

        // Handle page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && !this.websocketClient.getConnectionStatus()) {
                console.log('Page became visible, attempting to reconnect...');
                this.websocketClient.connect();
            }
        });
    }

    // Start the word loop
    async startLoop() {
        if (!this.websocketClient.getConnectionStatus()) {
            this.displayManager.showNotification('Not connected to server', 'error');
            return;
        }
        
        try {
            await this.apiClient.startLoop();
            // WebSocket will handle the UI updates
        } catch (error) {
            console.error('Error starting loop:', error);
            // Error message is already handled by ApiClient
        }
    }

    // Get application status
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            websocketConnected: this.websocketClient.getConnectionStatus(),
            displayManager: !!this.displayManager
        };
    }

    // Cleanup resources
    cleanup() {
        if (this.websocketClient) {
            this.websocketClient.close();
        }
        this.isInitialized = false;
    }
}

// Global application instance
const app = new Application();

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', () => {
    app.init().catch(error => {
        console.error('Failed to initialize application:', error);
    });
});

// Make app available globally for debugging
window.app = app;

export { Application };