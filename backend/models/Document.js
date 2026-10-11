import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Citizen',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Document name is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['identity', 'income', 'education', 'residence', 'category', 'other'],
      default: 'other',
    },
    originalFilename: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    fileSizeFormatted: {
      type: String,
    },
    filePath: {
      type: String,
    },
    fileDataUrl: {
      type: String,
    },

    version: {
      type: Number,
      default: 1,
    },
    extractedData: {
      // Fields auto-extracted from the document content
      fullName:       { type: String, default: '' },
      dateOfBirth:    { type: String, default: '' },
      age:            { type: Number, default: null },
      aadhaarNumber:  { type: String, default: '' },
      panNumber:      { type: String, default: '' },
      address:        { type: String, default: '' },
      annualIncome:   { type: Number, default: null },
      incomeText:     { type: String, default: '' },
      socialCategory: { type: String, default: '' },
      state:          { type: String, default: '' },
      extractedAt:    { type: Date, default: null },
      confidence:     { type: Number, default: 0 }, // 0-100 confidence score
    },
  },
  {
    timestamps: true,
  }
);

export const Document = mongoose.model('Document', documentSchema);
