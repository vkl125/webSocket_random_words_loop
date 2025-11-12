// Application middleware setup
const express = require('express');
const cors = require('cors');
const path = require('path');
const Logger = require('../utils/logger');

class AppMiddleware {
    constructor() {
        this.middlewareStack = [];
    }

    // Setup all middleware
    setup(app) {
        // CORS middleware
        app.use(cors());

        // JSON body parsing middleware
        app.use(express.json());

        // Static file serving middleware
        app.use(express.static(path.join(__dirname, '../../public')));

        // Request logging middleware
        app.use(Logger.requestLogger);

        // Error handling middleware
        app.use(this.errorHandler);
    }

    // Error handler middleware
    errorHandler(err, req, res, next) {
        Logger.error('Unhandled error:', err);
        
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }

    // Health check middleware
    healthCheck(req, res, next) {
        if (req.path === '/health') {
            return res.json({
                status: 'OK',
                timestamp: new Date().toISOString(),
                uptime: process.uptime()
            });
        }
        next();
    }
}

module.exports = AppMiddleware;