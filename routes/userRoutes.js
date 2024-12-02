const express = require('express');
const router = express.Router();
const Profile = require('../models/Profile'); // Import Profile model

// POST request to create or update profile
router.post('/profile', async (req, res) => {
  const { walletAddress, firstName, lastName, email } = req.body;

  try {
    // Check if profile already exists
    let profile = await Profile.findOne({ walletAddress });
    if (profile) {
      return res.status(400).json({ message: 'Profile already exists for this wallet address' });
    }

    // Create a new profile
    profile = new Profile({ walletAddress, firstName, lastName, email });
    await profile.save();

    res.status(201).json(profile); // Return the created profile
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET request to fetch profile by wallet address
router.get('/profile/:walletAddress', async (req, res) => {
  const { walletAddress } = req.params;

  try {
    const profile = await Profile.findOne({ walletAddress });

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.status(200).json(profile); // Return the found profile
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
