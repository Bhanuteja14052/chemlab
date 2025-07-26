// Test version without TypeScript imports for verification
const COMPOUND_DATABASE = [
  // Hydrogen-Oxygen compounds
  {
    elements: ['H', 'O'],
    ratios: { H: 2, O: 1 },
    formula: 'H₂O',
    name: 'Water',
    description: 'Essential for life, universal solvent',
    stability: 'high',
    safetyLevel: 'safe',
    state: 'liquid',
    color: '#4F94CD',
    formation: 'common'
  },
  {
    elements: ['H', 'O'],
    ratios: { H: 2, O: 2 },
    formula: 'H₂O₂',
    name: 'Hydrogen Peroxide',
    description: 'Strong oxidizing agent, antiseptic',
    stability: 'medium',
    safetyLevel: 'caution',
    state: 'liquid',
    color: '#B0E0E6',
    formation: 'synthetic'
  },
  
  // Carbon-Oxygen compounds
  {
    elements: ['C', 'O'],
    ratios: { C: 1, O: 1 },
    formula: 'CO',
    name: 'Carbon Monoxide',
    description: 'Toxic gas, binds to hemoglobin',
    stability: 'medium',
    safetyLevel: 'dangerous',
    state: 'gas',
    color: '#696969',
    formation: 'common'
  },
  {
    elements: ['C', 'O'],
    ratios: { C: 1, O: 2 },
    formula: 'CO₂',
    name: 'Carbon Dioxide',
    description: 'Greenhouse gas, product of respiration',
    stability: 'high',
    safetyLevel: 'safe',
    state: 'gas',
    color: '#D3D3D3',
    formation: 'common'
  },
  
  // Nitrogen-Oxygen compounds
  {
    elements: ['N', 'O'],
    ratios: { N: 1, O: 1 },
    formula: 'NO',
    name: 'Nitric Oxide',
    description: 'Signaling molecule, vasodilator',
    stability: 'low',
    safetyLevel: 'caution',
    state: 'gas',
    color: '#8B0000',
    formation: 'synthetic'
  },
  {
    elements: ['N', 'O'],
    ratios: { N: 1, O: 2 },
    formula: 'NO₂',
    name: 'Nitrogen Dioxide',
    description: 'Brown toxic gas, air pollutant',
    stability: 'medium',
    safetyLevel: 'dangerous',
    state: 'gas',
    color: '#8B4513',
    formation: 'common'
  },
  {
    elements: ['N', 'O'],
    ratios: { N: 2, O: 1 },
    formula: 'N₂O',
    name: 'Nitrous Oxide',
    description: 'Laughing gas, anesthetic',
    stability: 'high',
    safetyLevel: 'caution',
    state: 'gas',
    color: '#E0E0E0',
    formation: 'synthetic'
  },
  
  // Sodium-Chlorine compounds
  {
    elements: ['Na', 'Cl'],
    ratios: { Na: 1, Cl: 1 },
    formula: 'NaCl',
    name: 'Sodium Chloride',
    description: 'Table salt, essential electrolyte',
    stability: 'high',
    safetyLevel: 'safe',
    state: 'solid',
    color: '#FFFFFF',
    formation: 'common'
  }
]

function generatePossibleCompounds(elements) {
  if (!elements || elements.length === 0) {
    return []
  }

  const elementSymbols = elements.map(e => e.element)
  const elementCounts = {}
  
  elements.forEach(element => {
    elementCounts[element.element] = element.molecules || 1
  })

  // Find matching compounds in database
  const matchingCompounds = COMPOUND_DATABASE.filter(compound => {
    // Check if all compound elements are present in input
    const hasAllElements = compound.elements.every(element => 
      elementSymbols.includes(element)
    )
    
    if (!hasAllElements) return false

    // Check if input has only the compound elements (no extra elements)
    const hasOnlyNeededElements = elementSymbols.every(element =>
      compound.elements.includes(element)
    )
    
    return hasOnlyNeededElements
  })

  // Score compounds based on how well they match the input ratios
  const scoredCompounds = matchingCompounds.map(compound => {
    let score = 0
    let totalExpected = 0
    let totalActual = 0

    compound.elements.forEach(element => {
      const expected = compound.ratios[element] || 1
      const actual = elementCounts[element] || 0
      
      totalExpected += expected
      totalActual += actual
      
      // Give higher scores for better ratio matches
      if (actual > 0) {
        const ratio = Math.min(actual, expected) / Math.max(actual, expected)
        score += ratio
      }
    })

    // Normalize score
    score = score / compound.elements.length

    return {
      ...compound,
      score,
      ratioMatch: score > 0.7 ? 'good' : score > 0.4 ? 'fair' : 'poor'
    }
  })

  // Sort by score and return top matches
  return scoredCompounds
    .sort((a, b) => b.score - a.score)
    .slice(0, 10) // Return top 10 matches
}

module.exports = { generatePossibleCompounds }
