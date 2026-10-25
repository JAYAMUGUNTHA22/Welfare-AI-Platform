import jwt from 'jsonwebtoken';
import { Citizen } from '../models/Citizen.js';

export const authenticate = async (req, res, next) => {
  try {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    const user = await Citizen.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Not authorized, invalid token' });
  }
};

export const requireDocumentVerification = (req, res, next) => {
  try {
    const cookieHeader = req.headers.cookie || '';
    const tokenPair = cookieHeader.split(';').map((part) => part.trim())
      .find((part) => part.startsWith('documentAccess='));
    const accessToken = tokenPair?.slice('documentAccess='.length);
    if (!accessToken) {
      return res.status(403).json({ message: 'Verify your password to access documents' });
    }

    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET || 'fallback_secret');
    if (decoded.purpose !== 'document-access' || String(decoded.id) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Verify your password to access documents' });
    }

    next();
  } catch (_error) {
    res.status(403).json({ message: 'Your document verification expired. Enter your password again.' });
  }
};
