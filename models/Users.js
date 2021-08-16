const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    username: {
      type: String,
      trim: true,
      required: true,
      max: 64,
      min: 3,
    },

    passwordSalt: { type: String, required: true, max: 16 },

    passwordHash: {
      type: String,
      required: true,
    },

    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("Users", UserSchema);

module.exports = User;
