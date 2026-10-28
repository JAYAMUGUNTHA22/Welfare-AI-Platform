import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const citizenSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: 120,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    mobile: {
      type: String,
      required: [true, 'Mobile number is required'],
      trim: true,
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false,
    },
    language: {
      type: String,
      default: 'English',
      trim: true,
    },
    age: {
      type: Number,
      min: 0,
      max: 120,
    },
    gender: { type: String, trim: true, enum: ['Female', 'Male', 'Other', ''], default: undefined },
    educationLevel: { type: String, trim: true },
    currentCourse: { type: String, trim: true },
    employmentStatus: { type: String, trim: true },
    familySize: { type: Number, min: 1 },
    dependants: { type: Number, min: 0 },
    residenceType: { type: String, trim: true, enum: ['Rural', 'Urban', ''], default: undefined },
    isFarmer: { type: Boolean, default: undefined },
    firstGraduate: { type: Boolean, default: undefined },
    specialCircumstances: { type: String, trim: true, maxlength: 500 },
    district: { type: String, trim: true, maxlength: 120 },
    landholdingAcres: { type: Number, min: 0 },
    landOwnership: { type: String, trim: true, maxlength: 80 },
    cropTypes: [{ type: String, trim: true }],
    farmingActivities: [{ type: String, trim: true }],
    occupation: {
      type: String,
      trim: true,
    },
    income: {
      type: String,
      trim: true,
    },
    aadharNumber: {
      type: String,
      trim: true,
      match: [/^\d{12}$/, 'Please enter a valid 12-digit Aadhar number'],
    },
    rationCard: {
      type: String,
      trim: true,
    },
    socialCategory: {
      type: String,
      trim: true,
      enum: ['General', 'OBC', 'SC', 'ST', 'EWS', ''],
      default: undefined,
    },
    isDifferentlyAbled: {
      type: Boolean,
      default: undefined,
    },
    isWidow: {
      type: Boolean,
      default: undefined,
    },
    motherWidowed: {
      type: Boolean,
      default: undefined,
    },
    annualIncomeINR: {
      type: Number,
      min: 0,
    },
    activeApplicationCount: {
      type: Number,
      min: 0,
      max: 2,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
  }
);

citizenSchema.pre('save', async function hashPassword() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

citizenSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

export const Citizen = mongoose.model('Citizen', citizenSchema);
