const mongoose = require('mongoose');

// Schema = the shape and rules for documents in the "users" collection
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true, // creates a unique index, no two users with same email
      lowercase: true, // store emails in lowercase so login is case-insensitive
      trim: true,
    },
    // We never store the plain password, only the bcrypt hash
    password: { type: String, required: [true, 'Password is required'] },
  },
  { timestamps: true } // adds createdAt and updatedAt automatically
);

module.exports = mongoose.model('User', userSchema);
