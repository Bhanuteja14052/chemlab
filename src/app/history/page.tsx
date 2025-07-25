'use client'

import { useState, useEffect } from 'react'
import { UserButton } from '@clerk/nextjs'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  History, 
  Home, 
  Filter, 
  Calendar, 
  FlaskConical, 
  Beaker, 
  Eye, 
  Download, 
  Trash2,
  Edit3,
  Copy,
  ExternalLink,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface ExperimentResult {
  compoundName: string
  chemicalFormula: string
  color: string
  state: string
  safetyWarnings: string[]
  explanation: string
  reactionEquation?: string
}

interface ExperimentData {
  id: string
  mode: 'play' | 'practical'
  title: string
  description: string
  elements: string[]
  result: ExperimentResult
  tags: string[]
  createdAt: string
  updatedAt: string
  parameters: {
    temperature?: number
    pressure?: number
    volume?: number
    weight?: number
  }
}

export default function ExperimentHistoryPage() {
  const router = useRouter()
  const [experiments, setExperiments] = useState<ExperimentData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'play' | 'practical'>('all')
  const [selectedExperiment, setSelectedExperiment] = useState<ExperimentData | null>(null)
  const [copyDialogOpen, setCopyDialogOpen] = useState<ExperimentData | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<ExperimentData | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchExperiments()
  }, [filter])

  const fetchExperiments = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const params = new URLSearchParams()
      if (filter !== 'all') {
        params.append('mode', filter)
      }
      
      const response = await fetch(`/api/experiments/history?${params}`)
      const data = await response.json()
      
      if (data.success) {
        setExperiments(data.experiments)
      } else {
        setError(data.error || 'Failed to fetch experiments')
      }
    } catch (error) {
      console.error('Error fetching experiments:', error)
      setError('Failed to fetch experiments')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getModeColor = (mode: string) => {
    return mode === 'play' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'
  }

  const getModeIcon = (mode: string) => {
    return mode === 'play' ? <Beaker className="h-4 w-4" /> : <FlaskConical className="h-4 w-4" />
  }

  const handleEdit = (experiment: ExperimentData) => {
    // Navigate to the appropriate mode with experiment data
    const baseUrl = experiment.mode === 'play' ? '/play' : '/practical'
    
    // Store experiment data in localStorage for the mode to pick up
    localStorage.setItem('editExperiment', JSON.stringify({
      ...experiment,
      isEditing: true
    }))
    
    router.push(baseUrl)
  }

  const handleCopy = async (experiment: ExperimentData, newMode: 'play' | 'practical', newTitle: string) => {
    try {
      const response = await fetch(`/api/experiments/${experiment.id}/copy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newMode,
          newTitle
        })
      })

      const data = await response.json()
      
      if (data.success) {
        // Refresh the experiments list
        fetchExperiments()
        setCopyDialogOpen(null)
        alert(`Experiment copied to ${newMode} mode successfully!`)
      } else {
        alert('Failed to copy experiment: ' + (data.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error copying experiment:', error)
      alert('Failed to copy experiment')
    }
  }

  const handleDelete = async (experiment: ExperimentData) => {
    if (isDeleting) return // Prevent multiple deletions
    
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/experiments/${experiment.id}`, {
        method: 'DELETE',
        signal: AbortSignal.timeout(10000) // 10 second timeout
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success) {
        // Remove from local state immediately for better UX
        setExperiments(prev => prev.filter(exp => exp.id !== experiment.id))
        setDeleteConfirmOpen(null)
        // Use a more subtle notification
        const notification = document.createElement('div')
        notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50'
        notification.textContent = 'Experiment deleted successfully!'
        document.body.appendChild(notification)
        setTimeout(() => {
          document.body.removeChild(notification)
        }, 3000)
      } else {
        throw new Error(data.error || 'Failed to delete experiment')
      }
    } catch (error) {
      console.error('Error deleting experiment:', error)
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          alert('Delete operation timed out. Please check your connection and try again.')
        } else {
          alert(`Failed to delete experiment: ${error.message}`)
        }
      } else {
        alert('Failed to delete experiment. Please try again.')
      }
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white/80 backdrop-blur-md border-b border-blue-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
                <Home className="h-5 w-5" />
                <span>Dashboard</span>
              </Link>
              <div className="flex items-center space-x-2">
                <History className="h-8 w-8 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">Experiment History</span>
              </div>
            </div>
            
            <UserButton />
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Bar */}
        <div className="mb-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Filter className="h-5 w-5 text-black" />
              <span className="font-medium text-black">Filter by mode:</span>
              <div className="flex space-x-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    filter === 'all' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  All Experiments
                </button>
                <button
                  onClick={() => setFilter('play')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    filter === 'play' 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Play Mode
                </button>
                <button
                  onClick={() => setFilter('practical')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    filter === 'practical' 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Practical Mode
                </button>
              </div>
            </div>
            
            <div className="text-sm text-black">
              {experiments.length} experiment{experiments.length !== 1 ? 's' : ''} found
            </div>
          </div>
        </div>

        {/* Experiments Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-black">Loading experiments...</span>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-600 mb-4">{error}</div>
            <button
              onClick={fetchExperiments}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        ) : experiments.length === 0 ? (
          <div className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-200">
            <History className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-black mb-2">No Experiments Found</h3>
            <p className="text-black mb-6">
              You haven't saved any experiments to your journal yet.
            </p>
            <div className="flex justify-center space-x-4">
              <Link 
                href="/play"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Start Playing
              </Link>
              <Link 
                href="/practical"
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Run Experiments
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {experiments.map((experiment) => (
              <motion.div
                key={experiment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-200 p-6 hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => setSelectedExperiment(experiment)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${getModeColor(experiment.mode)}`}>
                    {getModeIcon(experiment.mode)}
                    <span>{experiment.mode === 'play' ? 'Play Mode' : 'Practical Mode'}</span>
                  </div>
                  <div className="flex items-center text-sm text-black">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatDate(experiment.createdAt)}
                  </div>
                </div>

                <h3 className="text-lg font-bold text-black mb-2">{experiment.title}</h3>
                
                <div className="mb-4">
                  <p className="text-sm text-black mb-2">Elements: {experiment.elements.join(', ')}</p>
                  <p className="text-sm font-medium text-black">
                    Result: {experiment.result.compoundName} ({experiment.result.chemicalFormula})
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div 
                    className="w-6 h-6 rounded-full border-2 border-gray-300"
                    style={{ backgroundColor: experiment.result.color }}
                    title={`Color: ${experiment.result.color}`}
                  ></div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedExperiment(experiment)
                      }}
                      className="flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                      title="View Details"
                    >
                      <Eye className="h-3 w-3" />
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEdit(experiment)
                      }}
                      className="flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
                      title="Edit Experiment"
                    >
                      <Edit3 className="h-3 w-3" />
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setCopyDialogOpen(experiment)
                      }}
                      className="flex items-center space-x-1 px-2 py-1 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors text-sm"
                      title="Copy to Another Mode"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setDeleteConfirmOpen(experiment)
                      }}
                      className="flex items-center space-x-1 px-2 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                      title="Delete Experiment"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Experiment Detail Modal */}
        {selectedExperiment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-black">Experiment Details</h2>
                  <button
                    onClick={() => setSelectedExperiment(null)}
                    className="text-black hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${getModeColor(selectedExperiment.mode)} mb-4`}>
                      {getModeIcon(selectedExperiment.mode)}
                      <span>{selectedExperiment.mode === 'play' ? 'Play Mode' : 'Practical Mode'}</span>
                    </div>
                    <h3 className="text-xl font-bold mb-2">{selectedExperiment.title}</h3>
                    <p className="text-black">{selectedExperiment.description}</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-bold text-black mb-3">Input Elements</h4>
                      <div className="space-y-2">
                        {selectedExperiment.elements.map((element, index) => (
                          <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            <span className="text-sm text-black">{element}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-bold text-black mb-3">Result</h4>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <div 
                            className="w-8 h-8 rounded-full border-2 border-gray-300"
                            style={{ backgroundColor: selectedExperiment.result.color }}
                          ></div>
                          <div>
                            <p className="font-medium text-black">{selectedExperiment.result.compoundName}</p>
                            <p className="text-sm text-black">{selectedExperiment.result.chemicalFormula}</p>
                          </div>
                        </div>
                        <div className="text-sm text-black">
                          <strong>State:</strong> {selectedExperiment.result.state}
                        </div>
                      </div>
                    </div>
                  </div>

                  {selectedExperiment.result.explanation && (
                    <div>
                      <h4 className="font-bold text-black mb-3">Explanation</h4>
                      <p className="text-sm text-black bg-gray-50 p-4 rounded-lg">
                        {selectedExperiment.result.explanation}
                      </p>
                    </div>
                  )}

                  {selectedExperiment.result.safetyWarnings && selectedExperiment.result.safetyWarnings.length > 0 && (
                    <div>
                      <h4 className="font-bold text-gray-900 mb-3">Safety Warnings</h4>
                      <ul className="space-y-1">
                        {selectedExperiment.result.safetyWarnings.map((warning, index) => (
                          <li key={index} className="flex items-center space-x-2 text-sm text-red-700 bg-red-50 p-2 rounded-lg">
                            <span>⚠️</span>
                            <span>{warning}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm text-black">
                      <span>Created: {formatDate(selectedExperiment.createdAt)}</span>
                      <span>Updated: {formatDate(selectedExperiment.updatedAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Copy Experiment Dialog */}
        {copyDialogOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl shadow-xl max-w-md w-full"
            >
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                    <Copy className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-black">Copy Experiment</h3>
                    <p className="text-sm text-black">Copy "{copyDialogOpen.title}" to another mode</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Target Mode
                    </label>
                    <select 
                      id="targetMode"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      defaultValue={copyDialogOpen.mode === 'play' ? 'practical' : 'play'}
                    >
                      <option value="play">Play Mode</option>
                      <option value="practical">Practical Mode</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      New Title
                    </label>
                    <input
                      type="text"
                      id="newTitle"
                      defaultValue={`Copy of ${copyDialogOpen.title}`}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      maxLength={100}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setCopyDialogOpen(null)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      const targetMode = (document.getElementById('targetMode') as HTMLSelectElement).value as 'play' | 'practical'
                      const newTitle = (document.getElementById('newTitle') as HTMLInputElement).value
                      handleCopy(copyDialogOpen, targetMode, newTitle)
                    }}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    Copy Experiment
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        {deleteConfirmOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl shadow-xl max-w-md w-full"
            >
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-black">Delete Experiment</h3>
                    <p className="text-sm text-black">This action cannot be undone</p>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <p className="text-sm text-black">
                    Are you sure you want to delete <strong>"{deleteConfirmOpen.title}"</strong>?
                  </p>
                  <p className="text-xs text-black mt-1">
                    This will permanently remove the experiment from your lab journal.
                  </p>
                </div>

                <div className="flex items-center justify-end space-x-3">
                  <button
                    onClick={() => setDeleteConfirmOpen(null)}
                    disabled={isDeleting}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(deleteConfirmOpen)}
                    disabled={isDeleting}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {isDeleting && (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    )}
                    <span>{isDeleting ? 'Deleting...' : 'Delete Experiment'}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}
