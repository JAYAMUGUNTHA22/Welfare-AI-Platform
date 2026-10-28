import test from 'node:test';
import assert from 'node:assert/strict';
import { farmerSupportSchemes } from '../data/farmerSupportSchemes.js';
import { seedFarmerSupportSchemes } from '../services/farmerSupportSeeder.js';
import { getFarmerRecommendations } from '../services/farmerRecommendations.js';

function makeFakeSchemeModel(initialRecords = []) {
  const records = structuredClone(initialRecords);
  const matches = (record, filter) => (filter.$or || []).some((condition) => {
    if (condition.schemeId) return record.schemeId === condition.schemeId;
    if (condition.name instanceof RegExp) return condition.name.test(record.name || '');
    if (condition.name) return record.name === condition.name;
    return false;
  });

  return {
    records,
    async findOne(filter) { return records.find((record) => matches(record, filter)) || null; },
    async updateOne(filter, update, options = {}) {
      let record = records.find((item) => item._id === filter._id || matches(item, filter));
      if (record && update.$set) Object.assign(record, structuredClone(update.$set));
      if (!record && options.upsert) {
        record = { _id: `fake-${records.length + 1}`, ...structuredClone(update.$setOnInsert) };
        records.push(record);
      }
      return { acknowledged: true, upsertedCount: record ? 1 : 0 };
    },
  };
}

test('farmer support seed can run twice without duplicates and preserves prior records', async () => {
  const legacy = { _id: 'legacy', schemeId: 'legacy-scheme', name: 'Existing legacy scheme', provider: 'Existing provider' };
  const existingKisan = { _id: 'existing-kisan', schemeId: 'pm-kisan-legacy-id', name: 'Pradhan Mantri Kisan Samman Nidhi', provider: 'Existing provider', benefitSummary: 'Existing untouched text' };
  const model = makeFakeSchemeModel([legacy, existingKisan]);

  const first = await seedFarmerSupportSchemes(model);
  const afterFirst = model.records.length;
  const second = await seedFarmerSupportSchemes(model);

  assert.equal(first.inserted + first.enriched, farmerSupportSchemes.length);
  assert.equal(second.inserted, 0);
  assert.equal(second.enriched, 0);
  assert.equal(second.unchanged, farmerSupportSchemes.length);
  assert.equal(model.records.length, afterFirst);
  assert.deepEqual(model.records.find(({ _id }) => _id === 'legacy'), legacy);
  assert.equal(model.records.find(({ _id }) => _id === 'existing-kisan').benefitSummary, 'Existing untouched text');
  assert.equal(model.records.filter(({ name }) => name === 'Pradhan Mantri Kisan Samman Nidhi').length, 1);
});

test('Tamil Nadu farmer receives location-relevant private and central potential matches with missing requirements', () => {
  const profile = { occupation: 'Farmer', state: 'Tamil Nadu', annualIncomeINR: 50000, age: 45 };
  const recommendations = getFarmerRecommendations(profile, farmerSupportSchemes);

  assert.ok(recommendations.some(({ provider }) => provider === 'Sengodu Foundation'));
  assert.ok(recommendations.some(({ provider }) => provider === 'Pasidi Panta Foundation'));
  assert.ok(recommendations.some(({ recommendationGroup }) => recommendationGroup === 'central'));
  assert.ok(!recommendations.some(({ provider }) => provider === 'TNS India Foundation'));
  assert.ok(recommendations.every(({ eligibilityStatus }) => !eligibilityStatus.startsWith('Eligible')));
  assert.ok(recommendations.filter(({ recommendationGroup }) => recommendationGroup === 'private')
    .every(({ eligibilityStatus }) => eligibilityStatus === 'Potential Match — Verify Availability'));
});

test('crop, district, and age mismatches filter records while specific missing details remain visible', () => {
  const profile = {
    occupation: 'Farmer', state: 'Tamil Nadu', district: 'Ramanathapuram',
    cropTypes: ['Chilli'], age: 45, annualIncomeINR: 50000,
  };
  const recommendations = getFarmerRecommendations(profile, farmerSupportSchemes);
  const pasidi = recommendations.find(({ provider }) => provider === 'Pasidi Panta Foundation');
  assert.ok(pasidi);
  assert.ok(pasidi.missingInformation.some((value) => value.includes('crop-specific')));
  assert.ok(!recommendations.some(({ schemeId }) => schemeId === 'central-pm-kisan-maan-dhan-yojana'));

  const wrongCrop = getFarmerRecommendations({ ...profile, cropTypes: ['Tea'] }, farmerSupportSchemes);
  assert.ok(!wrongCrop.some(({ provider }) => provider === 'Pasidi Panta Foundation'));
});

test('non-farmer profiles do not receive the farmer-only catalogue', () => {
  assert.deepEqual(getFarmerRecommendations({ occupation: 'Student', state: 'Tamil Nadu' }, farmerSupportSchemes), []);
});

test('recommendation output collapses duplicate database records by provider and programme name', () => {
  const duplicate = { ...farmerSupportSchemes.find(({ provider }) => provider === 'Sengodu Foundation'), schemeId: 'duplicate-sengodu-record' };
  const results = getFarmerRecommendations(
    { occupation: 'Farmer', state: 'Tamil Nadu', annualIncomeINR: 50000 },
    [...farmerSupportSchemes, duplicate],
  );
  assert.equal(results.filter(({ provider }) => provider === 'Sengodu Foundation').length, 1);
});
