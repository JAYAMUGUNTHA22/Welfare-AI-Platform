/**
 * Generate Hindi and Tamil translation JSON files for all scheme data.
 * 
 * This script reads the myscheme_eligibility_detailed.json dataset,
 * extracts all unique translatable strings (scheme names, benefits, details,
 * eligibility, provider labels), and writes them into
 *   src/data/translations/hindi.json
 *   src/data/translations/tamil.json
 *
 * Run:  node scripts/generateTranslations.js
 */

const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '..', 'src', 'data', 'myscheme_eligibility_detailed.json');
const outDir = path.join(__dirname, '..', 'src', 'data', 'translations');

const dataset = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
const schemes = dataset.schemes || [];

// Collect every unique string that getSchemeCatalogText could receive
const uniqueStrings = new Set();
schemes.forEach((s) => {
  if (s.scheme_name) uniqueStrings.add(s.scheme_name);
  if (s.benefits) uniqueStrings.add(s.benefits);
  if (s.details) uniqueStrings.add(s.details);
  if (s.eligibility) uniqueStrings.add(s.eligibility);
  if (s.eligibility_details?.eligibility_summary) uniqueStrings.add(s.eligibility_details.eligibility_summary);
  if (s.application) uniqueStrings.add(s.application);
  if (s.documents) uniqueStrings.add(s.documents);
});

// Also add the static provider labels
['Central Government Scheme', 'State Government Scheme', 'Government Scheme'].forEach((s) => uniqueStrings.add(s));

console.log(`Collected ${uniqueStrings.size} unique translatable strings.`);

// Build identity map for each language (key = English string, value = English string as placeholder)
// This allows getSchemeCatalogText to return the value from the map.
// In production you would replace these with actual translations.

const hindiTranslations = {};
const tamilTranslations = {};

// Add static provider label translations
const staticHindi = {
  'Central Government Scheme': 'केंद्र सरकार की योजना',
  'State Government Scheme': 'राज्य सरकार की योजना',
  'Government Scheme': 'सरकारी योजना',
};

const staticTamil = {
  'Central Government Scheme': 'மத்திய அரசுத் திட்டம்',
  'State Government Scheme': 'மாநில அரசுத் திட்டம்',
  'Government Scheme': 'அரசுத் திட்டம்',
};

// For static known translations
Object.assign(hindiTranslations, staticHindi);
Object.assign(tamilTranslations, staticTamil);

// For all other unique strings, we keep them as-is (English passthrough)
// This way the translation lookup won't fail and will show the original English text.
// The UI will use the English scheme names consistently until we can integrate
// a proper translation service.
uniqueStrings.forEach((str) => {
  if (!hindiTranslations[str]) hindiTranslations[str] = str;
  if (!tamilTranslations[str]) tamilTranslations[str] = str;
});

// Write JSON files
fs.mkdirSync(outDir, { recursive: true });

fs.writeFileSync(
  path.join(outDir, 'hindi.json'),
  JSON.stringify({
    language: 'Hindi',
    machineTranslated: false,
    translations: hindiTranslations,
  }, null, 0),
  'utf8'
);

fs.writeFileSync(
  path.join(outDir, 'tamil.json'),
  JSON.stringify({
    language: 'Tamil',
    machineTranslated: false,
    translations: tamilTranslations,
  }, null, 0),
  'utf8'
);

console.log(`Wrote hindi.json (${Object.keys(hindiTranslations).length} entries)`);
console.log(`Wrote tamil.json (${Object.keys(tamilTranslations).length} entries)`);
console.log('Done!');
