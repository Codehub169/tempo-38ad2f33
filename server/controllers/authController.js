import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getAppDb } from "../db/setup.js";

const JWT_SECRET = process.env.JWT_SECRET || 'yourFallbackSecretKeyForDevelopmentOnly'; // Ensure this is in .env for production
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '30d';

const generateToken = (id, email, role) => {
  if (!id || !email || !role) {
    console.error('generateToken called with missing id, email, or role.');
    // In a real app, this might throw an error or handle it more gracefully.
    // For now, logging and proceeding might lead to a token without full info if not caught earlier.
    throw new Error('Cannot generate token without user id, email, and role.');
  }
  return jwt.sign({ id, email, role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

export const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'Please provide name, email, password, and role' });
  }
  if (typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({ message: 'Name must be a non-empty string' });
  }
  if (typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ message: 'Please provide a valid email address' });
  }
  if (typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long' });
  }
  if (!['buyer', 'seller'].includes(role)) {
    return res.status(400).json({ message: "Role must be either 'buyer' or 'seller'" });
  }

  try {
    const db = await getAppDb();
    const lowercasedEmail = email.toLowerCase();
    const userExists = await db.get('SELECT id FROM users WHERE email = ?', lowercasedEmail);
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const result = await db.run(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      name.trim(), lowercasedEmail, hashedPassword, role
    );

    if (result.lastID) {
      const token = generateToken(result.lastID, lowercasedEmail, role);
      res.status(201).json({
        id: result.lastID,
        name: name.trim(),
        email: lowercasedEmail,
        role: role,
        token,
      });
    } else {
      console.error('User registration failed to insert, result:', result);
      res.status(500).json({ message: 'Error registering user due to a database issue' });
    }
  } catch (error) {
    console.error('Register user error:', error);
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }
  if (typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ message: 'Please provide a valid email address' });
  }

  try {
    const db = await getAppDb();
    const lowercasedEmail = email.toLowerCase();
    const user = await db.get('SELECT id, name, email, password_hash, role FROM users WHERE email = ?', lowercasedEmail);

    if (user && (await bcrypt.compare(password, user.password_hash))) {
      const token = generateToken(user.id, user.email, user.role);
      res.json({
        id: user.id,
        name: user.name,
        email: user.email, // Already lowercased from DB
        role: user.role,
        token,
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login user error:', error);
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
};

export const getLoggedInUserProfile = async (req, res) => {
  // req.user is populated by the 'protect' middleware
  if (!req.user || !req.user.id) {
    // This should be caught by 'protect' middleware, but as a safeguard:
    return res.status(401).json({ message: 'Not authorized, user information missing in request' });
  }

  try {
      const db = await getAppDb();
      // Fetch user profile using the ID from the token (req.user.id)
      // req.user already contains id, email, role from the token, but fetching from DB ensures data is current.
      const userProfile = await db.get('SELECT id, name, email, role, created_at FROM users WHERE id = ?', req.user.id);
      
      if (userProfile) {
          res.json(userProfile);
      } else {
          // User ID in token was valid, but user no longer exists in DB.
          res.status(404).json({ message: 'User profile not found. The user may have been deleted.' });
      }
  } catch (error) {
      console.error('Get user profile error:', error);
      res.status(500).json({ message: 'Server error fetching user profile', error: error.message });
  }
};