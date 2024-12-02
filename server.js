const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const path = require('path');
const ethUtil = require('ethereumjs-util');
const sigUtil = require('eth-sig-util');

// Models
const User = require('./models/User'); // Import the User model

// Initialize Express apps
const backendApp = express();
const frontendApp = express();

// Ports
const BACKEND_PORT = 5000;
const FRONTEND_PORT = 3111;

// Middleware
backendApp.use(cors()); // Allow CORS for all origins (for development)
backendApp.use(bodyParser.json()); // Parse JSON requests
frontendApp.use(bodyParser.json());

// MongoDB Connection
mongoose
  .connect('mongodb+srv://bhavanac003:RkQNGSoe25LDlVMK@cluster0.qzpbs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connected to MongoDB Atlas');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB Atlas:', err);
  });

// JWT Secret Key (Use a better approach in production)
const secretKey = 'w87LqcTUMeA7U8v@#yEEZX2KfH@G9mWxxx';

// ----------------------- Backend API ----------------------- //

// Helper function to generate JWT token
function generateAuthToken(walletAddress) {
  return `Bearer ${jwt.sign({ walletAddress }, secretKey, { expiresIn: '1h' })}`;
}

// Profile submission route
backendApp.post('/api/profile', async (req, res) => {
  const { walletAddress, firstName, lastName, email } = req.body;

  if (!walletAddress || !firstName || !lastName || !email) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    let user = await User.findOne({ walletAddress });

    if (user) {
      user.firstName = firstName;
      user.lastName = lastName;
      user.email = email;
      await user.save();
      return res.status(200).json({ message: 'Profile updated successfully' });
    } else {
      user = new User({ walletAddress, firstName, lastName, email });
      await user.save();
      return res.status(201).json({ message: 'Profile created successfully' });
    }
  } catch (error) {
    console.error('Error saving profile:', error);
    return res.status(500).json({ message: 'Error saving profile' });
  }
});

// Route to fetch profile by walletAddress
backendApp.get('/api/profile/:walletAddress', async (req, res) => {
  const { walletAddress } = req.params;

  try {
    const user = await User.findOne({ walletAddress });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    return res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return res.status(500).json({ message: 'Error fetching profile' });
  }
});

// ----------------------- Frontend API ----------------------- //

// Mock user database
const users = [];
const profiles = [];
const quizHistory = {};
const tokenBalances = {};

// Middleware to verify MetaMask signature
function verifySignature(req, res, next) {
  const { address, signature, message } = req.body;

  const senderAddress = sigUtil.recoverPersonalSignature({ data: message, sig: signature });
  if (senderAddress.toLowerCase() === address.toLowerCase()) {
    if (!users.includes(senderAddress.toLowerCase())) {
      users.push(senderAddress.toLowerCase());
      quizHistory[senderAddress.toLowerCase()] = [];
      tokenBalances[senderAddress.toLowerCase()] = 0;
    }
    req.senderAddress = senderAddress;
    return next();
  } else {
    return res.status(401).json({ error: 'Invalid signature' });
  }
}

// Middleware to verify JWT token
function verifyJwtToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid token' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, secretKey);
    req.senderAddress = decoded.senderAddress;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// MetaMask login
frontendApp.post('/login', verifySignature, (req, res) => {
  const { senderAddress } = req;
  const token = generateAuthToken(senderAddress);
  const profile = profiles.find((profile) => profile.address === senderAddress) || null;

  res.status(200).json({ token, profile });
});

// Profile creation or update
frontendApp.post('/profile', verifyJwtToken, (req, res) => {
  const { senderAddress } = req;
  const { firstName, lastName, email } = req.body;

  if (!firstName || !lastName || !email) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const existingProfile = profiles.find((profile) => profile.address === senderAddress);
  if (existingProfile) {
    return res.status(201).json({ message: 'Profile already exists' });
  }

  profiles.push({ address: senderAddress, firstName, lastName, email });
  res.status(200).json({ message: 'Profile saved successfully' });
});

// Fetch dashboard data (quiz history and token balance)
frontendApp.get('/dashboard', verifyJwtToken, (req, res) => {
  const { senderAddress } = req;
  res.status(200).json({
    history: quizHistory[senderAddress.toLowerCase()] || [],
    balance: tokenBalances[senderAddress.toLowerCase()] || 0,
  });
});

// Serve React static files from the public folder
frontendApp.use(express.static(path.join(__dirname, 'public')));
frontendApp.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ----------------------- Start Servers ----------------------- //

backendApp.listen(BACKEND_PORT, () => {
  console.log(`Backend server running on port ${BACKEND_PORT}`);
});

frontendApp.listen(FRONTEND_PORT, () => {
  console.log(`Frontend server running on port ${FRONTEND_PORT}`);
});
