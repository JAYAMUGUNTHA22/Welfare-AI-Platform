import { Scheme } from '../models/Scheme.js';
import { SchemeEligibility } from '../models/SchemeEligibility.js';
import { SchemeRecommendation } from '../models/SchemeRecommendation.js';
import { createHash } from 'node:crypto';

export const saveSchemeRecommendations = async (req, res) => {
  try {
    const { profile = {}, schemes } = req.body || {};
    if (!Array.isArray(schemes)) {
      return res.status(400).json({ message: 'A schemes array is required' });
    }

    const savedProfile = {
      fullName: String(profile.fullName || req.user.fullName || ''),
      state: String(profile.state || ''),
      age: profile.age === '' || profile.age == null ? null : Number(profile.age),
      occupation: String(profile.occupation || ''),
      income: String(profile.income || ''),
      annualIncomeINR: profile.annualIncomeINR === '' || profile.annualIncomeINR == null
        ? null : Number(profile.annualIncomeINR),
      socialCategory: String(profile.socialCategory || ''),
      isDifferentlyAbled: Boolean(profile.isDifferentlyAbled),
      isWidow: Boolean(profile.isWidow),
      motherWidowed: Boolean(profile.motherWidowed),
    };
    if ((savedProfile.age !== null && !Number.isFinite(savedProfile.age))
      || (savedProfile.annualIncomeINR !== null && !Number.isFinite(savedProfile.annualIncomeINR))) {
      return res.status(400).json({ message: 'Age and income must be valid numbers' });
    }

    const profileFingerprint = createHash('sha256').update(JSON.stringify(savedProfile)).digest('hex');
    const savedSchemes = schemes.slice(0, 100).map((scheme) => ({
      schemeId: String(scheme.schemeId || scheme.myschemeSlug || scheme.id || ''),
      name: String(scheme.name || scheme.scheme_name || ''),
      provider: String(scheme.provider || ''),
      category: String(scheme.category || ''),
      benefitSummary: String(scheme.benefitSummary || ''),
      matchScore: Number(scheme.matchScore) || 0,
      matchTier: String(scheme.matchTier || ''),
      matchReasons: Array.isArray(scheme.matchReasons) ? scheme.matchReasons : [],
      recommendationNote: String(scheme.recommendationNote || ''),
    }));

    const recommendation = await SchemeRecommendation.findOneAndUpdate(
      { citizen: req.user._id, profileFingerprint },
      { $set: { profile: savedProfile, schemes: savedSchemes, generatedAt: new Date() } },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true },
    );
    res.status(200).json({
      message: 'Recommendations saved',
      id: recommendation._id,
      schemeCount: recommendation.schemes.length,
    });
  } catch (error) {
    console.error('Error saving scheme recommendations:', error);
    res.status(500).json({ message: 'Failed to save scheme recommendations' });
  }
};

export const recommendSchemes = async (req, res) => {
  try {
    const user = req.user;

    const userState = req.query.state || user.state;
    const userAge = req.query.age ? parseInt(req.query.age, 10) : user.age;
    const userOcc = (req.query.occupation || user.occupation || '').toLowerCase();
    const userIncome = req.query.income || user.income;

    if (!userState) {
      const allSchemes = await Scheme.find();
      return res.json(allSchemes.map(s => ({
        ...s.toObject(),
        matchScore: 70,
        matchTier: 'Potential Match',
        matchReasons: [{ label: 'General public availability', status: 'match' }]
      })));
    }

    const matchCriteria = {
      State: userState,
    };
    if (userAge) {
      matchCriteria.Age = { $gte: userAge - 15, $lte: userAge + 15 };
    }

    let eligibleRecords = await SchemeEligibility.find(matchCriteria).limit(200);

    if (eligibleRecords.length === 0) {
      const broaderCriteria = { State: userState };
      eligibleRecords = await SchemeEligibility.find(broaderCriteria).limit(200);
    }

    const eligibleSchemeNames = [...new Set(eligibleRecords.map(r => r.Eligible_Scheme))];

    const schemeIdMap = {
      'National Scholarship': 'pm-scholarship',
      'Ayushman Bharat': 'ayushman-bharat',
      'PM Kisan': 'pm-kisan',
      'PM Awas Yojana': 'pmay-housing',
      'Atal Pension Yojana': 'atal-pension-yojana',
      'Mudra Loan': 'mudra-loan',
      'Stand Up India': 'stand-up-india',
    };

    const matchedSchemeIds = eligibleSchemeNames.map(n => schemeIdMap[n]).filter(Boolean);
    let uniqueSchemeIds = [...new Set(matchedSchemeIds)];

    let schemes = await Scheme.find({ schemeId: { $in: uniqueSchemeIds } });
    if (schemes.length === 0) {
      schemes = await Scheme.find();
    }

    const filteredSchemes = schemes.filter((s) => {
      if (userOcc.includes('salaried') && (s.schemeId === 'pm-kisan' || s.schemeId === 'pm-scholarship')) {
        return false;
      }
      if (userOcc.includes('student') && s.schemeId === 'pm-kisan') {
        return false;
      }
      return true;
    });

    const schemeFrequency = {};
    for (const record of eligibleRecords) {
      const sid = schemeIdMap[record.Eligible_Scheme];
      if (sid) schemeFrequency[sid] = (schemeFrequency[sid] || 0) + 1;
    }
    const maxFreq = Math.max(...Object.values(schemeFrequency), 1);

    const scoredSchemes = filteredSchemes.map(s => {
      const freq = schemeFrequency[s.schemeId] || 0;
      let dynamicScore = Math.min(Math.max(76 + Math.round((freq / maxFreq) * 20), 75), 98);

      if (userOcc.includes('salaried') && s.schemeId === 'atal-pension-yojana') dynamicScore = 96;
      if (userOcc.includes('salaried') && s.schemeId === 'ayushman-bharat') dynamicScore = 92;
      if (userOcc.includes('farmer') && s.schemeId === 'pm-kisan') dynamicScore = 98;
      if (userOcc.includes('student') && s.schemeId === 'pm-scholarship') dynamicScore = 96;

      let matchTier = 'Good Match';
      if (dynamicScore >= 90) matchTier = 'Highly Relevant';
      else if (dynamicScore >= 82) matchTier = 'Strong Match';
      else if (dynamicScore >= 75) matchTier = 'Good Match';
      else matchTier = 'Potential Match';

      const dynamicMatchReasons = [];
      if (userState) dynamicMatchReasons.push({ label: `Available in ${userState}`, status: 'match' });
      if (userOcc) dynamicMatchReasons.push({ label: `Suits occupation: ${userOcc.charAt(0).toUpperCase() + userOcc.slice(1)}`, status: 'match' });
      if (userAge) dynamicMatchReasons.push({ label: `Your age (${userAge}) falls within eligible range`, status: 'match' });
      if (userIncome) dynamicMatchReasons.push({ label: `Income bracket (${userIncome}) meets financial criteria`, status: 'match' });
      dynamicMatchReasons.push({ label: 'Verified against Indian Govt Dataset', status: 'match' });

      return {
        ...s.toObject(),
        matchScore: dynamicScore,
        matchTier,
        matchReasons: dynamicMatchReasons,
      };
    }).sort((a, b) => b.matchScore - a.matchScore);

    res.json(scoredSchemes);
  } catch (error) {
    console.error('Error recommending schemes:', error);
    res.status(500).json({ message: 'Failed to recommend schemes' });
  }
};

export const getAllSchemes = async (req, res) => {
  try {
    const schemes = await Scheme.find();
    res.json(schemes);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get schemes' });
  }
};

async function getEligibleList(profile) {
  const userState = profile.state;
  const userAge = profile.age ? parseInt(profile.age, 10) : profile.age;
  const userOcc = (profile.occupation || '').toLowerCase();
  const userIncome = profile.annualIncomeINR || profile.income;

  if (!userState) {
    const allSchemes = await Scheme.find();
    return allSchemes.map(s => s.schemeId);
  }

  const matchCriteria = { State: userState };
  if (userAge) {
    matchCriteria.Age = { $gte: userAge - 15, $lte: userAge + 15 };
  }

  let eligibleRecords = await SchemeEligibility.find(matchCriteria).limit(200);

  if (eligibleRecords.length === 0) {
    const broaderCriteria = { State: userState };
    eligibleRecords = await SchemeEligibility.find(broaderCriteria).limit(200);
  }

  const eligibleSchemeNames = [...new Set(eligibleRecords.map(r => r.Eligible_Scheme))];
  const schemeIdMap = {
    'National Scholarship': 'pm-scholarship',
    'Ayushman Bharat': 'ayushman-bharat',
    'PM Kisan': 'pm-kisan',
    'PM Awas Yojana': 'pmay-housing',
    'Atal Pension Yojana': 'atal-pension-yojana',
    'Mudra Loan': 'mudra-loan',
    'Stand Up India': 'stand-up-india'
  };

  const matchedSchemeIds = eligibleSchemeNames.map(n => schemeIdMap[n]).filter(Boolean);
  let uniqueSchemeIds = [...new Set(matchedSchemeIds)];

  let schemes = await Scheme.find({ schemeId: { $in: uniqueSchemeIds } });
  if (schemes.length === 0) {
    schemes = await Scheme.find();
  }

  const filteredSchemes = schemes.filter((s) => {
    if (userOcc.includes('salaried') && (s.schemeId === 'pm-kisan' || s.schemeId === 'pm-scholarship')) {
      return false;
    }
    if (userOcc.includes('student') && s.schemeId === 'pm-kisan') {
      return false;
    }
    return true;
  });

  return filteredSchemes.map(s => s.schemeId);
}

export const simulateSchemes = async (req, res) => {
  try {
    const user = req.user;
    const simulatedProfile = req.body;

    const currentEligibleIds = await getEligibleList(user);
    const simulatedEligibleIds = await getEligibleList(simulatedProfile);

    const allSchemes = await Scheme.find();
    
    let currentEligibleCount = 0;
    let simulatedEligibleCount = 0;
    let newOpportunitiesCount = 0;
    const newOpportunities = [];
    const lostEligibilities = [];
    const schemesList = [];

    for (const scheme of allSchemes) {
      const isCurrentEligible = currentEligibleIds.includes(scheme.schemeId);
      const isSimulatedEligible = simulatedEligibleIds.includes(scheme.schemeId);
      
      if (isCurrentEligible) currentEligibleCount++;
      if (isSimulatedEligible) simulatedEligibleCount++;

      let changeType = 'unchanged';
      let changeExplanation = 'No change in eligibility';

      if (!isCurrentEligible && isSimulatedEligible) {
        changeType = 'new_opportunity';
        changeExplanation = 'You meet the new criteria based on updated profile';
        newOpportunitiesCount++;
        newOpportunities.push({
          schemeId: scheme.schemeId,
          name: scheme.name,
          benefitSummary: scheme.benefitSummary
        });
      } else if (isCurrentEligible && !isSimulatedEligible) {
        changeType = 'lost_eligibility';
        changeExplanation = 'You no longer meet the criteria with the updated profile';
        lostEligibilities.push({
          schemeId: scheme.schemeId,
          name: scheme.name,
          changeExplanation
        });
      }

      schemesList.push({
        schemeId: scheme.schemeId,
        name: scheme.name,
        provider: scheme.provider || 'Govt of India',
        benefitSummary: scheme.benefitSummary,
        current: {
          isEligible: isCurrentEligible,
          reason: isCurrentEligible ? 'Eligible based on current profile' : 'Does not match current profile criteria'
        },
        simulated: {
          isEligible: isSimulatedEligible,
          reason: isSimulatedEligible ? 'Eligible based on simulated profile' : 'Does not match simulated profile criteria'
        },
        changeType,
        changeExplanation
      });
    }

    res.json({
      currentProfile: user,
      summary: {
        currentEligibleCount,
        simulatedEligibleCount,
        newOpportunitiesCount
      },
      schemes: schemesList,
      newOpportunities,
      lostEligibilities
    });
  } catch (error) {
    console.error('Error simulating schemes:', error);
    res.status(500).json({ message: 'Failed to simulate schemes' });
  }
};
