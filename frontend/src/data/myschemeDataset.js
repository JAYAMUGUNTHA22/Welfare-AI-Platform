import { myschemeCategories } from './myschemeCategories';

let schemesPromise;

const knownJurisdictions = [
  'andhra pradesh', 'arunachal pradesh', 'assam', 'bihar', 'chhattisgarh',
  'goa', 'gujarat', 'haryana', 'himachal pradesh', 'jharkhand', 'karnataka',
  'kerala', 'madhya pradesh', 'maharashtra', 'manipur', 'meghalaya', 'mizoram',
  'nagaland', 'odisha', 'punjab', 'rajasthan', 'sikkim', 'tamil nadu',
  'telangana', 'tripura', 'uttar pradesh', 'uttarakhand', 'west bengal',
  'andaman and nicobar islands', 'chandigarh', 'dadra and nagar haveli',
  'daman and diu', 'delhi', 'jammu and kashmir', 'ladakh', 'lakshadweep',
  'puducherry',
];

const occupationTerms = {
  agriculture: ['farmer', 'agriculturist', 'cultivator', 'agricultural worker', 'agricultural labourer', 'farm worker'],
  business: ['entrepreneur', 'self-employed', 'business owner', 'small business', 'micro enterprise', 'startup founder'],
  fisherman: ['fisherman', 'fisherwoman', 'fisherfolk'],
  salaried: ['salaried', 'salary employee', 'government employee', 'private employee', 'employed'],
  student: ['student', 'school pupil', 'college student', 'learner'],
  worker: ['construction worker', 'labourer', 'laborer', 'unorganised worker', 'unorganized worker', 'daily wage', 'gig worker'],
  jobSeeker: ['unemployed', 'job seeker', 'not employed', 'seeking work'],
  senior: ['retired', 'pensioner', 'senior citizen'],
};

const occupationCategoryTags = {
  agriculture: ['agriculture-rural-environment'],
  farmer: ['agriculture-rural-environment'],
  fisherman: ['agriculture-rural-environment', 'social-welfare-empowerment'],
  student: ['education-learning'],
  business: ['business-entrepreneurship', 'banking-financial-services-and-insurance'],
  entrepreneur: ['business-entrepreneurship', 'banking-financial-services-and-insurance'],
  unemployed: ['skills-employment'],
  'job seeker': ['skills-employment'],
  worker: ['skills-employment', 'social-welfare-empowerment'],
  senior: ['health-wellness', 'social-welfare-empowerment', 'banking-financial-services-and-insurance'],
};

function getSchemeSourceType(scheme) {
  const sourceText = `${scheme.sourceType || ''} ${scheme.providerType || ''} ${scheme.level || ''} ${scheme.provider || ''}`.toLowerCase();
  if (/private|corporate|foundation|ngo|non.?profit|company/.test(sourceText)) return 'private';
  if (/central|national government/.test(sourceText)) return 'central';
  if (/state/.test(sourceText)) return 'state';
  return 'other';
}

function getGenderStatus(profileGender, criteria) {
  if (!profileGender) return 'unknown';
  const gender = String(profileGender).toLowerCase();
  const relevant = criteria.filter(({ text }) => /\b(?:female|woman|women|girl|male|man|men|boy|transgender)\b/i.test(text));
  if (!relevant.length) return 'unknown';
  const profileTerms = gender.includes('female') || gender.includes('woman') ? /\b(?:female|woman|women|girl)\b/i
    : gender.includes('male') || gender.includes('man') ? /\b(?:male|man|men|boy)\b/i
      : gender.includes('trans') ? /\btransgender\b/i : null;
  if (!profileTerms) return 'unknown';
  const genderRequirement = relevant.some(({ text }) => hasAffirmativeRequirement(text) && profileTerms.test(text));
  const otherGenderRequirement = relevant.some(({ text }) => hasAffirmativeRequirement(text) && !profileTerms.test(text));
  if (genderRequirement) return 'match';
  if (otherGenderRequirement) return 'mismatch';
  return 'unknown';
}

function getResidenceTypeStatus(residenceType, criteria) {
  if (!residenceType) return 'unknown';
  const relevant = criteria.filter(({ text }) => /\b(?:rural|urban)\b/i.test(text) && hasAffirmativeRequirement(text));
  if (!relevant.length) return 'unknown';
  const requiredTypes = new Set(relevant.flatMap(({ text }) => [...text.matchAll(/\b(rural|urban)\b/gi)].map((match) => match[1].toLowerCase())));
  return requiredTypes.has(String(residenceType).toLowerCase()) ? 'match' : 'mismatch';
}

function getMaritalStatusStatus(profile, criteria) {
  const status = profile.maritalStatus || (profile.isWidow === true ? 'Widowed' : '');
  if (!status) return 'unknown';
  const relevant = criteria.filter(({ text }) => /\b(?:married|unmarried|widow(?:ed)?|divorc|single)\b/i.test(text) && hasAffirmativeRequirement(text));
  if (!relevant.length) return 'unknown';
  const normalizedStatus = String(status).toLowerCase();
  const profileTerms = normalizedStatus.includes('widow') ? /\bwidow(?:ed)?\b/i
    : normalizedStatus.includes('married') ? /\bmarried\b/i
      : normalizedStatus.includes('single') || normalizedStatus.includes('unmarried') ? /\b(?:single|unmarried)\b/i
        : normalizedStatus.includes('divorc') ? /\bdivorc\w*\b/i : null;
  if (!profileTerms) return 'unknown';
  if (relevant.some(({ text }) => profileTerms.test(text))) return 'match';
  return 'mismatch';
}

const northEasternStates = new Set([
  'arunachal pradesh', 'assam', 'manipur', 'meghalaya',
  'mizoram', 'nagaland', 'sikkim', 'tripura',
]);

function getCategoryLabels(value) {
  if (typeof value !== 'string') return [];

  return myschemeCategories
    .filter(({ name }) => (
      value === name
      || value.startsWith(`${name}, `)
      || value.includes(`, ${name}, `)
      || value.endsWith(`, ${name}`)
    ))
    .map(({ id }) => id);
}

function getEligibilityCriteria(scheme) {
  const criteria = scheme.eligibility_details?.eligibility_criteria || scheme.eligibilityCriteria;
  if (Array.isArray(criteria) && criteria.length) {
    return criteria.map((criterion) => ({
      text: criterion.criterion_text || '',
      values: criterion.extracted_values || {},
      types: criterion.criterion_types || [],
    }));
  }

  return [{ text: scheme.eligibility || '', values: {}, types: [] }];
}

function parseAgeBounds(criteria, profileCategory = '') {
  const bounds = [];

  for (const criterion of criteria) {
    if (!criterion.types.includes('age') && !/\bage\b/i.test(criterion.text)) continue;

    const values = criterion.values;
    let min = values.age_min != null && Number.isFinite(Number(values.age_min)) ? Number(values.age_min) : null;
    let max = values.age_max != null && Number.isFinite(Number(values.age_max)) ? Number(values.age_max) : null;
    const range = criterion.text.match(/\b(\d{1,3})\s*(?:years?\s*)?(?:to|and|-|–|—)\s*(\d{1,3})\b/);

    if (range) {
      if (min === null) min = Number(range[1]);
      if (max === null) max = Number(range[2]);
    } else {
      const single = criterion.text.match(/\b(?:at least|not less than|minimum|above|over|from)\s+(\d{1,3})\b/i);
      const upper = criterion.text.match(/\b(?:under|below|less than|not more than|not exceed|maximum|up to|at most)\s+(\d{1,3})\b/i);
      if (min === null && single) min = Number(single[1]);
      if (max === null && upper) max = Number(upper[1]);
    }

    if (['obc', 'sc', 'st'].includes(String(profileCategory).toLowerCase())) {
      const relaxedMax = criterion.text.match(/\brelaxation\b[^.]{0,60}?\b(?:up to\s+)?(\d{1,3})\s*years?\b/i);
      if (relaxedMax) max = Math.max(max ?? 0, Number(relaxedMax[1]));
    }

    if (min !== null || max !== null) bounds.push({ min, max });
  }

  return bounds;
}

function parseMoneyAmount(value, unit = '') {
  const amount = Number(String(value).replace(/,/g, ''));
  if (!Number.isFinite(amount)) return null;

  const normalizedUnit = unit.toLowerCase();
  if (normalizedUnit.startsWith('crore') || normalizedUnit === 'cr') return amount * 10000000;
  if (normalizedUnit.startsWith('lakh') || normalizedUnit.startsWith('lac') || normalizedUnit === 'l') {
    return amount * 100000;
  }
  return amount;
}

function parseIncomeBounds(criteria) {
  const bounds = [];
  const moneyPattern = /(?:₹|rs\.?|inr)\s*([\d,]+(?:\.\d+)?)\s*(crore|cr|lakh|lac|l)?|\b([\d,.]+)\s*(crore|cr|lakh|lac)\b/gi;

  for (const criterion of criteria) {
    if (!/\bincome\b|\bpoverty line\b/i.test(criterion.text)) continue;

    const amounts = [...criterion.text.matchAll(moneyPattern)]
      .map((match) => parseMoneyAmount(match[1] || match[3], match[2] || match[4]))
      .filter((amount) => amount !== null);
    if (!amounts.length) continue;

    const text = criterion.text.toLowerCase();
    if (/\bbetween\b|\brange\b|\bfrom\b/.test(text) && amounts.length > 1) {
      bounds.push({ min: Math.min(...amounts), max: Math.max(...amounts) });
    } else if (/\b(?:minimum|at least|not less than|above|over)\b/.test(text)) {
      bounds.push({ min: amounts[0], max: null });
    } else if (/\b(?:up to|not exceed|not more than|maximum|at most|below|less than)\b/.test(text)) {
      bounds.push({ min: null, max: amounts[0] });
    }
  }

  return bounds;
}

function getProfileIncomeRange(profile) {
  const exactIncome = profile.annualIncomeINR;
  if (exactIncome !== null && exactIncome !== undefined && exactIncome !== '' && Number.isFinite(Number(exactIncome)) && Number(exactIncome) >= 0) {
    const exactValue = Number(exactIncome);
    return { min: exactValue, max: exactValue };
  }

  const incomeText = String(profile.income || '').toLowerCase();
  const range = incomeText.match(/([\d.]+)\s*[-–]\s*([\d.]+)\s*(?:lakh|lac)/);
  if (range) {
    return { min: Number(range[1]) * 100000, max: Number(range[2]) * 100000 };
  }
  if (incomeText.includes('below')) return { min: 0, max: 100000 };
  if (incomeText.includes('above')) return { min: 1000000, max: Infinity };
  const amount = incomeText.match(/(?:₹|rs\.?)\s*([\d,]+(?:\.\d+)?)\s*(lakh|lac|crore|cr)?/);
  if (amount) {
    const exactValue = parseMoneyAmount(amount[1], amount[2]);
    return { min: exactValue, max: exactValue };
  }
  return null;
}

function getSocialCategoryStatus(profileCategory, criteria) {
  if (!profileCategory) return 'unknown';

  const category = profileCategory.toLowerCase();
  const categoryMatches = {
    sc: ['sc', 'scheduled caste'],
    st: ['st', 'scheduled tribe', 'tribal', 'adivasi'],
    obc: ['obc', 'other backward classes'],
    ews: ['ews', 'economically weaker section'],
    general: ['general'],
  };
  const normalizedCategory = categoryMatches[category] || [category];
  const qualifyingCategories = new Set();
  const excludedCategories = new Set();
  const categoryPattern = /\b(sc|st|obc|ews|general|bc|mbc|dnc|tribal|adivasi|scheduled castes?|scheduled tribes?|backward classes|most backward classes|denotified communities|other backward classes|economically weaker sections?)\b/gi;
  let stateBackwardRequirement = false;

  for (const criterion of criteria) {
    const text = criterion.text.toLowerCase();
    const hasTribalGroupRequirement = /\b(?:belong(?:s|ing)? to|member of|community|caste|category|tribe|tribal group|tribal household|pvtg)\b/.test(text)
      || /\b(?:applicant|beneficiary|candidate|person|individual)\b[^.]{0,80}\b(?:must|should|shall)\s+be\s+(?:a\s+)?(?:tribal|adivasi)\b/.test(text);
    const textHasCategory = categoryPattern.test(text);
    if (!criterion.types.includes('social_category') && (!textHasCategory || (/\b(?:tribal|adivasi)\b/.test(text) && !hasTribalGroupRequirement))) continue;
    categoryPattern.lastIndex = 0;
    const mentions = [...text.matchAll(categoryPattern)].filter((mention) => (
      !/\b(?:tribal|adivasi)\b/.test(mention[0]) || hasTribalGroupRequirement
    ));
    const qualifiesCategory = /\b(?:only|must belong|should belong|belonging to|belongs to|must be|should be|shall be|eligible(?: for| under)?|reserved for|applicants? from|beneficiaries? from)\b/i.test(text);
    if (qualifiesCategory && /\b(?:bc|mbc|dnc|backward classes|most backward classes|denotified communities)\b/i.test(text)) {
      stateBackwardRequirement = true;
    }
    const excludedClause = text.match(/\b(?:other than|except|excluding|not)\s+(?:the\s+)?((?:sc|st|obc|ews|general)(?:\s*[\/,&]\s*(?:sc|st|obc|ews|general))*)\b/i);
    if (excludedClause) {
      for (const excluded of excludedClause[1].matchAll(/\b(sc|st|obc|ews|general)\b/gi)) {
        excludedCategories.add(excluded[0]);
      }
    }

    for (const mention of mentions) {
      const beforeMention = text.slice(Math.max(0, mention.index - 24), mention.index);
      const normalizedMention = mention[0].replace(/\bcastes\b/gi, 'caste').replace(/\btribes\b/gi, 'tribe');
      if (/\b(?:other than|except|excluding|not)\s*$/.test(beforeMention)) {
        excludedCategories.add(normalizedMention);
      } else if (qualifiesCategory) {
        qualifyingCategories.add(normalizedMention);
      }
    }
  }

  if ([...excludedCategories].some((mention) => normalizedCategory.includes(mention))) return 'mismatch';
  for (const excluded of excludedCategories) qualifyingCategories.delete(excluded);
  if (!qualifyingCategories.size) {
    if (stateBackwardRequirement) return category === 'obc' ? 'partial' : 'mismatch';
    return excludedCategories.size ? 'match' : 'unknown';
  }
  if ([...qualifyingCategories].some((mention) => normalizedCategory.includes(mention))) return 'match';
  if (stateBackwardRequirement && category === 'obc') return 'partial';
  return 'mismatch';
}

function getOccupationStatus(profileOccupation, criteria) {
  if (!profileOccupation) return 'unknown';

  const profile = profileOccupation.toLowerCase();
  const occupationCriteria = criteria.filter(({ text }) => (
    !/\b(?:must|should|shall)\s+not\b|\b(?:not eligible|will not be eligible|not be eligible|ineligible|not entitled)\b/i.test(text)
  ));
  const criteriaText = occupationCriteria.map(({ text }) => text).join(' ').toLowerCase();
  const matchingGroups = Object.entries(occupationTerms)
    .filter(([, terms]) => terms.some((term) => profile.includes(term)))
    .map(([group]) => group);
  const criterionGroups = Object.entries(occupationTerms)
    .filter(([, terms]) => terms.some((term) => criteriaText.includes(term)))
    .map(([group]) => group);

  if (!criterionGroups.length) return 'unknown';
  if (matchingGroups.some((group) => criterionGroups.includes(group))) return 'match';

  const roleTerms = Object.values(occupationTerms)
    .flat()
    .map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|');
  const explicitRequirement = occupationCriteria.some(({ text }) => {
    return new RegExp(
      `\\b(?:applicant|beneficiary|candidate|person|individual)\\b.{0,80}\\b(?:must|should|shall)\\b.{0,50}\\b(?:be|work as|engaged in|employed as)\\s+(?:an?\\s+)?(?:${roleTerms})\\b|\\b(?:must|should|shall)\\s+be\\s+(?:an?\\s+)?(?:${roleTerms})\\b`,
      'i',
    ).test(text);
  });
  return explicitRequirement ? 'mismatch' : 'partial';
}

function hasAffirmativeRequirement(text) {
  return /\b(?:must|should|shall)(?!\s+not)\b|\b(?:required to|is required to|are required to|eligible only|only eligible|is eligible|are eligible|entitled to)\b/i.test(text);
}

function hasRequiredSpecialStatus(criteria, profile) {
  for (const criterion of criteria) {
    const text = criterion.text;
    if (!hasAffirmativeRequirement(text)) continue;

    const hasApplicant = /\b(?:applicant|beneficiary|candidate|person|individual)\b/i.test(text);
    const disabilityMention = /\b(?:differently[- ]abled|person with disabilit|disabled|disabilit(?:y|ies)|hearing[- ]and[- ]speech[- ]impaired|visually impaired|visual impairment|blind(?:ness)?|low vision|hearing[- ]impaired|orthopedically handicapped|specially abled|divyang)\b/i.test(text);
    const disabilityRequirement = disabilityMention && (
      (hasApplicant && (
        /\b(?:applicant|beneficiary|candidate|person|individual|student)\b[^.]{0,100}\b(?:must|should|shall)(?!\s+not)\b[^.]{0,100}\b(?:differently[- ]abled|person with disabilit|disabled|disabilit(?:y|ies)|hearing[- ]and[- ]speech[- ]impaired|visually impaired|visual impairment|blind(?:ness)?|low vision|hearing[- ]impaired|orthopedically handicapped|specially abled|divyang)\b/i.test(text)
        || /\b(?:applicant|beneficiary|candidate|person|individual|student)\b[^.]{0,100}\b(?:suffer(?:ing)? from|has|have|with)\b[^.]{0,100}\b(?:disabilit(?:y|ies)|visually impaired|visual impairment|blind(?:ness)?|low vision|hearing[- ]impaired|orthopedically handicapped)\b/i.test(text)
      ))
      || /\b(?:percentage|degree|extent|level) of disability\b[^.]{0,100}\b(?:must|should|shall)(?!\s+not)\b/i.test(text)
    );
    if (
      disabilityRequirement
      && profile.isDifferentlyAbled === false
    ) return true;

    const widowApplicant = /\b(?:applicant|beneficiary|candidate|person|individual)\b[^.]{0,100}\bwidow(?:ed)?\b/i.test(text)
      || /\bwidow(?:ed)?\b[^.]{0,100}\b(?:applicant|beneficiary|candidate|person|individual)\b/i.test(text);
    if (widowApplicant && profile.isWidow === false) return true;

    const widowParentRequirement = /\b(?:daughter|girl child|female child)\b[^.]{0,80}\bwidow\b|\bwidow\b[^.]{0,80}\b(?:daughter|girl child|female child)\b/i.test(text);
    if (widowParentRequirement && profile.motherWidowed === false) return true;

    const northEastRequirement = /\b(?:north[\s-]?eastern region|north[\s-]?east(?:ern)? states?|ner)\b/i.test(text)
      && /\b(?:domicile|resident|residing|from|belong(?:ing)? to)\b/i.test(text);
    if (northEastRequirement && !northEasternStates.has(String(profile.state || '').toLowerCase())) return true;
  }

  return false;
}

function hasRequiredOccupationMismatch(profileOccupation, criteria) {
  const profile = String(profileOccupation || '').toLowerCase();
  if (!profile) return false;
  for (const criterion of criteria) {
    const text = criterion.text;
    if (!criterion.types.includes('occupation_or_profession') || !hasAffirmativeRequirement(text)) continue;

    const requiredGroups = Object.entries(occupationTerms)
      .filter(([, terms]) => terms.some((term) => new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}s?\\b`, 'i').test(text)))
      .map(([group]) => group);
    if (!requiredGroups.length) continue;

    const profileGroups = Object.entries(occupationTerms)
      .filter(([, terms]) => terms.some((term) => profile.includes(term)))
      .map(([group]) => group);
    if (!profileGroups.length || !profileGroups.some((group) => requiredGroups.includes(group))) return true;
  }

  return false;
}

function getEducationStatus(profile, criteria) {
  const educationText = `${profile.educationLevel || ''} ${profile.currentCourse || ''}`.toLowerCase();
  const employmentStatus = String(profile.employmentStatus || '').toLowerCase();
  const occupation = String(profile.occupation || '').toLowerCase();
  const explicitStudent = employmentStatus === 'student'
    || /\b(?:student|pupil|learner)\b/.test(occupation)
    || /\b(?:studying|enrolled|course)\b/.test(educationText);
  const explicitNonStudent = Boolean(employmentStatus || occupation) && !explicitStudent;
  const requirements = criteria.filter(({ text, types }) => (
    types.some((type) => ['education_or_student_status', 'institution_or_organization'].includes(type))
    && hasAffirmativeRequirement(text)
  ));
  if (!requirements.length) return 'unknown';

  let matched = false;
  for (const { text } of requirements) {
    if (/\b(?:student|pupil|learner)\b/i.test(text)) {
      if (explicitStudent) matched = true;
      else if (explicitNonStudent) return 'mismatch';
    }

    const lowerText = text.toLowerCase();
    const belowHigherEducation = /\b(?:class|standard|grade)\s*(?:xii|12|12th|eleven|11|ten|10|tenth)\b|\bwithin\s+xii\s+standard\b/.test(lowerText);
    if (belowHigherEducation && /\b(?:undergraduate|postgraduate|graduate|degree)\b/.test(educationText)) return 'mismatch';

    const requiresDegree = /\b(?:undergraduate|postgraduate|ug\/pg|degree course|bachelor|master)\b/.test(lowerText);
    if (requiresDegree && /\b(?:primary|secondary|higher secondary|class\s*(?:x|xi|xii|10|11|12))\b/.test(educationText)) return 'mismatch';
    if (requiresDegree && /\b(?:undergraduate|postgraduate|bachelor|master|degree)\b/.test(educationText)) matched = true;
  }

  return matched ? 'match' : 'unknown';
}

function assessScheme(scheme, profile) {
  const criteria = getEligibilityCriteria(scheme);
  const criteriaText = criteria.map(({ text }) => text).join(' ');
  const profileOccupation = [profile.occupation, profile.employmentStatus, profile.isFarmer === true ? 'Farmer' : '']
    .filter(Boolean).join(' ');
  if (
    hasRequiredSpecialStatus(criteria, profile)
    || hasRequiredOccupationMismatch(profileOccupation, criteria)
  ) return null;

  const age = Number(profile.age);
  const hasAge = Number.isFinite(age) && age > 0;
  const ageBounds = parseAgeBounds(criteria, profile.socialCategory);
  const incomeRange = getProfileIncomeRange(profile);
  const incomeBounds = parseIncomeBounds(criteria);
  const ageStatus = !hasAge || !ageBounds.length
    ? 'unknown'
    : ageBounds.every(({ min, max }) => (min === null || age >= min) && (max === null || age <= max))
      ? 'match'
      : 'mismatch';
  const incomeMin = Math.max(0, ...incomeBounds.map(({ min }) => min ?? 0));
  const incomeMax = Math.min(Infinity, ...incomeBounds.map(({ max }) => max ?? Infinity));
  const incomeStatus = !incomeRange || !incomeBounds.length
    ? 'unknown'
    : incomeRange.max < incomeMin || incomeRange.min > incomeMax
      ? 'mismatch'
      : incomeRange.min >= incomeMin && incomeRange.max <= incomeMax
        ? 'match'
        : 'partial';
  const categoryStatus = getSocialCategoryStatus(profile.socialCategory, criteria);
  const occupationStatus = getOccupationStatus(profileOccupation, criteria);
  const genderStatus = getGenderStatus(profile.gender, criteria);
  const residenceTypeStatus = getResidenceTypeStatus(profile.residenceType, criteria);
  const maritalStatusStatus = getMaritalStatusStatus(profile, criteria);
  const educationStatus = getEducationStatus(profile, criteria);

  if (
    ageStatus === 'mismatch'
    || incomeStatus === 'mismatch'
    || categoryStatus === 'mismatch'
    || occupationStatus === 'mismatch'
    || genderStatus === 'mismatch'
    || residenceTypeStatus === 'mismatch'
    || maritalStatusStatus === 'mismatch'
    || educationStatus === 'mismatch'
  ) return null;
  const content = `${scheme.name} ${scheme.details || ''} ${criteriaText}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ').trim();
  const mentionedJurisdictions = knownJurisdictions.filter((jurisdiction) => content.includes(` ${jurisdiction} `));
  const profileState = String(profile.state || '').toLowerCase();
  const sourceType = getSchemeSourceType(scheme);
  const explicitApplicableStates = (scheme.applicableStates || scheme.states || []).map((state) => String(state).toLowerCase());
  if (profileState && explicitApplicableStates.length && !explicitApplicableStates.includes(profileState)) return null;
  const profileStateMatches = mentionedJurisdictions.includes(profileState);
  const hasExplicitStateScope = mentionedJurisdictions.length > 0;
  if (sourceType === 'state' && profileState && hasExplicitStateScope && !profileStateMatches) return null;
  if (profileState) {
    const residenceCriteria = criteria.filter(({ text }) => /\b(?:resident|residing|residence|domicile|belong(?:ing)? to)\b/i.test(text));
    const scopedStates = knownJurisdictions.filter((jurisdiction) => residenceCriteria.some(({ text }) => text.toLowerCase().includes(jurisdiction)));
    if (scopedStates.length && !scopedStates.includes(profileState)) return null;
  }

  const occupationKey = Object.keys(occupationCategoryTags)
    .find((key) => String(profileOccupation || '').toLowerCase().includes(key));
  const categoryAffinity = occupationKey
    ? scheme.tags?.some((tag) => occupationCategoryTags[occupationKey].includes(tag))
    : false;
  const locationStatus = !profileState
    ? 'unknown'
    : sourceType === 'central' || profileStateMatches
      ? 'match'
      : 'unknown';
  const profileFactors = [
    { relevant: hasAge && ageBounds.length > 0, status: ageStatus },
    { relevant: incomeRange !== null && incomeBounds.length > 0, status: incomeStatus },
    { relevant: Boolean(profile.socialCategory) && categoryStatus !== 'unknown', status: categoryStatus },
    { relevant: Boolean(profileOccupation) && occupationStatus !== 'unknown', status: occupationStatus },
    { relevant: Boolean(profile.gender) && genderStatus !== 'unknown', status: genderStatus },
    { relevant: Boolean(profile.residenceType) && residenceTypeStatus !== 'unknown', status: residenceTypeStatus },
    { relevant: Boolean(profile.maritalStatus || profile.isWidow === true) && maritalStatusStatus !== 'unknown', status: maritalStatusStatus },
    { relevant: Boolean(profile.educationLevel || profile.currentCourse || profile.employmentStatus || profile.occupation) && educationStatus !== 'unknown', status: educationStatus },
    { relevant: sourceType === 'state' && Boolean(profileState) && hasExplicitStateScope, status: locationStatus },
  ].filter((factor) => factor.relevant);
  if (!profileFactors.some(({ status }) => status === 'match' || status === 'partial')) return null;
  const matchPoints = profileFactors.reduce((total, { status }) => (
    total + (status === 'match' ? 1 : status === 'partial' ? 0.5 : 0)
  ), 0);
  const matchScore = profileFactors.length
    ? Math.round((matchPoints / profileFactors.length) * 100)
    : 0;
  const missingInformation = [];
  const requirementFields = {
    age: { available: profile.age != null && profile.age !== '', label: 'age' },
    income: { available: incomeRange !== null, label: 'annual family income' },
    social_category: { available: Boolean(profile.socialCategory), label: 'social category' },
    education_or_student_status: { available: Boolean(profile.educationLevel || profile.currentCourse || profile.employmentStatus || profile.occupation), label: 'education level or current course' },
    employment_or_membership: { available: Boolean(profile.employmentStatus || profile.occupation || profile.isFarmer != null), label: 'employment or membership status' },
    occupation_or_profession: { available: Boolean(profile.occupation), label: 'occupation' },
    residence_or_state: { available: Boolean(profile.state), label: 'state of residence' },
    disability_or_health: { available: profile.isDifferentlyAbled != null, label: 'disability or health status' },
    institution_or_organization: { available: Boolean(profile.institutionType || profile.collegeType || profile.currentCourse), label: 'institution or course details' },
    family_or_relationship: { available: Boolean(profile.familySize || profile.dependants || profile.maritalStatus || profile.firstGraduate != null || profile.isWidow != null || profile.motherWidowed != null), label: 'relevant family circumstances' },
  };
  const missingTypes = new Set();
  if (categoryStatus === 'partial') missingTypes.add('social_category');
  if (incomeStatus === 'partial') missingTypes.add('income');
  const needsTribalCategory = criteria.some(({ text }) => (
    hasAffirmativeRequirement(text)
    && /\b(?:tribal|adivasi|scheduled tribe|pvtg|particularly vulnerable tribal groups?)\b/i.test(text)
    && /\b(?:belong(?:s|ing)? to|member of|community|caste|category|tribe|tribal group|tribal household|eligible)\b/i.test(text)
  ));
  if (needsTribalCategory && !profile.socialCategory) missingTypes.add('social_category');
  const needsDisabilityStatus = criteria.some(({ text }) => (
    (/\b(?:applicant|beneficiary|candidate|person|individual|student)\b/i.test(text)
      && /\b(?:differently[- ]abled|person with disabilit|disabled|disabilit(?:y|ies)|visually impaired|visual impairment|blind(?:ness)?|low vision|hearing[- ]impaired|orthopedically handicapped|specially abled|divyang)\b/i.test(text)
      && (hasAffirmativeRequirement(text) || /\b(?:suffer(?:ing)? from|has|have|with)\b/i.test(text)))
    || /\b(?:percentage|degree|extent|level) of disability\b[^.]{0,100}\b(?:must|should|shall)(?!\s+not)\b/i.test(text)
  ));
  if (needsDisabilityStatus && (profile.isDifferentlyAbled == null || profile.isDifferentlyAbled === true)) {
    missingTypes.add('disability_or_health');
  }
  for (const criterion of criteria) {
    if (!hasAffirmativeRequirement(criterion.text)) continue;
    for (const type of criterion.types) {
      if (type === 'gender_or_marital_status') {
        const needsGender = /\b(?:female|woman|women|girl|male|man|men|boy|transgender)\b/i.test(criterion.text);
        const needsMarital = /\b(?:married|unmarried|widow(?:ed)?|divorc|single)\b/i.test(criterion.text);
        if ((needsGender && !profile.gender) || (needsMarital && !profile.maritalStatus && profile.isWidow == null)) {
          missingTypes.add(type);
        }
        continue;
      }
      const field = requirementFields[type];
      if (field && !field.available) missingTypes.add(type);
    }
    if (criterion.types.includes('disability_or_health') && /\b(?:applicant|beneficiary|candidate|person|individual)\b[^.]{0,100}\b(?:must|should|shall)(?!\s+not)\b[^.]{0,100}\b(?:disabled|disability|differently[- ]abled|person with disabilit)\b/i.test(criterion.text)
      && profile.isDifferentlyAbled == null) missingTypes.add('disability_or_health');
    if (criterion.types.includes('event_or_special_condition') && /\b(?:crisis|disaster|widow|orphan|accident|illness|death|drought|flood)\b/i.test(criterion.text)
      && !profile.specialCircumstances) missingTypes.add('event_or_special_condition');
    if (criterion.types.includes('other_condition')) missingTypes.add('other_condition');
  }
  if (!profileFactors.length) missingTypes.add('other_condition');
  if (sourceType === 'state' && !profileState) missingTypes.add('residence_or_state');
  if (sourceType === 'state' && profileState && !hasExplicitStateScope) missingTypes.add('state_applicability');
  if (sourceType === 'private' && !explicitApplicableStates.length && !hasExplicitStateScope) missingTypes.add('state_applicability');
  for (const type of missingTypes) {
    missingInformation.push(requirementFields[type]?.label
      || (type === 'state_applicability' ? 'state applicability'
        : type === 'other_condition' ? 'other scheme-specific conditions'
          : type === 'gender_or_marital_status' ? 'gender or marital status'
            : type === 'event_or_special_condition' ? 'scheme-specific circumstances'
              : type === 'disability_or_health' ? 'disability or health status' : 'scheme-specific circumstances'));
  }
  const matchReasons = [
    locationStatus === 'match'
      ? { label: scheme.level === 'Central' ? 'This is listed as a Central Government scheme.' : `The scheme lists ${profile.state} as an applicable jurisdiction.`, status: 'match' }
      : { label: profileState ? 'The dataset does not provide enough location detail to confirm that this scheme applies to you.' : 'Add your State to check whether this scheme applies to your location.', status: 'partial' },
    !hasAge
      ? { label: 'Add your age to compare it with any age limits for this scheme.', status: 'partial' }
      : ageStatus === 'unknown'
        ? { label: 'No age rule was available in the dataset to compare with your profile.', status: 'partial' }
      : { label: `Age ${profile.age} ${ageStatus === 'match' ? 'is within' : 'does not meet'} the age range listed for this scheme.`, status: ageStatus },
    incomeRange === null
      ? { label: 'Add your annual income to compare it with any income limits for this scheme.', status: 'partial' }
      : incomeStatus === 'unknown'
        ? { label: 'No comparable income limit was available in the dataset.', status: 'partial' }
        : incomeStatus === 'partial'
          ? { label: 'Your income range partly overlaps the income limit listed for this scheme; check the official criteria.', status: 'partial' }
          : { label: `Your recorded income ${incomeStatus === 'match' ? 'fits' : 'does not fit'} the income limit stated for this scheme.`, status: incomeStatus },
    !profile.socialCategory
      ? { label: 'Add your social category to compare any category-specific criteria.', status: 'partial' }
      : categoryStatus === 'unknown'
        ? { label: 'The listed criteria do not specify your social category.', status: 'partial' }
      : { label: `Your ${profile.socialCategory} category ${categoryStatus === 'match' ? 'matches' : 'does not match'} the listed criteria.`, status: categoryStatus },
    !profile.occupation
      ? { label: 'Add your occupation to compare it with occupation-specific criteria.', status: 'partial' }
      : occupationStatus === 'unknown'
        ? { label: 'No occupation-specific rule was available to compare with your profile.', status: 'partial' }
      : { label: occupationStatus === 'match' ? `The listed occupation criteria include ${profile.occupation}.` : 'The listed occupation criteria may not match your profile.', status: occupationStatus },
  ];

  if (categoryAffinity) {
    matchReasons.push({ label: `The ${scheme.schemeCategories?.[0] || 'scheme'} category is relevant to your occupation.`, status: 'partial' });
  }

  if (missingInformation.length) {
    matchReasons.push({ label: `Needs more information: ${missingInformation.join(', ')}.`, status: 'partial' });
  }

  return {
    ...scheme,
    sourceType,
    sourceGroup: sourceType === 'state'
      ? `${profile.state || 'State'} Government`
      : sourceType === 'central'
        ? 'Central Government'
        : sourceType === 'private'
          ? 'Private / Corporate / Foundation / NGO'
          : 'Other assistance',
    eligibilityStatus: missingInformation.length ? 'Needs more information' : 'Potentially eligible',
    missingInformation,
    matchScore,
    matchScoreLabel: profileFactors.length ? `Profile fit · ${profileFactors.length} criteria compared` : 'Insufficient comparable criteria',
    matchTier: profileFactors.length < 2 ? 'Needs Review' : matchScore >= 75 ? 'Strong Match' : matchScore >= 50 ? 'Potential Match' : 'Needs Review',
    matchReasons,
    recommendationNote: 'Dataset-extracted eligibility information may be incomplete or unverified. Confirm requirements on the official scheme page.',
    rankingScore: matchPoints * 10 + matchScore / 20
      - Math.min(missingInformation.length, 10) * 1.5
      + (categoryAffinity ? 1 : 0),
  };
}

export function loadMyschemeSchemes() {
  if (!schemesPromise) {
    schemesPromise = import('./myscheme_eligibility_detailed.json')
      .then(({ default: data }) => {
        if (!Array.isArray(data?.schemes)) {
          throw new Error('The MyScheme dataset does not contain a schemes array.');
        }

        return data.schemes
          .filter((item) => item.scheme_name && item.schemeCategory)
          .map((item, index) => {
            const schemeId = item.slug || `myscheme-scheme-${index}`;
            const tags = getCategoryLabels(item.schemeCategory);

            return {
              id: `${schemeId}-${index}`,
              schemeId,
              myschemeSlug: item.slug,
              name: item.scheme_name,
              provider: item.level === 'Central'
                ? 'Central Government Scheme'
                : item.level === 'State'
                  ? 'State Government Scheme'
                  : item.provider || 'Government Scheme',
              level: item.level,
              sourceType: item.sourceType || item.providerType || item.level,
              providerType: item.providerType,
              applicableStates: item.applicableStates || item.states || [],
              category: tags[0],
              tags,
              schemeCategories: tags.map((tag) => myschemeCategories.find((category) => category.id === tag)?.name).filter(Boolean),
              eligibilityCriteria: item.eligibility_details?.eligibility_criteria || [],
              details: item.details,
              benefitSummary: item.benefits,
              eligibility: item.eligibility_details?.eligibility_summary || item.eligibility,
              applicationUrl: item.applicationUrl,
              applicationProcess: item.application,
              documentsRequired: item.documents,
              applicationMethod: item.application,
            };
          });
      })
      .catch((error) => {
        schemesPromise = undefined;
        throw error;
      });
  }

  return schemesPromise;
}

export async function getPersonalizedSchemeRecommendations(profile, limit = 24, { perSource = false } = {}) {
  const normalizedProfile = {
    ...profile,
    age: Number(profile?.age) || null,
    occupation: profile?.occupation || '',
    socialCategory: profile?.socialCategory || '',
    annualIncomeINR: profile?.annualIncomeINR,
    income: profile?.income || '',
  };
  const hasProfileData = normalizedProfile.state
    || normalizedProfile.age
    || normalizedProfile.gender
    || normalizedProfile.occupation
    || normalizedProfile.socialCategory
    || normalizedProfile.annualIncomeINR != null
    || normalizedProfile.income
    || normalizedProfile.educationLevel
    || normalizedProfile.currentCourse
    || normalizedProfile.employmentStatus
    || normalizedProfile.familySize != null
    || normalizedProfile.dependants != null
    || normalizedProfile.residenceType
    || normalizedProfile.isFarmer != null
    || normalizedProfile.firstGraduate != null
    || normalizedProfile.specialCircumstances
    || normalizedProfile.isDifferentlyAbled != null
    || normalizedProfile.isWidow != null
    || normalizedProfile.motherWidowed != null;
  if (!hasProfileData) return [];

  const schemes = await loadMyschemeSchemes();

  const recommendationsBySlug = new Map();
  for (const scheme of schemes) {
    const recommendation = assessScheme(scheme, normalizedProfile);
    if (!recommendation) continue;
    const key = recommendation.schemeId || recommendation.id;
    const existing = recommendationsBySlug.get(key);
    if (!existing || recommendation.rankingScore > existing.rankingScore) {
      recommendationsBySlug.set(key, recommendation);
    }
  }

  const rankedRecommendations = [...recommendationsBySlug.values()]
    .sort((a, b) => b.rankingScore - a.rankingScore || b.matchScore - a.matchScore || a.name.localeCompare(b.name))
  if (!perSource) return rankedRecommendations.slice(0, limit);
  return ['state', 'central', 'private'].flatMap((sourceType) =>
    rankedRecommendations.filter((scheme) => scheme.sourceType === sourceType).slice(0, limit)
  );
}
