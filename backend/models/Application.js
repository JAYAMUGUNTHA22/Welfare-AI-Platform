import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Citizen', required: true, index: true },
  schemeId: { type: String, required: true, trim: true, maxlength: 160 },
  schemeName: { type: String, required: true, trim: true, maxlength: 300 },
  provider: { type: String, trim: true, maxlength: 200, default: 'Government Scheme' },
  applicationUrl: { type: String, trim: true, maxlength: 2048, default: '' },
  applicationMethod: { type: String, enum: ['online', 'offline', 'unknown'], default: 'unknown' },
  benefitSummary: { type: String, trim: true, maxlength: 3000, default: '' },
  status: { type: String, enum: ['pending_confirmation', 'submitted'], default: 'pending_confirmation', index: true },
  startedAt: { type: Date, default: Date.now },
  submittedAt: { type: Date, default: null },
  confirmationExpiresAt: { type: Date, default: null, index: true },
}, { timestamps: true });

applicationSchema.index({ userId: 1, schemeId: 1 }, { unique: true });

export const Application = mongoose.model('Application', applicationSchema);
