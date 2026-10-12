import jwt from 'jsonwebtoken';
import { Citizen } from '../models/Citizen.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '30d',
  });
};

export const register = async (req, res) => {
  try {
    const {
      fullName,
      email,
      mobile,
      password,
      state,
      age,
      occupation,
      income,
      annualIncomeINR,
      socialCategory = 'General',
      isDifferentlyAbled = false,
      isWidow = false,
      motherWidowed = false,
      language,
      aadharNumber,
      rationCard,
    } = req.body;
    
    const existing = await Citizen.findOne({ email: email?.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    
    const citizen = await Citizen.create({
      fullName,
      email,
      mobile,
      password,
      state,
      language: language || 'English',
      age,
      occupation,
      income,
      annualIncomeINR,
      socialCategory: socialCategory || 'General',
      isDifferentlyAbled,
      isWidow,
      motherWidowed,
      aadharNumber,
      rationCard,
    });
    
    res.status(201).json({
      token: generateToken(citizen._id),
      user: {
        id: citizen._id,
        fullName: citizen.fullName,
        email: citizen.email,
        mobile: citizen.mobile,
        state: citizen.state,
        age: citizen.age,
        occupation: citizen.occupation,
        income: citizen.income,
        annualIncomeINR: citizen.annualIncomeINR,
        socialCategory: citizen.socialCategory,
        isDifferentlyAbled: citizen.isDifferentlyAbled,
        isWidow: citizen.isWidow,
        motherWidowed: citizen.motherWidowed,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error in registration', error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email?.toLowerCase().trim();
    
    const citizen = await Citizen.findOne({ email: normalizedEmail }).select('+password');
    if (!citizen || !(await citizen.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    res.json({
      token: generateToken(citizen._id),
      user: {
        id: citizen._id,
        fullName: citizen.fullName,
        email: citizen.email,
        mobile: citizen.mobile,
        state: citizen.state,
        age: citizen.age,
        occupation: citizen.occupation,
        income: citizen.income,
        annualIncomeINR: citizen.annualIncomeINR,
        socialCategory: citizen.socialCategory || 'General',
        isDifferentlyAbled: citizen.isDifferentlyAbled,
        isWidow: citizen.isWidow,
        motherWidowed: citizen.motherWidowed,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error in login', error: error.message });
  }
};

export const getMe = async (req, res) => {
  res.json({ user: req.user });
};
