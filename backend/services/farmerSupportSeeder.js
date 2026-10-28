import { farmerSchemeAliases, farmerSupportSchemes, normalizeSchemeName } from '../data/farmerSupportSchemes.js';

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export async function seedFarmerSupportSchemes(SchemeModel) {
  const summary = { inserted: 0, enriched: 0, unchanged: 0 };

  for (const record of farmerSupportSchemes) {
    const names = [record.name, ...(farmerSchemeAliases[record.schemeId] || [])];
    const existing = await SchemeModel.findOne({
      $or: [
        { schemeId: record.schemeId },
        ...names.map((name) => ({ name: new RegExp(`^${escapeRegex(name)}$`, 'i') })),
      ],
    });

    const canonicalData = { ...record };
    delete canonicalData.supportMetadata;
    const nextSupportMetadata = {
      ...(record.supportMetadata || {}),
      canonicalData,
      canonicalSchemeId: record.schemeId,
    };

    if (existing) {
      const previous = existing.supportMetadata || {};
      const alreadyEnriched = JSON.stringify(previous.canonicalData) === JSON.stringify(canonicalData);
      if (alreadyEnriched) {
        summary.unchanged += 1;
        continue;
      }
      await SchemeModel.updateOne(
        { _id: existing._id },
        { $set: { supportMetadata: { ...previous, ...nextSupportMetadata } } },
      );
      summary.enriched += 1;
      continue;
    }

    await SchemeModel.updateOne(
      { schemeId: record.schemeId },
      { $setOnInsert: { ...record, supportMetadata: nextSupportMetadata } },
      { upsert: true, runValidators: true },
    );
    summary.inserted += 1;
  }

  return summary;
}

export function canonicalNameKey(name) {
  return normalizeSchemeName(name);
}
