import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getAppDb } from "../db/setup.js";

const JWT_SECRET = process.env.JWT_SECRET || 'yourFallbackSecretKey';
const JWT_EXPIRES_IN = '30d';

const generateToken = (id, email) => {
  if (!id || !email) {
    // This should ideally not happen if called correctly
    console.error('generateToken called with missing id or email.');
    throw new Error('Cannot generate token without user id and email.');
  }
  return jwt.sign({ id, email }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please provide name, email, and password' });
  }
  // Basic email validation regex
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ message: 'Please provide a valid email address' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long' });
  }

  try {
    const db = await getAppDb();
    const userExists = await db.get('SELECT id FROM users WHERE email = ?', email.toLowerCase());
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const result = await db.run(
      'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
      name, email.toLowerCase(), hashedPassword
    );

    if (result.lastID) {
      const token = generateToken(result.lastID, email.toLowerCase());
      res.status(201).json({
        id: result.lastID,
        name,
        email: email.toLowerCase(),
        token,
      });
    } else {
      // This case should be rare if DB is operational and schema is correct
      console.error('User registration inserted 0 rows, result:', result);
      res.status(500).json({ message: 'Error registering user' });
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
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ message: 'Please provide a valid email address' });
  }

  try {
    const db = await getAppDb();
    const user = await db.get('SELECT id, name, email, password_hash FROM users WHERE email = ?', email.toLowerCase());

    if (user && (await bcrypt.compare(password, user.password_hash))) {
      const token = generateToken(user.id, user.email);
      res.json({
        id: user.id,
        name: user.name,
        email: user.email, // Already lowercased from DB
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
  // req.user is populated by the 'protect' middleware and should contain id and email
  if (!req.user || !req.user.id) {
    // This case should be prevented by the 'protect' middleware
    return res.status(401).json({ message: 'Not authorized, user information missing' });
  }

  try {
      const db = await getAppDb();
      // Fetch user profile using the ID from the token
      const userProfile = await db.get('SELECT id, name, email, created_at FROM users WHERE id = ?', req.user.id);
      if (userProfile) {
          // Ensure email from DB is consistent (it should be, as it's from token's user.id)
          res.json(userProfile);
      } else {
          // This implies user ID in token is valid but user doesn't exist in DB (e.g., deleted after token issuance)
          res.status(404).json({ message: 'User profile not found' });
      }
  } catch (error) {
      console.error('Get user profile error:', error);
      res.status(500).json({ message: 'Server error fetching profile', error: error.message });
  }
};
