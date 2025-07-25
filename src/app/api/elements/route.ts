import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Element } from '@/models'

// Common elements for the chemistry lab
const commonElements = [
  { symbol: 'H', name: 'Hydrogen', atomicNumber: 1, atomicWeight: 1.008, category: 'nonmetal', color: 'white', state: 'gas', safetyLevel: 'caution' },
  { symbol: 'He', name: 'Helium', atomicNumber: 2, atomicWeight: 4.003, category: 'noble gas', color: 'colorless', state: 'gas', safetyLevel: 'safe' },
  { symbol: 'Li', name: 'Lithium', atomicNumber: 3, atomicWeight: 6.94, category: 'alkali metal', color: 'silver', state: 'solid', safetyLevel: 'dangerous' },
  { symbol: 'C', name: 'Carbon', atomicNumber: 6, atomicWeight: 12.01, category: 'nonmetal', color: 'black', state: 'solid', safetyLevel: 'safe' },
  { symbol: 'N', name: 'Nitrogen', atomicNumber: 7, atomicWeight: 14.007, category: 'nonmetal', color: 'colorless', state: 'gas', safetyLevel: 'safe' },
  { symbol: 'O', name: 'Oxygen', atomicNumber: 8, atomicWeight: 15.999, category: 'nonmetal', color: 'colorless', state: 'gas', safetyLevel: 'caution' },
  { symbol: 'F', name: 'Fluorine', atomicNumber: 9, atomicWeight: 18.998, category: 'halogen', color: 'pale yellow', state: 'gas', safetyLevel: 'dangerous' },
  { symbol: 'Ne', name: 'Neon', atomicNumber: 10, atomicWeight: 20.18, category: 'noble gas', color: 'colorless', state: 'gas', safetyLevel: 'safe' },
  { symbol: 'Na', name: 'Sodium', atomicNumber: 11, atomicWeight: 22.99, category: 'alkali metal', color: 'silver', state: 'solid', safetyLevel: 'dangerous' },
  { symbol: 'Mg', name: 'Magnesium', atomicNumber: 12, atomicWeight: 24.305, category: 'alkaline earth metal', color: 'silver', state: 'solid', safetyLevel: 'caution' },
  { symbol: 'Al', name: 'Aluminum', atomicNumber: 13, atomicWeight: 26.982, category: 'post-transition metal', color: 'silver', state: 'solid', safetyLevel: 'safe' },
  { symbol: 'Si', name: 'Silicon', atomicNumber: 14, atomicWeight: 28.085, category: 'metalloid', color: 'gray', state: 'solid', safetyLevel: 'safe' },
  { symbol: 'P', name: 'Phosphorus', atomicNumber: 15, atomicWeight: 30.974, category: 'nonmetal', color: 'white', state: 'solid', safetyLevel: 'dangerous' },
  { symbol: 'S', name: 'Sulfur', atomicNumber: 16, atomicWeight: 32.06, category: 'nonmetal', color: 'yellow', state: 'solid', safetyLevel: 'caution' },
  { symbol: 'Cl', name: 'Chlorine', atomicNumber: 17, atomicWeight: 35.45, category: 'halogen', color: 'green', state: 'gas', safetyLevel: 'dangerous' },
  { symbol: 'Ar', name: 'Argon', atomicNumber: 18, atomicWeight: 39.948, category: 'noble gas', color: 'colorless', state: 'gas', safetyLevel: 'safe' },
  { symbol: 'K', name: 'Potassium', atomicNumber: 19, atomicWeight: 39.098, category: 'alkali metal', color: 'silver', state: 'solid', safetyLevel: 'dangerous' },
  { symbol: 'Ca', name: 'Calcium', atomicNumber: 20, atomicWeight: 40.078, category: 'alkaline earth metal', color: 'gray', state: 'solid', safetyLevel: 'caution' },
  { symbol: 'Fe', name: 'Iron', atomicNumber: 26, atomicWeight: 55.845, category: 'transition metal', color: 'gray', state: 'solid', safetyLevel: 'safe' },
  { symbol: 'Cu', name: 'Copper', atomicNumber: 29, atomicWeight: 63.546, category: 'transition metal', color: 'copper', state: 'solid', safetyLevel: 'safe' },
  { symbol: 'Zn', name: 'Zinc', atomicNumber: 30, atomicWeight: 65.38, category: 'transition metal', color: 'blue-gray', state: 'solid', safetyLevel: 'safe' },
  { symbol: 'Br', name: 'Bromine', atomicNumber: 35, atomicWeight: 79.904, category: 'halogen', color: 'red-brown', state: 'liquid', safetyLevel: 'dangerous' },
  { symbol: 'Ag', name: 'Silver', atomicNumber: 47, atomicWeight: 107.868, category: 'transition metal', color: 'silver', state: 'solid', safetyLevel: 'safe' },
  { symbol: 'I', name: 'Iodine', atomicNumber: 53, atomicWeight: 126.904, category: 'halogen', color: 'purple', state: 'solid', safetyLevel: 'caution' },
  { symbol: 'Au', name: 'Gold', atomicNumber: 79, atomicWeight: 196.967, category: 'transition metal', color: 'gold', state: 'solid', safetyLevel: 'safe' }
]

export async function GET() {
  try {
    await connectDB()
    
    // Check if elements exist in database
    const existingElements = await Element.find({})
    
    if (existingElements.length === 0) {
      // Seed the database with common elements
      await Element.insertMany(commonElements)
    }
    
    // Get all elements from database
    const elements = await Element.find({}).sort({ atomicNumber: 1 })
    
    return NextResponse.json({
      success: true,
      elements
    })
    
  } catch (error) {
    console.error('Error fetching elements:', error)
    
    // Return fallback elements when database connection fails
    console.log('Using fallback elements due to database connection failure')
    return NextResponse.json({
      success: true,
      elements: commonElements,
      fallback: true
    })
  }
}
