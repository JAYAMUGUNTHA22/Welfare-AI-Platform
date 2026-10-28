const supportedCatalogLanguages = {
  'हिंदी': () => import('@/data/translations/hindi.json'),
  'தமிழ்': () => import('@/data/translations/tamil.json'),
};

const loadedCatalogs = new Map();
const loadingCatalogs = new Map();

export async function loadSchemeCatalogTranslations(language) {
  const loader = supportedCatalogLanguages[language];
  if (!loader) return {};
  if (loadedCatalogs.has(language)) return loadedCatalogs.get(language);
  if (!loadingCatalogs.has(language)) {
    loadingCatalogs.set(language, loader().then((module) => {
      const translations = module.default?.translations || {};
      loadedCatalogs.set(language, translations);
      loadingCatalogs.delete(language);
      return translations;
    }).catch((error) => {
      loadingCatalogs.delete(language);
      console.error(`Could not load ${language} scheme translations`, error);
      return {};
    }));
  }
  return loadingCatalogs.get(language);
}

export function getSchemeCatalogText(value, language) {
  if (typeof value !== 'string' || !value) return value || '';
  const existingDictionary = i18n.getResource(language, 'translation', 'schemeData') || {};
  return loadedCatalogs.get(language)?.[value] || existingDictionary[value] || value;
}
import i18n from '@/i18n';

const categoryTranslationKeys = {
  'Agriculture,Rural & Environment': 'catAgriculture',
  'Education & Learning': 'catEducation',
  'Business & Entrepreneurship': 'catBusiness',
  'Social welfare & Empowerment': 'catSocialWelfare',
  'Women and Child': 'catWomenChild',
  'Skills & Employment': 'catSkills',
  'Banking,Financial Services and Insurance': 'catBanking',
  'Health & Wellness': 'catHealth',
  'Sports & Culture': 'catSports',
  'Housing & Shelter': 'catHousing',
  'Science, IT & Communications': 'catScience',
  'Transport & Infrastructure': 'catTransport',
  'Utility & Sanitation': 'catUtility',
  'Travel & Tourism': 'catTravel',
  'Public Safety,Law & Justice': 'catPublicSafety',
};


export function getSchemeCategoryLabel(value, language) {
  const key = categoryTranslationKeys[value];
  return key ? i18n.t(key, { lng: language, defaultValue: value }) : getSchemeCatalogText(value, language);
}
