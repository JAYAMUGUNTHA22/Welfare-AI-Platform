import mongoose from 'mongoose';

const recommendationSchema = new mongoose.Schema({
  citizen: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Citizen',
    required: true,
  },
  profileFingerprint: { type: String, required: true },
  profile: { type: mongoose.Schema.Types.Mixed, required: true },
  schemes: [{ type: mongoose.Schema.Types.Mixed }],
  generatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

recommendationSchema.index({ citizen: 1, profileFingerprint: 1 }, { unique: true });

export const SchemeRecommendation = mongoose.model('SchemeRecommendation', recommendationSchema);
