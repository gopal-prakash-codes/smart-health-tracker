const WebSocket = require('ws');
const mongoose = require('mongoose');
const HealthData = require('../models/HealthData'); // Assuming HealthData is a Mongoose model

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
    console.log('New client connected');

    ws.on('message', async (message) => {
        try {
            const data = JSON.parse(message);
            // Save incoming health data to MongoDB
            const healthData = new HealthData(data);
            await healthData.save();
            console.log('Health data saved:', healthData);
            
            // Broadcast the new health data to all connected clients
            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(healthData));
                }
            });
        } catch (error) {
            console.error('Error processing message:', error);
            ws.send(JSON.stringify({ error: 'Failed to process message' }));
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
});

mongoose.connect('mongodb://localhost:27017/healthdata', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('MongoDB connected');
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
    });

process.on('SIGINT', () => {
    wss.close(() => {
        console.log('WebSocket server closed');
        mongoose.connection.close(() => {
            console.log('MongoDB connection closed');
            process.exit(0);
        });
    });
});