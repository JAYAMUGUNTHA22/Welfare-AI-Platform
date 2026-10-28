import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import { Scheme } from './models/Scheme.js';
import { SchemeEligibility } from './models/SchemeEligibility.js';
import { connectDB } from './config/db.js';
import { seedFarmerSupportSchemes } from './services/farmerSupportSeeder.js';
import { farmerSchemeAliases, farmerSupportSchemes, normalizeSchemeName } from './data/farmerSupportSchemes.js';

const backendDir = path.dirname(fileURLToPath(import.meta.url));
const projectDir = path.resolve(backendDir, '..');

async function readJson(relativePath) {
  return JSON.parse(await fs.readFile(path.join(projectDir, relativePath), 'utf8'));
}

function asList(value) {
  if (Array.isArray(value)) return value.filter(Boolean).map(String);
  return value ? [String(value)] : [];
}

async function importSchemes() {
  const catalogue = await readJson('frontend/src/data/myscheme_eligibility_detailed.json');
  if (!Array.isArray(catalogue.schemes)) throw new Error('Scheme catalogue is missing its schemes array');

  const operations = catalogue.schemes
    .filter((item) => item.scheme_name && item.schemeCategory)
    .map((item, index) => {
      const schemeId = `${item.slug || 'myscheme-scheme'}-${index}`;
      const tags = typeof item.schemeCategory === 'string'
        ? item.schemeCategory.split(',').map((tag) => tag.trim()).filter(Boolean)
        : asList(item.schemeCategory);
      const eligibility = item.eligibility_details?.eligibility_summary || item.eligibility || '';
      const update = {
        schemeId,
        myschemeSlug: item.slug || '',
        name: item.scheme_name,
        provider: item.level === 'Central' ? 'Central Government Scheme'
          : item.level === 'State' ? 'State Government Scheme' : 'Government Scheme',
        providerType: 'government',
        verification: 'dataset_unverified',
        level: item.level || '',
        category: tags[0] || '',
        tags,
        benefitSummary: typeof item.benefits === 'string' ? item.benefits : asList(item.benefits).join('\n'),
        overview: typeof item.details === 'string' ? item.details : '',
        eligibility: asList(eligibility),
        benefits: asList(item.benefits),
        documentsRequired: asList(item.documents),
        applicationProcess: asList(item.application),
        applicationMethod: typeof item.application === 'string' ? item.application : asList(item.application).join('\n'),
        sourceData: item,
      };
      const matchingFarmerScheme = farmerSupportSchemes.find((farmerScheme) => (
        [farmerScheme.name, ...(farmerSchemeAliases[farmerScheme.schemeId] || [])]
          .some((name) => normalizeSchemeName(name) === normalizeSchemeName(item.scheme_name))
      ));
      const farmerAliases = matchingFarmerScheme
        ? [matchingFarmerScheme.name, ...(farmerSchemeAliases[matchingFarmerScheme.schemeId] || [])]
        : [];
      return {
        updateOne: {
          filter: { $or: [{ schemeId }, { name: item.scheme_name }, ...farmerAliases.map((name) => ({ name }))] },
          update: { $setOnInsert: update },
          upsert: true,
        },
      };
    });

  for (let offset = 0; offset < operations.length; offset += 500) {
    await Scheme.bulkWrite(operations.slice(offset, offset + 500), { ordered: false });
  }
  console.log(`Imported ${operations.length} detailed schemes (upsert; existing records retained).`);
}

async function importEligibilityIfEmpty() {
  const existingCount = await SchemeEligibility.estimatedDocumentCount();
  if (existingCount) {
    console.log(`Kept ${existingCount} existing eligibility records; import skipped.`);
    return;
  }

  const rows = await readJson('frontend/src/data/dataset_with_scheme_categories.json');
  if (!Array.isArray(rows)) throw new Error('Eligibility dataset is not an array');
  const records = rows.map((row) => ({
    Age: Number(row.Age),
    Annual_Income_INR: Number(row.Annual_Income_INR),
    State: row.State,
    Category: row.Category,
    Eligible_Scheme: row.Eligible_Scheme,
    Scheme_Category: row.Scheme_Category,
  }));
  await SchemeEligibility.insertMany(records, { ordered: false });
  console.log(`Imported ${records.length} eligibility records.`);
}

try {
  await connectDB();
  await importSchemes();
  const farmerSupportSummary = await seedFarmerSupportSchemes(Scheme);
  console.log(`Farmer-support seed complete: ${farmerSupportSummary.inserted} inserted, ${farmerSupportSummary.enriched} existing records safely enriched, ${farmerSupportSummary.unchanged} unchanged.`);
  await importEligibilityIfEmpty();
  console.log('MongoDB seed complete.');
} catch (error) {
  console.error('MongoDB seed failed:', error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
