// Application constants and configuration
module.exports = {
    PORT: process.env.PORT || 3000,
    WORDS: ['cat', 'dog', 'mouse', 'horse', 'fox'],
    WORD_CHANGE_INTERVAL: 5000, // 5 seconds
    WEBSOCKET_CLOSE_CODE: 1000,
    WEBSOCKET_CLOSE_REASON: 'Server shutting down',
    
    // WebSocket message types
    MESSAGE_TYPES: {
        WORD_UPDATE: 'wordUpdate'
    },
    
    // API response messages
    MESSAGES: {
        LOOP_ALREADY_RUNNING: 'Loop is already running',
        LOOP_STARTED: 'Word loop started',
        INTERNAL_ERROR: 'Internal server error'
    }
};