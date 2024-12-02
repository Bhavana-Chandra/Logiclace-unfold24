const mongoose = require('mongoose');

// Define Profile Schema
const profileSchema = new mongoose.Schema({
  walletAddress: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
});

// Export the model
module.exports = mongoose.model('Profile', profileSchema);
