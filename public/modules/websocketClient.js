// WebSocket client module
export class WebSocketClient {
    constructor(displayManager) {
        this.ws = null;
        this.isConnected = false;
        this.displayManager = displayManager;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 3000;
        this.messageHandlers = new Map();
    }

    // Connect to WebSocket server
    async connect() {
        try {
            // Create WebSocket connection
            this.ws = new WebSocket(`ws://${window.location.host}`);
            
            this.ws.onopen = () => {
                console.log('WebSocket connected');
                this.isConnected = true;
                this.reconnectAttempts = 0;
                this.displayManager.updateConnectionStatus(true);
            };
            
            this.ws.onmessage = async (event) => {
                await this.handleMessage(event);
            };
            
            this.ws.onclose = async () => {
                console.log('WebSocket disconnected');
                this.isConnected = false;
                this.displayManager.updateConnectionStatus(false);
                await this.handleReconnect();
            };
            
            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                this.isConnected = false;
                this.displayManager.updateConnectionStatus(false);
            };
            
        } catch (error) {
            console.error('Error creating WebSocket:', error);
            this.displayManager.updateConnectionStatus(false);
        }
    }

    // Handle incoming WebSocket messages
    async handleMessage(event) {
        try {
            const data = JSON.parse(event.data);
            console.log('WebSocket message received:', data);
            
            // Use requestAnimationFrame for smoother UI updates
            await new Promise(resolve => requestAnimationFrame(resolve));
            
            // Call registered message handlers
            if (this.messageHandlers.has(data.type)) {
                this.messageHandlers.get(data.type)(data);
            }
            
        } catch (error) {
            console.error('Error parsing WebSocket message:', error);
        }
    }

    // Handle reconnection logic
    async handleReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
            
            console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            
            await new Promise(resolve => setTimeout(resolve, delay));
            
            if (!this.isConnected) {
                console.log('Attempting to reconnect...');
                await this.connect();
            }
        } else {
            console.log('Max reconnection attempts reached');
            this.displayManager.showNotification('Unable to reconnect to server', 'error');
        }
    }

    // Register message handler
    on(messageType, handler) {
        this.messageHandlers.set(messageType, handler);
    }

    // Send message to server
    send(data) {
        if (this.ws && this.isConnected) {
            this.ws.send(JSON.stringify(data));
        } else {
            console.warn('WebSocket not connected, cannot send message');
        }
    }

    // Close connection
    close() {
        if (this.ws) {
            this.ws.close();
        }
    }

    // Get connection status
    getConnectionStatus() {
        return this.isConnected;
    }
}