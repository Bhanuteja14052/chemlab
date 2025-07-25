import mongoose from 'mongoose'

// Element Schema
const elementSchema = new mongoose.Schema({
  symbol: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  atomicNumber: { type: Number, required: true },
  atomicWeight: { type: Number, required: true },
  category: { type: String, required: true }, // metal, nonmetal, noble gas, etc.
  color: { type: String, default: 'gray' },
  state: { type: String, enum: ['solid', 'liquid', 'gas'], default: 'solid' },
  description: { type: String },
  safetyLevel: { type: String, enum: ['safe', 'caution', 'dangerous'], default: 'safe' }
}, { timestamps: true })

// Compound Schema
const compoundSchema = new mongoose.Schema({
  name: { type: String, required: true },
  formula: { type: String, required: true },
  elements: [{ type: String }], // Array of element symbols
  color: { type: String, default: 'clear' },
  state: { type: String, enum: ['solid', 'liquid', 'gas'], default: 'liquid' },
  molarMass: { type: Number },
  description: { type: String },
  safetyWarnings: [{ type: String }]
}, { timestamps: true })

// Experiment Schema
const experimentSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // Clerk user ID
  mode: { type: String, enum: ['play', 'practical'], required: true },
  title: { type: String, required: true },
  description: { type: String },
  
  // Input parameters
  elements: [{ type: String, required: true }], // Element symbols or compound names
  temperature: { type: Number }, // Celsius
  pressure: { type: Number }, // atm
  volume: { type: Number }, // mL
  weight: { type: Number }, // grams
  
  // AI predicted results
  result: {
    compoundName: { type: String },
    chemicalFormula: { type: String },
    color: { type: String },
    state: { type: String },
    safetyWarnings: [{ type: String }],
    explanation: { type: String },
    reactionEquation: { type: String },
    finalTemperature: { type: Number },
    finalPressure: { type: Number }
  },
  
  // Metadata
  isPublic: { type: Boolean, default: false },
  tags: [{ type: String }],
  rating: { type: Number, min: 1, max: 5 }
}, { timestamps: true })

// User Profile Schema
const userProfileSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true }, // Clerk user ID
  email: { type: String, required: true },
  firstName: { type: String },
  lastName: { type: String },
  avatar: { type: String },
  
  // Lab preferences
  preferredMode: { type: String, enum: ['play', 'practical'], default: 'play' },
  experienceLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
  
  // Statistics
  totalExperiments: { type: Number, default: 0 },
  favoriteElements: [{ type: String }],
  achievements: [{ 
    name: { type: String },
    description: { type: String },
    earnedAt: { type: Date }
  }],
  
  // Settings
  notifications: { type: Boolean, default: true },
  publicProfile: { type: Boolean, default: false }
}, { timestamps: true })

// Export models
export const Element = mongoose.models.Element || mongoose.model('Element', elementSchema)
export const Compound = mongoose.models.Compound || mongoose.model('Compound', compoundSchema)
export const Experiment = mongoose.models.Experiment || mongoose.model('Experiment', experimentSchema)
export const UserProfile = mongoose.models.UserProfile || mongoose.model('UserProfile', userProfileSchema)
