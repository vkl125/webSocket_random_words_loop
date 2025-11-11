// Display management module
export class DisplayManager {
    constructor() {
        this.wordDisplay = document.getElementById('wordDisplay');
        this.statusElement = document.getElementById('status');
        this.connectionStatus = document.getElementById('connectionStatus');
        this.startButton = document.getElementById('startButton');
    }

    // Update the display with current word
    updateDisplay(word, isRunning) {
        if (word) {
            this.wordDisplay.textContent = word;
            this.wordDisplay.style.color = '#2c3e50';
        } else {
            this.wordDisplay.textContent = 'No word selected';
            this.wordDisplay.style.color = '#7f8c8d';
        }
        
        this.statusElement.textContent = `Loop status: ${isRunning ? 'Running' : 'Not running'}`;
    }

    // Update connection status
    updateConnectionStatus(connected) {
        if (connected) {
            this.connectionStatus.textContent = 'WebSocket: Connected';
            this.connectionStatus.style.color = '#27ae60';
            this.startButton.disabled = false;
        } else {
            this.connectionStatus.textContent = 'WebSocket: Disconnected';
            this.connectionStatus.style.color = '#e74c3c';
            this.startButton.disabled = true;
        }
    }

    // Set start button state
    setStartButtonState(disabled) {
        this.startButton.disabled = disabled;
    }

    // Show notification
    showNotification(message, type = 'info') {
        // Simple notification implementation
        console.log(`[${type.toUpperCase()}] ${message}`);
        
        // You could enhance this with a proper notification system
        if (type === 'error') {
            alert(message);
        }
    }
}