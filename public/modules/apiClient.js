// API client module
export class ApiClient {
    constructor(displayManager) {
        this.displayManager = displayManager;
        this.baseUrl = '/api';
    }

    // Make API request
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        };

        try {
            const response = await fetch(url, { ...defaultOptions, ...options });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error(`API request failed for ${endpoint}:`, error);
            throw error;
        }
    }

    // Start the word loop
    async startLoop() {
        try {
            const data = await this.request('/start-loop', {
                method: 'POST'
            });
            
            if (data.success) {
                console.log('Loop started successfully');
                return data;
            } else {
                throw new Error(data.message || 'Failed to start loop');
            }
        } catch (error) {
            console.error('Error starting loop:', error);
            this.displayManager.showNotification('Error: Could not connect to server', 'error');
            throw error;
        }
    }

    // Get current word
    async getCurrentWord() {
        try {
            return await this.request('/current-word');
        } catch (error) {
            console.error('Error getting current word:', error);
            throw error;
        }
    }

    // Get server status
    async getServerStatus() {
        try {
            return await this.request('/status');
        } catch (error) {
            console.error('Error getting server status:', error);
            throw error;
        }
    }
}