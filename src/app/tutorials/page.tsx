'use client'

import { useState } from 'react'
import { UserButton } from '@clerk/nextjs'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Home, 
  BookOpen, 
  Play, 
  FlaskConical, 
  ChevronRight, 
  ChevronLeft,
  Lightbulb,
  Target,
  Zap,
  Save,
  Edit3,
  Eye,
  Trash2,
  Copy
} from 'lucide-react'
import Link from 'next/link'

interface Tutorial {
  id: string
  title: string
  description: string
  category: 'basics' | 'play-mode' | 'practical-mode' | 'advanced'
  steps: {
    title: string
    description: string
    image?: string
    tips?: string[]
  }[]
}

export default function TutorialsPage() {
  const [selectedTutorial, setSelectedTutorial] = useState<Tutorial | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [activeCategory, setActiveCategory] = useState<'all' | 'basics' | 'play-mode' | 'practical-mode' | 'advanced'>('all')

  const tutorials: Tutorial[] = [
    {
      id: 'getting-started',
      title: 'Getting Started with Virtual Chemistry Lab',
      description: 'Learn the basics of navigating and using the virtual chemistry lab interface.',
      category: 'basics',
      steps: [
        {
          title: 'Welcome to Your Virtual Lab',
          description: 'Your virtual chemistry lab provides a safe environment to explore chemical reactions without physical materials.',
          tips: [
            'No real chemicals are used - experiment freely!',
            'All reactions are AI-predicted for educational purposes',
            'Your experiments are automatically saved to your journal'
          ]
        },
        {
          title: 'Understanding the Dashboard',
          description: 'The dashboard is your home base with quick access to all lab features.',
          tips: [
            'Play Mode: Quick experiments with simple drag-and-drop',
            'Practical Mode: Detailed experiments with real lab parameters',
            'Experiment History: View and manage your saved experiments'
          ]
        },
        {
          title: 'Lab Safety in Virtual Environment',
          description: 'Even in virtual experiments, understanding safety is crucial for real-world application.',
          tips: [
            'Pay attention to safety warnings in results',
            'Learn about dangerous chemical combinations',
            'Understand protective equipment requirements'
          ]
        }
      ]
    },
    {
      id: 'play-mode-guide',
      title: 'Play Mode: Quick Experiments',
      description: 'Master the simplified Play Mode for rapid experimentation and learning.',
      category: 'play-mode',
      steps: [
        {
          title: 'Selecting Elements',
          description: 'Choose elements from the periodic table to add to your experiment.',
          tips: [
            'Click on any element to select it',
            'Selected elements appear in the sidebar',
            'You can select multiple elements for complex reactions'
          ]
        },
        {
          title: 'Adding to Beaker',
          description: 'Transfer your selected elements to the reaction beaker.',
          tips: [
            'Click "Add Selected Elements to Beaker"',
            'You can specify the number of molecules',
            'The beaker shows all your current elements'
          ]
        },
        {
          title: 'Running Experiments',
          description: 'Execute your reaction and see the AI-predicted results.',
          tips: [
            'Click "Run Experiment" to start the reaction',
            'Results show compound name, formula, and properties',
            'Watch for color changes and state transitions'
          ]
        },
        {
          title: 'Saving Your Work',
          description: 'Save interesting experiments to your personal journal.',
          tips: [
            'Click "Save to Journal" after running an experiment',
            'Give your experiment a descriptive name',
            'Add notes about what you learned'
          ]
        }
      ]
    },
    {
      id: 'practical-mode-guide',
      title: 'Practical Mode: Advanced Experiments',
      description: 'Learn to use Practical Mode with real laboratory parameters and conditions.',
      category: 'practical-mode',
      steps: [
        {
          title: 'Understanding Lab Parameters',
          description: 'Practical Mode includes real laboratory conditions that affect reactions.',
          tips: [
            'Temperature: Affects reaction speed and outcomes',
            'Pressure: Important for gas reactions',
            'Volume: Determines concentration',
            'Weight: Affects stoichiometry'
          ]
        },
        {
          title: 'Setting Up Experiments',
          description: 'Configure your experiment with precise measurements.',
          tips: [
            'Adjust temperature using the slider (0°C to 100°C)',
            'Set pressure for gas reactions (0.1 to 5 atm)',
            'Control volume for proper concentrations',
            'Specify exact weights of materials'
          ]
        },
        {
          title: 'Adding Reagents with Precision',
          description: 'Add chemicals with specific quantities and ratios.',
          tips: [
            'Select elements from the periodic table',
            'Specify exact number of molecules',
            'Set individual weights for each component',
            'Consider stoichiometric ratios'
          ]
        },
        {
          title: 'Analyzing Results',
          description: 'Interpret detailed results with professional accuracy.',
          tips: [
            'Review chemical equations and balanced formulas',
            'Check final temperature and pressure readings',
            'Note any safety warnings or hazards',
            'Document observations for future reference'
          ]
        }
      ]
    },
    {
      id: 'experiment-management',
      title: 'Managing Your Experiments',
      description: 'Learn to organize, edit, and share your experimental data.',
      category: 'advanced',
      steps: [
        {
          title: 'Experiment History Overview',
          description: 'Access and organize all your saved experiments.',
          tips: [
            'Filter experiments by Play or Practical mode',
            'Search for specific experiments by name',
            'Sort by date or experiment type',
            'View detailed results and parameters'
          ]
        },
        {
          title: 'Editing Existing Experiments',
          description: 'Continue working on previous experiments with new modifications.',
          tips: [
            'Click the edit button on any saved experiment',
            'Automatically loads all previous settings',
            'Add new elements or modify parameters',
            'Save as a new experiment or update existing'
          ]
        },
        {
          title: 'Copying Between Modes',
          description: 'Transfer experiments between Play and Practical modes.',
          tips: [
            'Use the copy function to duplicate experiments',
            'Convert simple Play experiments to detailed Practical',
            'Simplify complex Practical experiments for quick testing',
            'Maintain experiment history and notes'
          ]
        },
        {
          title: 'Organizing Your Lab Journal',
          description: 'Keep your experiments organized and accessible.',
          tips: [
            'Use descriptive names for easy identification',
            'Add detailed descriptions and observations',
            'Delete unsuccessful or duplicate experiments',
            'Export or share important findings'
          ]
        }
      ]
    },
    {
      id: 'ai-predictions',
      title: 'Understanding AI Predictions',
      description: 'Learn how the AI system predicts chemical reactions and interprets results.',
      category: 'advanced',
      steps: [
        {
          title: 'How AI Predictions Work',
          description: 'The system uses advanced models to predict realistic chemical outcomes.',
          tips: [
            'Based on real chemical principles and data',
            'Considers temperature, pressure, and concentration effects',
            'Provides safety warnings for dangerous combinations',
            'Educational tool - not a substitute for real lab work'
          ]
        },
        {
          title: 'Interpreting Results',
          description: 'Understand what the AI predictions tell you about the reaction.',
          tips: [
            'Compound names follow IUPAC naming conventions',
            'Chemical formulas show actual molecular composition',
            'Color changes indicate real reaction properties',
            'State changes (solid/liquid/gas) reflect actual physics'
          ]
        },
        {
          title: 'Safety Information',
          description: 'Pay attention to AI-generated safety warnings and recommendations.',
          tips: [
            'Red warnings indicate potentially dangerous reactions',
            'Yellow cautions suggest careful handling required',
            'Green indicators show generally safe combinations',
            'Always research real safety data for actual lab work'
          ]
        },
        {
          title: 'Limitations and Best Practices',
          description: 'Understand the boundaries of AI predictions for educational use.',
          tips: [
            'Predictions are educational approximations',
            'Real lab results may vary due to impurities',
            'Complex reactions may have simplified predictions',
            'Always verify with authoritative chemistry sources'
          ]
        }
      ]
    }
  ]

  const filteredTutorials = activeCategory === 'all' 
    ? tutorials 
    : tutorials.filter(tutorial => tutorial.category === activeCategory)

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'basics': return <BookOpen className="h-4 w-4" />
      case 'play-mode': return <Play className="h-4 w-4" />
      case 'practical-mode': return <FlaskConical className="h-4 w-4" />
      case 'advanced': return <Target className="h-4 w-4" />
      default: return <Lightbulb className="h-4 w-4" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'basics': return 'bg-blue-100 text-blue-800'
      case 'play-mode': return 'bg-green-100 text-green-800'
      case 'practical-mode': return 'bg-purple-100 text-purple-800'
      case 'advanced': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const nextStep = () => {
    if (selectedTutorial && currentStep < selectedTutorial.steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const startTutorial = (tutorial: Tutorial) => {
    setSelectedTutorial(tutorial)
    setCurrentStep(0)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-blue-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="flex items-center space-x-2 text-black hover:text-gray-700">
                <Home className="h-5 w-5" />
                <span>Dashboard</span>
              </Link>
              <div className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                <span className="text-xl font-bold text-black">Lab Tutorials</span>
              </div>
            </div>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!selectedTutorial ? (
          <div className="space-y-8">
            {/* Header */}
            <div className="text-center">
              <h1 className="text-4xl font-bold text-black mb-4">Chemistry Lab Tutorials</h1>
              <p className="text-lg text-black max-w-3xl mx-auto">
                Master your virtual chemistry lab with step-by-step tutorials covering everything from basic navigation to advanced experimental techniques.
              </p>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap justify-center gap-4">
              {[
                { key: 'all', label: 'All Tutorials', icon: <BookOpen className="h-4 w-4" /> },
                { key: 'basics', label: 'Basics', icon: <BookOpen className="h-4 w-4" /> },
                { key: 'play-mode', label: 'Play Mode', icon: <Play className="h-4 w-4" /> },
                { key: 'practical-mode', label: 'Practical Mode', icon: <FlaskConical className="h-4 w-4" /> },
                { key: 'advanced', label: 'Advanced', icon: <Target className="h-4 w-4" /> }
              ].map(({ key, label, icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveCategory(key as any)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeCategory === key
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-black hover:bg-blue-50'
                  }`}
                >
                  {icon}
                  <span>{label}</span>
                </button>
              ))}
            </div>

            {/* Tutorial Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTutorials.map((tutorial) => (
                <motion.div
                  key={tutorial.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl shadow-lg border border-blue-100 overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                  onClick={() => startTutorial(tutorial)}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(tutorial.category)}`}>
                        {getCategoryIcon(tutorial.category)}
                        <span className="capitalize">{tutorial.category.replace('-', ' ')}</span>
                      </div>
                      <div className="text-black">
                        {tutorial.steps.length} steps
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-black mb-3">{tutorial.title}</h3>
                    <p className="text-black text-sm leading-relaxed mb-4">{tutorial.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-blue-600">
                        <span className="text-sm font-medium">Start Tutorial</span>
                        <ChevronRight className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          /* Tutorial Viewer */
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg border border-blue-100 overflow-hidden">
              {/* Tutorial Header */}
              <div className="bg-blue-600 text-white p-6">
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => setSelectedTutorial(null)}
                    className="flex items-center space-x-2 text-blue-100 hover:text-white transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Back to Tutorials</span>
                  </button>
                  <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium bg-white/20`}>
                    {getCategoryIcon(selectedTutorial.category)}
                    <span className="capitalize">{selectedTutorial.category.replace('-', ' ')}</span>
                  </div>
                </div>
                
                <h1 className="text-2xl font-bold mb-2">{selectedTutorial.title}</h1>
                <p className="text-blue-100">{selectedTutorial.description}</p>
                
                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span>Step {currentStep + 1} of {selectedTutorial.steps.length}</span>
                    <span>{Math.round(((currentStep + 1) / selectedTutorial.steps.length) * 100)}% Complete</span>
                  </div>
                  <div className="w-full bg-blue-500 rounded-full h-2">
                    <div 
                      className="bg-white rounded-full h-2 transition-all duration-300"
                      style={{ width: `${((currentStep + 1) / selectedTutorial.steps.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Step Content */}
              <div className="p-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h2 className="text-2xl font-bold text-black mb-4">
                      {selectedTutorial.steps[currentStep].title}
                    </h2>
                    
                    <p className="text-black text-lg leading-relaxed mb-6">
                      {selectedTutorial.steps[currentStep].description}
                    </p>

                    {selectedTutorial.steps[currentStep].tips && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center space-x-2 mb-3">
                          <Lightbulb className="h-5 w-5 text-blue-600" />
                          <h3 className="font-semibold text-black">Tips & Best Practices</h3>
                        </div>
                        <ul className="space-y-3">
                          {selectedTutorial.steps[currentStep].tips!.map((tip, index) => (
                            <li key={index} className="flex items-start space-x-3">
                              <span className="text-blue-600 mt-1 text-lg leading-none">•</span>
                              <span className="text-black text-sm leading-relaxed flex-1">{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Navigation */}
              <div className="bg-gray-50 px-8 py-4 flex items-center justify-between">
                <button
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-200 text-black rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Previous</span>
                </button>

                <div className="text-black text-sm">
                  {currentStep + 1} / {selectedTutorial.steps.length}
                </div>

                {currentStep < selectedTutorial.steps.length - 1 ? (
                  <button
                    onClick={nextStep}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <span>Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => setSelectedTutorial(null)}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <span>Complete</span>
                    <Zap className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
