// Global variables
let ws = null;
let isConnected = false;

// DOM elements
const wordDisplay = document.getElementById('wordDisplay');
const statusElement = document.getElementById('status');
const connectionStatus = document.getElementById('connectionStatus');
const startButton = document.getElementById('startButton');

// Function to update the display with current word
function updateDisplay(word, isRunning) {
    if (word) {
        wordDisplay.textContent = word;
        wordDisplay.style.color = '#2c3e50';
    } else {
        wordDisplay.textContent = 'No word selected';
        wordDisplay.style.color = '#7f8c8d';
    }
    
    statusElement.textContent = `Loop status: ${isRunning ? 'Running' : 'Not running'}`;
}

// Function to update connection status
function updateConnectionStatus(connected) {
    isConnected = connected;
    if (connected) {
        connectionStatus.textContent = 'WebSocket: Connected';
        connectionStatus.style.color = '#27ae60';
        startButton.disabled = false;
    } else {
        connectionStatus.textContent = 'WebSocket: Disconnected';
        connectionStatus.style.color = '#e74c3c';
        startButton.disabled = true;
    }
}

// Function to connect to WebSocket
async function connectWebSocket() {
    try {
        // Create WebSocket connection
        ws = new WebSocket(`ws://${window.location.host}`);
        
        ws.onopen = () => {
            console.log('WebSocket connected');
            updateConnectionStatus(true);
        };
        
        ws.onmessage = async (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log('WebSocket message received:', data);
                
                switch (data.type) {
                    case 'wordUpdate':
                        // Use requestAnimationFrame for smoother UI updates
                        await new Promise(resolve => requestAnimationFrame(resolve));
                        updateDisplay(data.word, true);
                        startButton.disabled = true;
                        break;
                }
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
        };
        
        ws.onclose = async () => {
            console.log('WebSocket disconnected');
            updateConnectionStatus(false);
            
            // Try to reconnect after 3 seconds
            await new Promise(resolve => setTimeout(resolve, 3000));
            if (!isConnected) {
                console.log('Attempting to reconnect...');
                await connectWebSocket();
            }
        };
        
        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            updateConnectionStatus(false);
        };
        
    } catch (error) {
        console.error('Error creating WebSocket:', error);
        updateConnectionStatus(false);
    }
}

// Function to start the word loop
async function startLoop() {
    if (!isConnected) {
        alert('Not connected to server');
        return;
    }
    
    try {
        const response = await fetch('/api/start-loop', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            console.log('Loop started successfully');
            // WebSocket will handle the UI updates
        } else {
            alert('Failed to start loop: ' + data.message);
        }
    } catch (error) {
        console.error('Error starting loop:', error);
        alert('Error: Could not connect to server');
    }
}



// Initialize the application
function init() {
    // Connect to WebSocket
    connectWebSocket();
    
    // Add event listeners
    startButton.addEventListener('click', startLoop);
    
    console.log('Application initialized with WebSocket');
}

// Start the application when the page loads
document.addEventListener('DOMContentLoaded', init);