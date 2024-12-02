const User = require('../models/User');

// Register a new user
exports.createUser = async (req, res) => {
  const { walletAddress } = req.body;
  try {
    const existingUser = await User.findOne({ walletAddress });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const newUser = new User({ walletAddress });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Get user profile
exports.getUser = async (req, res) => {
  const { wallet } = req.params;
  try {
    const user = await User.findOne({ walletAddress: wallet });
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Update user tokens
exports.updateUserTokens = async (req, res) => {
  const { wallet } = req.params;
  const { tokens, quizId, correctAnswers } = req.body;
  try {
    const user = await User.findOne({ walletAddress: wallet });
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.tokensEarned += tokens;
    user.quizHistory.push({ quizId, correctAnswers, tokensEarned: tokens });
    await user.save();

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
