// Global variables
let pollingInterval = null;
let isPolling = false;

// DOM elements
const wordDisplay = document.getElementById('wordDisplay');
const statusElement = document.getElementById('status');
const startButton = document.getElementById('startButton');
const stopButton = document.getElementById('stopButton');

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

// Function to start polling for current word
function startPolling() {
    if (isPolling) return;
    
    isPolling = true;
    
    // Poll every 2 seconds (more frequent than backend changes)
    pollingInterval = setInterval(async () => {
        try {
            const response = await fetch('/api/current-word');
            const data = await response.json();
            
            updateDisplay(data.currentWord, data.isLoopRunning);
            
            // Update button states based on loop status
            if (data.isLoopRunning) {
                startButton.disabled = true;
                stopButton.disabled = false;
            } else {
                startButton.disabled = false;
                stopButton.disabled = true;
            }
        } catch (error) {
            console.error('Error fetching current word:', error);
            statusElement.textContent = 'Error: Could not connect to server';
        }
    }, 2000);
}

// Function to stop polling
function stopPolling() {
    if (pollingInterval) {
        clearInterval(pollingInterval);
        pollingInterval = null;
    }
    isPolling = false;
}

// Function to start the word loop
async function startLoop() {
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
            
            // Update UI
            startButton.disabled = true;
            stopButton.disabled = false;
            
            // Start polling if not already started
            if (!isPolling) {
                startPolling();
            }
            
            // Immediately update with initial word
            updateDisplay(data.initialWord, true);
        } else {
            alert('Failed to start loop: ' + data.message);
        }
    } catch (error) {
        console.error('Error starting loop:', error);
        alert('Error: Could not connect to server');
    }
}

// Function to stop the word loop
async function stopLoop() {
    try {
        const response = await fetch('/api/stop-loop', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            console.log('Loop stopped successfully');
            
            // Update UI
            startButton.disabled = false;
            stopButton.disabled = true;
            
            // Stop polling
            stopPolling();
            
            // Update display
            updateDisplay(null, false);
        } else {
            alert('Failed to stop loop: ' + data.message);
        }
    } catch (error) {
        console.error('Error stopping loop:', error);
        alert('Error: Could not connect to server');
    }
}

// Initialize the application
function init() {
    // Start polling immediately to check initial state
    startPolling();
    
    // Add event listeners for better UX
    startButton.addEventListener('click', startLoop);
    stopButton.addEventListener('click', stopLoop);
    
    console.log('Application initialized');
}

// Start the application when the page loads
document.addEventListener('DOMContentLoaded', init);