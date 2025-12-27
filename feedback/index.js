import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FeedbackForm = () => {
    const [feedback, setFeedback] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setFeedback(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/feedback', { feedback });
            setSubmitted(true);
            setFeedback('');
        } catch (err) {
            setError('Failed to submit feedback. Please try again later.');
        }
    };

    return (
        <div>
            <h2>User Feedback</h2>
            {submitted && <p>Thank you for your feedback!</p>}
            {error && <p>{error}</p>}
            <form onSubmit={handleSubmit}>
                <textarea value={feedback} onChange={handleChange} required />
                <button type="submit">Submit Feedback</button>
            </form>
        </div>
    );
};

export default FeedbackForm;

import express from 'express';
import mongoose from 'mongoose';

const app = express();
app.use(express.json());

const feedbackSchema = new mongoose.Schema({
    feedback: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const Feedback = mongoose.model('Feedback', feedbackSchema);

app.post('/api/feedback', async (req, res) => {
    const { feedback } = req.body;
    try {
        const newFeedback = new Feedback({ feedback });
        await newFeedback.save();
        res.status(201).send(newFeedback);
    } catch (err) {
        res.status(400).send({ error: 'Error saving feedback' });
    }
});

const startServer = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/feedback', { useNewUrlParser: true, useUnifiedTopology: true });
        app.listen(5000, () => {
            console.log('Server is running on http://localhost:5000');
        });
    } catch (err) {
        console.error('Database connection error:', err);
    }
};

startServer();

version: '3.8'
services:
  web:
    build: .
    ports:
      - "5000:5000"
    volumes:
      - .:/app
    environment:
      - NODE_ENV=production
    depends_on:
      - mongo
  mongo:
    image: mongo
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db
volumes:
  mongo-data: