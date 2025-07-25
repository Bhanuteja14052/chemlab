'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Save, X, AlertCircle } from 'lucide-react'

interface SaveExperimentDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (name: string, description?: string, options?: SaveOptions) => Promise<void>
  mode: 'play' | 'practical'
  defaultName?: string
}

interface SaveOptions {
  includeStructure: boolean
  includeParameters: boolean
  includeAnalysis: boolean
}

export default function SaveExperimentDialog({
  isOpen,
  onClose,
  onSave,
  mode,
  defaultName = ''
}: SaveExperimentDialogProps) {
  const [name, setName] = useState(defaultName)
  const [description, setDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [saveMode, setSaveMode] = useState<'full' | 'basic'>('full')
  const [saveOptions, setSaveOptions] = useState<SaveOptions>({
    includeStructure: true,
    includeParameters: true,
    includeAnalysis: true
  })
  const [isDarkTheme, setIsDarkTheme] = useState(false)

  // Check theme on mount and listen for changes
  useEffect(() => {
    const checkTheme = () => {
      const theme = document.documentElement.getAttribute('data-theme')
      setIsDarkTheme(theme === 'dark')
    }
    
    checkTheme()
    
    const observer = new MutationObserver(checkTheme)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    })
    
    return () => observer.disconnect()
  }, [])

  // Update name when defaultName changes
  useEffect(() => {
    if (defaultName && !name) {
      setName(defaultName)
    }
  }, [defaultName, name])

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Experiment name is required')
      return
    }

    setIsLoading(true)
    setError('')
    
    try {
      await onSave(name.trim(), description.trim() || undefined, saveOptions)
      onClose()
      setName('')
      setDescription('')
      setSaveMode('full')
      setSaveOptions({
        includeStructure: true,
        includeParameters: true,
        includeAnalysis: true
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save experiment')
    } finally {
      setIsLoading(false)
    }
  }

  const generateRandomName = () => {
    const adjectives = ['Amazing', 'Brilliant', 'Curious', 'Dynamic', 'Epic', 'Fantastic']
    const nouns = ['Reaction', 'Experiment', 'Test', 'Analysis', 'Study', 'Discovery']
    const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)]
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)]
    const randomNum = Math.floor(Math.random() * 999) + 1
    const generatedName = `${randomAdj}-${randomNoun}-${randomNum.toString().padStart(3, '0')}`
    setName(generatedName)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto ${
              isDarkTheme ? 'bg-slate-900' : 'bg-white'
            }`}
          >
            {/* Header */}
            <div className={`flex items-center justify-between p-6 border-b ${
              isDarkTheme ? 'border-slate-700' : 'border-gray-200'
            }`}>
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  mode === 'play' 
                    ? isDarkTheme ? 'bg-blue-900' : 'bg-blue-100'
                    : isDarkTheme ? 'bg-purple-900' : 'bg-purple-100'
                }`}>
                  <Save className={`h-5 w-5 ${
                    mode === 'play' 
                      ? isDarkTheme ? 'text-blue-300' : 'text-blue-600'
                      : isDarkTheme ? 'text-purple-300' : 'text-purple-600'
                  }`} />
                </div>
                <div>
                  <h3 className={`text-lg font-semibold ${
                    isDarkTheme ? 'text-white' : 'text-black'
                  }`}>Save Experiment</h3>
                  <p className={`text-sm ${
                    isDarkTheme ? 'text-slate-300' : 'text-slate-600'
                  }`}>
                    {mode === 'play' ? 'Play Mode' : 'Practical Mode'} Experiment
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className={`transition-colors ${
                  isDarkTheme 
                    ? 'text-slate-400 hover:text-white' 
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Experiment Name */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkTheme ? 'text-white' : 'text-black'
                }`}>
                  Experiment Name *
                </label>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Acid-Base-001, My First Reaction..."
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      isDarkTheme 
                        ? 'bg-slate-800 border-slate-600 text-white placeholder-slate-400' 
                        : 'bg-white border-gray-300 text-black placeholder-gray-500'
                    }`}
                    maxLength={100}
                  />
                  <button
                    type="button"
                    onClick={generateRandomName}
                    className={`text-sm transition-colors ${
                      isDarkTheme 
                        ? 'text-blue-400 hover:text-blue-300' 
                        : 'text-blue-600 hover:text-blue-700'
                    }`}
                  >
                    🎲 Generate random name
                  </button>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkTheme ? 'text-white' : 'text-black'
                }`}>
                  Description (Optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add notes about your experiment..."
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                    isDarkTheme 
                      ? 'bg-slate-800 border-slate-600 text-white placeholder-slate-400' 
                      : 'bg-white border-gray-300 text-black placeholder-gray-500'
                  }`}
                  maxLength={500}
                />
                <div className={`text-xs mt-1 ${
                  isDarkTheme ? 'text-slate-400' : 'text-gray-500'
                }`}>
                  {description.length}/500 characters
                </div>
              </div>

              {/* Save Options */}
              <div>
                <label className={`block text-sm font-medium mb-3 ${
                  isDarkTheme ? 'text-white' : 'text-black'
                }`}>
                  Save Options
                </label>
                
                {/* Save Mode Selection */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <button
                    type="button"
                    onClick={() => {
                      setSaveMode('full')
                      setSaveOptions({
                        includeStructure: true,
                        includeParameters: true,
                        includeAnalysis: true
                      })
                    }}
                    className={`p-3 rounded-lg border-2 transition-all text-left ${
                      saveMode === 'full'
                        ? isDarkTheme 
                          ? 'border-blue-400 bg-blue-900/30'
                          : 'border-blue-500 bg-blue-50'
                        : isDarkTheme
                        ? 'border-slate-600 hover:border-slate-500'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`font-medium text-sm ${
                      isDarkTheme ? 'text-white' : 'text-black'
                    }`}>Full Save</div>
                    <div className={`text-xs mt-1 ${
                      isDarkTheme ? 'text-slate-400' : 'text-gray-600'
                    }`}>
                      3D structure, parameters, and analysis
                    </div>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      setSaveMode('basic')
                      setSaveOptions({
                        includeStructure: false,
                        includeParameters: true,
                        includeAnalysis: false
                      })
                    }}
                    className={`p-3 rounded-lg border-2 transition-all text-left ${
                      saveMode === 'basic'
                        ? isDarkTheme
                          ? 'border-green-400 bg-green-900/30'
                          : 'border-green-500 bg-green-50'
                        : isDarkTheme
                        ? 'border-slate-600 hover:border-slate-500'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`font-medium text-sm ${
                      isDarkTheme ? 'text-white' : 'text-black'
                    }`}>Basic Save</div>
                    <div className={`text-xs mt-1 ${
                      isDarkTheme ? 'text-slate-400' : 'text-gray-600'
                    }`}>
                      Elements and results only
                    </div>
                  </button>
                </div>

                {/* Custom Options (only shown for full save) */}
                {saveMode === 'full' && (
                  <div className={`p-3 rounded-lg space-y-2 ${
                    isDarkTheme ? 'bg-slate-800' : 'bg-gray-50'
                  }`}>
                    <div className={`text-xs font-medium mb-2 ${
                      isDarkTheme ? 'text-slate-300' : 'text-gray-700'
                    }`}>Customize what to include:</div>
                    
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={saveOptions.includeStructure}
                        onChange={(e) => setSaveOptions(prev => ({ ...prev, includeStructure: e.target.checked }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className={`text-sm ${
                        isDarkTheme ? 'text-white' : 'text-black'
                      }`}>3D Molecular Structure & 2D Fallback</span>
                    </label>
                    
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={saveOptions.includeParameters}
                        onChange={(e) => setSaveOptions(prev => ({ ...prev, includeParameters: e.target.checked }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className={`text-sm ${
                        isDarkTheme ? 'text-white' : 'text-black'
                      }`}>Lab Parameters (T, P, Volume, Weight)</span>
                    </label>
                    
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={saveOptions.includeAnalysis}
                        onChange={(e) => setSaveOptions(prev => ({ ...prev, includeAnalysis: e.target.checked }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className={`text-sm ${
                        isDarkTheme ? 'text-white' : 'text-black'
                      }`}>Analysis, pH & Safety Warnings</span>
                    </label>
                  </div>
                )}
              </div>

              {/* Error */}
              {error && (
                <div className={`flex items-center space-x-2 p-3 border rounded-lg ${
                  isDarkTheme 
                    ? 'bg-red-900/30 border-red-500/50' 
                    : 'bg-red-50 border-red-200'
                }`}>
                  <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                  <span className={`text-sm ${
                    isDarkTheme ? 'text-red-300' : 'text-red-700'
                  }`}>{error}</span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className={`flex items-center justify-end space-x-3 p-6 border-t ${
              isDarkTheme ? 'border-slate-700' : 'border-gray-200'
            }`}>
              <button
                onClick={onClose}
                disabled={isLoading}
                className={`px-4 py-2 rounded-lg transition-colors disabled:opacity-50 ${
                  isDarkTheme 
                    ? 'bg-slate-700 text-white hover:bg-slate-600' 
                    : 'bg-gray-100 text-black hover:bg-gray-200'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isLoading || !name.trim()}
                className={`px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2 ${
                  mode === 'play' 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'bg-purple-600 hover:bg-purple-700'
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Save Experiment</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
