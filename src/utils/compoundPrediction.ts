import { ElementSpec } from '@/types/chemistry'

export interface PossibleCompound {
  name: string
  formula: string
  state: string
  description: string
  color: string
  commonUse?: string
  safetyLevel: 'safe' | 'caution' | 'dangerous'
  stability: 'high' | 'medium' | 'low'
  formation: 'common' | 'rare' | 'synthetic'
}

export interface CompoundRule {
  elements: string[]
  compounds: PossibleCompound[]
  ratios?: { [formula: string]: number[] } // element ratios for specific compounds
}

// Comprehensive compound database
const COMPOUND_DATABASE: CompoundRule[] = [
  // Hydrogen compounds
  {
    elements: ['H', 'O'],
    compounds: [
      {
        name: 'Water',
        formula: 'H₂O',
        state: 'liquid',
        description: 'Essential for life, universal solvent',
        color: '#E3F2FD',
        commonUse: 'Drinking, industrial processes',
        safetyLevel: 'safe',
        stability: 'high',
        formation: 'common'
      },
      {
        name: 'Hydrogen Peroxide',
        formula: 'H₂O₂',
        state: 'liquid',
        description: 'Strong oxidizing agent, antiseptic',
        color: '#BBDEFB',
        commonUse: 'Disinfectant, bleaching agent',
        safetyLevel: 'caution',
        stability: 'medium',
        formation: 'common'
      }
    ],
    ratios: {
      'H₂O': [2, 1], // 2 H : 1 O
      'H₂O₂': [2, 2] // 2 H : 2 O
    }
  },
  
  // Nitrogen-Oxygen compounds
  {
    elements: ['N', 'O'],
    compounds: [
      {
        name: 'Nitric Oxide',
        formula: 'NO',
        state: 'gas',
        description: 'Colorless gas, biological messenger',
        color: '#F3E5F5',
        commonUse: 'Medical applications, industrial processes',
        safetyLevel: 'caution',
        stability: 'medium',
        formation: 'common'
      },
      {
        name: 'Nitrogen Dioxide',
        formula: 'NO₂',
        state: 'gas',
        description: 'Reddish-brown toxic gas, air pollutant',
        color: '#FFCDD2',
        commonUse: 'Nitric acid production',
        safetyLevel: 'dangerous',
        stability: 'medium',
        formation: 'common'
      },
      {
        name: 'Dinitrogen Monoxide',
        formula: 'N₂O',
        state: 'gas',
        description: 'Laughing gas, anesthetic',
        color: '#E8F5E8',
        commonUse: 'Medical anesthesia, food industry',
        safetyLevel: 'caution',
        stability: 'high',
        formation: 'common'
      },
      {
        name: 'Dinitrogen Trioxide',
        formula: 'N₂O₃',
        state: 'liquid',
        description: 'Blue liquid at low temperature',
        color: '#E1F5FE',
        commonUse: 'Chemical intermediate',
        safetyLevel: 'dangerous',
        stability: 'low',
        formation: 'rare'
      },
      {
        name: 'Dinitrogen Tetroxide',
        formula: 'N₂O₄',
        state: 'liquid',
        description: 'Colorless liquid, rocket fuel oxidizer',
        color: '#FFF3E0',
        commonUse: 'Rocket propellant',
        safetyLevel: 'dangerous',
        stability: 'medium',
        formation: 'synthetic'
      },
      {
        name: 'Dinitrogen Pentoxide',
        formula: 'N₂O₅',
        state: 'solid',
        description: 'White crystalline solid, strong oxidizer',
        color: '#F8F9FA',
        commonUse: 'Nitric acid anhydride',
        safetyLevel: 'dangerous',
        stability: 'low',
        formation: 'synthetic'
      }
    ],
    ratios: {
      'NO': [1, 1],     // 1 N : 1 O
      'NO₂': [1, 2],    // 1 N : 2 O
      'N₂O': [2, 1],    // 2 N : 1 O
      'N₂O₃': [2, 3],   // 2 N : 3 O
      'N₂O₄': [2, 4],   // 2 N : 4 O
      'N₂O₅': [2, 5]    // 2 N : 5 O
    }
  },

  // Carbon-Oxygen compounds
  {
    elements: ['C', 'O'],
    compounds: [
      {
        name: 'Carbon Monoxide',
        formula: 'CO',
        state: 'gas',
        description: 'Toxic, colorless, odorless gas',
        color: '#FFCDD2',
        commonUse: 'Industrial reducing agent',
        safetyLevel: 'dangerous',
        stability: 'medium',
        formation: 'common'
      },
      {
        name: 'Carbon Dioxide',
        formula: 'CO₂',
        state: 'gas',
        description: 'Greenhouse gas, product of respiration',
        color: '#E8F5E8',
        commonUse: 'Fire extinguishers, carbonation',
        safetyLevel: 'caution',
        stability: 'high',
        formation: 'common'
      }
    ],
    ratios: {
      'CO': [1, 1],   // 1 C : 1 O
      'CO₂': [1, 2]   // 1 C : 2 O
    }
  },

  // Hydrogen-Nitrogen compounds
  {
    elements: ['H', 'N'],
    compounds: [
      {
        name: 'Ammonia',
        formula: 'NH₃',
        state: 'gas',
        description: 'Alkaline gas, essential for life',
        color: '#F3E5F5',
        commonUse: 'Fertilizer, cleaning products',
        safetyLevel: 'caution',
        stability: 'high',
        formation: 'common'
      },
      {
        name: 'Hydrazine',
        formula: 'N₂H₄',
        state: 'liquid',
        description: 'Rocket fuel, highly toxic',
        color: '#FFF3E0',
        commonUse: 'Rocket propellant, chemical synthesis',
        safetyLevel: 'dangerous',
        stability: 'medium',
        formation: 'synthetic'
      }
    ],
    ratios: {
      'NH₃': [3, 1],  // 3 H : 1 N
      'N₂H₄': [4, 2]  // 4 H : 2 N
    }
  },

  // Hydrogen-Carbon compounds
  {
    elements: ['H', 'C'],
    compounds: [
      {
        name: 'Methane',
        formula: 'CH₄',
        state: 'gas',
        description: 'Simplest hydrocarbon, natural gas',
        color: '#E1F5FE',
        commonUse: 'Fuel, heating',
        safetyLevel: 'caution',
        stability: 'high',
        formation: 'common'
      },
      {
        name: 'Ethane',
        formula: 'C₂H₆',
        state: 'gas',
        description: 'Two-carbon alkane',
        color: '#E1F5FE',
        commonUse: 'Petrochemical feedstock',
        safetyLevel: 'caution',
        stability: 'high',
        formation: 'common'
      },
      {
        name: 'Acetylene',
        formula: 'C₂H₂',
        state: 'gas',
        description: 'Highly reactive, welding gas',
        color: '#FFF3E0',
        commonUse: 'Welding, chemical synthesis',
        safetyLevel: 'dangerous',
        stability: 'low',
        formation: 'synthetic'
      }
    ],
    ratios: {
      'CH₄': [4, 1],   // 4 H : 1 C
      'C₂H₆': [6, 2],  // 6 H : 2 C
      'C₂H₂': [2, 2]   // 2 H : 2 C
    }
  },

  // Sodium compounds
  {
    elements: ['Na', 'Cl'],
    compounds: [
      {
        name: 'Sodium Chloride',
        formula: 'NaCl',
        state: 'solid',
        description: 'Table salt, essential for life',
        color: '#F8F9FA',
        commonUse: 'Food seasoning, chemical processes',
        safetyLevel: 'safe',
        stability: 'high',
        formation: 'common'
      }
    ],
    ratios: {
      'NaCl': [1, 1]  // 1 Na : 1 Cl
    }
  },

  {
    elements: ['Na', 'O', 'H'],
    compounds: [
      {
        name: 'Sodium Hydroxide',
        formula: 'NaOH',
        state: 'solid',
        description: 'Strong base, caustic soda',
        color: '#F3E5F5',
        commonUse: 'Soap making, drain cleaner',
        safetyLevel: 'dangerous',
        stability: 'high',
        formation: 'common'
      }
    ],
    ratios: {
      'NaOH': [1, 1, 1]  // 1 Na : 1 O : 1 H
    }
  },

  // Sulfur compounds
  {
    elements: ['S', 'O'],
    compounds: [
      {
        name: 'Sulfur Dioxide',
        formula: 'SO₂',
        state: 'gas',
        description: 'Acid rain precursor, preservative',
        color: '#FFF3E0',
        commonUse: 'Food preservation, chemical processes',
        safetyLevel: 'caution',
        stability: 'high',
        formation: 'common'
      },
      {
        name: 'Sulfur Trioxide',
        formula: 'SO₃',
        state: 'gas',
        description: 'Forms sulfuric acid in water',
        color: '#FFCDD2',
        commonUse: 'Sulfuric acid production',
        safetyLevel: 'dangerous',
        stability: 'medium',
        formation: 'synthetic'
      }
    ],
    ratios: {
      'SO₂': [1, 2],  // 1 S : 2 O
      'SO₃': [1, 3]   // 1 S : 3 O
    }
  },

  // Iron compounds
  {
    elements: ['Fe', 'O'],
    compounds: [
      {
        name: 'Iron(II) Oxide',
        formula: 'FeO',
        state: 'solid',
        description: 'Black iron oxide, wüstite',
        color: '#424242',
        commonUse: 'Metallurgy, ceramics',
        safetyLevel: 'safe',
        stability: 'medium',
        formation: 'common'
      },
      {
        name: 'Iron(III) Oxide',
        formula: 'Fe₂O₃',
        state: 'solid',
        description: 'Rust, red iron oxide',
        color: '#D84315',
        commonUse: 'Pigments, catalysts',
        safetyLevel: 'safe',
        stability: 'high',
        formation: 'common'
      }
    ],
    ratios: {
      'FeO': [1, 1],   // 1 Fe : 1 O
      'Fe₂O₃': [2, 3]  // 2 Fe : 3 O
    }
  }
]

/**
 * Calculate element counts from ElementSpec array
 */
export function calculateElementCounts(elements: ElementSpec[]): { [element: string]: number } {
  const counts: { [element: string]: number } = {}
  
  elements.forEach(spec => {
    counts[spec.element] = (counts[spec.element] || 0) + spec.molecules
  })
  
  return counts
}

/**
 * Check if given element counts match a compound ratio
 */
function matchesRatio(elementCounts: { [element: string]: number }, ratio: number[], elements: string[]): boolean {
  if (Object.keys(elementCounts).length !== elements.length) return false
  
  // Check if all required elements are present
  for (const element of elements) {
    if (!elementCounts[element]) return false
  }
  
  // Calculate the greatest common divisor to normalize ratios
  const actualRatios = elements.map(element => elementCounts[element])
  const gcd = findGCD(actualRatios)
  const normalizedActual = actualRatios.map(r => r / gcd)
  
  // Compare normalized ratios
  return normalizedActual.every((actualRatio, index) => actualRatio === ratio[index])
}

/**
 * Find greatest common divisor of an array of numbers
 */
function findGCD(numbers: number[]): number {
  return numbers.reduce((a, b) => {
    while (b !== 0) {
      const temp = b
      b = a % b
      a = temp
    }
    return a
  })
}

/**
 * Generate all possible compounds for given elements
 */
export function generatePossibleCompounds(elements: ElementSpec[]): PossibleCompound[] {
  if (!elements || elements.length === 0) return []
  
  const elementCounts = calculateElementCounts(elements)
  const elementSymbols = Object.keys(elementCounts)
  const compounds: PossibleCompound[] = []
  
  console.log('Generating compounds for elements:', elementCounts)
  
  // Find matching compound rules
  for (const rule of COMPOUND_DATABASE) {
    // Check if current elements are a subset of rule elements
    const hasAllElements = rule.elements.every(element => elementSymbols.includes(element))
    const onlyRuleElements = elementSymbols.every(element => rule.elements.includes(element))
    
    if (hasAllElements && onlyRuleElements) {
      // Check each compound in the rule
      for (const compound of rule.compounds) {
        // If specific ratios are defined, check them
        if (rule.ratios && rule.ratios[compound.formula]) {
          const requiredRatio = rule.ratios[compound.formula]
          if (matchesRatio(elementCounts, requiredRatio, rule.elements)) {
            compounds.push(compound)
          }
        } else {
          // If no specific ratios, include all compounds from this rule
          compounds.push(compound)
        }
      }
    }
  }
  
  // Sort by stability and formation likelihood
  compounds.sort((a, b) => {
    const stabilityWeight = { high: 3, medium: 2, low: 1 }
    const formationWeight = { common: 3, synthetic: 2, rare: 1 }
    
    const scoreA = stabilityWeight[a.stability] + formationWeight[a.formation]
    const scoreB = stabilityWeight[b.stability] + formationWeight[b.formation]
    
    return scoreB - scoreA
  })
  
  return compounds
}

/**
 * Get compound by formula
 */
export function getCompoundByFormula(formula: string): PossibleCompound | null {
  for (const rule of COMPOUND_DATABASE) {
    const compound = rule.compounds.find(c => c.formula === formula)
    if (compound) return compound
  }
  return null
}

/**
 * Suggest most likely compound for given elements
 */
export function suggestMostLikelyCompound(elements: ElementSpec[]): PossibleCompound | null {
  const compounds = generatePossibleCompounds(elements)
  return compounds.length > 0 ? compounds[0] : null
}
