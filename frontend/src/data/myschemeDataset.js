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
  agriculture: ['farmer', 'agriculturist', 'cultivator', 'agricultural worker'],
  business: ['entrepreneur', 'self-employed', 'business owner', 'micro enterprise'],
  fisherman: ['fisherman', 'fisherwoman', 'fisherfolk'],
  salaried: ['salaried', 'salary employee', 'government employee', 'private employee'],
  student: ['student', 'school pupil', 'college student'],
  worker: ['construction worker', 'labourer', 'laborer', 'unorganised worker', 'unorganized worker'],
};

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
    st: ['st', 'scheduled tribe'],
    obc: ['obc', 'other backward classes'],
    ews: ['ews', 'economically weaker section'],
    general: ['general'],
  };
  const normalizedCategory = categoryMatches[category] || [category];
  const qualifyingCategories = new Set();
  const excludedCategories = new Set();
  const categoryPattern = /\b(sc|st|obc|ews|general|scheduled caste|scheduled tribe|other backward classes|economically weaker sections?)\b/gi;

  for (const criterion of criteria) {
    const text = criterion.text.toLowerCase();
    if (!criterion.types.includes('social_category') && !categoryPattern.test(text)) continue;
    categoryPattern.lastIndex = 0;
    const mentions = [...text.matchAll(categoryPattern)];
    const qualifiesCategory = /\b(?:only|must belong|should belong|belonging to|belongs to|eligible(?: for| under)?|reserved for|applicants? from|beneficiaries? from)\b/i.test(text);
    const excludedClause = text.match(/\b(?:other than|except|excluding|not)\s+(?:the\s+)?((?:sc|st|obc|ews|general)(?:\s*[\/,&]\s*(?:sc|st|obc|ews|general))*)\b/i);
    if (excludedClause) {
      for (const excluded of excludedClause[1].matchAll(/\b(sc|st|obc|ews|general)\b/gi)) {
        excludedCategories.add(excluded[0]);
      }
    }

    for (const mention of mentions) {
      const beforeMention = text.slice(Math.max(0, mention.index - 24), mention.index);
      if (/\b(?:other than|except|excluding|not)\s*$/.test(beforeMention)) {
        excludedCategories.add(mention[0]);
      } else if (qualifiesCategory) {
        qualifyingCategories.add(mention[0]);
      }
    }
  }

  if ([...excludedCategories].some((mention) => normalizedCategory.includes(mention))) return 'mismatch';
  for (const excluded of excludedCategories) qualifyingCategories.delete(excluded);
  if (!qualifyingCategories.size) return excludedCategories.size ? 'match' : 'unknown';
  if ([...qualifyingCategories].some((mention) => normalizedCategory.includes(mention))) return 'match';
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
    const disabilityMention = /\b(?:differently[- ]abled|person with disabilit|disabled|disabilit(?:y|ies)|hearing[- ]and[- ]speech[- ]impaired)\b/i.test(text);
    const disabilityRequirement = hasApplicant
      && disabilityMention
      && /\b(?:applicant|beneficiary|candidate|person|individual)\b[^.]{0,100}\b(?:must|should|shall)(?!\s+not)\b[^.]{0,100}\b(?:differently[- ]abled|person with disabilit|disabled|disabilit(?:y|ies)|hearing[- ]and[- ]speech[- ]impaired)\b/i.test(text);
    if (
      disabilityRequirement
      && !profile.isDifferentlyAbled
    ) return true;

    const widowApplicant = /\b(?:applicant|beneficiary|candidate|person|individual)\b[^.]{0,100}\bwidow(?:ed)?\b/i.test(text)
      || /\bwidow(?:ed)?\b[^.]{0,100}\b(?:applicant|beneficiary|candidate|person|individual)\b/i.test(text);
    if (widowApplicant && !profile.isWidow) return true;

    const widowParentRequirement = /\b(?:daughter|girl child|female child)\b[^.]{0,80}\bwidow\b|\bwidow\b[^.]{0,80}\b(?:daughter|girl child|female child)\b/i.test(text);
    if (widowParentRequirement && !profile.motherWidowed) return true;

    const northEastRequirement = /\b(?:north[\s-]?eastern region|north[\s-]?east(?:ern)? states?|ner)\b/i.test(text)
      && /\b(?:domicile|resident|residing|from|belong(?:ing)? to)\b/i.test(text);
    if (northEastRequirement && !northEasternStates.has(String(profile.state || '').toLowerCase())) return true;
  }

  return false;
}

function hasRequiredOccupationMismatch(profileOccupation, criteria) {
  const profile = String(profileOccupation || '').toLowerCase();
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
    if (!profileGroups.some((group) => requiredGroups.includes(group))) return true;
  }

  return false;
}

function assessScheme(scheme, profile) {
  const criteria = getEligibilityCriteria(scheme);
  const criteriaText = criteria.map(({ text }) => text).join(' ');
  if (
    hasRequiredSpecialStatus(criteria, profile)
    || hasRequiredOccupationMismatch(profile.occupation, criteria)
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
  const occupationStatus = getOccupationStatus(profile.occupation, criteria);

  if (
    ageStatus === 'mismatch'
    || incomeStatus === 'mismatch'
    || categoryStatus === 'mismatch'
    || occupationStatus === 'mismatch'
  ) return null;
  const content = `${scheme.name} ${scheme.details || ''} ${criteriaText}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ').trim();
  const mentionedJurisdictions = knownJurisdictions.filter((jurisdiction) => content.includes(` ${jurisdiction} `));
  const profileState = String(profile.state || '').toLowerCase();
  if (
    scheme.level === 'State'
    && profileState
    && mentionedJurisdictions.length > 0
    && !mentionedJurisdictions.includes(profileState)
  ) return null;

  const occupationCategories = {
    agriculture: ['agriculture-rural-environment'],
    farmer: ['agriculture-rural-environment'],
    student: ['education-learning'],
    business: ['business-entrepreneurship', 'banking-financial-services-and-insurance'],
    entrepreneur: ['business-entrepreneurship', 'banking-financial-services-and-insurance'],
    unemployed: ['skills-employment'],
    worker: ['skills-employment', 'social-welfare-empowerment'],
  };
  const occupationKey = Object.keys(occupationCategories)
    .find((key) => String(profile.occupation || '').toLowerCase().includes(key));
  const categoryAffinity = occupationKey
    ? scheme.tags?.some((tag) => occupationCategories[occupationKey].includes(tag))
    : false;
  const locationStatus = !profileState
    ? 'unknown'
    : scheme.level === 'Central' || mentionedJurisdictions.includes(profileState)
      ? 'match'
      : 'unknown';
  const profileFactors = [
    { known: hasAge, status: ageStatus },
    { known: incomeRange !== null, status: incomeStatus },
    { known: Boolean(profile.socialCategory), status: categoryStatus },
    { known: Boolean(profile.occupation), status: occupationStatus },
    { known: scheme.level === 'State' && Boolean(profileState), status: locationStatus },
  ].filter((factor) => factor.known);
  const matchPoints = profileFactors.reduce((total, { status }) => (
    total + (status === 'match' ? 1 : status === 'partial' ? 0.5 : 0)
  ), 0);
  const matchScore = profileFactors.length
    ? Math.round((matchPoints / profileFactors.length) * 100)
    : 0;
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

  return {
    ...scheme,
    matchScore,
    matchScoreLabel: 'Profile fit',
    matchTier: matchScore >= 75 ? 'Strong Match' : matchScore >= 50 ? 'Potential Match' : 'Needs Review',
    matchReasons,
    recommendationNote: 'Dataset-extracted eligibility information may be incomplete or unverified. Confirm requirements on the official scheme page.',
    rankingScore: matchPoints * 10 + (categoryAffinity ? 5 : 0),
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
                  : 'Government Scheme',
              level: item.level,
              category: tags[0],
              tags,
              schemeCategories: tags.map((tag) => myschemeCategories.find((category) => category.id === tag)?.name).filter(Boolean),
              eligibilityCriteria: item.eligibility_details?.eligibility_criteria || [],
              details: item.details,
              benefitSummary: item.benefits,
              eligibility: item.eligibility_details?.eligibility_summary || item.eligibility,
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

export async function getPersonalizedSchemeRecommendations(profile, limit = 24) {
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
    || normalizedProfile.occupation
    || normalizedProfile.socialCategory
    || normalizedProfile.annualIncomeINR != null
    || normalizedProfile.income;
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

  return [...recommendationsBySlug.values()]
    .sort((a, b) => b.rankingScore - a.rankingScore || b.matchScore - a.matchScore || a.name.localeCompare(b.name))
    .slice(0, limit);
}
