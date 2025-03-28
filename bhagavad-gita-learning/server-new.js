const express = require('express');
const path = require('path');
const app = express();
const port = 8000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Routes
app.get('/api/chapters', (req, res) => {
    try {
        res.setHeader('Content-Type', 'application/json');
        res.sendFile(path.join(__dirname, 'data/gita.json'));
    } catch (err) {
        console.error('Error serving chapters:', err);
        res.status(500).json({ error: 'Failed to load chapters' });
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});