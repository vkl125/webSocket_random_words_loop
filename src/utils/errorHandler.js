// Common error handling utilities
class ErrorHandler {
    // Standard error response format
    static createErrorResponse(message, error = null, includeErrorDetails = false) {
        const response = {
            success: false,
            message: message
        };
        
        if (error && includeErrorDetails) {
            response.error = error.message;
        }
        
        return response;
    }

    // Standard success response format
    static createSuccessResponse(message, data = null) {
        const response = {
            success: true,
            message: message
        };
        
        if (data !== null) {
            response.data = data;
        }
        
        return response;
    }

    // Handle common API errors
    static handleApiError(error, res) {
        console.error('API Error:', error);
        
        if (error.message === 'Loop is already running') {
            return res.json(this.createErrorResponse('Loop is already running'));
        }
        
        const includeErrorDetails = process.env.NODE_ENV === 'development';
        return res.status(500).json(
            this.createErrorResponse('Internal server error', error, includeErrorDetails)
        );
    }

    // Safe promise execution with error handling
    static async safeExecute(operation, errorMessage) {
        try {
            return await operation();
        } catch (error) {
            console.error(`${errorMessage}:`, error);
            throw error;
        }
    }
}

module.exports = ErrorHandler;