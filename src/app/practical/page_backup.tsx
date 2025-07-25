'use client'

import { useState, useEffect } from 'react'
import { UserButton } from '@clerk/nextjs'
import { motion } from 'framer-motion'
import { FlaskConical, Home, Settings, Play, RotateCcw, Thermometer, Gauge, Droplets, Scale, Zap, Save, Lightbulb, Timer, Bot, AlertTriangle, Volume2 } from 'lucide-react'
import Link from 'next/link'
import Element from '@/components/lab/Element'
import Beaker from '@/components/lab/Beaker'
import SaveExperimentDialog from '@/components/lab/SaveExperimentDialog'
import MolecularViewer3D from '@/components/lab/MolecularViewer3D'
import PHMeter from '@/components/lab/PHMeter'
import DigitalScale from '@/components/lab/DigitalScale'
import ReactionTimer from '@/components/lab/ReactionTimer'
import SafetyQuiz from '@/components/lab/SafetyQuiz'
import LabAssistant from '@/components/lab/LabAssistant'
import LabSoundControls, { useLabSounds } from '@/components/lab/LabSounds'
import ParticleAnimation from '@/components/lab/ParticleAnimation'

// Add lab panel types
type LabPanel = 'elements' | 'equipment' | 'analysis' | 'safety' | 'sounds'

interface ElementSpec {
  element: string
  molecules: number
  weight: number
}

interface ElementData {
  symbol: string
  name: string
  atomicNumber: number
  color: string
  safetyLevel: 'safe' | 'caution' | 'dangerous'
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

export default function PracticalModePage() {
  const [elements, setElements] = useState<ElementData[]>([])
  const [beakerContents, setBeakerContents] = useState<ElementSpec[]>([])
  const [beakerColor, setBeakerColor] = useState('#e0f2fe')
  const [reactionResult, setReactionResult] = useState<ReactionResult | null>(null)
  const [isReacting, setIsReacting] = useState(false)
  const [showResult, setShowResult] = useState(false)
  
  // Element selection for container
  const [selectedElement, setSelectedElement] = useState<string>('')
  const [selectedMolecules, setSelectedMolecules] = useState<number>(1)
  const [selectedWeight, setSelectedWeight] = useState<number>(1)
  const [showElementSelector, setShowElementSelector] = useState(false)

  const [reactionHistory, setReactionHistory] = useState<ReactionResult[]>([])

  // Lab parameters
  const [temperature, setTemperature] = useState(25) // Celsius
  const [pressure, setPressure] = useState(1.0) // atm
  const [volume, setVolume] = useState(100) // mL
  const [weight, setWeight] = useState(10) // grams

  // Save dialog state
  const [showSaveDialog, setShowSaveDialog] = useState(false)

  // New feature states
  const [activePanel, setActivePanel] = useState<LabPanel>('elements')
  const [showMolecularViewer, setShowMolecularViewer] = useState(false)
  const [showSafetyQuiz, setShowSafetyQuiz] = useState(false)
  const [safetyQuizPassed, setSafetyQuizPassed] = useState(false)
  const [particleAnimationType, setParticleAnimationType] = useState<'bubble' | 'steam' | 'spark' | 'smoke'>('bubble')
  const [showParticles, setShowParticles] = useState(false)
  
  // pH calculation based on beaker contents
  const currentPH = beakerContents.length > 0 ? 
    beakerContents.map(el => el.element).join(',') : null

  // Initialize lab sounds
  const { playSound, setVolume } = useLabSounds()

  // Fetch elements on component mount
  useEffect(() => {
    fetchElements()
    
    // Check if we're editing an existing experiment
    const editExperiment = localStorage.getItem('editExperiment')
    if (editExperiment) {
      try {
        const experiment = JSON.parse(editExperiment)
        if (experiment.isEditing && experiment.mode === 'practical') {
          // Load experiment data
          setBeakerContents(experiment.elements.map((el: string) => ({
            element: el,
            molecules: 1,
            weight: 1
          })))
          setTemperature(experiment.parameters?.temperature || 25)
          setPressure(experiment.parameters?.pressure || 1.0)
          setVolume(experiment.parameters?.volume || 100)
          setWeight(experiment.parameters?.weight || 10)
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

  const handleElementDrop = (elementName: string) => {
    // Remove drag functionality - this function is no longer used
    console.log('Drag functionality disabled')
  }

  const addElementToBeaker = () => {
    if (!selectedElement || selectedMolecules <= 0 || selectedWeight <= 0) return
    
    console.log('=== ADD ELEMENT EVENT (Practical) ===')
    console.log('Adding element:', selectedElement)
    console.log('Molecules:', selectedMolecules)
    console.log('Weight:', selectedWeight)
    
    // Find element data for safety check
    const elementData = elements.find(el => el.symbol === selectedElement)
    
    // Check safety level for dangerous elements
    if (elementData?.safetyLevel === 'dangerous' && !safetyQuizPassed) {
      setShowSafetyQuiz(true)
      return
    }
    
    const newElement: ElementSpec = {
      element: selectedElement,
      molecules: selectedMolecules,
      weight: selectedWeight
    }
    
    const newContents = [...beakerContents, newElement]
    setBeakerContents(newContents)
    
    // Play pour sound effect
    playSound('pour', 0.3)
    
    // Reset selection
    setSelectedElement('')
    setSelectedMolecules(1)
    setSelectedWeight(1)
    setShowElementSelector(false)
    setShowResult(false)
    setReactionResult(null)
    
    console.log('Element added to beaker:', newElement)
    console.log('=== ADD ELEMENT COMPLETE (Practical) ===')
  }

  const runExperiment = async () => {
    console.log('=== RUN EXPERIMENT CLICKED (Practical) ===')
    console.log('Elements to send to Gemini:', beakerContents)
    console.log('Element specifications:', beakerContents.map((spec, index) => `${index + 1}. ${spec.molecules} molecules of ${spec.element} (${spec.weight}g)`))
    console.log('Lab conditions:', { temperature, pressure, volume, weight })
    
    if (beakerContents.length < 1) {
      alert('Please add at least 1 element to run an experiment.')
      return
    }

    setIsReacting(true)
    
    // Play reaction sound
    playSound('reaction', 0.5)
    
    // Start particle animation
    setShowParticles(true)
    const particleType = temperature > 100 ? 'steam' : 
                        temperature > 50 ? 'bubble' : 
                        pressure > 2 ? 'spark' : 'smoke'
    setParticleAnimationType(particleType)
    
    try {
      const response = await fetch('/api/reactions/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          elements: beakerContents,
          temperature,
          pressure,
          volume,
          weight,
          mode: 'practical',
          title: `Practical: ${beakerContents.map(spec => `${spec.molecules}x${spec.element}`).join(' + ')} at ${temperature}°C`
        }),
      })

      const data = await response.json()
      if (data.success) {
        setReactionResult(data.result)
        setBeakerColor(data.result.color || '#e0f2fe')
        setShowResult(true)
        
        // Play completion sound
        setTimeout(() => playSound('completion', 0.4), 1000)
        
        // Save to reaction history
        setReactionHistory(prev => [...prev, data.result])
      } else {
        console.error('Error predicting reaction:', data.error)
        playSound('error', 0.3)
      }
    } catch (error) {
      console.error('Error predicting reaction:', error)
      playSound('error', 0.3)
    } finally {
      setIsReacting(false)
      // Stop particles after reaction
      setTimeout(() => setShowParticles(false), 3000)
    }
  }

  const clearBeaker = () => {
    console.log('Clear workbench clicked (Practical)')
    
    // Reset everything to initial state
    setBeakerContents([])
    setBeakerColor('#e0f2fe')
    setReactionResult(null)
    setShowResult(false)
    setShowParticles(false)
    
    // Play cleaning sound
    playSound('cleaning', 0.3)
    
    console.log('Workbench completely cleared (Practical)')
  }

  // New feature handlers
  const handleSafetyQuizComplete = (passed: boolean) => {
    setSafetyQuizPassed(passed)
    setShowSafetyQuiz(false)
    
    if (passed) {
      // Allow adding the dangerous element
      addElementToBeaker()
    }
  }

  const toggleMolecularViewer = () => {
    setShowMolecularViewer(!showMolecularViewer)
  }

  const handleTemperatureChange = (newTemp: number) => {
    setTemperature(newTemp)
    playSound('beep', 0.2)
  }

  const handlePressureChange = (newPressure: number) => {
    setPressure(newPressure)
    playSound('beep', 0.2)
  }

  const handleSaveExperiment = async (title: string, description?: string) => {
    if (!reactionResult) {
      throw new Error('No reaction result to save')
    }

    const response = await fetch('/api/experiments/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mode: 'practical',
        title,
        description,
        elements: beakerContents.map(spec => `${spec.molecules}×${spec.element}`),
        temperature,
        pressure,
        volume,
        weight,
        result: reactionResult
      })
    })

    const data = await response.json()
    if (!data.success) {
      throw new Error(data.error || 'Failed to save experiment')
    }
  }

  const resetParameters = () => {
    setTemperature(25)
    setPressure(1.0)
    setVolume(100)
    setWeight(10)
  }

  const toggleElementSelection = (elementName: string) => {
    setSelectedElement(elementName === selectedElement ? '' : elementName)
    if (elementName !== selectedElement) {
      setShowElementSelector(true)
    }
  }

  const addSelectedElementsToBeaker = () => {
    // This function is replaced by addElementToBeaker
    addElementToBeaker()
  }

  const clearSelectedElements = () => {
    setSelectedElement('')
    setSelectedMolecules(1)
    setSelectedWeight(1)
    setShowElementSelector(false)
  }

  return (
    <div>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
        <nav className="bg-white/80 backdrop-blur-md border-b border-purple-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <Link href="/dashboard" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
                  <Home className="h-5 w-5" />
                  <span>Dashboard</span>
                </Link>
                <div className="flex items-center space-x-2">
                  <FlaskConical className="h-8 w-8 text-purple-600" />
                  <span className="text-xl font-bold text-gray-900">Practical Mode</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={runExperiment}
                  disabled={beakerContents.length < 1 || isReacting}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Play className="h-4 w-4" />
                  <span>{isReacting ? 'Running...' : 'Run Experiment'}</span>
                </button>
                <UserButton />
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              {/* Lab Panel Tabs */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-purple-200 mb-6">
                <div className="flex border-b border-purple-200">
                  {[
                    { id: 'elements' as LabPanel, label: 'Elements', icon: FlaskConical },
                    { id: 'equipment' as LabPanel, label: 'Equipment', icon: Scale },
                    { id: 'analysis' as LabPanel, label: 'Analysis', icon: Droplets },
                    { id: 'safety' as LabPanel, label: 'Safety', icon: AlertTriangle },
                    { id: 'sounds' as LabPanel, label: 'Audio', icon: Volume2 }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActivePanel(tab.id)}
                      className={`flex-1 flex items-center justify-center space-x-1 px-3 py-3 text-sm font-medium transition-colors
                        ${activePanel === tab.id 
                          ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50' 
                          : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                      <tab.icon className="h-4 w-4" />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                  ))}
                </div>

                <div className="p-6">
                  {/* Elements Panel */}
                  {activePanel === 'elements' && (
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-4">Elements</h2>
                      
                      {selectedElement && showElementSelector && (
                        <div className="mb-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                          <h3 className="font-medium text-purple-800 mb-3">Selected: {selectedElement}</h3>
                          
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Number of Molecules: {selectedMolecules}
                              </label>
                              <input
                                type="range"
                                min="1"
                                max="10"
                                value={selectedMolecules}
                                onChange={(e) => setSelectedMolecules(Number(e.target.value))}
                                className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer"
                              />
                              <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>1</span>
                                <span>10</span>
                              </div>
                            </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Weight (grams): {selectedWeight}g
                        </label>
                        <input
                          type="range"
                          min="0.1"
                          max="50"
                          step="0.1"
                          value={selectedWeight}
                          onChange={(e) => setSelectedWeight(Number(e.target.value))}
                          className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>0.1g</span>
                          <span>50g</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2 mt-4">
                      <button
                        onClick={clearSelectedElements}
                        className="flex-1 px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={addElementToBeaker}
                        className="flex-1 px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm"
                      >
                        Add to Beaker
                      </button>
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                  {elements.map((element) => (
                    <div key={element.symbol} className="flex justify-center">
                      <div
                        onClick={() => toggleElementSelection(element.name)}
                        className={`cursor-pointer transform transition-all duration-200 hover:scale-105 ${
                          selectedElement === element.name 
                            ? 'ring-2 ring-purple-500 ring-offset-2' 
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
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-purple-200 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center">
                    <Settings className="h-5 w-5 text-purple-600 mr-2" />
                    Parameters
                  </h2>
                  <button
                    onClick={resetParameters}
                    className="text-sm text-purple-600 hover:text-purple-800"
                  >
                    Reset
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <Thermometer className="h-4 w-4 text-red-500 mr-2" />
                        <label className="text-sm font-medium text-gray-700">Temperature</label>
                      </div>
                      <span className="text-sm text-gray-600">{temperature}°C</span>
                    </div>
                    <input
                      type="range"
                      min="-50"
                      max="500"
                      value={temperature}
                      onChange={(e) => setTemperature(Number(e.target.value))}
                      className="w-full h-2 bg-red-200 rounded-lg appearance-none cursor-pointer slider-thumb-red"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>-50°C</span>
                      <span>500°C</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <Gauge className="h-4 w-4 text-blue-500 mr-2" />
                        <label className="text-sm font-medium text-gray-700">Pressure</label>
                      </div>
                      <span className="text-sm text-gray-600">{pressure.toFixed(1)} atm</span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="10"
                      step="0.1"
                      value={pressure}
                      onChange={(e) => setPressure(Number(e.target.value))}
                      className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>0.1 atm</span>
                      <span>10 atm</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <Droplets className="h-4 w-4 text-cyan-500 mr-2" />
                        <label className="text-sm font-medium text-gray-700">Volume</label>
                      </div>
                      <span className="text-sm text-gray-600">{volume} mL</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="500"
                      value={volume}
                      onChange={(e) => setVolume(Number(e.target.value))}
                      className="w-full h-2 bg-cyan-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>10 mL</span>
                      <span>500 mL</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <Scale className="h-4 w-4 text-green-500 mr-2" />
                        <label className="text-sm font-medium text-gray-700">Weight</label>
                      </div>
                      <span className="text-sm text-gray-600">{weight} g</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={weight}
                      onChange={(e) => setWeight(Number(e.target.value))}
                      className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>1 g</span>
                      <span>100 g</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-3">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-purple-200 p-8">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900">Laboratory Workstation</h2>
                  
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={clearBeaker}
                      className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <RotateCcw className="h-4 w-4" />
                      <span>Clear</span>
                    </button>
                  </div>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start space-x-2">
                    <Lightbulb className="h-5 w-5 text-purple-600 mt-0.5" />
                    <div className="text-sm text-purple-800">
                      <p className="font-medium mb-1">How to run experiments:</p>
                      <p>1. Click elements to select and configure molecules/weight</p>
                      <p>2. Set temperature, pressure, and other parameters</p>
                      <p>3. Click "React" to see AI-predicted reactions</p>
                    </div>
                  </div>
                </div>

                {beakerContents.length > 0 && (
                  <div className="mb-4 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
                    <div className="mb-3 text-center">
                      <div className="font-semibold text-black mb-1">Elements in beaker</div>
                    </div>
                    <div className="space-y-3">
                      {beakerContents.map((spec, index) => (
                        <div
                          key={`${spec.element}-${index}`}
                          className="flex items-center justify-between bg-white/60 px-3 py-3 rounded border mb-2"
                        >
                          <div className="flex items-center">
                            <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs mr-3 font-bold">
                              {index + 1}
                            </span>
                            <div>
                              <span className="font-medium text-purple-800">{spec.element}</span>
                              <div className="text-xs text-black">
                                {spec.molecules} molecules • {spec.weight}g
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              const newContents = beakerContents.filter((_, i) => i !== index)
                              setBeakerContents(newContents)
                              setShowResult(false)
                              setReactionResult(null)
                            }}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="text-sm text-gray-600 bg-white/60 px-3 py-1 rounded border mt-2">
                      <span className="font-medium">Reaction sequence:</span> {beakerContents.map(spec => `${spec.molecules}×${spec.element}(${spec.weight}g)`).join(' + ')}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-4 gap-4 mb-6 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{temperature}°C</div>
                    <div className="text-xs text-gray-600">Temperature</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{pressure.toFixed(1)}</div>
                    <div className="text-xs text-gray-600">atm</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-cyan-600">{volume}</div>
                    <div className="text-xs text-gray-600">mL</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{weight}</div>
                    <div className="text-xs text-gray-600">grams</div>
                  </div>
                </div>

                <div className="min-h-64 bg-gradient-to-b from-blue-50 to-blue-100 rounded-xl p-8 border-2 border-dashed border-blue-300 flex justify-center items-center">
                  <div className="text-center w-full">
                    <div className="flex justify-center mb-4">
                      <Beaker
                        id="practical-beaker"
                        contents={beakerContents.map(spec => spec.element)}
                        color={beakerColor}
                        onDrop={handleElementDrop}
                        size="large"
                      />
                    </div>
                      
                    {isReacting && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-4 text-purple-600 font-medium"
                      >
                        <div className="animate-spin inline-block w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full mr-2"></div>
                        Running experiment...
                      </motion.div>
                    )}
                    
                    {beakerContents.length > 0 && (
                      <div className="mt-4 text-center">
                        <div className="text-sm text-black font-medium mb-2">
                          {beakerContents.length} element{beakerContents.length !== 1 ? 's' : ''}
                        </div>
                        <div className="text-sm text-black">
                          <div className="font-medium mb-1">Contents:</div>
                          <div className="flex flex-wrap justify-center gap-2">
                            {beakerContents.map((spec, index) => (
                              <span key={index} className="inline-flex items-center bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                                {spec.molecules}×{spec.element}({spec.weight}g)
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {showResult && reactionResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-xl p-6 border border-purple-200"
                  >
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                      <Zap className="h-6 w-6 text-purple-600 mr-2" />
                      Experiment Results - Compound Formed!
                    </h3>
                    
                    <div className="grid md:grid-cols-3 gap-6 mb-6">
                      <div className="flex flex-col items-center">
                        <h4 className="font-semibold text-gray-700 mb-3">Visual Model</h4>
                        <div className="relative">
                          <motion.div
                            initial={{ scale: 0, rotate: 0 }}
                            animate={{ scale: 1, rotate: 360 }}
                            transition={{ duration: 1, type: "spring" }}
                            className="w-24 h-24 rounded-lg border-4 border-gray-300 flex items-center justify-center text-gray-800 font-bold text-lg shadow-lg"
                            style={{ 
                              backgroundColor: reactionResult.color,
                              borderColor: reactionResult.color === '#e0f2fe' ? '#6B7280' : reactionResult.color,
                              color: reactionResult.color === '#1f2937' ? '#ffffff' : '#1f2937'
                            }}
                          >
                            {reactionResult.chemicalFormula}
                          </motion.div>
                          
                          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-white rounded-full text-xs font-medium border shadow-sm">
                            {(() => {
                              const state = reactionResult.state.toLowerCase();
                              if (state.includes('solid') || state.includes('crystal')) return '🧊';
                              if (state.includes('liquid') || state.includes('aqueous')) return '💧';
                              if (state.includes('gas') || state.includes('vapor') || state.includes('steam')) return '💨';
                              // For other states like plasma, return just the text
                              return reactionResult.state.split('(')[0].trim();
                            })()}
                          </div>
                        </div>
                      </div>

                      <div className="bg-white/60 rounded-lg p-4 mb-4">
                        <h4 className="font-semibold text-black mb-3">Product Properties</h4>
                        <div className="space-y-2 text-sm text-black">
                          <div><span className="font-medium">Name:</span> {reactionResult.compoundName}</div>
                          <div><span className="font-medium">Formula:</span> <span className="font-mono text-lg">{reactionResult.chemicalFormula}</span></div>
                          <div>
                            <span className="font-medium">State:</span> 
                            <span className="capitalize ml-1">
                              {(() => {
                                const state = reactionResult.state.toLowerCase();
                                if (state.includes('solid') || state.includes('crystal')) return '🧊';
                                if (state.includes('liquid') || state.includes('aqueous')) return '💧';
                                if (state.includes('gas') || state.includes('vapor') || state.includes('steam')) return '💨';
                                // For other states like plasma, return just the text
                                return reactionResult.state.split('(')[0].trim();
                              })()}
                            </span>
                            {reactionResult.state.includes('(') && (
                              <span className="text-xs text-gray-600 ml-1">
                                ({reactionResult.state.split('(')[1]}
                              </span>
                            )}
                          </div>
                          <div>
                            <span className="font-medium">Color:</span>
                            <div className="inline-flex items-center space-x-2 ml-1">
                              <span className="capitalize">
                                {(() => {
                                  const colorValue = reactionResult.color.toLowerCase();
                                  if (colorValue === '#e0f2fe' || colorValue === 'clear' || colorValue === 'colorless') {
                                    return 'Colorless';
                                  } else if (colorValue === '#f8fafc' || colorValue === 'white') {
                                    return 'White';
                                  } else if (colorValue === '#1f2937' || colorValue === 'black') {
                                    return 'Black';
                                  } else if (colorValue.startsWith('#')) {
                                    return 'Colored';
                                  } else {
                                    return reactionResult.color;
                                  }
                                })()}
                              </span>
                              <div 
                                className="w-4 h-4 rounded-full border border-gray-300"
                                style={{ backgroundColor: reactionResult.color }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-white/60 rounded-lg p-4 mb-4">
                        <h4 className="font-semibold text-black mb-3">Final Conditions</h4>
                        <div className="space-y-2 text-sm text-black">
                          <div><span className="font-medium">Temperature:</span> {reactionResult.temperature || temperature}°C</div>
                          <div><span className="font-medium">Pressure:</span> {reactionResult.pressure || pressure} atm</div>
                          <div><span className="font-medium">Volume:</span> {volume} mL</div>
                          <div><span className="font-medium">Mass:</span> {weight} g</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/60 rounded-lg p-4 mb-6">
                      <h4 className="font-semibold text-black mb-3">Chemical Equation</h4>
                      <div className="text-sm">
                        {reactionResult.reactionEquation ? (
                          <div className="font-mono bg-gray-100 p-3 rounded text-center text-black border">
                            {reactionResult.reactionEquation}
                          </div>
                        ) : (
                          <div className="font-mono bg-gray-100 p-3 rounded text-center text-black border">
                            {beakerContents.map(spec => `${spec.molecules}×${spec.element}(${spec.weight}g)`).join(' + ')} → {reactionResult.chemicalFormula}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-white/60 rounded-lg p-4 mb-4">
                      <h4 className="font-semibold text-black mb-3">Scientific Analysis</h4>
                      <p className="text-black text-sm leading-relaxed">{reactionResult.explanation}</p>
                    </div>

                    {reactionResult.safetyWarnings && reactionResult.safetyWarnings.length > 0 && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                        <h4 className="font-semibold text-yellow-800 mb-2 flex items-center">
                          ⚠️ Safety Information:
                        </h4>
                        <ul className="text-yellow-700 text-sm space-y-1">
                          {reactionResult.safetyWarnings.map((warning, index) => (
                            <li key={index} className="flex items-start">
                              <span className="text-yellow-600 mr-2">•</span>
                              <span>{warning}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex justify-end">
                      <button
                        onClick={() => setShowSaveDialog(true)}
                        className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        <Save className="h-4 w-4" />
                        <span>Save to Journal</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Save Experiment Dialog */}
      <SaveExperimentDialog
        isOpen={showSaveDialog}
        onClose={() => setShowSaveDialog(false)}
        onSave={handleSaveExperiment}
        mode="practical"
        defaultName={`Practical-${beakerContents.map(spec => `${spec.molecules}x${spec.element}`).join('-')}-${temperature}C`}
      />
    </div>
  )
}
