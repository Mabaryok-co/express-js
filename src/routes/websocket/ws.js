const { WebSocketServer } = require('ws');
const express = require("express");
const router = express.Router();
// WebSocket server
const wss = new WebSocketServer({ noServer: true });

// API route to validate and proxy WebSocket connections
router.get('', (req, res) => {
    if (!req.headers.upgrade || req.headers.upgrade.toLowerCase() !== 'websocket') {
        return res.status(400).send('Expected a WebSocket upgrade');
    }

    // Proxy to WebSocket server
    server.on('upgrade', (request, socket, head) => {
        wss.handleUpgrade(request, socket, head, (ws) => {
            wss.emit('connection', ws, request);
        });
    });

    res.end(); // End the HTTP response
});

// WebSocket connection handler
wss.on('connection', (ws, req) => {
    console.log('WebSocket connection established');

    ws.on('message', (message) => {
        console.log(`Received message: ${message}`);
        ws.send(`Echo: ${message}`);
    });

    ws.on('close', () => {
        console.log('WebSocket connection closed');
    });
});

module.exports = router;
