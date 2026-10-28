const normalize = (value) => String(value || '').toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, ' ').trim();

function profileCrops(profile) {
  const values = profile.cropTypes ?? profile.crops ?? [];
  return (Array.isArray(values) ? values : [values]).map(normalize).filter(Boolean);
}

function getLandHectares(profile) {
  if (profile.landholdingHectares != null && profile.landholdingHectares !== '') {
    const value = Number(profile.landholdingHectares);
    return Number.isFinite(value) ? value : null;
  }
  if (profile.landholdingAcres != null && profile.landholdingAcres !== '') {
    const value = Number(profile.landholdingAcres);
    return Number.isFinite(value) ? value * 0.404686 : null;
  }
  return null;
}

function canonicalScheme(scheme) {
  const canonical = scheme.supportMetadata?.canonicalData;
  if (!canonical) return scheme.toObject ? scheme.toObject() : scheme;
  const stored = scheme.toObject ? scheme.toObject() : scheme;
  return { ...canonical, _id: stored._id, schemeId: stored.schemeId, supportMetadata: stored.supportMetadata };
}

function isFarmerProfile(profile) {
  return profile.isFarmer === true || /\b(farmer|agriculturist|cultivator|agricultural worker|farm worker)\b/i.test(profile.occupation || '');
}

function assessFarmerProgramme(profile, rawScheme) {
  const scheme = canonicalScheme(rawScheme);
  const metadata = scheme.supportMetadata || {};
  const age = Number(profile.age);
  const hasAge = Number.isFinite(age) && age > 0;
  if (hasAge && ((metadata.ageMin != null && age < metadata.ageMin) || (metadata.ageMax != null && age > metadata.ageMax))) return null;

  const state = normalize(profile.state);
  const supportedStates = (metadata.supportedStates || []).map(normalize);
  if (state && supportedStates.length && !supportedStates.includes(state)) return null;

  const district = normalize(profile.district);
  const supportedDistricts = (metadata.supportedDistricts || []).map(normalize);
  if (district && supportedDistricts.length && supportedStates.includes(state) && !supportedDistricts.includes(district)) return null;

  const applicantCrops = profileCrops(profile);
  const supportedCrops = (scheme.supportedCrops || []).map(normalize);
  const knownCropMatch = applicantCrops.length && supportedCrops.length
    ? applicantCrops.some((crop) => supportedCrops.some((supported) => supported.includes(crop) || crop.includes(supported)))
    : false;
  if (applicantCrops.length && supportedCrops.length && !knownCropMatch) return null;

  const landHectares = getLandHectares(profile);
  if (metadata.requiresLandholding && landHectares != null && metadata.ageMax === 40 && landHectares > 2) return null;

  const missingInformation = [];
  if (!state) missingInformation.push('state of residence');
  if (supportedStates.length && state && !supportedStates.includes(state)) return null;
  if (metadata.supportedDistricts?.length && supportedStates.includes(state) && !district) missingInformation.push('district or block to confirm project coverage');
  if (supportedCrops.length && !applicantCrops.length) missingInformation.push(`crop (${scheme.supportedCrops.join(', ')})`);
  if (metadata.requiresLandholding && landHectares == null) missingInformation.push('landholding and land-record details');
  if (metadata.ageMax === 40 && !hasAge) missingInformation.push('age at scheme entry');
  if (metadata.requiresCropAndArea) {
    if (!applicantCrops.length) missingInformation.push('crop grown in the current season');
    if (!district) missingInformation.push('district / notified insurance unit');
    missingInformation.push('current season crop notification and enrolment window');
  }
  if (metadata.requiresBankAssessment) missingInformation.push('lender appraisal and approved credit limit');
  if (scheme.schemeId === 'central-pm-kisan-samman-nidhi') missingInformation.push('land-record verification and PM-KISAN exclusion checks');
  if (scheme.schemeId === 'central-soil-health-card-scheme') missingInformation.push('farm holding and local soil-sample registration');
  if (scheme.recommendationGroup === 'private') {
    missingInformation.push('current provider intake and local programme availability');
  }
  if (metadata.locationNotes && (!state || !supportedStates.includes(state))) missingInformation.push('project location confirmation with provider');
  if (metadata.cropsNeedConfirmation && applicantCrops.length && supportedCrops.length && knownCropMatch) {
    missingInformation.push('crop-specific project participation confirmation');
  }

  const uniqueMissing = [...new Set(missingInformation)];
  const privateProgramme = scheme.recommendationGroup === 'private';
  const eligibilityStatus = privateProgramme
    ? 'Potential Match — Verify Availability'
    : uniqueMissing.length ? 'Potential Match — More Information Required' : 'Potential Match — Confirm Official Criteria';
  const statusLabel = privateProgramme ? 'Potential Match — Verify Availability' : eligibilityStatus;

  return {
    ...scheme,
    sourceType: scheme.recommendationGroup,
    recommendationGroup: scheme.recommendationGroup,
    eligibilityStatus: statusLabel,
    missingInformation: uniqueMissing,
    matchTier: 'Potential Match',
    matchReasons: [
      { label: 'Your profile identifies you as a farmer.', status: 'match' },
      ...(supportedStates.length && state
        ? [{ label: `Programme lists ${profile.state} as a supported state.`, status: 'match' }]
        : []),
      ...(knownCropMatch ? [{ label: `Your crop matches the published programme crop list.`, status: 'match' }] : []),
      ...(uniqueMissing.length ? [{ label: `Confirm: ${uniqueMissing.join(', ')}.`, status: 'partial' }] : []),
    ],
    recommendationNote: metadata.availabilityNote || 'Confirm current eligibility and availability with the official provider before applying.',
    rankingScore: (supportedStates.includes(state) ? 20 : 0) + (knownCropMatch ? 10 : 0) + (district && supportedDistricts.includes(district) ? 10 : 0),
  };
}

export function getFarmerRecommendations(profile, schemes) {
  if (!isFarmerProfile(profile)) return [];
  const unique = new Map();
  for (const rawScheme of schemes) {
    const recommendation = assessFarmerProgramme(profile, rawScheme);
    if (!recommendation) continue;
    const key = `${recommendation.recommendationGroup}:${normalize(recommendation.name)}`;
    const existing = unique.get(key);
    if (!existing || recommendation.rankingScore > existing.rankingScore) unique.set(key, recommendation);
  }
  return [...unique.values()].sort((a, b) => b.rankingScore - a.rankingScore || a.name.localeCompare(b.name));
}

export { assessFarmerProgramme, getLandHectares, isFarmerProfile };
