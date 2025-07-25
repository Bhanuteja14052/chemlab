'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, AlertTriangle, CheckCircle, X, HelpCircle } from 'lucide-react'

interface SafetyQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
  difficulty: 'easy' | 'medium' | 'hard'
}

interface SafetyQuizProps {
  elements: string[]
  isOpen: boolean
  onClose: () => void
  onPass: () => void
  onFail: () => void
  requiredScore?: number
}

// Safety questions database
const SAFETY_QUESTIONS: SafetyQuestion[] = [
  {
    id: 'q1',
    question: 'What should you do FIRST when handling strong acids?',
    options: [
      'Wear safety goggles and gloves',
      'Check the temperature',
      'Mix with water immediately',
      'Taste to identify the acid'
    ],
    correctAnswer: 0,
    explanation: 'Always wear proper PPE (Personal Protective Equipment) before handling any chemicals.',
    difficulty: 'easy'
  },
  {
    id: 'q2',
    question: 'When mixing acid and water, what is the correct procedure?',
    options: [
      'Add water to acid',
      'Add acid to water',
      'Mix them simultaneously',
      'Heat them first, then mix'
    ],
    correctAnswer: 1,
    explanation: 'Always add acid to water, never water to acid. This prevents violent exothermic reactions.',
    difficulty: 'medium'
  },
  {
    id: 'q3',
    question: 'What does a "DANGER" safety label indicate?',
    options: [
      'Mildly hazardous',
      'Extremely hazardous - can cause death',
      'Safe for skin contact',
      'Edible substance'
    ],
    correctAnswer: 1,
    explanation: 'DANGER indicates extremely hazardous substances that can cause serious injury or death.',
    difficulty: 'easy'
  },
  {
    id: 'q4',
    question: 'What should you do if you accidentally spill a strong base on your skin?',
    options: [
      'Apply vinegar immediately',
      'Rinse with large amounts of water',
      'Use a towel to wipe it off',
      'Ignore it if it doesn\'t hurt'
    ],
    correctAnswer: 1,
    explanation: 'Rinse immediately with large amounts of water for at least 15 minutes.',
    difficulty: 'medium'
  },
  {
    id: 'q5',
    question: 'Which gas combination is potentially explosive?',
    options: [
      'Oxygen + Carbon Dioxide',
      'Nitrogen + Oxygen',
      'Hydrogen + Oxygen',
      'Helium + Argon'
    ],
    correctAnswer: 2,
    explanation: 'Hydrogen and oxygen can form an explosive mixture. Always ensure proper ventilation.',
    difficulty: 'hard'
  },
  {
    id: 'q6',
    question: 'What is the minimum eye protection required in a chemistry lab?',
    options: [
      'Regular sunglasses',
      'Reading glasses',
      'Safety goggles or safety glasses',
      'No protection needed'
    ],
    correctAnswer: 2,
    explanation: 'Proper safety goggles or safety glasses are essential to protect from chemical splashes.',
    difficulty: 'easy'
  },
  {
    id: 'q7',
    question: 'What should you do if a chemical reaction produces unexpected heat?',
    options: [
      'Add more reactants to speed it up',
      'Stop the reaction and cool it down',
      'Ignore the heat',
      'Add water directly to the mixture'
    ],
    correctAnswer: 1,
    explanation: 'Unexpected heat generation can indicate a dangerous reaction. Stop and cool immediately.',
    difficulty: 'medium'
  },
  {
    id: 'q8',
    question: 'Which statement about chemical fume hoods is correct?',
    options: [
      'They are only decorative',
      'They remove harmful vapors from the lab',
      'They are used for storage',
      'They heat chemicals faster'
    ],
    correctAnswer: 1,
    explanation: 'Fume hoods are essential safety equipment that remove dangerous vapors and gases.',
    difficulty: 'easy'
  },
  {
    id: 'q9',
    question: 'What is the first step when there is a chemical fire?',
    options: [
      'Use water to extinguish it',
      'Call emergency services and evacuate',
      'Try to move the chemicals',
      'Open windows for ventilation'
    ],
    correctAnswer: 1,
    explanation: 'Safety first - call emergency services and evacuate. Some chemical fires cannot be extinguished with water.',
    difficulty: 'hard'
  },
  {
    id: 'q10',
    question: 'When should you read the Safety Data Sheet (SDS) for a chemical?',
    options: [
      'After an accident occurs',
      'Only if you feel like it',
      'Before working with the chemical',
      'Never, they are too long'
    ],
    correctAnswer: 2,
    explanation: 'Always read the SDS before working with any chemical to understand its hazards and safe handling procedures.',
    difficulty: 'medium'
  }
]

// Get questions based on elements being used
const getRelevantQuestions = (elements: string[], difficulty: string[] = ['easy', 'medium']): SafetyQuestion[] => {
  // For now, return random questions based on difficulty
  // In a real app, you'd filter based on the specific elements
  const filteredQuestions = SAFETY_QUESTIONS.filter(q => difficulty.includes(q.difficulty))
  
  // Shuffle and return 5 questions
  const shuffled = [...filteredQuestions].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, 5)
}

export default function SafetyQuiz({ 
  elements, 
  isOpen, 
  onClose, 
  onPass, 
  onFail, 
  requiredScore = 80 
}: SafetyQuizProps) {
  const [questions, setQuestions] = useState<SafetyQuestion[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([])
  const [showResults, setShowResults] = useState(false)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes
  const [quizStarted, setQuizStarted] = useState(false)
  
  useEffect(() => {
    if (isOpen && !quizStarted) {
      // Determine difficulty based on elements
      const hasHighRiskElements = elements.some(el => 
        ['Hydrochloric Acid', 'Sulfuric Acid', 'Sodium Hydroxide', 'Hydrogen'].includes(el)
      )
      
      const difficulty = hasHighRiskElements ? ['easy', 'medium', 'hard'] : ['easy', 'medium']
      const relevantQuestions = getRelevantQuestions(elements, difficulty)
      
      setQuestions(relevantQuestions)
      setSelectedAnswers(new Array(relevantQuestions.length).fill(-1))
      setCurrentQuestionIndex(0)
      setShowResults(false)
      setScore(0)
      setTimeLeft(300)
    }
  }, [isOpen, elements, quizStarted])
  
  // Timer countdown
  useEffect(() => {
    if (isOpen && quizStarted && timeLeft > 0 && !showResults) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            submitQuiz()
            return 0
          }
          return prev - 1
        })
      }, 1000)
      
      return () => clearInterval(timer)
    }
  }, [isOpen, quizStarted, timeLeft, showResults])
  
  const startQuiz = () => {
    setQuizStarted(true)
  }
  
  const selectAnswer = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers]
    newAnswers[currentQuestionIndex] = answerIndex
    setSelectedAnswers(newAnswers)
  }
  
  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      submitQuiz()
    }
  }
  
  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }
  
  const submitQuiz = () => {
    let correctAnswers = 0
    
    questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correctAnswer) {
        correctAnswers++
      }
    })
    
    const finalScore = Math.round((correctAnswers / questions.length) * 100)
    setScore(finalScore)
    setShowResults(true)
    
    if (finalScore >= requiredScore) {
      onPass()
    } else {
      onFail()
    }
  }
  
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }
  
  const resetQuiz = () => {
    setQuizStarted(false)
    setShowResults(false)
    setCurrentQuestionIndex(0)
    setSelectedAnswers(new Array(questions.length).fill(-1))
    setScore(0)
    setTimeLeft(300)
  }
  
  if (!isOpen) return null
  
  const currentQuestion = questions[currentQuestionIndex]
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.8 }}
        className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-red-600" />
            <h2 className="text-xl font-bold text-gray-900">Safety Quiz</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Quiz Introduction */}
        {!quizStarted && !showResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
              <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-900 mb-2">
                Safety Quiz Required
              </h3>
              <p className="text-red-800 mb-4">
                You are about to work with potentially dangerous chemicals. 
                Please complete this safety quiz to proceed.
              </p>
              <div className="text-sm text-red-700 space-y-1">
                <p>• {questions.length} questions</p>
                <p>• 5 minutes time limit</p>
                <p>• {requiredScore}% required to pass</p>
                <p>• You can retake if needed</p>
              </div>
            </div>
            
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-2">Elements in your experiment:</h4>
              <div className="flex flex-wrap justify-center gap-2">
                {elements.map((element, index) => (
                  <span 
                    key={index}
                    className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                  >
                    {element}
                  </span>
                ))}
              </div>
            </div>
            
            <button
              onClick={startQuiz}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Start Safety Quiz
            </button>
          </motion.div>
        )}
        
        {/* Quiz Questions */}
        {quizStarted && !showResults && currentQuestion && (
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            {/* Progress and Timer */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <motion.div
                    className="bg-blue-600 h-2 rounded-full"
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
              
              <div className={`text-sm font-medium ${timeLeft <= 60 ? 'text-red-600' : 'text-gray-600'}`}>
                Time: {formatTime(timeLeft)}
              </div>
            </div>
            
            {/* Question */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {currentQuestion.question}
              </h3>
              
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <motion.button
                    key={index}
                    onClick={() => selectAnswer(index)}
                    className={`w-full text-left p-4 rounded-lg border transition-colors ${
                      selectedAnswers[currentQuestionIndex] === index
                        ? 'bg-blue-50 border-blue-200 text-blue-900'
                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedAnswers[currentQuestionIndex] === index
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300'
                      }`}>
                        {selectedAnswers[currentQuestionIndex] === index && (
                          <div className="w-2 h-2 bg-white rounded-full" />
                        )}
                      </div>
                      <span>{option}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
            
            {/* Navigation */}
            <div className="flex justify-between">
              <button
                onClick={prevQuestion}
                disabled={currentQuestionIndex === 0}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              
              <button
                onClick={nextQuestion}
                disabled={selectedAnswers[currentQuestionIndex] === -1}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {currentQuestionIndex === questions.length - 1 ? 'Submit' : 'Next'}
              </button>
            </div>
          </motion.div>
        )}
        
        {/* Quiz Results */}
        {showResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className={`rounded-lg p-6 mb-6 ${
              score >= requiredScore 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              {score >= requiredScore ? (
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              ) : (
                <X className="h-12 w-12 text-red-600 mx-auto mb-4" />
              )}
              
              <h3 className={`text-2xl font-bold mb-2 ${
                score >= requiredScore ? 'text-green-900' : 'text-red-900'
              }`}>
                {score >= requiredScore ? 'Quiz Passed!' : 'Quiz Failed'}
              </h3>
              
              <p className={`text-lg mb-4 ${
                score >= requiredScore ? 'text-green-800' : 'text-red-800'
              }`}>
                Your Score: {score}% ({questions.filter((_, i) => selectedAnswers[i] === questions[i].correctAnswer).length}/{questions.length})
              </p>
              
              <p className={`text-sm ${
                score >= requiredScore ? 'text-green-700' : 'text-red-700'
              }`}>
                {score >= requiredScore 
                  ? 'You may proceed with the experiment.'
                  : `You need ${requiredScore}% to pass. Please review the explanations and try again.`
                }
              </p>
            </div>
            
            {/* Answer Review */}
            <div className="text-left mb-6 max-h-60 overflow-y-auto">
              {questions.map((question, index) => (
                <div key={question.id} className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">
                    {index + 1}. {question.question}
                  </h4>
                  
                  <div className={`text-sm mb-2 ${
                    selectedAnswers[index] === question.correctAnswer ? 'text-green-600' : 'text-red-600'
                  }`}>
                    Your answer: {question.options[selectedAnswers[index]] || 'Not answered'}
                    {selectedAnswers[index] === question.correctAnswer ? ' ✓' : ' ✗'}
                  </div>
                  
                  {selectedAnswers[index] !== question.correctAnswer && (
                    <div className="text-sm text-green-600 mb-2">
                      Correct answer: {question.options[question.correctAnswer]}
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-600">
                    <HelpCircle className="h-3 w-3 inline mr-1" />
                    {question.explanation}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-center space-x-4">
              {score < requiredScore && (
                <button
                  onClick={resetQuiz}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Retake Quiz
                </button>
              )}
              
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                {score >= requiredScore ? 'Continue to Experiment' : 'Close'}
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  )
}
