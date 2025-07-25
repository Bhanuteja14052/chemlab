'use client'

// State of matter configuration with proper emoji and text mapping
export interface StateOfMatter {
  solid: {
    emoji: '🧊'
    text: 'Solid'
    symbol: '(s)'
    color: '#64748b'
    description: 'Particles are tightly packed in a rigid structure'
  }
  liquid: {
    emoji: '💧'
    text: 'Liquid'
    symbol: '(l)'
    color: '#3b82f6'
    description: 'Particles flow freely but stay together'
  }
  gas: {
    emoji: '💨'
    text: 'Gas'
    symbol: '(g)'
    color: '#10b981'
    description: 'Particles move freely in all directions'
  }
  aqueous: {
    emoji: '🌊'
    text: 'Aqueous'
    symbol: '(aq)'
    color: '#06b6d4'
    description: 'Dissolved in water solution'
  }
  plasma: {
    emoji: '⚡'
    text: 'Plasma'
    symbol: '(plasma)'
    color: '#8b5cf6'
    description: 'Ionized gas with free electrons'
  }
}

export const STATES_OF_MATTER: StateOfMatter = {
  solid: {
    emoji: '🧊',
    text: 'Solid',
    symbol: '(s)',
    color: '#64748b',
    description: 'Particles are tightly packed in a rigid structure'
  },
  liquid: {
    emoji: '💧',
    text: 'Liquid',
    symbol: '(l)',
    color: '#3b82f6',
    description: 'Particles flow freely but stay together'
  },
  gas: {
    emoji: '💨',
    text: 'Gas',
    symbol: '(g)',
    color: '#10b981',
    description: 'Particles move freely in all directions'
  },
  aqueous: {
    emoji: '🌊',
    text: 'Aqueous',
    symbol: '(aq)',
    color: '#06b6d4',
    description: 'Dissolved in water solution'
  },
  plasma: {
    emoji: '⚡',
    text: 'Plasma',
    symbol: '(plasma)',
    color: '#8b5cf6',
    description: 'Ionized gas with free electrons'
  }
}

/**
 * Get state of matter information from state string
 */
export function getStateOfMatter(state: string): StateOfMatter[keyof StateOfMatter] {
  const normalizedState = state.toLowerCase().trim()
  
  switch (normalizedState) {
    case 'solid':
    case 's':
    case '(s)':
      return STATES_OF_MATTER.solid
    
    case 'liquid':
    case 'l':
    case '(l)':
      return STATES_OF_MATTER.liquid
    
    case 'gas':
    case 'gaseous':
    case 'g':
    case '(g)':
      return STATES_OF_MATTER.gas
    
    case 'aqueous':
    case 'aq':
    case '(aq)':
      return STATES_OF_MATTER.aqueous
    
    case 'plasma':
    case '(plasma)':
      return STATES_OF_MATTER.plasma
    
    default:
      return STATES_OF_MATTER.liquid // Default fallback
  }
}

/**
 * Format state display with emoji and text
 */
export function formatStateDisplay(state: string, format: 'full' | 'emoji' | 'text' | 'symbol' = 'full'): string {
  const stateInfo = getStateOfMatter(state)
  
  switch (format) {
    case 'emoji':
      return stateInfo.emoji
    case 'text':
      return stateInfo.text
    case 'symbol':
      return stateInfo.symbol
    case 'full':
    default:
      return `${stateInfo.emoji} ${stateInfo.text} ${stateInfo.symbol}`
  }
}

/**
 * Get state color for styling
 */
export function getStateColor(state: string): string {
  return getStateOfMatter(state).color
}

/**
 * Check if state is valid
 */
export function isValidState(state: string): boolean {
  const normalizedState = state.toLowerCase().trim()
  return ['solid', 's', '(s)', 'liquid', 'l', '(l)', 'gas', 'gaseous', 'g', '(g)', 'aqueous', 'aq', '(aq)', 'plasma', '(plasma)'].includes(normalizedState)
}
