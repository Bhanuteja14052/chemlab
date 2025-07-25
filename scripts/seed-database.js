// Database seeding script for periodic table elements
// Run with: node scripts/seed-database.js

import { connectToMongoDB } from '../src/lib/mongodb.js';
import { Element } from '../src/models/Element.js';
import { Compound } from '../src/models/Compound.js';

const elements = [
  // Period 1
  { symbol: 'H', name: 'Hydrogen', atomicNumber: 1, atomicMass: 1.008, category: 'nonmetal', color: '#FFFFFF', state: 'gas', safetyLevel: 'medium' },
  { symbol: 'He', name: 'Helium', atomicNumber: 2, atomicMass: 4.003, category: 'noble-gas', color: '#D9FFFF', state: 'gas', safetyLevel: 'safe' },
  
  // Period 2
  { symbol: 'Li', name: 'Lithium', atomicNumber: 3, atomicMass: 6.94, category: 'alkali-metal', color: '#CC80FF', state: 'solid', safetyLevel: 'dangerous' },
  { symbol: 'Be', name: 'Beryllium', atomicNumber: 4, atomicMass: 9.012, category: 'alkaline-earth-metal', color: '#C2FF00', state: 'solid', safetyLevel: 'dangerous' },
  { symbol: 'B', name: 'Boron', atomicNumber: 5, atomicMass: 10.81, category: 'metalloid', color: '#FFB5B5', state: 'solid', safetyLevel: 'medium' },
  { symbol: 'C', name: 'Carbon', atomicNumber: 6, atomicMass: 12.01, category: 'nonmetal', color: '#909090', state: 'solid', safetyLevel: 'safe' },
  { symbol: 'N', name: 'Nitrogen', atomicNumber: 7, atomicMass: 14.01, category: 'nonmetal', color: '#3050F8', state: 'gas', safetyLevel: 'medium' },
  { symbol: 'O', name: 'Oxygen', atomicNumber: 8, atomicMass: 16.00, category: 'nonmetal', color: '#FF0D0D', state: 'gas', safetyLevel: 'medium' },
  { symbol: 'F', name: 'Fluorine', atomicNumber: 9, atomicMass: 19.00, category: 'halogen', color: '#90E050', state: 'gas', safetyLevel: 'dangerous' },
  { symbol: 'Ne', name: 'Neon', atomicNumber: 10, atomicMass: 20.18, category: 'noble-gas', color: '#B3E3F5', state: 'gas', safetyLevel: 'safe' },
  
  // Period 3
  { symbol: 'Na', name: 'Sodium', atomicNumber: 11, atomicMass: 22.99, category: 'alkali-metal', color: '#AB5CF2', state: 'solid', safetyLevel: 'dangerous' },
  { symbol: 'Mg', name: 'Magnesium', atomicNumber: 12, atomicMass: 24.31, category: 'alkaline-earth-metal', color: '#8AFF00', state: 'solid', safetyLevel: 'medium' },
  { symbol: 'Al', name: 'Aluminum', atomicNumber: 13, atomicMass: 26.98, category: 'post-transition-metal', color: '#BFA6A6', state: 'solid', safetyLevel: 'safe' },
  { symbol: 'Si', name: 'Silicon', atomicNumber: 14, atomicMass: 28.09, category: 'metalloid', color: '#F0C8A0', state: 'solid', safetyLevel: 'safe' },
  { symbol: 'P', name: 'Phosphorus', atomicNumber: 15, atomicMass: 30.97, category: 'nonmetal', color: '#FF8000', state: 'solid', safetyLevel: 'dangerous' },
  { symbol: 'S', name: 'Sulfur', atomicNumber: 16, atomicMass: 32.07, category: 'nonmetal', color: '#FFFF30', state: 'solid', safetyLevel: 'medium' },
  { symbol: 'Cl', name: 'Chlorine', atomicNumber: 17, atomicMass: 35.45, category: 'halogen', color: '#1FF01F', state: 'gas', safetyLevel: 'dangerous' },
  { symbol: 'Ar', name: 'Argon', atomicNumber: 18, atomicMass: 39.95, category: 'noble-gas', color: '#80D1E3', state: 'gas', safetyLevel: 'safe' },
  
  // Common transition metals
  { symbol: 'Fe', name: 'Iron', atomicNumber: 26, atomicMass: 55.85, category: 'transition-metal', color: '#E06633', state: 'solid', safetyLevel: 'safe' },
  { symbol: 'Cu', name: 'Copper', atomicNumber: 29, atomicMass: 63.55, category: 'transition-metal', color: '#C88033', state: 'solid', safetyLevel: 'safe' },
  { symbol: 'Zn', name: 'Zinc', atomicNumber: 30, atomicMass: 65.38, category: 'transition-metal', color: '#7D80B0', state: 'solid', safetyLevel: 'safe' },
  { symbol: 'Ag', name: 'Silver', atomicNumber: 47, atomicMass: 107.87, category: 'transition-metal', color: '#C0C0C0', state: 'solid', safetyLevel: 'safe' },
  { symbol: 'Au', name: 'Gold', atomicNumber: 79, atomicMass: 196.97, category: 'transition-metal', color: '#FFD123', state: 'solid', safetyLevel: 'safe' },
  
  // Heavy metals
  { symbol: 'Pb', name: 'Lead', atomicNumber: 82, atomicMass: 207.2, category: 'post-transition-metal', color: '#575961', state: 'solid', safetyLevel: 'dangerous' },
  { symbol: 'Hg', name: 'Mercury', atomicNumber: 80, atomicMass: 200.59, category: 'transition-metal', color: '#B8B8D0', state: 'liquid', safetyLevel: 'dangerous' },
];

const compounds = [
  // Common water and acids
  { formula: 'H2O', name: 'Water', color: '#87CEEB', state: 'liquid', safetyLevel: 'safe' },
  { formula: 'HCl', name: 'Hydrochloric Acid', color: '#FFFF99', state: 'liquid', safetyLevel: 'dangerous' },
  { formula: 'H2SO4', name: 'Sulfuric Acid', color: '#FFE4B5', state: 'liquid', safetyLevel: 'dangerous' },
  { formula: 'HNO3', name: 'Nitric Acid', color: '#FFFFE0', state: 'liquid', safetyLevel: 'dangerous' },
  
  // Salts
  { formula: 'NaCl', name: 'Sodium Chloride', color: '#FFFFFF', state: 'solid', safetyLevel: 'safe' },
  { formula: 'CaCO3', name: 'Calcium Carbonate', color: '#FFFFFF', state: 'solid', safetyLevel: 'safe' },
  { formula: 'MgSO4', name: 'Magnesium Sulfate', color: '#FFFFFF', state: 'solid', safetyLevel: 'safe' },
  
  // Oxides
  { formula: 'CO2', name: 'Carbon Dioxide', color: '#C0C0C0', state: 'gas', safetyLevel: 'medium' },
  { formula: 'SO2', name: 'Sulfur Dioxide', color: '#FFF8DC', state: 'gas', safetyLevel: 'dangerous' },
  { formula: 'Fe2O3', name: 'Iron Oxide (Rust)', color: '#CD853F', state: 'solid', safetyLevel: 'safe' },
  
  // Organic compounds
  { formula: 'CH4', name: 'Methane', color: '#E6E6FA', state: 'gas', safetyLevel: 'medium' },
  { formula: 'C2H6O', name: 'Ethanol', color: '#F0F8FF', state: 'liquid', safetyLevel: 'medium' },
  { formula: 'C6H12O6', name: 'Glucose', color: '#FFFFFF', state: 'solid', safetyLevel: 'safe' },
];

async function seedDatabase() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await connectToMongoDB();
    
    console.log('🧹 Clearing existing data...');
    await Element.deleteMany({});
    await Compound.deleteMany({});
    
    console.log('🧪 Seeding elements...');
    await Element.insertMany(elements);
    console.log(`✅ Inserted ${elements.length} elements`);
    
    console.log('⚗️ Seeding compounds...');
    await Compound.insertMany(compounds);
    console.log(`✅ Inserted ${compounds.length} compounds`);
    
    console.log('🎉 Database seeding completed successfully!');
    console.log('');
    console.log('📊 Summary:');
    console.log(`   • Elements: ${elements.length}`);
    console.log(`   • Compounds: ${compounds.length}`);
    console.log('');
    console.log('🚀 You can now start the application with: npm run dev');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Run the seeding function
seedDatabase();
