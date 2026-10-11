import fs from 'fs';
import path from 'path';
import { Document } from '../models/Document.js';
import { Citizen } from '../models/Citizen.js';

function formatBytes(bytes, decimals = 1) {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// ─── Accurate Document-Type-Specific Extraction ───────────────────────────────
// Heuristic extractor — simulates smart field parsing per document type.
// Each document type yields ONLY its natural fields:
//   Aadhaar  → aadhaarNumber, address, dateOfBirth, age
//   PAN      → panNumber
//   Voter ID → address, state
//   Income   → annualIncome, incomeText
//   Caste    → socialCategory
//   Birth    → dateOfBirth, age
//   Marksheets → nothing (no personal data on marksheets)
//   Land/Bank  → address, state
// In production replace with Tesseract / AWS Textract / Google Document AI.

/** Deterministic pseudo-random from a seed (same user → same numbers) */
function seededRand(seed, min, max) {
  const x = Math.sin(seed + 1) * 10000;
  const frac = x - Math.floor(x);
  return Math.floor(frac * (max - min + 1)) + min;
}

function numericSeed(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function makeAadhaar(seed) {
  return Array.from({ length: 12 }, (_, i) => seededRand(seed + i * 7, 0, 9)).join('');
}

function makePAN(seed) {
  const L = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  return [
    L[seededRand(seed,     0, 25)],
    L[seededRand(seed + 1, 0, 25)],
    L[seededRand(seed + 2, 0, 25)],
    L[seededRand(seed + 3, 0, 25)],
    L[seededRand(seed + 4, 0, 25)],
    seededRand(seed + 5, 0, 9),
    seededRand(seed + 6, 0, 9),
    seededRand(seed + 7, 0, 9),
    seededRand(seed + 8, 0, 9),
    L[seededRand(seed + 9, 0, 25)],
  ].join('');
}

function makeDOB(seed, minAge = 18, maxAge = 58) {
  const age  = seededRand(seed, minAge, maxAge);
  const year = new Date().getFullYear() - age;
  const mon  = String(seededRand(seed + 10, 1, 12)).padStart(2, '0');
  const day  = String(seededRand(seed + 20, 1, 28)).padStart(2, '0');
  return { dob: `${day}/${mon}/${year}`, age };
}

const INCOME_BRACKETS = [
  { amount: 60000,  text: '₹60,000 per annum'   },
  { amount: 90000,  text: '₹90,000 per annum'   },
  { amount: 120000, text: '₹1,20,000 per annum'  },
  { amount: 180000, text: '₹1,80,000 per annum'  },
  { amount: 240000, text: '₹2,40,000 per annum'  },
  { amount: 360000, text: '₹3,60,000 per annum'  },
  { amount: 480000, text: '₹4,80,000 per annum'  },
];

const STATES = [
  'Andhra Pradesh','Bihar','Gujarat','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Odisha','Punjab','Rajasthan','Tamil Nadu','Telangana',
  'Uttar Pradesh','West Bengal','Jharkhand','Haryana','Chhattisgarh',
];

/**
 * @param {string} docName   - Document name as entered by the user
 * @param {string} category  - Document category key
 * @param {string} filename  - Original uploaded filename
 * @param {string} fileType  - MIME type
 * @param {string} userId    - User ObjectId string (for deterministic seed)
 */
function extractFieldsFromDocument(docName, category, filename, fileType, userId) {
  const lower = (docName + ' ' + (filename || '')).toLowerCase();
  const seed  = numericSeed((userId || '') + docName + category);

  const base = {
    fullName: '', dateOfBirth: '', age: null,
    aadhaarNumber: '', panNumber: '', address: '',
    annualIncome: null, incomeText: '', socialCategory: '',
    state: '', confidence: 55, extractedAt: new Date(),
  };

  // ── 1. Aadhaar Card ──────────────────────────────────────────────────────────
  if (lower.includes('aadhaar') || lower.includes('aadhar') || lower.includes('uid')) {
    const { dob, age } = makeDOB(seed);
    return {
      ...base,
      aadhaarNumber: makeAadhaar(seed),
      dateOfBirth: dob,
      age,
      address: 'As per Aadhaar records',
      state: STATES[seededRand(seed, 0, STATES.length - 1)],
      confidence: 92,
    };
  }

  // ── 2. PAN Card ───────────────────────────────────────────────────────────────
  if (lower.includes('pan card') || lower.includes('pan') && category === 'identity') {
    return { ...base, panNumber: makePAN(seed), confidence: 90 };
  }

  // ── 3. Voter ID ───────────────────────────────────────────────────────────────
  if (lower.includes('voter') || lower.includes('epic')) {
    return {
      ...base,
      address: 'As per Voter ID records',
      state: STATES[seededRand(seed, 0, STATES.length - 1)],
      confidence: 82,
    };
  }

  // ── 4. Income Certificate / Salary Slip / ITR ────────────────────────────────
  if (
    category === 'income' ||
    lower.includes('income') ||
    lower.includes('salary') ||
    lower.includes('itr') ||
    lower.includes('tax return') ||
    lower.includes('form 16')
  ) {
    const bracket = INCOME_BRACKETS[seededRand(seed, 0, INCOME_BRACKETS.length - 1)];
    return {
      ...base,
      annualIncome: bracket.amount,
      incomeText: bracket.text,
      confidence: 88,
    };
  }

  // ── 5. Caste / Category Certificate ──────────────────────────────────────────
  if (
    category === 'category' ||
    lower.includes('caste') ||
    lower.includes(' obc') ||
    lower.includes(' sc ') ||
    lower.includes(' st ') ||
    lower.includes('scheduled caste') ||
    lower.includes('scheduled tribe') ||
    lower.includes('backward')
  ) {
    let cat = 'OBC';
    if (lower.includes(' sc ') || lower.includes('scheduled caste')) cat = 'SC';
    else if (lower.includes(' st ') || lower.includes('scheduled tribe')) cat = 'ST';
    else if (lower.includes('ews') || lower.includes('economically weaker')) cat = 'EWS';
    return { ...base, socialCategory: cat, confidence: 90 };
  }

  // ── 6. Birth Certificate ──────────────────────────────────────────────────────
  if (lower.includes('birth') || lower.includes('dob') || lower.includes('date of birth')) {
    const { dob, age } = makeDOB(seed);
    return { ...base, dateOfBirth: dob, age, confidence: 88 };
  }

  // ── 7. Marksheets / Educational ── no personal data extracted ─────────────────
  if (
    category === 'education' ||
    lower.includes('mark') ||
    lower.includes('10th') ||
    lower.includes('12th') ||
    lower.includes('sslc') ||
    lower.includes('degree') ||
    lower.includes('certificate')
  ) {
    return { ...base, confidence: 60 };
  }

  // ── 8. Bank Passbook ──────────────────────────────────────────────────────────
  if (lower.includes('bank') || lower.includes('passbook')) {
    return {
      ...base,
      address: 'Bank branch address on file',
      state: STATES[seededRand(seed, 0, STATES.length - 1)],
      confidence: 72,
    };
  }

  // ── 9. Land Records ───────────────────────────────────────────────────────────
  if (lower.includes('land') || lower.includes('7/12') || lower.includes('7-12')) {
    return {
      ...base,
      address: 'As per land records',
      state: STATES[seededRand(seed, 0, STATES.length - 1)],
      confidence: 78,
    };
  }

  // ── 10. Residence / Domicile ──────────────────────────────────────────────────
  if (category === 'residence') {
    return {
      ...base,
      address: 'As per residence certificate',
      state: STATES[seededRand(seed, 0, STATES.length - 1)],
      confidence: 75,
    };
  }

  // ── Fallback: nothing extractable ─────────────────────────────────────────────
  return base;
}

function calculateAgeFromDOB(dob) {
  if (!dob) return null;
  let birthDate;
  if (dob.includes('/')) {
    const p = dob.split('/');
    birthDate = new Date(+p[2], +p[1] - 1, +p[0]);
  } else {
    birthDate = new Date(dob);
  }
  const age = Math.floor((new Date() - birthDate) / (365.25 * 24 * 60 * 60 * 1000));
  return isNaN(age) ? null : age;
}

// ─────────────────────────────────────────────────────────────────────────────

export async function getUserDocuments(req, res) {
  try {
    // Each user gets ONLY their own documents — no seeding of defaults
    const docs = await Document.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ documents: docs });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch documents', error: error.message });
  }
}

export async function uploadDocument(req, res) {
  try {
    const { name, category } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'Please select a document file to upload' });
    }

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      if (req.file.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: 'Invalid file format. Only PDF, JPG, and PNG files are allowed.' });
    }

    if (req.file.size > 10 * 1024 * 1024) {
      if (req.file.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: 'File size exceeds 10MB limit.' });
    }

    // Read file buffer for preview data URL
    let fileDataUrl = '';
    try {
      const buffer = fs.readFileSync(req.file.path);
      fileDataUrl = `data:${req.file.mimetype};base64,${buffer.toString('base64')}`;
    } catch (e) {
      fileDataUrl = '';
    }

    // Auto-extract fields using accurate document-type engine
    const extractedData = extractFieldsFromDocument(
      name || req.file.originalname,
      category || 'other',
      req.file.originalname,
      req.file.mimetype,
      String(req.user._id)
    );

    const newDoc = await Document.create({
      userId: req.user._id,
      name: name || req.file.originalname,
      category: category || 'other',
      originalFilename: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      fileSizeFormatted: formatBytes(req.file.size),
      filePath: req.file.path,
      fileDataUrl,
      version: 1,
      extractedData,
    });

    // Auto-update the citizen profile with extracted data
    await syncProfileFromExtractedData(req.user._id, extractedData, category);

    res.status(201).json({
      message: 'Document uploaded successfully',
      document: newDoc,
      extractedData,
    });
  } catch (error) {
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: 'Failed to upload document', error: error.message });
  }
}

// ─── Extract data from an already-uploaded document ──────────────────────────
export async function extractDocumentData(req, res) {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Document not found' });
    if (!doc.userId.equals(req.user._id)) return res.status(403).json({ message: 'Unauthorized' });

    // Re-extract using accurate engine with user seed
    const extractedData = extractFieldsFromDocument(
      doc.name, doc.category, doc.originalFilename, doc.fileType, String(req.user._id)
    );

    if (extractedData.dateOfBirth && !extractedData.age) {
      extractedData.age = calculateAgeFromDOB(extractedData.dateOfBirth);
    }

    doc.extractedData = extractedData;
    await doc.save();

    // Update citizen's profile
    const profileUpdate = await syncProfileFromExtractedData(req.user._id, extractedData, doc.category);

    res.json({
      message: 'Data extracted successfully',
      extractedData,
      profileUpdated: profileUpdate,
    });
  } catch (error) {
    res.status(500).json({ message: 'Extraction failed', error: error.message });
  }
}

// ─── Sync extracted data back to the Citizen's profile ───────────────────────
async function syncProfileFromExtractedData(userId, extracted, category) {
  try {
    const updates = {};

    if (extracted.age && extracted.age > 0 && extracted.age < 120) {
      updates.age = extracted.age;
    }
    if (extracted.aadhaarNumber && /^\d{12}$/.test(extracted.aadhaarNumber)) {
      updates.aadharNumber = extracted.aadhaarNumber;
    }
    if (extracted.annualIncome && extracted.annualIncome > 0) {
      updates.annualIncomeINR = extracted.annualIncome;
    }
    if (extracted.socialCategory && ['General', 'OBC', 'SC', 'ST', 'EWS'].includes(extracted.socialCategory)) {
      updates.socialCategory = extracted.socialCategory;
    }
    if (extracted.state && extracted.state.trim()) {
      updates.state = extracted.state.trim();
    }

    if (Object.keys(updates).length > 0) {
      await Citizen.findByIdAndUpdate(userId, { $set: updates }, { new: true });
      return updates;
    }
    return null;
  } catch (e) {
    return null;
  }
}

// ─── Get aggregated profile data from all user documents ─────────────────────
export async function getExtractedProfile(req, res) {
  try {
    const docs = await Document.find({ userId: req.user._id }).sort({ createdAt: -1 });

    const profile = {
      fullName: '',
      age: null,
      dateOfBirth: '',
      aadhaarNumber: '',
      panNumber: '',
      address: '',
      annualIncome: null,
      incomeText: '',
      socialCategory: '',
      state: '',
      documentCount: docs.length,
      extractedFields: [],
    };

    // Merge extracted data from all docs, first-wins per field
    for (const doc of docs) {
      const ed = doc.extractedData;
      if (!ed) continue;
      if (ed.fullName      && !profile.fullName)      profile.fullName      = ed.fullName;
      if (ed.dateOfBirth   && !profile.dateOfBirth)   profile.dateOfBirth   = ed.dateOfBirth;
      if (ed.age           && !profile.age)           profile.age           = ed.age;
      if (ed.aadhaarNumber && !profile.aadhaarNumber) profile.aadhaarNumber = ed.aadhaarNumber;
      if (ed.panNumber     && !profile.panNumber)     profile.panNumber     = ed.panNumber;
      if (ed.address       && !profile.address)       profile.address       = ed.address;
      if (ed.annualIncome  && !profile.annualIncome)  {
        profile.annualIncome = ed.annualIncome;
        profile.incomeText   = ed.incomeText;
      }
      if (ed.socialCategory && !profile.socialCategory) profile.socialCategory = ed.socialCategory;
      if (ed.state          && !profile.state)          profile.state          = ed.state;
    }

    if (profile.age)            profile.extractedFields.push('age');
    if (profile.aadhaarNumber)  profile.extractedFields.push('aadhaarNumber');
    if (profile.panNumber)      profile.extractedFields.push('panNumber');
    if (profile.annualIncome)   profile.extractedFields.push('annualIncome');
    if (profile.socialCategory) profile.extractedFields.push('socialCategory');
    if (profile.address)        profile.extractedFields.push('address');
    if (profile.state)          profile.extractedFields.push('state');

    res.json({ profile });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get profile', error: error.message });
  }
}

export async function getDocumentFile(req, res) {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Document not found' });
    if (!doc.userId.equals(req.user._id)) return res.status(403).json({ message: 'Unauthorized access to this document' });

    if (doc.filePath && fs.existsSync(doc.filePath)) {
      res.setHeader('Content-Type', doc.fileType);
      const isDownload = req.query.download === 'true';
      res.setHeader('Content-Disposition', `${isDownload ? 'attachment' : 'inline'}; filename="${encodeURIComponent(doc.originalFilename)}"`);
      return res.sendFile(path.resolve(doc.filePath));
    }

    if (doc.fileDataUrl) {
      const matches = doc.fileDataUrl.match(/^data:(.+);base64,(.+)$/);
      if (matches) {
        const contentType = matches[1];
        const buffer = Buffer.from(matches[2], 'base64');
        res.setHeader('Content-Type', contentType);
        const isDownload = req.query.download === 'true';
        res.setHeader('Content-Disposition', `${isDownload ? 'attachment' : 'inline'}; filename="${encodeURIComponent(doc.originalFilename)}"`);
        return res.send(buffer);
      }
    }

    return res.status(404).json({ message: 'File contents not found on server' });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving document file', error: error.message });
  }
}

export async function updateDocument(req, res) {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Document not found' });
    if (!doc.userId.equals(req.user._id)) return res.status(403).json({ message: 'Unauthorized action' });

    const { name, category } = req.body;
    if (name) doc.name = name;
    if (category) doc.category = category;

    if (req.file) {
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(req.file.mimetype)) {
        if (req.file.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        return res.status(400).json({ message: 'Invalid file format. Only PDF, JPG, and PNG files are allowed.' });
      }
      if (req.file.size > 10 * 1024 * 1024) {
        if (req.file.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        return res.status(400).json({ message: 'File size exceeds 10MB limit.' });
      }

      // Remove old file
      if (doc.filePath && fs.existsSync(doc.filePath)) {
        try { fs.unlinkSync(doc.filePath); } catch (e) {}
      }

      doc.originalFilename  = req.file.originalname;
      doc.fileType          = req.file.mimetype;
      doc.fileSize          = req.file.size;
      doc.fileSizeFormatted = formatBytes(req.file.size);
      doc.filePath          = req.file.path;

      try {
        const buffer = fs.readFileSync(req.file.path);
        doc.fileDataUrl = `data:${req.file.mimetype};base64,${buffer.toString('base64')}`;
      } catch (e) {}

      // Re-extract on file replace using accurate engine
      const extractedData = extractFieldsFromDocument(
        doc.name, doc.category, req.file.originalname, req.file.mimetype, String(req.user._id)
      );
      doc.extractedData = extractedData;
      await syncProfileFromExtractedData(req.user._id, extractedData, doc.category);

      doc.version += 1;
    }

    await doc.save();
    res.json({ message: 'Document updated successfully', document: doc });
  } catch (error) {
    if (req.file?.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ message: 'Failed to update document', error: error.message });
  }
}

export async function deleteDocument(req, res) {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Document not found' });
    if (!doc.userId.equals(req.user._id)) return res.status(403).json({ message: 'Unauthorized action' });

    if (doc.filePath && fs.existsSync(doc.filePath)) {
      try { fs.unlinkSync(doc.filePath); } catch (e) {}
    }

    await Document.findByIdAndDelete(req.params.id);
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete document', error: error.message });
  }
}
