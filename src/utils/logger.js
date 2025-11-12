// Common logging utilities
class Logger {
    // Standard log format
    static formatMessage(level, message, context = null) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level,
            message
        };
        
        if (context) {
            logEntry.context = context;
        }
        
        return logEntry;
    }

    // Info level logging
    static info(message, context = null) {
        const logEntry = this.formatMessage('INFO', message, context);
        console.log(`[${logEntry.timestamp}] ${logEntry.level}: ${logEntry.message}`);
    }

    // Error level logging
    static error(message, error = null, context = null) {
        const logEntry = this.formatMessage('ERROR', message, context);
        console.error(`[${logEntry.timestamp}] ${logEntry.level}: ${logEntry.message}`);
        
        if (error) {
            console.error('Error details:', error);
        }
    }

    // Debug level logging (only in development)
    static debug(message, context = null) {
        if (process.env.NODE_ENV === 'development') {
            const logEntry = this.formatMessage('DEBUG', message, context);
            console.log(`[${logEntry.timestamp}] ${logEntry.level}: ${logEntry.message}`);
        }
    }

    // Request logging middleware
    static requestLogger(req, res, next) {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] ${req.method} ${req.path} - ${req.ip}`);
        next();
    }

    // Word change logging
    static logWordChange(word) {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] Current word: ${word}`);
    }
}

module.exports = Logger;