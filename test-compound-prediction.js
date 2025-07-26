// Simple test to verify our compound prediction logic works
const { generatePossibleCompounds } = require('./compoundPrediction')

// Test with Hydrogen and Oxygen
const elements = [
  { element: 'H', molecules: 2, weight: 1 },
  { element: 'O', molecules: 1, weight: 16 }
]

console.log('Testing compound prediction with H2O:')
try {
  const compounds = generatePossibleCompounds(elements)
  console.log('Generated compounds:', compounds.length)
  compounds.forEach((compound, index) => {
    console.log(`${index + 1}. ${compound.name} (${compound.formula})`)
    console.log(`   Description: ${compound.description}`)
    console.log(`   Stability: ${compound.stability}`)
    console.log(`   State: ${compound.state}`)
    console.log('')
  })
} catch (error) {
  console.error('Error:', error.message)
}

// Test with Carbon and Oxygen
const carbonOxygen = [
  { element: 'C', molecules: 1, weight: 12 },
  { element: 'O', molecules: 2, weight: 16 }
]

console.log('Testing compound prediction with CO2:')
try {
  const compounds = generatePossibleCompounds(carbonOxygen)
  console.log('Generated compounds:', compounds.length)
  compounds.forEach((compound, index) => {
    console.log(`${index + 1}. ${compound.name} (${compound.formula})`)
    console.log(`   Description: ${compound.description}`)
    console.log(`   Stability: ${compound.stability}`)
    console.log(`   State: ${compound.state}`)
    console.log('')
  })
} catch (error) {
  console.error('Error:', error.message)
}
