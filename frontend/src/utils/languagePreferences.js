import i18n from '@/i18n';
import { getMe, updateCitizen } from '@/services/api';
import { loadSchemeCatalogTranslations } from '@/utils/schemeCatalogTranslations';

export const supportedLanguages = ['English', 'हिंदी', 'தமிழ்'];

export function normalizeLanguage(language) {
  return supportedLanguages.includes(language) ? language : 'English';
}

export async function changePreferredLanguage(language, userId) {
  const preferredLanguage = normalizeLanguage(language);
  await loadSchemeCatalogTranslations(preferredLanguage);
  await i18n.changeLanguage(preferredLanguage);
  if (!localStorage.getItem('token')) return preferredLanguage;

  try {
    let id = userId;
    if (!id) {
      const result = await getMe();
      id = result.user?._id;
    }
    if (id) await updateCitizen(id, { language: preferredLanguage });
  } catch (error) {
    // Keep the browser preference even when the profile service is offline.
    console.warn('Could not save the preferred language to the profile:', error.message);
  }
  return preferredLanguage;
}
