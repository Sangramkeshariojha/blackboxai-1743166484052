const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const app = express();
const port = 8000;

// Configuration
const SECRET_KEY = 'gita-learning-secret-key';
const USERS_FILE = path.join(__dirname, 'data/users.json');

// Initialize users file if not exists
if (!fs.existsSync(USERS_FILE)) {
  fs.writeFileSync(USERS_FILE, '[]');
}

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Auth Middleware
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    req.user = jwt.verify(token, SECRET_KEY);
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

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

// Register endpoint
app.post('/api/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    const users = JSON.parse(fs.readFileSync(USERS_FILE));
    
    if (users.some(u => u.email === email)) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    users.push({ email, password: hashedPassword });
    fs.writeFileSync(USERS_FILE, JSON.stringify(users));
    
    const token = jwt.sign({ email }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const users = JSON.parse(fs.readFileSync(USERS_FILE));
    const user = users.find(u => u.email === email);
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ email }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Protected test endpoint
app.get('/api/protected', authenticate, (req, res) => {
  res.json({ message: 'This is a protected route', user: req.user });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
