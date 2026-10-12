const directApplicationUrlFields = [
  'applicationUrl',
  'applyUrl',
  'applicationWebsite',
  'officialApplyUrl',
  'officialWebsite',
  'officialUrl',
  'website',
];

const applicationInstructionFields = [
  'applicationProcess',
  'applicationMethod',
  'application',
];

const knownApplicationPortals = {
  'ab-pmjay': 'https://beneficiary.nha.gov.in/',
  'atal-pension-yojana': 'https://enps.nsdl.com/eNPS/NationalPensionSystem.html',
  'ayushman-bharat': 'https://beneficiary.nha.gov.in/',
  'pm-kisan': 'https://pmkisan.gov.in/RegistrationFormNew.aspx',
  'pmay-housing': 'https://pmaymis.gov.in/',
  'pmay-u': 'https://pmaymis.gov.in/',
  'stand-up-india': 'https://www.standupmitra.in/Login/Register',
  apy: 'https://enps.nsdl.com/eNPS/NationalPensionSystem.html',
  sui: 'https://www.standupmitra.in/Login/Register',
};

const urlPattern = /\b(?:https?:\/\/|www\.)[^\s<>"'`]+/gi;
const applicationKeywords = /\b(apply|application|register|registration|portal|website|visit|submit|online)\b/gi;

function getTextValues(value) {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(getTextValues);
  return [];
}

function normalizeExternalUrl(value) {
  const cleanedValue = value.replace(/[.,;:!?)}\]]+$/g, '').replace(/&amp;/gi, '&');
  const candidate = cleanedValue.startsWith('www.') ? `https://${cleanedValue}` : cleanedValue;

  try {
    const parsed = new URL(candidate);
    if (!['http:', 'https:'].includes(parsed.protocol)) return null;
    if (parsed.hostname === 'myscheme.gov.in' || parsed.hostname.endsWith('.myscheme.gov.in')) return null;
    return parsed.href;
  } catch {
    return null;
  }
}

function findApplicationInstructionUrl(text) {
  const candidates = [...text.matchAll(urlPattern)]
    .map((match) => {
      const url = normalizeExternalUrl(match[0]);
      if (!url) return null;

      const context = `${text.slice(Math.max(0, match.index - 120), match.index)} ${text.slice(match.index + match[0].length, match.index + match[0].length + 80)}`;
      const applicationContext = /\b(?:apply|application|register|registration|visit)\b.{0,80}\b(?:portal|website|online|at|through|via)\b/i.test(context);
      const directApplicationPath = /\/(?:apply|application|register|registration|login)(?:\/|$|[?#])/i.test(url);
      return {
        url,
        score: [...context.matchAll(applicationKeywords)].length
          + (applicationContext ? 5 : 0)
          + (directApplicationPath ? 100 : 0),
      };
    })
    .filter(Boolean)
    .sort((left, right) => right.score - left.score);

  return candidates[0]?.url || null;
}

export function getSchemeApplicationUrl(scheme) {
  if (!scheme) return null;

  for (const field of directApplicationUrlFields) {
    const value = scheme[field];
    const directUrl = typeof value === 'string' ? normalizeExternalUrl(value.trim()) : null;
    if (directUrl) return directUrl;
  }

  for (const field of applicationInstructionFields) {
    const url = findApplicationInstructionUrl(getTextValues(scheme[field]).join('\n'));
    if (url) return url;
  }

  for (const value of [scheme.schemeId, scheme.id, scheme.myschemeSlug]) {
    if (typeof value === 'string' && knownApplicationPortals[value.toLowerCase()]) {
      return knownApplicationPortals[value.toLowerCase()];
    }
  }
  return null;
}
