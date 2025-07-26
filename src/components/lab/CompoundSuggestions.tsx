'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FlaskConical, ChevronRight, Info } from 'lucide-react'

interface ElementSpec {
  element: string
  molecules: number
  weight: number
}

interface SimpleCompound {
  name: string
  formula: string
  description: string
  commonality: 'Common' | 'Uncommon' | 'Rare'
  state: 'solid' | 'liquid' | 'gas' | 'aqueous'
  color: string
}

interface CompoundSuggestionsProps {
  selectedElements: ElementSpec[]
  onCompoundClick: (compound: SimpleCompound) => void
  className?: string
}

const CompoundSuggestions: React.FC<CompoundSuggestionsProps> = ({
  selectedElements,
  onCompoundClick,
  className = ''
}) => {
  const [suggestions, setSuggestions] = useState<SimpleCompound[]>([])

  // Simple compound database with only basic, well-known compounds
  const SIMPLE_COMPOUNDS: { elements: string[], compounds: SimpleCompound[] }[] = [
    {
      elements: ['H', 'O'],
      compounds: [
        {
          name: 'Water',
          formula: 'H₂O',
          description: 'Essential for life, universal solvent',
          commonality: 'Common',
          state: 'liquid',
          color: '#4FC3F7'
        },
        {
          name: 'Hydrogen Peroxide',
          formula: 'H₂O₂',
          description: 'Antiseptic and bleaching agent',
          commonality: 'Common',
          state: 'liquid',
          color: '#E3F2FD'
        }
      ]
    },
    {
      elements: ['N', 'H'],
      compounds: [
        {
          name: 'Ammonia',
          formula: 'NH₃',
          description: 'Used in fertilizers and cleaning',
          commonality: 'Common',
          state: 'gas',
          color: '#F3E5F5'
        }
      ]
    },
    {
      elements: ['C', 'O'],
      compounds: [
        {
          name: 'Carbon Monoxide',
          formula: 'CO',
          description: 'Toxic gas, incomplete combustion product',
          commonality: 'Common',
          state: 'gas',
          color: '#FFCDD2'
        },
        {
          name: 'Carbon Dioxide',
          formula: 'CO₂',
          description: 'Greenhouse gas, respiration product',
          commonality: 'Common',
          state: 'gas',
          color: '#E8F5E8'
        }
      ]
    },
    {
      elements: ['Na', 'Cl'],
      compounds: [
        {
          name: 'Sodium Chloride',
          formula: 'NaCl',
          description: 'Table salt, essential electrolyte',
          commonality: 'Common',
          state: 'solid',
          color: '#FFFFFF'
        }
      ]
    },
    {
      elements: ['C', 'H'],
      compounds: [
        {
          name: 'Methane',
          formula: 'CH₄',
          description: 'Natural gas, greenhouse gas',
          commonality: 'Common',
          state: 'gas',
          color: '#E8F5E8'
        }
      ]
    },
    {
      elements: ['N', 'O'],
      compounds: [
        {
          name: 'Nitric Oxide',
          formula: 'NO',
          description: 'Signaling molecule, air pollutant',
          commonality: 'Uncommon',
          state: 'gas',
          color: '#FFF3E0'
        },
        {
          name: 'Nitrogen Dioxide',
          formula: 'NO₂',
          description: 'Brown gas, air pollutant',
          commonality: 'Common',
          state: 'gas',
          color: '#FFE0B2'
        }
      ]
    },
    {
      elements: ['S', 'O'],
      compounds: [
        {
          name: 'Sulfur Dioxide',
          formula: 'SO₂',
          description: 'Acid rain precursor',
          commonality: 'Common',
          state: 'gas',
          color: '#FFECB3'
        }
      ]
    },
    {
      elements: ['Ca', 'O'],
      compounds: [
        {
          name: 'Calcium Oxide',
          formula: 'CaO',
          description: 'Quicklime, used in cement',
          commonality: 'Common',
          state: 'solid',
          color: '#F5F5F5'
        }
      ]
    }
  ]

  useEffect(() => {
    if (selectedElements.length === 0) {
      setSuggestions([])
      return
    }

    // Get unique element symbols from selected elements
    const elementSymbols = [...new Set(selectedElements.map(el => el.element))]
    
    // Find compounds that can be made with these elements
    const possibleCompounds: SimpleCompound[] = []

    SIMPLE_COMPOUNDS.forEach(entry => {
      // Check if all required elements for this compound are available
      const canMakeCompound = entry.elements.every(requiredElement => 
        elementSymbols.includes(requiredElement)
      )
      
      // Also check that we only use elements that are selected (no extra elements)
      const onlyUsesSelectedElements = entry.elements.every(element =>
        elementSymbols.includes(element)
      ) && elementSymbols.every(element =>
        entry.elements.includes(element)
      )

      if (canMakeCompound && onlyUsesSelectedElements) {
        possibleCompounds.push(...entry.compounds)
      }
    })

    // Sort by commonality (Common first, then Uncommon, then Rare)
    const sortedCompounds = possibleCompounds.sort((a, b) => {
      const order = { 'Common': 0, 'Uncommon': 1, 'Rare': 2 }
      return order[a.commonality] - order[b.commonality]
    })

    setSuggestions(sortedCompounds)
  }, [selectedElements])

  const getStateEmoji = (state: string) => {
    switch (state) {
      case 'solid': return '🧊'
      case 'liquid': return '💧'
      case 'gas': return '💨'
      case 'aqueous': return '🌊'
      default: return '⚗️'
    }
  }

  const getCommonalityColor = (commonality: string) => {
    switch (commonality) {
      case 'Common': return 'text-green-600 bg-green-100'
      case 'Uncommon': return 'text-yellow-600 bg-yellow-100'
      case 'Rare': return 'text-orange-600 bg-orange-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  if (selectedElements.length === 0) {
    return (
      <div className={`bg-white rounded-lg border p-4 ${className}`}>
        <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
          <FlaskConical className="h-4 w-4 mr-2" />
          Compound Suggestions
        </h3>
        <div className="text-center py-6">
          <FlaskConical className="h-8 w-8 text-gray-400 mx-auto mb-2" />
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
        Compound Suggestions
      </h3>

      {suggestions.length === 0 ? (
        <div className="text-center py-4">
          <Info className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">
            No common compounds found for this combination
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Try adding different elements
          </p>
        </div>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {suggestions.map((compound, index) => (
            <motion.div
              key={`${compound.formula}-${index}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-all group hover:shadow-sm"
              onClick={() => onCompoundClick(compound)}
              style={{ backgroundColor: compound.color + '15' }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center mb-1">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {compound.name}
                    </h4>
                    <span className="ml-2 text-lg">
                      {getStateEmoji(compound.state)}
                    </span>
                  </div>
                  
                  <p className="text-lg font-mono text-purple-600 mb-2">
                    {compound.formula}
                  </p>
                  
                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                    {compound.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCommonalityColor(compound.commonality)}`}>
                      {compound.commonality}
                    </span>
                    
                    <span className="text-xs text-gray-500 capitalize">
                      {compound.state}
                    </span>
                  </div>
                </div>
                
                <ChevronRight className="h-4 w-4 text-gray-400 ml-2 group-hover:text-gray-600 transition-colors" />
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500 text-center">
            Click a compound to explore its structure
          </p>
        </div>
      )}
    </div>
  )
}

export default CompoundSuggestions
