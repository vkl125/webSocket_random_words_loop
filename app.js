// Main application entry point
const Server = require('./src/server/server');
const Logger = require('./src/utils/logger');

async function main() {
    try {
        Logger.info('Starting application...');
        
        // Create and initialize server
        const server = new Server();
        await server.initialize();
        
        // Start the server
        await server.start();
        
        Logger.info('Application started successfully');
        
    } catch (error) {
        Logger.error('Failed to start application:', error);
        process.exit(1);
    }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    Logger.error('Uncaught Exception:', error);
    process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    Logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// Start the application
if (require.main === module) {
    main();
}

module.exports = main;