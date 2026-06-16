import { User } from "../models/Schema.js";

export const registerUser = async (req, res) => {
  const { username, password, email, usertype } = req.body;
  try {
    if (!username || !password || !email || !usertype) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }
    const newUser = new User({ username, password, email, usertype });
    await newUser.save();
    return res.status(201).json({ message: "User registered successfully", user: newUser });
  } catch (error) {
    return res.status(500).json({ message: "Error registering user", error: error.message });
  }
};

export const loginUser = async (req, res) => {
  const { email, password, usertype } = req.body;
  try {
    if (!email || !password || !usertype) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const user = await User.findOne({ email, usertype });
    if (!user) {
      return res.status(400).json({ message: "User not found or user type mismatch" });
    }
    if (user.password !== password) {
      return res.status(400).json({ message: "Incorrect password" });
    }
    return res.status(200).json({ message: "Login successful", user });
  } catch (error) {
    return res.status(500).json({ message: "Error logging in", error: error.message });
  }
};
