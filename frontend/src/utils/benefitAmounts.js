export function getListedBenefitAmounts(description = '') {
  if (typeof description !== 'string') return [];
  return [...description.matchAll(/(?:₹|INR\b|Rs\.?\s*)(\d[\d,]*(?:\.\d+)?(?:\s*(?:lakh|lakhs|crore|crores|LPA|per\s+(?:month|year|annum)))?(?:\s*\/-)?)/gi)]
    .map((match) => match[0].replace(/\s+/g, ' ').trim())
    .filter((amount, index, all) => all.indexOf(amount) === index);
}
