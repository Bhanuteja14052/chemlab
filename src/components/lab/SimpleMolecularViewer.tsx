'use client'

import React, { useState, useEffect } from 'react'
import { RotateCcw, Download, Eye, EyeOff, CheckCircle, AlertTriangle } from 'lucide-react'

interface ElementSpec {
  element: string
  molecules: number
  weight: number
}

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
}

interface SimpleMolecularViewerProps {
  compound: ElementSpec[]
  reactionResult: ReactionResult | null
  onDataExport?: (data: any) => void
  showValidation?: boolean
  mode?: '2D' | '3D'
  isDarkTheme?: boolean
}

export default function SimpleMolecularViewer({ 
  compound, 
  reactionResult, 
  onDataExport, 
  showValidation = true,
  mode = '3D',
  isDarkTheme = false 
}: SimpleMolecularViewerProps) {
  const [viewMode, setViewMode] = useState<'2D' | '3D'>(mode)
  const [isValidStructure, setIsValidStructure] = useState(false)
  const [molecularData, setMolecularData] = useState<any>(null)

  useEffect(() => {
    if (reactionResult) {
      // Generate basic molecular data
      const basicData = {
        formula: reactionResult.chemicalFormula,
        name: reactionResult.compoundName,
        atoms: compound.map(spec => ({
          element: spec.element,
          count: spec.molecules
        })),
        structure: 'basic',
        isValid: compound.length > 0 && reactionResult.chemicalFormula,
        source: 'generated'
      }
      
      setMolecularData(basicData)
      setIsValidStructure(!!basicData.isValid)
      
      // Export data if callback provided
      if (onDataExport) {
        onDataExport(basicData)
      }
    }
  }, [compound, reactionResult]) // Removed onDataExport from dependencies

  const handleDownload = async () => {
    if (!molecularData) return

    try {
      if (viewMode === '3D') {
        // Download as JSON structure
        const structureData = {
          ...molecularData,
          exportedAt: new Date().toISOString(),
          format: '3D_JSON'
        }
        
        const blob = new Blob([JSON.stringify(structureData, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${molecularData.formula}_structure.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      } else {
        // Download as text data for 2D
        const textData = `Molecular Structure: ${molecularData.name}
Formula: ${molecularData.formula}
Atoms: ${molecularData.atoms.map((a: any) => `${a.element}${a.count}`).join(', ')}
Generated: ${new Date().toISOString()}`
        
        const blob = new Blob([textData], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${molecularData.formula}_data.txt`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Download failed:', error)
    }
  }

  const toggleViewMode = () => {
    setViewMode(prev => prev === '2D' ? '3D' : '2D')
  }

  if (!reactionResult) {
    return (
      <div className={`rounded-lg border p-4 ${
        isDarkTheme 
          ? 'bg-slate-800 border-slate-700' 
          : 'bg-white border-slate-200'
      }`}>
        <div className="text-center py-8">
          <div className={`text-sm ${isDarkTheme ? 'text-slate-400' : 'text-slate-500'}`}>
            Add elements to the beaker to see molecular structure
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`rounded-lg border ${
      isDarkTheme 
        ? 'bg-slate-800 border-slate-700' 
        : 'bg-white border-slate-200'
    }`}>
      {/* Header */}
      <div className={`flex items-center justify-between p-4 border-b ${
        isDarkTheme ? 'border-slate-700' : 'border-slate-200'
      }`}>
        <div className="flex items-center space-x-2">
          <h3 className={`font-semibold ${isDarkTheme ? 'text-white' : 'text-black'}`}>
            Molecular Structure
          </h3>
          {showValidation && (
            <div className="flex items-center space-x-1">
              {isValidStructure ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-orange-500" />
              )}
              <span className={`text-xs ${
                isValidStructure 
                  ? 'text-green-600' 
                  : 'text-orange-600'
              }`}>
                {isValidStructure ? 'Valid' : 'Simplified'}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleViewMode}
            className={`p-2 rounded-lg transition-colors ${
              isDarkTheme
                ? 'hover:bg-slate-700 text-slate-300'
                : 'hover:bg-gray-100 text-gray-600'
            }`}
            title={`Switch to ${viewMode === '2D' ? '3D' : '2D'} view`}
          >
            {viewMode === '2D' ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </button>
          
          <button
            onClick={handleDownload}
            className={`p-2 rounded-lg transition-colors ${
              isDarkTheme
                ? 'hover:bg-slate-700 text-slate-300'
                : 'hover:bg-gray-100 text-gray-600'
            }`}
            title="Download structure"
          >
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="text-center py-8">
          <div className={`text-lg font-mono mb-2 ${isDarkTheme ? 'text-white' : 'text-black'}`}>
            {reactionResult.chemicalFormula}
          </div>
          <div className={`text-sm mb-4 ${isDarkTheme ? 'text-slate-300' : 'text-slate-600'}`}>
            {reactionResult.compoundName}
          </div>
          
          {/* Molecule representation */}
          <div className={`rounded-lg p-6 mb-4 ${
            isDarkTheme ? 'bg-slate-900' : 'bg-slate-50'
          }`}>
            {viewMode === '3D' ? (
              <div className="relative">
                {/* 3D Molecular Structure Visualization */}
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative w-48 h-48 flex items-center justify-center">
                    {/* Create visual molecular structure based on formula */}
                    {reactionResult.chemicalFormula === 'H2O' && (
                      <div className="relative">
                        {/* Water molecule */}
                        <div className="relative flex items-center">
                          <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">O</div>
                          <div className="w-12 h-1 bg-gray-400 mx-1"></div>
                          <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-black text-xs font-bold">H</div>
                        </div>
                        <div className="absolute top-6 left-3 flex items-center rotate-45">
                          <div className="w-12 h-1 bg-gray-400"></div>
                          <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-black text-xs font-bold">H</div>
                        </div>
                      </div>
                    )}
                    {reactionResult.chemicalFormula === 'CO2' && (
                      <div className="flex items-center space-x-2">
                        {/* Carbon dioxide */}
                        <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">O</div>
                        <div className="w-2 h-1 bg-gray-400"></div>
                        <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-white text-xs font-bold">C</div>
                        <div className="w-2 h-1 bg-gray-400"></div>
                        <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">O</div>
                      </div>
                    )}
                    {reactionResult.chemicalFormula === 'NaCl' && (
                      <div className="flex items-center space-x-3">
                        {/* Sodium chloride */}
                        <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-black text-xs font-bold">Na</div>
                        <div className="w-3 h-1 bg-blue-400"></div>
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">Cl</div>
                      </div>
                    )}
                    {reactionResult.chemicalFormula === 'CH4' && (
                      <div className="relative">
                        {/* Methane - tetrahedral structure */}
                        <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-white text-xs font-bold absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">C</div>
                        <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-black text-xs font-bold absolute top-0 left-1/2 transform -translate-x-1/2">H</div>
                        <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-black text-xs font-bold absolute bottom-0 left-1/2 transform -translate-x-1/2">H</div>
                        <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-black text-xs font-bold absolute top-1/2 left-0 transform -translate-y-1/2">H</div>
                        <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-black text-xs font-bold absolute top-1/2 right-0 transform -translate-y-1/2">H</div>
                        {/* Bonds */}
                        <div className="w-8 h-1 bg-gray-400 absolute top-6 left-1/2 transform -translate-x-1/2 rotate-0"></div>
                        <div className="w-8 h-1 bg-gray-400 absolute bottom-6 left-1/2 transform -translate-x-1/2 rotate-0"></div>
                        <div className="w-8 h-1 bg-gray-400 absolute top-1/2 left-6 transform -translate-y-1/2 rotate-90"></div>
                        <div className="w-8 h-1 bg-gray-400 absolute top-1/2 right-6 transform -translate-y-1/2 rotate-90"></div>
                      </div>
                    )}
                    {!['H2O', 'CO2', 'NaCl', 'CH4'].includes(reactionResult.chemicalFormula) && (
                      <div className="flex flex-col items-center">
                        {/* Generic molecular structure */}
                        <div className="relative">
                          {compound.map((spec, index) => (
                            <div key={index} className="flex items-center mb-2">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                                spec.element === 'H' ? 'bg-gray-300 text-black' :
                                spec.element === 'C' ? 'bg-gray-800' :
                                spec.element === 'O' ? 'bg-red-500' :
                                spec.element === 'N' ? 'bg-blue-500' :
                                spec.element === 'Cl' ? 'bg-green-500' :
                                spec.element === 'Na' ? 'bg-yellow-400 text-black' :
                                spec.element === 'K' ? 'bg-purple-500' :
                                spec.element === 'Ca' ? 'bg-orange-500' :
                                'bg-gray-600'
                              }`}>
                                {spec.element}
                              </div>
                              {index < compound.length - 1 && <div className="w-6 h-1 bg-gray-400 mx-2"></div>}
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 flex items-center justify-center">
                          <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center ${
                            isDarkTheme ? 'border-slate-400 bg-slate-700' : 'border-gray-400 bg-gray-100'
                          }`}>
                            <span className="text-lg font-bold">3D</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className={`text-xs ${isDarkTheme ? 'text-slate-400' : 'text-slate-500'}`}>
                    3D Molecular Structure
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                {/* 2D Lewis Structure representation */}
                <div className="text-2xl font-mono mb-2">{reactionResult.chemicalFormula}</div>
                <div className="mt-4 flex items-center justify-center">
                  <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center ${
                    isDarkTheme ? 'border-slate-400 bg-slate-700' : 'border-gray-400 bg-gray-100'
                  }`}>
                    <span className="text-lg font-bold">2D</span>
                  </div>
                </div>
                <div className={`text-xs mt-2 ${isDarkTheme ? 'text-slate-400' : 'text-slate-500'}`}>
                  2D Lewis Structure
                </div>
              </div>
            )}
          </div>

          {/* Atom composition */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            {compound.map((spec, index) => (
              <div key={index} className={`p-2 rounded ${
                isDarkTheme ? 'bg-slate-700' : 'bg-gray-100'
              }`}>
                <div className={`font-medium ${isDarkTheme ? 'text-white' : 'text-black'}`}>
                  {spec.element}
                </div>
                <div className={`text-xs ${isDarkTheme ? 'text-slate-300' : 'text-slate-600'}`}>
                  {spec.molecules} atoms
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
