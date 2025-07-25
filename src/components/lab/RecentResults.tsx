'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { History, RotateCcw, Trash2 } from 'lucide-react'
import { formatStateDisplay, getStateColor } from '@/utils/stateOfMatter'

interface ReactionResult {
  compoundName: string
  chemicalFormula: string
  color: string
  state: string
  safetyWarnings: string[]
  explanation: string
  reactionEquation?: string
  temperature?: number
  pressure?: number
  timestamp?: number
}

interface RecentResultsProps {
  results: ReactionResult[]
  onResultSelect: (result: ReactionResult) => void
  onClearHistory?: () => void
  className?: string
}

const RecentResults: React.FC<RecentResultsProps> = ({
  results,
  onResultSelect,
  onClearHistory,
  className = ''
}) => {
  // Limit to 3 most recent results
  const recentResults = results.slice(0, 3)
  
  const formatTimeAgo = (timestamp?: number) => {
    if (!timestamp) return 'Just now'
    
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return 'Earlier'
  }
  
  const truncateText = (text: string, maxLength: number = 60) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }
  
  if (recentResults.length === 0) {
    return (
      <div className={`bg-white rounded-lg border p-4 ${className}`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-900 flex items-center">
            <History className="h-4 w-4 mr-2" />
            Recent Results
          </h3>
        </div>
        <div className="text-center py-8">
          <History className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">
            No recent experiments
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Run an experiment to see results here
          </p>
        </div>
      </div>
    )
  }
  
  return (
    <div className={`bg-white rounded-lg border p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900 flex items-center">
          <History className="h-4 w-4 mr-2" />
          Recent Results
        </h3>
        
        {recentResults.length > 0 && onClearHistory && (
          <button
            onClick={onClearHistory}
            className="text-xs text-gray-500 hover:text-red-500 flex items-center transition-colors"
            title="Clear history"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Clear
          </button>
        )}
      </div>
      
      <div className="space-y-2">
        {recentResults.map((result, index) => (
          <motion.button
            key={`${result.chemicalFormula}-${index}`}
            onClick={() => onResultSelect(result)}
            className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-medium text-gray-900 text-sm">
                    {result.compoundName}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                    {result.chemicalFormula}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2 mb-1">
                  <span 
                    className="text-xs px-2 py-0.5 rounded-full text-white"
                    style={{ backgroundColor: getStateColor(result.state) }}
                  >
                    {formatStateDisplay(result.state, 'emoji')} {formatStateDisplay(result.state, 'text')}
                  </span>
                  
                  <span className="text-xs text-gray-500">
                    {formatTimeAgo(result.timestamp)}
                  </span>
                </div>
                
                <p className="text-xs text-gray-600 line-clamp-2">
                  {truncateText(result.explanation.replace(/\.{2,}/g, '...'))}
                </p>
                
                {result.reactionEquation && (
                  <p className="text-xs text-blue-600 mt-1 font-mono">
                    {result.reactionEquation}
                  </p>
                )}
                
                {(result.temperature || result.pressure) && (
                  <div className="flex items-center space-x-3 mt-1 text-xs text-gray-500">
                    {result.temperature && (
                      <span>🌡️ {result.temperature}°C</span>
                    )}
                    {result.pressure && (
                      <span>📊 {result.pressure} atm</span>
                    )}
                  </div>
                )}
              </div>
              
              <RotateCcw className="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors flex-shrink-0 ml-2" />
            </div>
          </motion.button>
        ))}
      </div>
      
      {results.length > 3 && (
        <div className="mt-3 text-xs text-gray-500 text-center">
          Showing 3 most recent results
        </div>
      )}
    </div>
  )
}

export default RecentResults
