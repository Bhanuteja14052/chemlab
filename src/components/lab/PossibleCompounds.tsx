'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChevronRight, FlaskConical, Atom, RefreshCw, AlertCircle } from 'lucide-react'
import { formatStateDisplay, getStateColor } from '@/utils/stateOfMatter'
import { generatePossibleCompounds, PossibleCompound } from '@/utils/compoundPrediction'
import { ElementSpec } from '@/types/chemistry'

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
  const [compounds, setCompounds] = useState<PossibleCompound[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Generate compounds when elements change
  useEffect(() => {
    if (selectedElements.length === 0) {
      setCompounds([])
      return
    }

    console.log('Elements changed, generating compounds for:', selectedElements)
    generateCompounds()
  }, [selectedElements])

  const generateCompounds = async () => {
    setLoading(true)
    setError(null)

    try {
      // Convert string elements to ElementSpec format
      const elementSpecs: ElementSpec[] = selectedElements.map(element => ({
        element,
        molecules: 1,
        weight: 1
      }))

      // Try AI-powered compound generation first
      let possibleCompounds: PossibleCompound[] = []
      
      try {
        const response = await fetch('/api/possible-compounds', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ elements: elementSpecs })
        })

        if (response.ok) {
          const data = await response.json()
          possibleCompounds = data.compounds || []
        }
      } catch (apiError) {
        console.warn('API call failed, using local generation:', apiError)
      }

      // Fallback to local generation if API fails
      if (possibleCompounds.length === 0) {
        possibleCompounds = generatePossibleCompounds(elementSpecs)
      }

      console.log('Generated compounds:', possibleCompounds)
      setCompounds(possibleCompounds)

      if (possibleCompounds.length === 0) {
        setError('No stable compounds found for this combination of elements.')
      }
    } catch (err) {
      console.error('Error generating compounds:', err)
      setError('Failed to generate possible compounds.')
      setCompounds([])
    } finally {
      setLoading(false)
    }
  }

  const handleCompoundClick = (compound: PossibleCompound) => {
    console.log('Compound selected:', compound)
    onCompoundSelect(compound)
  }

  const getStabilityColor = (stability: string) => {
    switch (stability) {
      case 'high': return 'text-green-600 bg-green-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getSafetyColor = (safety: string) => {
    switch (safety) {
      case 'safe': return 'text-green-600 bg-green-100'
      case 'caution': return 'text-yellow-600 bg-yellow-100'
      case 'dangerous': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getFormationIcon = (formation: string) => {
    switch (formation) {
      case 'common': return '⭐'
      case 'synthetic': return '🧪'
      case 'rare': return '💎'
      default: return '🔬'
    }
  }

  if (selectedElements.length === 0) {
    return (
      <div className={`bg-white rounded-lg border p-4 ${className}`}>
        <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
          <FlaskConical className="h-4 w-4 mr-2" />
          Possible Compounds
        </h3>
        <div className="text-center py-8">
          <Atom className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">
            Add elements to see possible compounds
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg border p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900 flex items-center">
          <FlaskConical className="h-4 w-4 mr-2" />
          Possible Compounds
        </h3>
        <button
          onClick={generateCompounds}
          disabled={loading}
          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          title="Refresh compounds"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading && (
        <div className="text-center py-4">
          <div className="animate-spin inline-block w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full"></div>
          <p className="text-sm text-gray-500 mt-2">Analyzing compounds...</p>
        </div>
      )}

      {error && (
        <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg mb-3">
          <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {!loading && compounds.length > 0 && (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {compounds.map((compound, index) => (
            <motion.div
              key={`${compound.formula}-${index}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group"
              onClick={() => handleCompoundClick(compound)}
              style={{ backgroundColor: compound.color + '20' }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center mb-1">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {compound.name}
                    </h4>
                    <span className="ml-2 text-xs text-gray-500">
                      {getFormationIcon(compound.formation)}
                    </span>
                  </div>
                  
                  <p className="text-lg font-mono text-purple-600 mb-2">
                    {compound.formula}
                  </p>
                  
                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                    {compound.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStabilityColor(compound.stability)}`}>
                        {compound.stability}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSafetyColor(compound.safetyLevel)}`}>
                        {compound.safetyLevel}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-xs text-gray-500">
                      <span className="mr-1">{formatStateDisplay(compound.state)}</span>
                      <span className="capitalize">{compound.state}</span>
                    </div>
                  </div>
                </div>
                
                <ChevronRight className="h-4 w-4 text-gray-400 ml-2 group-hover:text-gray-600 transition-colors" />
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && compounds.length === 0 && selectedElements.length > 0 && !error && (
        <div className="text-center py-6">
          <FlaskConical className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">
            No compounds found for this combination
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Try different elements or quantities
          </p>
        </div>
      )}
    </div>
  )
}

export default PossibleCompounds
