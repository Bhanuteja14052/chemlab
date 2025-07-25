'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, Send, Bot, User, X, Lightbulb, AlertTriangle, Beaker, MinimizeIcon as Minimize2 } from 'lucide-react'

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  isTyping?: boolean
}

interface LabAssistantProps {
  currentElements: string[]
  currentExperiment?: string
  className?: string
}

// Knowledge base for chemistry-related questions
const getChemistryResponse = async (question: string, elements: string[]): Promise<string> => {
  // Simulate AI response - in real implementation, use Gemini API
  const responses = {
    'safety': {
      'acid': 'When working with acids, always wear safety goggles and gloves. Add acid to water, never water to acid. Work in a well-ventilated area.',
      'base': 'Bases can be corrosive. Wear protective equipment and avoid skin contact. If contact occurs, rinse immediately with water.',
      'general': 'Always wear safety equipment, work in a ventilated area, and never mix unknown chemicals.'
    },
    'reactions': {
      'combustion': 'Combustion reactions require oxygen and produce heat. Ensure proper ventilation and fire safety measures.',
      'synthesis': 'Synthesis reactions combine elements to form compounds. Monitor temperature and reaction rate.',
      'general': 'Chemical reactions involve energy changes. Monitor temperature, color changes, and gas production.'
    },
    'equipment': {
      'beaker': 'Beakers are used for mixing and heating solutions. Use appropriate sizes and never heat empty beakers.',
      'scale': 'Digital scales provide precise measurements. Tare before use and handle chemicals carefully.',
      'timer': 'Reaction timers help monitor reaction progress. Set appropriate intervals for your specific reaction.'
    },
    'general': {
      'help': 'I can help with safety procedures, reaction explanations, equipment usage, and chemical properties. What would you like to know?',
      'hello': 'Hello! I\'m your virtual lab assistant. I can help you with chemistry questions, safety procedures, and experiment guidance.',
      'elements': `I see you're working with: ${elements.join(', ')}. What would you like to know about these elements or your experiment?`
    }
  }
  
  const lowerQuestion = question.toLowerCase()
  
  // Safety-related questions
  if (lowerQuestion.includes('safety') || lowerQuestion.includes('dangerous') || lowerQuestion.includes('hazard')) {
    if (elements.some(el => el.includes('Acid'))) return responses.safety.acid
    if (elements.some(el => el.includes('Hydroxide') || el.includes('Sodium'))) return responses.safety.base
    return responses.safety.general
  }
  
  // Reaction-related questions
  if (lowerQuestion.includes('reaction') || lowerQuestion.includes('combine') || lowerQuestion.includes('mix')) {
    if (lowerQuestion.includes('burn') || lowerQuestion.includes('oxygen')) return responses.reactions.combustion
    if (lowerQuestion.includes('form') || lowerQuestion.includes('create')) return responses.reactions.synthesis
    return responses.reactions.general
  }
  
  // Equipment questions
  if (lowerQuestion.includes('beaker')) return responses.equipment.beaker
  if (lowerQuestion.includes('scale') || lowerQuestion.includes('weight')) return responses.equipment.scale
  if (lowerQuestion.includes('timer') || lowerQuestion.includes('time')) return responses.equipment.timer
  
  // Greeting responses
  if (lowerQuestion.includes('hello') || lowerQuestion.includes('hi') || lowerQuestion.includes('hey')) {
    return responses.general.hello
  }
  
  // Help requests
  if (lowerQuestion.includes('help') || lowerQuestion.includes('assist')) {
    return responses.general.help
  }
  
  // Element-specific questions
  if (lowerQuestion.includes('element') || lowerQuestion.includes('what') || elements.length > 0) {
    return responses.general.elements
  }
  
  // Default response
  return 'I can help you with chemistry questions, safety procedures, and lab equipment. Could you be more specific about what you\'d like to know?'
}

// Predefined quick questions
const QUICK_QUESTIONS = [
  'What safety precautions should I take?',
  'How do these elements react together?',
  'What equipment do I need?',
  'Is this reaction dangerous?',
  'What should I expect to see?',
  'How long should this reaction take?'
]

export default function LabAssistant({ 
  currentElements, 
  currentExperiment, 
  className = '' 
}: LabAssistantProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Hello! I\'m your virtual lab assistant. I can help you with chemistry questions, safety procedures, and experiment guidance. How can I assist you today?',
      timestamp: new Date()
    }
  ])
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }
  
  useEffect(() => {
    scrollToBottom()
  }, [messages])
  
  const sendMessage = async (text: string) => {
    if (!text.trim()) return
    
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: text,
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, userMessage])
    setInputText('')
    setIsTyping(true)
    
    try {
      // Simulate typing delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const response = await getChemistryResponse(text, currentElements)
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response,
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error getting response:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'I apologize, but I\'m having trouble responding right now. Please try again or ask a different question.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(inputText)
  }
  
  const selectQuickQuestion = (question: string) => {
    sendMessage(question)
  }
  
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }
  
  return (
    <>
      {/* Chat Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-40 p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors ${isOpen ? 'hidden' : 'block'} ${className}`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <MessageCircle className="h-6 w-6" />
      </motion.button>
      
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
              height: isMinimized ? 'auto' : '500px'
            }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed bottom-6 right-6 z-50 w-80 bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden"
          >
            {/* Chat Header */}
            <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bot className="h-5 w-5" />
                <div>
                  <h3 className="font-semibold">Lab Assistant</h3>
                  <p className="text-xs text-blue-100">Chemistry Helper</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1 hover:bg-blue-700 rounded transition-colors"
                >
                  <Minimize2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-blue-700 rounded transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            {!isMinimized && (
              <>
                {/* Messages Area */}
                <div className="h-80 overflow-y-auto p-4 space-y-4 bg-gray-50">
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex items-start space-x-2 max-w-[80%] ${
                        message.type === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'
                      }`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          message.type === 'user' ? 'bg-blue-600' : 'bg-gray-600'
                        }`}>
                          {message.type === 'user' ? (
                            <User className="h-4 w-4 text-white" />
                          ) : (
                            <Bot className="h-4 w-4 text-white" />
                          )}
                        </div>
                        
                        <div className={`rounded-lg px-3 py-2 ${
                          message.type === 'user' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-white text-gray-900 border border-gray-200'
                        }`}>
                          <p className="text-sm">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {formatTime(message.timestamp)}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  
                  {/* Typing Indicator */}
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <div className="flex items-start space-x-2">
                        <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                          <Bot className="h-4 w-4 text-white" />
                        </div>
                        <div className="bg-white border border-gray-200 rounded-lg px-3 py-2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
                
                {/* Quick Questions */}
                {messages.length <= 1 && (
                  <div className="p-4 border-t border-gray-200 bg-white">
                    <p className="text-xs text-gray-600 mb-2">Quick questions:</p>
                    <div className="space-y-1">
                      {QUICK_QUESTIONS.slice(0, 3).map((question, index) => (
                        <button
                          key={index}
                          onClick={() => selectQuickQuestion(question)}
                          className="w-full text-left text-xs p-2 bg-gray-50 hover:bg-gray-100 rounded border transition-colors"
                        >
                          {question}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Input Area */}
                <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 bg-white">
                  <div className="flex space-x-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Ask about safety, reactions, equipment..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      disabled={isTyping}
                    />
                    <button
                      type="submit"
                      disabled={!inputText.trim() || isTyping}
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </form>
              </>
            )}
            
            {/* Current Experiment Context */}
            {currentElements.length > 0 && (
              <div className="bg-blue-50 border-t border-blue-200 p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <Beaker className="h-4 w-4 text-blue-600" />
                  <span className="text-xs font-medium text-blue-900">Current Elements:</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {currentElements.slice(0, 3).map((element, index) => (
                    <span 
                      key={index}
                      className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs"
                    >
                      {element}
                    </span>
                  ))}
                  {currentElements.length > 3 && (
                    <span className="text-xs text-blue-600">+{currentElements.length - 3} more</span>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
