// Chemistry-related type definitions

export interface ElementSpec {
  element: string
  molecules: number
  weight: number
}

export interface ReactionResult {
  compoundName: string
  chemicalFormula: string
  color: string
  state: string
  safetyWarnings: string[]
  explanation: string
  reactionEquation?: string
  temperature?: number
  pressure?: number
}

export interface ElementData {
  symbol: string
  name: string
  atomicNumber: number
  color: string
  safetyLevel: 'safe' | 'caution' | 'dangerous'
}

export interface ChemicalReactionParams {
  elements: ElementSpec[]
  mode: 'play' | 'practical'
  temperature?: number
  pressure?: number
  volume?: number
  weight?: number
}
