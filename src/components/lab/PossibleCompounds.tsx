'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ChevronRight, FlaskConical, Atom } from 'lucide-react'
import { formatStateDisplay, getStateColor } from '@/utils/stateOfMatter'

interface PossibleCompound {
  name: string
  formula: string
  state: string
  description: string
  color: string
  commonUse?: string
  safetyLevel?: 'safe' | 'caution' | 'dangerous'
}

interface PossibleCompoundsProps {
  selectedElements: string[]
  onCompoundSelect: (compound: PossibleCompound) => void
  className?: string
}

const PossibleCompounds: React.FC<PossibleCompoundsProps> = ({
  selectedElements,
  onCompoundSelect,
  className = ''
}) => {
  // Generate possible compounds based on selected elements
  const generatePossibleCompounds = (elements: string[]): PossibleCompound[] => {
    if (elements.length === 0) return []
    
    const elementSet = new Set(elements.map(e => e.toUpperCase()))
    const compounds: PossibleCompound[] = []
    
    // Hydrogen combinations
    if (elementSet.has('H')) {
      if (elementSet.has('O')) {
        compounds.push({
          name: 'Water',
          formula: 'H₂O',
          state: 'liquid',
          description: 'Essential for life, universal solvent',
          color: '#e3f2fd',
          commonUse: 'Drinking, industrial processes',
          safetyLevel: 'safe'
        })
        
        compounds.push({
          name: 'Hydrogen Peroxide',
          formula: 'H₂O₂',
          state: 'liquid',
          description: 'Strong oxidizing agent, antiseptic',
          color: '#bbdefb',
          commonUse: 'Disinfectant, bleaching agent',
          safetyLevel: 'caution'
        })
      }
      
      if (elementSet.has('CL')) {
        compounds.push({
          name: 'Hydrochloric Acid',
          formula: 'HCl',
          state: 'aqueous',
          description: 'Strong acid, widely used in industry',
          color: '#ffecb3',
          commonUse: 'Steel production, food processing',
          safetyLevel: 'dangerous'
        })
      }
      
      if (elementSet.has('N')) {
        compounds.push({
          name: 'Ammonia',
          formula: 'NH₃',
          state: 'gas',
          description: 'Alkaline gas, converts to NH₄OH in water',
          color: '#f3e5f5',
          commonUse: 'Fertilizer, cleaning products',
          safetyLevel: 'caution'
        })
      }
      
      if (elementSet.has('S')) {
        compounds.push({
          name: 'Hydrogen Sulfide',
          formula: 'H₂S',
          state: 'gas',
          description: 'Toxic gas with rotten egg smell',
          color: '#fff3e0',
          commonUse: 'Industrial processes (handle with care)',
          safetyLevel: 'dangerous'
        })
      }
    }
    
    // Carbon combinations
    if (elementSet.has('C')) {
      if (elementSet.has('O')) {
        compounds.push({
          name: 'Carbon Monoxide',
          formula: 'CO',
          state: 'gas',
          description: 'Toxic, colorless gas',
          color: '#ffcdd2',
          commonUse: 'Industrial reducing agent',
          safetyLevel: 'dangerous'
        })
        
        compounds.push({
          name: 'Carbon Dioxide',
          formula: 'CO₂',
          state: 'gas',
          description: 'Greenhouse gas, product of respiration',
          color: '#e8f5e8',
          commonUse: 'Fire extinguishers, carbonation',
          safetyLevel: 'caution'
        })
      }
      
      if (elementSet.has('H')) {
        compounds.push({
          name: 'Methane',
          formula: 'CH₄',
          state: 'gas',
          description: 'Simplest hydrocarbon, natural gas',
          color: '#e1f5fe',
          commonUse: 'Fuel, heating',
          safetyLevel: 'caution'
        })
        
        if (elementSet.has('O')) {
          compounds.push({
            name: 'Methanol',
            formula: 'CH₃OH',
            state: 'liquid',
            description: 'Simplest alcohol, wood alcohol',
            color: '#f1f8e9',
            commonUse: 'Solvent, fuel additive',
            safetyLevel: 'dangerous'
          })
        }
      }
    }
    
    // Sodium combinations
    if (elementSet.has('NA')) {
      if (elementSet.has('CL')) {
        compounds.push({
          name: 'Sodium Chloride',
          formula: 'NaCl',
          state: 'solid',
          description: 'Table salt, essential for life',
          color: '#fafafa',
          commonUse: 'Food seasoning, preservation',
          safetyLevel: 'safe'
        })
      }
      
      if (elementSet.has('O') && elementSet.has('H')) {
        compounds.push({
          name: 'Sodium Hydroxide',
          formula: 'NaOH',
          state: 'solid',
          description: 'Strong base, caustic soda',
          color: '#fff8e1',
          commonUse: 'Soap making, drain cleaner',
          safetyLevel: 'dangerous'
        })
      }
    }
    
    // Calcium combinations
    if (elementSet.has('CA')) {
      if (elementSet.has('O')) {
        compounds.push({
          name: 'Calcium Oxide',
          formula: 'CaO',
          state: 'solid',
          description: 'Quicklime, used in construction',
          color: '#f5f5f5',
          commonUse: 'Cement, mortar',
          safetyLevel: 'caution'
        })
      }
      
      if (elementSet.has('CL')) {
        compounds.push({
          name: 'Calcium Chloride',
          formula: 'CaCl₂',
          state: 'solid',
          description: 'Hygroscopic salt, de-icer',
          color: '#f8f9fa',
          commonUse: 'Road de-icing, drying agent',
          safetyLevel: 'caution'
        })
      }
    }
    
    // Iron combinations
    if (elementSet.has('FE')) {
      if (elementSet.has('O')) {
        compounds.push({
          name: 'Iron Oxide',
          formula: 'Fe₂O₃',
          state: 'solid',
          description: 'Rust, reddish-brown compound',
          color: '#d32f2f',
          commonUse: 'Pigments, polishing compounds',
          safetyLevel: 'safe'
        })
      }
    }
    
    // Limit to 6 most relevant compounds
    return compounds.slice(0, 6)
  }
  
  const possibleCompounds = generatePossibleCompounds(selectedElements)
  
  const getSafetyColor = (level?: string) => {
    switch (level) {
      case 'safe': return 'text-green-600 bg-green-50'
      case 'caution': return 'text-yellow-600 bg-yellow-50'
      case 'dangerous': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }
  
  if (possibleCompounds.length === 0) {
    return (
      <div className={`bg-white rounded-lg border p-4 ${className}`}>
        <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
          <FlaskConical className="h-4 w-4 mr-2" />
          Possible Compounds
        </h3>
        <div className="text-center py-8">
          <Atom className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">
            Select elements to see possible compounds
          </p>
        </div>
      </div>
    )
  }
  
  return (
    <div className={`bg-white rounded-lg border p-4 ${className}`}>
      <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
        <FlaskConical className="h-4 w-4 mr-2" />
        Possible Compounds
      </h3>
      
      <div className="space-y-2">
        {possibleCompounds.map((compound, index) => (
          <motion.button
            key={`${compound.formula}-${index}`}
            onClick={() => onCompoundSelect(compound)}
            className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-medium text-gray-900 text-sm">
                    {compound.name}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                    {compound.formula}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2 mb-1">
                  <span 
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: getStateColor(compound.state), color: 'white' }}
                  >
                    {formatStateDisplay(compound.state, 'emoji')} {formatStateDisplay(compound.state, 'text')}
                  </span>
                  
                  {compound.safetyLevel && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getSafetyColor(compound.safetyLevel)}`}>
                      {compound.safetyLevel}
                    </span>
                  )}
                </div>
                
                <p className="text-xs text-gray-600 line-clamp-2">
                  {compound.description}
                </p>
                
                {compound.commonUse && (
                  <p className="text-xs text-gray-500 mt-1 italic">
                    Uses: {compound.commonUse}
                  </p>
                )}
              </div>
              
              <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors flex-shrink-0 ml-2" />
            </div>
          </motion.button>
        ))}
      </div>
      
      {possibleCompounds.length > 0 && (
        <div className="mt-3 text-xs text-gray-500 text-center">
          Click any compound to analyze its structure
        </div>
      )}
    </div>
  )
}

export default PossibleCompounds
