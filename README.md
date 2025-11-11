# Random Word WebSocket Application

A modular web application that demonstrates real-time word updates using WebSocket connections.

## Project Structure

```
├── app.js                    # Main application entry point
├── package.json              # Dependencies and scripts
├── README.md                 # This file
├── public/                   # Frontend files
│   ├── index.html            # Main HTML page
│   ├── app.js               # Main frontend application
│   └── modules/             # Frontend modules
│       ├── displayManager.js # UI display management
│       ├── websocketClient.js # WebSocket client logic
│       └── apiClient.js      # API communication
└── src/                     # Backend source code
    ├── server/              # Server-related modules
    │   └── server.js        # Main server class
    ├── config/              # Configuration
    │   └── constants.js     # Application constants
    ├── middleware/          # Express middleware
    │   └── appMiddleware.js # Application middleware setup
    ├── routes/              # API routes
    │   └── apiRoutes.js     # API route handlers
    ├── utils/               # Utility modules
    │   └── wordManager.js   # Word management logic
    └── websocket/           # WebSocket modules
        └── websocketManager.js # WebSocket connection management
```

## Features

- **Real-time Updates**: Uses WebSocket for instant word updates
- **Modular Architecture**: Clean separation of concerns
- **Graceful Shutdown**: Proper cleanup on server shutdown
- **Error Handling**: Comprehensive error handling throughout
- **Auto-reconnect**: Client automatically reconnects if connection is lost

## Backend Modules

### Server (`src/server/server.js`)
Main server class that orchestrates all components:
- Express app setup
- WebSocket server initialization
- Graceful shutdown handling

### Word Manager (`src/utils/wordManager.js`)
Manages the word selection and loop:
- Random word selection
- Word loop management
- State management

### WebSocket Manager (`src/websocket/websocketManager.js`)
Handles WebSocket connections:
- Client connection management
- Message broadcasting
- Connection cleanup

### API Routes (`src/routes/apiRoutes.js`)
Defines REST API endpoints:
- Start word loop
- Get current word
- Server status

### Middleware (`src/middleware/appMiddleware.js`)
Configures Express middleware:
- CORS
- JSON parsing
- Static file serving
- Request logging
- Error handling

### Configuration (`src/config/constants.js`)
Application constants and configuration.

## Frontend Modules

### Display Manager (`public/modules/displayManager.js`)
Manages UI updates and display logic.

### WebSocket Client (`public/modules/websocketClient.js`)
Handles WebSocket connection and message handling.

### API Client (`public/modules/apiClient.js`)
Manages HTTP API communication.

## Installation and Running

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the server:
   ```bash
   npm start
   ```

3. Open your browser to `http://localhost:3000`

## API Endpoints

- `POST /api/start-loop` - Start the word loop
- `GET /api/current-word` - Get current word
- `GET /api/status` - Get server status
- `GET /health` - Health check

## WebSocket Messages

- `wordUpdate` - Sent when the word changes
  ```json
  {
    "type": "wordUpdate",
    "word": "current-word"
  }
  ```

## Development

The application uses modern JavaScript features:
- ES6 modules for frontend
- CommonJS modules for backend
- Async/await for asynchronous operations
- Classes for better organization

## Benefits of Modular Structure

1. **Maintainability**: Each module has a single responsibility
2. **Testability**: Modules can be tested independently
3. **Reusability**: Modules can be reused in other projects
4. **Scalability**: Easy to add new features
5. **Team Development**: Multiple developers can work on different modules

## Error Handling

- All async operations use try/catch
- WebSocket connections handle disconnections gracefully
- Server includes comprehensive error middleware
- Frontend includes user-friendly error notifications