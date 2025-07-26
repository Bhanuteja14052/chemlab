'use client'

import { useState, useEffect } from 'react'
import { UserButton } from '@clerk/nextjs'
import { motion } from 'framer-motion'
import { FlaskConical, Home, Lightbulb, Zap, RotateCcw, Save } from 'lucide-react'
import Link from 'next/link'
import Element from '@/components/lab/Element'
import Beaker from '@/components/lab/Beaker'
import SaveExperimentDialog from '@/components/lab/SaveExperimentDialog'
import MolecularViewer3D from '@/components/lab/MolecularViewer3D'
import LoadingAnimation from '@/components/lab/LoadingAnimation'
import OptimizedLoading from '@/components/lab/OptimizedLoading'
import RecentResults from '@/components/lab/RecentResults'

interface ElementData {
  symbol: string
  name: string
  atomicNumber: number
  color: string
  safetyLevel: 'safe' | 'caution' | 'dangerous'
}

interface SelectedElementWithMolecules {
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
}

export default function PlayModePage() {
  const [isDarkTheme, setIsDarkTheme] = useState(true) // Default to dark mode
  const [settings, setSettings] = useState<any>({
    preferences: { autoSave: true }
  })
  const [elements, setElements] = useState<ElementData[]>([])
  const [beakerContents, setBeakerContents] = useState<SelectedElementWithMolecules[]>([])
  const [beakerColor, setBeakerColor] = useState('#e0f2fe')
  const [reactionResult, setReactionResult] = useState<ReactionResult | null>(null)
  const [isReacting, setIsReacting] = useState(false)
  const [showResult, setShowResult] = useState(false)
  
  // Element selection for container
  const [selectedElements, setSelectedElements] = useState<string[]>([])
  
  const [reactionHistory, setReactionHistory] = useState<ReactionResult[]>([])

  // Molecule selection modal
  const [showMoleculeModal, setShowMoleculeModal] = useState(false)
  const [selectedElementForMolecules, setSelectedElementForMolecules] = useState<string | null>(null)
  const [tempMoleculeCount, setTempMoleculeCount] = useState(1)

  // Save dialog state
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  
  // Molecular structure data for saving
  const [currentMolecularData, setCurrentMolecularData] = useState<any>(null)

  // Check theme on mount and listen for changes
  useEffect(() => {
    const checkTheme = () => {
      const theme = document.documentElement.getAttribute('data-theme')
      setIsDarkTheme(theme === 'dark')
    }
    
    // Only set default dark mode if no theme preference exists
    const savedTheme = localStorage.getItem('theme-preference')
    if (!savedTheme && !document.documentElement.getAttribute('data-theme')) {
      document.documentElement.setAttribute('data-theme', 'dark')
      localStorage.setItem('theme-preference', 'dark')
      setIsDarkTheme(true)
    } else {
      checkTheme()
    }
    
    const observer = new MutationObserver(checkTheme)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    })
    
    return () => observer.disconnect()
  }, [])

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('lab-settings')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setSettings(parsed)
      } catch (error) {
        console.error('Error parsing saved settings:', error)
      }
    }
  }, [])

  // Fetch elements on component mount
  useEffect(() => {
    fetchElements()
    
    // Check if we're editing an existing experiment
    const editExperiment = localStorage.getItem('editExperiment')
    if (editExperiment) {
      try {
        const experiment = JSON.parse(editExperiment)
        if (experiment.isEditing && experiment.mode === 'play') {
          // Load experiment data
          setBeakerContents(experiment.elements.map((el: string) => ({
            element: el.includes('×') ? el.split('×')[1] : el,
            molecules: el.includes('×') ? parseInt(el.split('×')[0]) : 1
          })))
          setReactionResult(experiment.result)
          setShowResult(true)
          
          // Clear the localStorage
          localStorage.removeItem('editExperiment')
        }
      } catch (error) {
        console.error('Error loading experiment for editing:', error)
        localStorage.removeItem('editExperiment')
      }
    }
  }, [])

  const fetchElements = async () => {
    try {
      const response = await fetch('/api/elements')
      const data = await response.json()
      if (data.success) {
        setElements(data.elements)
      }
    } catch (error) {
      console.error('Error fetching elements:', error)
    }
  }

  // Get suggested compounds from selected elements (same as practical mode)
  const getSuggestedCompounds = (selectedElements: string[]): Array<{ name: string; formula: string; state: string; description: string }> => {
    if (selectedElements.length === 0) return []
    
    const elementSet = new Set(selectedElements)
    const suggestedCompounds: Array<{ name: string; formula: string; state: string; description: string }> = []
    
    // Define compound mappings based on element combinations
    const compoundMappings = [
      // Hydrogen combinations
      {
        elements: ['H', 'O'],
        compounds: [
          { name: 'Water', formula: 'H₂O', state: 'liquid', description: 'Essential for life' },
          { name: 'Hydrogen Peroxide', formula: 'H₂O₂', state: 'liquid', description: 'Strong oxidizing agent' }
        ]
      },
      {
        elements: ['H', 'Cl'],
        compounds: [
          { name: 'Hydrochloric Acid', formula: 'HCl', state: 'aqueous', description: 'Strong acid, pH ~1' }
        ]
      },
      {
        elements: ['H', 'N'],
        compounds: [
          { name: 'Ammonia', formula: 'NH₃', state: 'gas', description: 'Alkaline gas, converts to NH₄OH in water' },
          { name: 'Ammonium Hydroxide', formula: 'NH₄OH', state: 'aqueous', description: 'Weak base, pH ~11' }
        ]
      },
      // Add more mappings as needed
      {
        elements: ['C', 'O'],
        compounds: [
          { name: 'Carbon Monoxide', formula: 'CO', state: 'gas', description: 'Toxic, colorless gas' },
          { name: 'Carbon Dioxide', formula: 'CO₂', state: 'gas', description: 'Forms carbonic acid in water' }
        ]
      },
      {
        elements: ['Na', 'Cl'],
        compounds: [
          { name: 'Sodium Chloride', formula: 'NaCl', state: 'solid', description: 'Table salt, neutral pH when dissolved' }
        ]
      }
    ]
    
    // Find matching compounds
    for (const mapping of compoundMappings) {
      const requiredElements = new Set(mapping.elements)
      const hasAllElements = Array.from(requiredElements).every(element => elementSet.has(element))
      
      if (hasAllElements) {
        suggestedCompounds.push(...mapping.compounds)
      }
    }
    
    // Remove duplicates and sort by complexity
    const uniqueCompounds = suggestedCompounds.filter((compound, index, self) => 
      index === self.findIndex(c => c.formula === compound.formula)
    )
    
    return uniqueCompounds.sort((a, b) => a.formula.length - b.formula.length)
  }

  // Function to load a compound when selected from Suggested Compounds panel
  const loadCompoundDetails = (compound: { name: string; formula: string; state: string; description: string }) => {
    // Create a mock reaction result with the selected compound
    const mockResult: ReactionResult = {
      compoundName: compound.name,
      chemicalFormula: compound.formula,
      color: getCompoundColor(compound.formula),
      state: compound.state,
      safetyWarnings: getCompoundSafetyWarnings(compound.formula),
      explanation: `Selected compound: ${compound.description}`,
      reactionEquation: `Elements → ${compound.formula}`
    }

    // Update the reaction result
    setReactionResult(mockResult)
    setShowResult(true)
    setBeakerColor(getCompoundColor(compound.formula))

    // Add to reaction history
    addToReactionHistory(mockResult)
  }

  // Helper function to get compound color based on formula
  const getCompoundColor = (formula: string): string => {
    if (formula.includes('Cl') && !formula.includes('Na')) return '#90EE90' // Light green for chlorides
    if (formula.includes('Fe')) return '#CD853F' // Brown for iron compounds
    if (formula.includes('Cu')) return '#4169E1' // Blue for copper compounds
    if (formula.includes('SO₄')) return '#FFD700' // Yellow for sulfates
    if (formula.includes('NO₃')) return '#FF6347' // Red for nitrates
    if (formula.includes('OH')) return '#DDA0DD' // Light purple for hydroxides
    if (formula.includes('O₂')) return '#87CEEB' // Light blue for oxides
    if (formula.includes('H₂O')) return '#ADD8E6' // Light blue for water
    return '#e0f2fe' // Default light blue
  }

  // Helper function to get safety warnings based on formula
  const getCompoundSafetyWarnings = (formula: string): string[] => {
    const warnings: string[] = []
    
    if (formula.includes('H₂SO₄')) warnings.push('Highly corrosive - causes severe burns')
    if (formula.includes('HCl')) warnings.push('Corrosive acid - handle with care')
    if (formula.includes('NaOH')) warnings.push('Caustic base - causes chemical burns')
    if (formula.includes('NH₃')) warnings.push('Toxic gas - avoid inhalation')
    if (formula.includes('H₂S')) warnings.push('Extremely toxic gas - lethal at high concentrations')
    if (formula.includes('CO')) warnings.push('Toxic gas - causes carbon monoxide poisoning')
    if (formula.includes('NO₂')) warnings.push('Toxic gas - causes respiratory damage')
    if (formula.includes('Cl₂')) warnings.push('Toxic gas - causes respiratory burns')
    
    if (warnings.length === 0) warnings.push('Handle with standard laboratory safety precautions')
    
    return warnings
  }

  // Enhanced reaction history management (max 3 entries, no duplicates)
  const addToReactionHistory = (newResult: ReactionResult) => {
    setReactionHistory(prev => {
      // Check if the result is the same as the last entry (prevent duplicates)
      if (prev.length > 0) {
        const lastResult = prev[prev.length - 1]
        if (lastResult.compoundName === newResult.compoundName && 
            lastResult.chemicalFormula === newResult.chemicalFormula) {
          return prev // Don't add duplicate
        }
      }
      
      // Add new result and keep only last 3
      const updated = [...prev, newResult]
      return updated.slice(-3) // Keep only the last 3 entries
    })
  }

  // Display state with emoji and text
  const getStateDisplay = (state: string): { emoji: string; text: string } => {
    const lowerState = state.toLowerCase()
    
    if (lowerState.includes('gas') || lowerState.includes('gaseous')) {
      return { emoji: '💨', text: 'Gas' }
    }
    if (lowerState.includes('liquid') || lowerState.includes('aqueous') || lowerState.includes('solution')) {
      return { emoji: '🌊', text: 'Liquid' }
    }
    if (lowerState.includes('solid') || lowerState.includes('crystal') || lowerState.includes('powder')) {
      return { emoji: '🧊', text: 'Solid' }
    }
    if (lowerState.includes('plasma')) {
      return { emoji: '⚡', text: 'Plasma' }
    }
    
    return { emoji: '🌊', text: 'Liquid' } // Default to liquid state with wave emoji
  }

  const handleElementDrop = async (elementName: string) => {
    // Remove drag functionality - this function is no longer used
    console.log('Drag functionality disabled in play mode')
  }

  const handleReactButton = async () => {
    console.log('=== REACT BUTTON CLICKED ===')
    console.log('Elements to send to Gemini:', beakerContents)
    console.log('Order sequence:', beakerContents.map((element, index) => `${index + 1}. ${element.element} (${element.molecules} molecules)`))
    
    if (beakerContents.length < 1) {
      alert('Please add at least 1 element to create a reaction!')
      return
    }
    await predictReaction(beakerContents)
  }

  const predictReaction = async (contents: SelectedElementWithMolecules[]) => {
    setIsReacting(true)
    try {
      const response = await fetch('/api/reactions/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          elements: contents,
          mode: 'play',
          title: `Play Mode: ${contents.map(el => `${el.molecules}${el.element}`).join(' + ')}`
        }),
      })

      const data = await response.json()
      if (data.success) {
        setReactionResult(data.result)
        setBeakerColor(data.result.color || '#e0f2fe')
        setShowResult(true)
        
        // Respect autoSave setting
        if (settings.preferences?.autoSave) {
          addToReactionHistory(data.result)
        }
      } else {
        console.error('Error predicting reaction:', data.error)
      }
    } catch (error) {
      console.error('Error predicting reaction:', error)
    } finally {
      setIsReacting(false)
    }
  }

  const clearBeaker = () => {
    console.log('Clear workbench clicked (Play)')
    
    // Reset everything to initial state
    setBeakerContents([])
    setBeakerColor('#e0f2fe')
    setReactionResult(null)
    setShowResult(false)
    
    console.log('Workbench completely cleared (Play)')
  }

  // Test pH of current compound using Gemini API
  const testPH = async () => {
    if (!reactionResult) {
      alert('No compound to test pH for!')
      return
    }

    try {
      setIsReacting(true)
      
      const prompt = `I have the compound "${reactionResult.compoundName}" with chemical formula "${reactionResult.chemicalFormula}".

Please analyze this compound and provide:
1. Convert this compound to its suitable form for pH testing (if it's not already in aqueous solution)
2. What is the pH value of this compound when properly prepared for testing?
3. Is it acidic, basic, or neutral?
4. Any special considerations for pH testing this compound?

Please provide a clear, concise response suitable for a chemistry student.`

      const response = await fetch('/api/reactions/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      })

      if (!response.ok) {
        throw new Error(`Failed to get pH analysis: ${response.statusText}`)
      }

      const data = await response.json()
      
      if (data.success && data.prediction) {
        // Update reaction result with pH information
        const updatedResult = {
          ...reactionResult,
          explanation: `${reactionResult.explanation}\n\nPH Analysis: ${data.prediction}`,
          phAnalysis: data.prediction
        }
        setReactionResult(updatedResult)
        alert(`pH Analysis:\n${data.prediction}`)
      } else {
        throw new Error(data.error || 'Failed to analyze pH')
      }
    } catch (error) {
      console.error('Error testing pH:', error)
      alert(`Error testing pH: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsReacting(false)
    }
  }

  // Handle molecular data export from MolecularViewer3D
  const handleMolecularDataExport = (data: any) => {
    setCurrentMolecularData(data)
    console.log('Received molecular data for saving (Play):', data)
  }

  const handleSaveExperiment = async (title: string, description?: string, options?: { includeStructure: boolean, includeParameters: boolean, includeAnalysis: boolean }) => {
    if (!reactionResult) {
      throw new Error('No reaction result to save')
    }

    // Prepare data based on save options
    const experimentData: any = {
      mode: 'play',
      title,
      description,
      elements: beakerContents.map(spec => `${spec.molecules}×${spec.element}`),
      result: reactionResult
    }

    // Note: Play mode now includes parameters like practical mode
    if (options?.includeParameters) {
      experimentData.gameMode = 'play'
      experimentData.elementsUsed = beakerContents.length
    }

    if (options?.includeStructure) {
      // Include real molecular structure data
      experimentData.molecularStructure = currentMolecularData || {
        atoms: beakerContents.map(spec => ({ element: spec.element, count: spec.molecules }))
      }
    }

    if (options?.includeAnalysis) {
      // Include analysis data
      experimentData.analysis = {
        reactionType: 'unknown',
        energyChange: null,
        colorChange: reactionResult.color || null,
        phChange: null,
        stateChange: reactionResult.state || null,
        safetyWarnings: reactionResult.safetyWarnings || []
      }
    }

    const response = await fetch('/api/experiments/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(experimentData)
    })

    const data = await response.json()
    if (!data.success) {
      throw new Error(data.error || 'Failed to save experiment')
    }
  }

  const getRandomElements = () => {
    const shuffled = [...elements].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, 2)
  }

  const toggleElementSelection = (elementName: string) => {
    setSelectedElements(prev => {
      if (prev.includes(elementName)) {
        return prev.filter(el => el !== elementName)
      } else {
        return [...prev, elementName]
      }
    })
  }

  const addSelectedElementsToBeaker = () => {
    if (selectedElements.length === 0) return
    
    const newElementsWithMolecules = selectedElements.map(element => {
      // Get element data for weight calculation
      const elementData = elements.find(el => el.symbol === element)
      const elementWeight = elementData ? elementData.atomicNumber : 1
      
      return {
        element,
        molecules: 1,
        weight: elementWeight
      }
    })
    
    const newContents = [...beakerContents, ...newElementsWithMolecules]
    setBeakerContents(newContents)
    setSelectedElements([])
    setShowResult(false)
    setReactionResult(null)
    
    console.log('Added selected elements to beaker:', selectedElements)
  }

  const clearSelectedElements = () => {
    setSelectedElements([])
  }

  const selectElementForMolecules = (elementName: string) => {
    setSelectedElementForMolecules(elementName)
    setTempMoleculeCount(1)
    setShowMoleculeModal(true)
  }

  const addElementWithMolecules = () => {
    if (selectedElementForMolecules && tempMoleculeCount > 0) {
      // Get element data for weight calculation
      const elementData = elements.find(el => el.symbol === selectedElementForMolecules)
      const elementWeight = elementData ? elementData.atomicNumber * tempMoleculeCount : tempMoleculeCount
      
      // Check if element already exists in beaker
      const existingIndex = beakerContents.findIndex(item => item.element === selectedElementForMolecules)
      
      if (existingIndex >= 0) {
        // Update existing element's molecule count
        const newContents = [...beakerContents]
        newContents[existingIndex] = {
          element: selectedElementForMolecules,
          molecules: tempMoleculeCount,
          weight: elementWeight
        }
        setBeakerContents(newContents)
      } else {
        // Add new element
        const newContents = [...beakerContents, {
          element: selectedElementForMolecules,
          molecules: tempMoleculeCount,
          weight: elementWeight
        }]
        setBeakerContents(newContents)
      }
      
      setShowMoleculeModal(false)
      setSelectedElementForMolecules(null)
      setShowResult(false)
      setReactionResult(null)
      setBeakerColor('#e0f2fe')
    }
  }

  const removeElementFromBeaker = (elementName: string) => {
    const newContents = beakerContents.filter(item => item.element !== elementName)
    setBeakerContents(newContents)
    setShowResult(false)
    setReactionResult(null)
    setBeakerColor('#e0f2fe')
  }

  const updateElementMolecules = (elementName: string, newMolecules: number) => {
    if (newMolecules > 0) {
      const newContents = beakerContents.map(item => {
        if (item.element === elementName) {
          // Get element data for weight calculation
          const elementData = elements.find(el => el.symbol === elementName)
          const elementWeight = elementData ? elementData.atomicNumber * newMolecules : newMolecules
          return { ...item, molecules: newMolecules, weight: elementWeight }
        }
        return item
      })
      setBeakerContents(newContents)
      setShowResult(false)
      setReactionResult(null)
      setBeakerColor('#e0f2fe')
    }
  }

  const performRandomReaction = async () => {
    const randomElements = getRandomElements()
    if (randomElements.length >= 2) {
      const elementSpecs = randomElements.map(el => ({
        element: el.name,
        molecules: 1,
        weight: el.atomicNumber
      }))
      
      // Add random elements to existing contents
      const existingElements = beakerContents.map(item => item.element)
      const newElements = elementSpecs.filter(spec => !existingElements.includes(spec.element))
      const newContents = [...beakerContents, ...newElements]
      setBeakerContents(newContents)
      
      await predictReaction(newContents)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-800 to-slate-700">
      {/* Navigation */}
      <nav className="bg-slate-900/90 backdrop-blur-md border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="flex items-center space-x-2 text-slate-300 hover:text-white">
                <Home className="h-5 w-5" />
                <span>Dashboard</span>
              </Link>
              <div className="flex items-center space-x-2">
                <FlaskConical className="h-8 w-8 text-green-400" />
                <span className="text-xl font-bold text-white">Play Mode</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={performRandomReaction}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Zap className="h-4 w-4" />
                <span>Random Reaction</span>
              </button>
              <UserButton />
            </div>
          </div>
        </div>
      </nav>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Elements Panel */}
            <div className="lg:col-span-1">
              <div className="bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-600 p-6">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                  <Lightbulb className="h-6 w-6 text-green-400 mr-2" />
                  Elements
                </h2>
                
                <p className="text-slate-300 mb-4">
                  Click elements to select them for your container!
                </p>
                
                <div className="mb-4 p-3 bg-slate-700/50 rounded-lg border border-slate-600">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-green-300">
                      Selected: {selectedElements.length}
                    </span>
                    <div className="flex space-x-2">
                      <button
                        onClick={clearSelectedElements}
                        className="text-xs px-2 py-1 bg-slate-600 text-white rounded hover:bg-slate-500"
                      >
                        Clear
                      </button>
                      <button
                        onClick={addSelectedElementsToBeaker}
                        disabled={selectedElements.length === 0}
                        className="text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-slate-400"
                      >
                        Add to Beaker
                      </button>
                    </div>
                  </div>
                  {selectedElements.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {selectedElements.map((element, index) => (
                        <span key={index} className="text-xs bg-green-600 text-white px-2 py-1 rounded">
                          {element}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className={`grid grid-cols-3 gap-4 max-h-96 overflow-y-auto custom-scrollbar ${
                  isDarkTheme ? 'custom-scrollbar-dark' : 'custom-scrollbar-light'
                }`}>
                  {elements.map((element) => (
                    <div key={element.symbol} className="flex justify-center">
                      <div
                        onClick={() => selectElementForMolecules(element.name)}
                        className={`cursor-pointer transform transition-all duration-200 hover:scale-105 w-full max-w-[80px] ${
                          selectedElements.includes(element.name) 
                            ? 'ring-2 ring-green-500 ring-offset-2' 
                            : ''
                        }`}
                      >
                        <Element
                          symbol={element.symbol}
                          name={element.name}
                          color={element.color}
                          safetyLevel={element.safetyLevel}
                          atomicNumber={element.atomicNumber}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Suggested Compounds Panel */}
                <div className="mt-6 p-4 bg-gradient-to-r from-purple-800 to-pink-800 rounded-lg border border-purple-600">
                  <h3 className="font-semibold text-white text-sm mb-3 flex items-center">
                    <FlaskConical className="h-4 w-4 text-purple-400 mr-2" />
                    Suggested Compounds
                    {beakerContents.length > 0 && (
                      <span className="ml-2 text-xs px-2 py-1 rounded-full bg-purple-600 text-white">
                        From: {beakerContents.map(spec => spec.element).join(', ')}
                      </span>
                    )}
                  </h3>
                  
                  {(() => {
                    const selectedElements = beakerContents.map(spec => spec.element)
                    const suggestedCompounds = getSuggestedCompounds(selectedElements)
                    
                    if (selectedElements.length === 0) {
                      return (
                        <div className="text-center py-4 text-slate-400">
                          <FlaskConical className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-xs">Add elements to see suggested compounds</p>
                        </div>
                      )
                    }
                    
                    if (suggestedCompounds.length === 0) {
                      return (
                        <div className="text-center py-3 text-slate-400">
                          <p className="text-xs">No compounds available for this selection.</p>
                        </div>
                      )
                    }
                    
                    return (
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {suggestedCompounds.map((compound, index) => (
                          <div 
                            key={index} 
                            onClick={() => loadCompoundDetails(compound)}
                            className="p-2 bg-slate-700 rounded border border-purple-500 hover:border-purple-400 cursor-pointer transition-all hover:shadow-sm transform hover:scale-[1.02]">
                            <div className="flex justify-between items-center">
                              <div className="flex-1">
                                <div className="font-medium text-xs text-white">{compound.name}</div>
                                <div className="text-xs text-purple-400">{compound.formula}</div>
                                <div className="text-xs text-slate-300 mt-1">{compound.description}</div>
                                <div className="text-xs text-purple-300 font-medium mt-1">
                                  Click to load →
                                </div>
                              </div>
                              <div className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                                compound.state === 'gas' 
                                  ? 'bg-blue-800 text-blue-200'
                                  : compound.state === 'liquid' || compound.state === 'aqueous'
                                  ? 'bg-cyan-800 text-cyan-200'
                                  : 'bg-amber-800 text-amber-200'
                              }`}>
                                {(() => {
                                  const stateDisplay = getStateDisplay(compound.state)
                                  return (
                                    <>
                                      {stateDisplay.emoji && <span className="mr-1">{stateDisplay.emoji}</span>}
                                      {stateDisplay.text}
                                    </>
                                  )
                                })()}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  })()}
                </div>
              </div>
            </div>

            {/* Lab Area */}
            <div className="lg:col-span-2">
              <div className="bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-600 p-8">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-bold text-white">Virtual Lab Bench</h2>
                  
                  {/* Control Buttons */}
                  <div className="flex items-center space-x-3">
                    {/* React Button */}
                    <button
                      onClick={handleReactButton}
                      disabled={beakerContents.length < 1 || isReacting}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
                    >
                      <Zap className="h-4 w-4" />
                      <span>{isReacting ? 'Reacting...' : 'React'}</span>
                    </button>
                    
                    {/* Clear Button */}
                    <button
                      onClick={clearBeaker}
                      className="flex items-center space-x-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
                    >
                      <RotateCcw className="h-4 w-4" />
                      <span>Clear</span>
                    </button>
                  </div>
                </div>

                {/* Current Elements Display - Enhanced with Order */}
                {beakerContents.length > 0 && (
                  <div className="mb-4 p-4 bg-gradient-to-r from-slate-700 to-slate-600 rounded-lg border border-slate-500">
                    <div className="mb-3 text-center">
                      <div className="font-semibold text-white mb-1">Elements in beaker (in order)</div>
                      <div className="text-sm text-slate-300">Total: {beakerContents.length}</div>
                    </div>
                    <div className="flex flex-wrap gap-3 mb-3">
                      {beakerContents.map((elementSpec, index) => (
                        <div
                          key={`${elementSpec.element}-${index}`}
                          className="inline-flex items-center bg-slate-600 text-white px-3 py-2 rounded-full text-sm font-medium border border-slate-400 mb-1"
                        >
                          <span className="bg-green-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 font-bold">
                            {index + 1}
                          </span>
                          <input
                            type="number"
                            min="1"
                            max="10"
                            value={elementSpec.molecules}
                            onChange={(e) => updateElementMolecules(elementSpec.element, parseInt(e.target.value) || 1)}
                            className="w-8 text-center bg-transparent border-none outline-none text-white font-medium"
                          />
                          <span>×{elementSpec.element}</span>
                          <button
                            onClick={() => removeElementFromBeaker(elementSpec.element)}
                            className="ml-2 text-red-400 hover:text-red-300 font-bold"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="text-sm text-slate-300 bg-slate-700/60 px-3 py-1 rounded border border-slate-500">
                      <span className="font-medium">Reaction sequence:</span> {beakerContents.map(el => `${el.molecules}${el.element}`).join(' + ')}
                    </div>
                  </div>
                )}

                {/* Lab Equipment Area */}
                <div className="min-h-64 bg-gradient-to-b from-slate-700 to-slate-600 rounded-xl p-8 border-2 border-dashed border-slate-400">
                  {beakerContents.length === 0 && (
                    <div className="text-center mb-4 p-3 bg-slate-600/60 rounded-lg border border-slate-400">
                      <p className="text-green-300 font-medium">💡 Tip: Select multiple elements to the beaker, then click React!</p>
                      <p className="text-sm text-slate-300 mt-1">Build your chemical reaction by adding elements one by one</p>
                    </div>
                  )}
                  <div className="flex justify-center items-center h-full">
                    <div className="text-center">
                      <Beaker
                        id="main-beaker"
                        contents={beakerContents.map(el => `${el.molecules}×${el.element}`)}
                        color={beakerColor}
                        onDrop={handleElementDrop}
                        size="large"
                        compoundState={reactionResult?.state as any || 'liquid'}
                        isReacting={isReacting}
                      />
                      
                      {isReacting && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg"
                        >
                          <p className="text-blue-800 font-medium text-center">Analyzing chemical reaction...</p>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Reaction Result */}
                {showResult && reactionResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 bg-gradient-to-r from-green-800 to-emerald-800 rounded-xl p-6 border border-green-600"
                  >
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                      <Zap className="h-6 w-6 text-green-400 mr-2" />
                      Compound Formed!
                    </h3>
                    
                    <div className="grid md:grid-cols-3 gap-6">
                      {/* Compound Visualization */}
                      <div className="flex flex-col items-center">
                        <h4 className="font-semibold text-slate-300 mb-3">Visual Representation</h4>
                        <div className="relative">
                          {/* Compound Crystal/Molecule Representation */}
                          <motion.div
                            initial={{ scale: 0, rotate: 0 }}
                            animate={{ scale: 1, rotate: 360 }}
                            transition={{ duration: 1, type: "spring" }}
                            className="w-24 h-24 rounded-lg border-4 border-slate-400 flex items-center justify-center text-white font-bold text-lg shadow-lg"
                            style={{ 
                              backgroundColor: reactionResult.color === 'colorless' ? '#475569' : reactionResult.color,
                              borderColor: reactionResult.color === 'colorless' ? '#64748B' : reactionResult.color
                            }}
                          >
                            {reactionResult.chemicalFormula}
                          </motion.div>
                          
                          {/* State indicator */}
                          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-slate-700 rounded-full text-xs font-medium border border-slate-500 shadow-sm text-white">
                            {(() => {
                              const stateDisplay = getStateDisplay(reactionResult.state)
                              return stateDisplay.emoji
                            })()}
                          </div>
                        </div>
                      </div>

                      {/* Compound Details */}
                      <div className="mb-4">
                        <h4 className="font-semibold text-white mb-3">Properties</h4>
                        <div className="space-y-3">
                          <div>
                            <span className="font-semibold text-white">Name:</span>
                            <span className="ml-2 text-slate-300">{reactionResult.compoundName}</span>
                          </div>
                          <div>
                            <span className="font-semibold text-white">Formula:</span>
                            <span className="ml-2 text-slate-300 font-mono text-lg">{reactionResult.chemicalFormula}</span>
                          </div>
                          <div>
                            <span className="font-semibold text-white">State:</span>
                            <span className="ml-2 text-slate-300 capitalize">{reactionResult.state}</span>
                          </div>
                          <div>
                            <span className="font-semibold text-white">Color:</span>
                            <div className="ml-2 inline-flex items-center space-x-2">
                              <span className="text-slate-300 capitalize">{reactionResult.color}</span>
                              <div 
                                className="w-4 h-4 rounded-full border border-slate-400"
                                style={{ backgroundColor: reactionResult.color === 'colorless' ? '#64748B' : reactionResult.color }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Explanation */}
                      <div className="mb-4">
                        <h4 className="font-semibold text-white mb-3">How it Formed:</h4>
                        <p className="text-slate-300 text-sm leading-relaxed">{reactionResult.explanation}</p>
                        
                        {/* Reaction Equation */}
                        {reactionResult.reactionEquation && (
                          <div className="mt-4 p-3 bg-slate-700 rounded border border-slate-500">
                            <div className="text-xs text-white font-medium mb-2">Chemical Equation:</div>
                            <div className="font-mono text-sm text-white bg-slate-600 p-2 rounded text-center">{reactionResult.reactionEquation}</div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Safety Warnings */}
                    {reactionResult.safetyWarnings && reactionResult.safetyWarnings.length > 0 && (
                      <div className="mt-6 p-4 bg-yellow-900/50 border border-yellow-700 rounded-lg">
                        <h4 className="font-semibold text-yellow-300 mb-2 flex items-center">
                          ⚠️ Safety Information:
                        </h4>
                        <ul className="text-yellow-200 text-sm space-y-1">
                          {reactionResult.safetyWarnings.map((warning, index) => (
                            <li key={index} className="flex items-start">
                              <span className="text-yellow-400 mr-2">•</span>
                              <span>{warning}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* 3D Molecular Structure */}
                    <div className="mt-6">
                      <h4 className="font-semibold text-slate-300 mb-3">3D Molecular Structure</h4>
                      <div className="p-4 bg-slate-700 rounded-lg border border-slate-500">
                        <MolecularViewer3D 
                          compound={beakerContents} 
                          reactionResult={reactionResult}
                          onDataExport={handleMolecularDataExport}
                        />
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-6 flex justify-end space-x-3">
                      <button
                        onClick={testPH}
                        disabled={isReacting}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                      >
                        <span className="text-sm">🧪</span>
                        <span>{isReacting ? 'Testing...' : 'Test pH'}</span>
                      </button>
                      <button
                        onClick={() => setShowSaveDialog(true)}
                        className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Save className="h-4 w-4" />
                        <span>Save to Journal</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Right Panel - Recent Results Only */}
            <div className="lg:col-span-1">
              {/* Recent Results Component */}
              <RecentResults
                results={reactionHistory}
                onResultSelect={(result) => {
                  setReactionResult(result)
                  setShowResult(true)
                  setBeakerColor(result.color)
                }}
                onClearHistory={() => setReactionHistory([])}
                className="bg-slate-800/90 backdrop-blur-sm border-slate-600"
              />
            </div>
          </div>

      {/* Molecule Selection Modal */}
      {showMoleculeModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-800 rounded-xl p-6 max-w-md w-full mx-4 border border-slate-600"
          >
            <h3 className="text-xl font-bold text-white mb-4">
              Select Molecules for {selectedElementForMolecules}
            </h3>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Number of Molecules
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={tempMoleculeCount}
                onChange={(e) => setTempMoleculeCount(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-slate-500 bg-slate-700 text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <p className="text-sm text-slate-400 mt-1">
                Choose between 1-10 molecules
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowMoleculeModal(false)
                  setSelectedElementForMolecules(null)
                }}
                className="flex-1 px-4 py-2 bg-slate-600 text-slate-300 rounded-lg hover:bg-slate-500 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addElementWithMolecules}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Add to Beaker
              </button>
            </div>
          </motion.div>
        </div>
      )}
      
      {/* Save Experiment Dialog */}
      <SaveExperimentDialog
        isOpen={showSaveDialog}
        onClose={() => setShowSaveDialog(false)}
        onSave={handleSaveExperiment}
        mode="play"
        defaultName={`Play-${beakerContents.map(el => `${el.molecules}x${el.element}`).join('-')}`}
      />
    </div>
  </div>
  )
}
