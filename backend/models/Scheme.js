import mongoose from 'mongoose';

const schemeSchema = new mongoose.Schema(
  {
    schemeId: { type: String, required: true },
    myschemeSlug: { type: String },
    level: { type: String },
    tags: [{ type: String }],
    name: { type: String, required: true },
    provider: { type: String, required: true },
    providerType: { type: String },
    verification: { type: String },
    category: { type: String },
    eligibleCategories: [{ type: String }],
    matchScore: { type: Number },
    benefitSummary: { type: String },
    benefitAmount: { type: String },
    deadline: { type: String },
    applicationMethod: { type: String },
    processingTime: { type: String },
    shortExplanation: { type: String },
    overview: { type: String },
    eligibility: [{ type: String }],
    benefits: [{ type: String }],
    documentsRequired: [{ type: String }],
    applicationProcess: [{ type: String }],
    officialWebsite: { type: String, trim: true },
    targetBeneficiaries: [{ type: String }],
    supportedLocations: [{ type: String }],
    supportedCrops: [{ type: String }],
    activeStatus: { type: String, enum: ['active', 'inactive', 'unconfirmed'], default: 'unconfirmed' },
    eligibilityStatus: { type: String },
    missingInformation: [{ type: String }],
    recommendationGroup: { type: String, enum: ['state', 'central', 'private', 'other'] },
    supportMetadata: { type: mongoose.Schema.Types.Mixed },
    // We can embed dataset rules manually or just simple ones
    rules: [
      {
        field: { type: String },
        operator: { type: String },
        value: { type: mongoose.Schema.Types.Mixed },
      }
    ],
    // Keep the complete source record so fields added to the catalogue are not lost.
    sourceData: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

schemeSchema.index({ schemeId: 1 }, { unique: true });

export const Scheme = mongoose.model('Scheme', schemeSchema);
