import { Citizen } from '../models/Citizen.js';

export async function registerCitizen(req, res) {
  try {
    const { fullName, email, mobile, state, password, language, age, occupation, income } = req.body;

    const existing = await Citizen.findOne({ email: email?.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: 'A citizen with this email already exists' });
    }

    const citizen = await Citizen.create({
      fullName,
      email,
      mobile,
      state,
      password,
      language,
      age,
      occupation,
      income,
    });

    res.status(201).json({
      message: 'Citizen registered successfully',
      citizen,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Failed to register citizen', error: error.message });
  }
}

export async function getCitizens(req, res) {
  try {
    const citizens = await Citizen.find().sort({ createdAt: -1 });
    res.json({ count: citizens.length, citizens });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch citizens', error: error.message });
  }
}

export async function getCitizenById(req, res) {
  try {
    const citizen = await Citizen.findById(req.params.id);
    if (!citizen) {
      return res.status(404).json({ message: 'Citizen not found' });
    }
    res.json({ citizen });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid citizen ID' });
    }
    res.status(500).json({ message: 'Failed to fetch citizen', error: error.message });
  }
}

export async function updateCitizen(req, res) {
  try {
    const allowed = [
      'fullName',
      'mobile',
      'state',
      'language',
      'age',
      'gender',
      'occupation',
      'income',
      'educationLevel',
      'currentCourse',
      'employmentStatus',
      'familySize',
      'dependants',
      'residenceType',
      'isFarmer',
      'firstGraduate',
      'specialCircumstances',
      'district',
      'landholdingAcres',
      'landOwnership',
      'cropTypes',
      'farmingActivities',
      'annualIncomeINR',
      'socialCategory',
      'isDifferentlyAbled',
      'isWidow',
      'motherWidowed',
    ];
    const updates = {};

    for (const field of allowed) {
      if (req.body[field] !== undefined) {
        updates[field] = field === 'socialCategory'
          ? (req.body[field] || 'General')
          : req.body[field];
      }
    }

    const citizen = await Citizen.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!citizen) {
      return res.status(404).json({ message: 'Citizen not found' });
    }

    res.json({ message: 'Citizen updated successfully', citizen });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Failed to update citizen', error: error.message });
  }
}

export async function deleteCitizen(req, res) {
  try {
    const citizen = await Citizen.findByIdAndDelete(req.params.id);
    if (!citizen) {
      return res.status(404).json({ message: 'Citizen not found' });
    }
    res.json({ message: 'Citizen deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete citizen', error: error.message });
  }
}
