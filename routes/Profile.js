const express = require('express');
const Profile = require('../models/Profile'); // Ensure correct path to Profile model
const router = express.Router();

// POST request to save profile
router.post('/', async (req, res) => {
  const { walletAddress, firstName, lastName, email } = req.body;

  try {
    // Check if the user already exists
    const existingProfile = await Profile.findOne({ walletAddress });
    if (existingProfile) {
      return res.status(400).json({ message: 'User already exists!' });
    }

    // Create a new profile
    const newProfile = new Profile({
      walletAddress,
      firstName,
      lastName,
      email
    });

    await newProfile.save();
    res.status(200).json({ message: 'Profile submitted successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Error saving profile. Please try again.' });
  }
});

// GET request to fetch profile by wallet address
router.get('/:walletAddress', async (req, res) => {
  const { walletAddress } = req.params;

  try {
    const profile = await Profile.findOne({ walletAddress });
    if (profile) {
      res.status(200).json(profile);
    } else {
      res.status(404).json({ message: 'User not found.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile. Please try again.' });
  }
});

module.exports = router;
