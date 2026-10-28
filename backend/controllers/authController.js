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
      gender,
      occupation,
      income,
      annualIncomeINR,
      socialCategory,
      isDifferentlyAbled,
      isWidow,
      motherWidowed,
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
      gender,
      occupation,
      income,
      annualIncomeINR,
      socialCategory: socialCategory || undefined,
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
        gender: citizen.gender,
        occupation: citizen.occupation,
        income: citizen.income,
        annualIncomeINR: citizen.annualIncomeINR,
        socialCategory: citizen.socialCategory,
        isDifferentlyAbled: citizen.isDifferentlyAbled,
        isWidow: citizen.isWidow,
        motherWidowed: citizen.motherWidowed,
        educationLevel: citizen.educationLevel,
        currentCourse: citizen.currentCourse,
        employmentStatus: citizen.employmentStatus,
        familySize: citizen.familySize,
        dependants: citizen.dependants,
        residenceType: citizen.residenceType,
        isFarmer: citizen.isFarmer,
        firstGraduate: citizen.firstGraduate,
        specialCircumstances: citizen.specialCircumstances,
        district: citizen.district,
        landholdingAcres: citizen.landholdingAcres,
        landOwnership: citizen.landOwnership,
        cropTypes: citizen.cropTypes,
        farmingActivities: citizen.farmingActivities,
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
        gender: citizen.gender,
        occupation: citizen.occupation,
        income: citizen.income,
        annualIncomeINR: citizen.annualIncomeINR,
        socialCategory: citizen.socialCategory || '',
        isDifferentlyAbled: citizen.isDifferentlyAbled,
        isWidow: citizen.isWidow,
        motherWidowed: citizen.motherWidowed,
        educationLevel: citizen.educationLevel,
        currentCourse: citizen.currentCourse,
        employmentStatus: citizen.employmentStatus,
        familySize: citizen.familySize,
        dependants: citizen.dependants,
        residenceType: citizen.residenceType,
        isFarmer: citizen.isFarmer,
        firstGraduate: citizen.firstGraduate,
        specialCircumstances: citizen.specialCircumstances,
        district: citizen.district,
        landholdingAcres: citizen.landholdingAcres,
        landOwnership: citizen.landOwnership,
        cropTypes: citizen.cropTypes,
        farmingActivities: citizen.farmingActivities,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error in login', error: error.message });
  }
};

export const getMe = async (req, res) => {
  res.json({ user: req.user });
};

export const verifyDocumentPassword = async (req, res) => {
  try {
    const password = req.body?.password;
    if (typeof password !== 'string' || !password) {
      return res.status(400).json({ message: 'Enter your password to continue' });
    }

    const citizen = await Citizen.findById(req.user._id).select('+password');
    if (!citizen || !(await citizen.comparePassword(password))) {
      return res.status(401).json({ message: 'The password is incorrect. Please try again.' });
    }

    const accessToken = jwt.sign(
      { id: String(citizen._id), purpose: 'document-access' },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '10m' },
    );
    res.cookie('documentAccess', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 10 * 60 * 1000,
      path: '/api/documents',
    });
    return res.json({ message: 'Identity verified', expiresIn: 600 });
  } catch (error) {
    console.error('Error verifying document access:', error.message);
    return res.status(500).json({ message: 'Could not verify your identity right now' });
  }
};

export const lockDocumentAccess = (_req, res) => {
  res.clearCookie('documentAccess', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/api/documents',
  });
  res.json({ message: 'Document access locked' });
};
