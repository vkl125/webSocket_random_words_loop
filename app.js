// Main application entry point
const Server = require('./src/server/server');

async function main() {
    try {
        console.log('Starting application...');
        
        // Create and initialize server
        const server = new Server();
        await server.initialize();
        
        // Start the server
        await server.start();
        
        console.log('Application started successfully');
        
    } catch (error) {
        console.error('Failed to start application:', error);
        process.exit(1);
    }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// Start the application
if (require.main === module) {
    main();
}

module.exports = main;