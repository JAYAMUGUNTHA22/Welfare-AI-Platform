export function translateEligibilityReason(value, t) {
  const text = String(value || '');
  const stateMatch = text.match(/^The scheme lists (.+) as an applicable jurisdiction\.$/);
  if (stateMatch) return t('ui.eligibilityReason.stateApplies', { state: stateMatch[1], defaultValue: text });
  const ageMatch = text.match(/^Age (\d+) is within the age range listed for this scheme\.$/);
  if (ageMatch) return t('ui.eligibilityReason.ageMatches', { age: ageMatch[1], defaultValue: text });
  const ageNoMatch = text.match(/^Age (\d+) does not meet the age range listed for this scheme\.$/);
  if (ageNoMatch) return t('ui.eligibilityReason.ageDoesNotMatch', { age: ageNoMatch[1], defaultValue: text });
  const incomeMatch = text.match(/^Your recorded income (fits|does not fit) the income limit stated for this scheme\.$/);
  if (incomeMatch) return t(incomeMatch[1] === 'fits' ? 'ui.eligibilityReason.incomeMatches' : 'ui.eligibilityReason.incomeDoesNotMatch', { defaultValue: text });
  const categoryMatch = text.match(/^Your (.+) category (matches|does not match) the listed criteria\.$/);
  if (categoryMatch) return t(categoryMatch[2] === 'matches' ? 'ui.eligibilityReason.categoryMatches' : 'ui.eligibilityReason.categoryDoesNotMatch', { category: categoryMatch[1], defaultValue: text });
  const messages = {
    'This is listed as a Central Government scheme.': 'ui.eligibilityReason.centralScheme',
    'No occupation-specific rule was available to compare with your profile.': 'ui.eligibilityReason.noOccupationRule',
    'No age rule was available in the dataset to compare with your profile.': 'ui.eligibilityReason.noAgeRule',
    'No comparable income limit was available in the dataset.': 'ui.eligibilityReason.noIncomeRule',
    'The listed criteria do not specify your social category.': 'ui.eligibilityReason.noCategoryRule',
    'The listed occupation criteria may not match your profile.': 'ui.eligibilityReason.occupationMayNotMatch',
    'The dataset does not provide enough location detail to confirm that this scheme applies to you.': 'ui.eligibilityReason.locationUnknown',
    'Add your State to check whether this scheme applies to your location.': 'ui.eligibilityReason.addState',
    'Add your age to compare it with any age limits for this scheme.': 'ui.eligibilityReason.addAge',
    'Add your annual income to compare it with any income limits for this scheme.': 'ui.eligibilityReason.addIncome',
    'Add your social category to compare any category-specific criteria.': 'ui.eligibilityReason.addCategory',
    'Add your occupation to compare it with occupation-specific criteria.': 'ui.eligibilityReason.addOccupation',
    'No occupation-specific rule was available to compare with your profile.': 'ui.eligibilityReason.noOccupationRule',
  };
  if (messages[text]) return t(messages[text], { defaultValue: text });
  const partialIncome = text.includes('partly overlaps the income limit');
  if (partialIncome) return t('ui.eligibilityReason.incomePartial', { defaultValue: text });
  const missing = text.match(/^Needs more information: (.+)\.$/);
  if (missing) {
    const itemTranslations = {
      'other scheme-specific conditions': t('ui.eligibilityReason.otherConditions', { defaultValue: 'other scheme-specific conditions' }),
      'state applicability': t('ui.eligibilityReason.stateApplicability', { defaultValue: 'state applicability' }),
      'scheme-specific circumstances': t('ui.eligibilityReason.specialCircumstances', { defaultValue: 'scheme-specific circumstances' }),
    };
    const items = missing[1].split(',').map((item) => item.trim()).map((item) => itemTranslations[item] || item).join(', ');
    return t('ui.eligibilityReason.needsMoreInfo', { items, defaultValue: text });
  }
  if (text.startsWith('Dataset-extracted eligibility information')) return t('ui.eligibilityReason.disclaimer', { defaultValue: text });
  return text;
}
