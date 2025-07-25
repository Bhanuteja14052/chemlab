'use client'

import { useState, useRef, useEffect } from 'react'
import { Bot, MessageCircle, X, Send, Minimize2, Maximize2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface FloatingLabAssistantProps {
  currentElements?: string[]
  currentPage?: string
}

const FloatingLabAssistant = ({ currentElements = [], currentPage = 'lab' }: FloatingLabAssistantProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [isDarkTheme, setIsDarkTheme] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: '👋 Hi! I\'m your chemistry lab assistant. Ask me about acids, bases, reactions, pH, safety, or any chemistry topic!',
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Check theme on mount and listen for changes
  useEffect(() => {
    const checkTheme = () => {
      const theme = document.documentElement.getAttribute('data-theme')
      setIsDarkTheme(theme === 'dark')
    }
    
    checkTheme()
    
    // Listen for theme changes
    const observer = new MutationObserver(checkTheme)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    })
    
    return () => observer.disconnect()
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Simple helper functions for student-friendly responses
  const getSimpleReactionPrediction = (elements: string[]): string => {
    if (elements.includes('H') && elements.includes('O')) {
      return 'Hydrogen + Oxygen → Water (H₂O). This makes water and releases lots of heat!'
    }
    if (elements.includes('Na') && elements.includes('Cl')) {
      return 'Sodium + Chlorine → Salt (NaCl). This forms table salt and releases energy!'
    }
    if (elements.includes('H') && elements.includes('Cl')) {
      return 'Hydrogen + Chlorine → Hydrochloric acid (HCl). This makes a strong acid!'
    }
    if (elements.includes('Ca') && elements.includes('O')) {
      return 'Calcium + Oxygen → Calcium oxide (CaO). This makes lime, used in cement!'
    }
    return `These elements can form compounds. Try mixing them to see what happens!`
  }

  const getSimplePHInfo = (elements: string[]): string => {
    const phInfo = []
    for (const element of elements) {
      switch (element) {
        case 'H':
          phInfo.push('Acids have lots of H⁺ ions (pH 0-6)')
          break
        case 'Na':
          phInfo.push('Sodium compounds are often basic (pH 8-14)')
          break
        case 'Cl':
          phInfo.push('HCl is a strong acid (pH around 1)')
          break
        case 'O':
          phInfo.push('Pure water (H₂O) is neutral (pH 7)')
          break
      }
    }
    return phInfo.length > 0 ? phInfo.join('. ') : 'pH tells us if something is acidic (0-6), neutral (7), or basic (8-14).'
  }

  const getAcidBaseInfo = (elements: string[]): string => {
    for (const element of elements) {
      switch (element) {
        case 'H':
          return 'Hydrogen often makes acids like HCl (hydrochloric acid). Acids taste sour and have pH less than 7.'
        case 'Na':
          return 'Sodium often makes bases like NaOH (sodium hydroxide). Bases feel slippery and have pH greater than 7.'
        case 'Cl':
          return 'Chlorine with hydrogen makes HCl, a strong acid. It has a very low pH around 1.'
        case 'O':
          return 'Oxygen with hydrogen makes water (H₂O), which is neutral with pH 7.'
      }
    }
    return 'Acids have pH 0-6, neutral is pH 7, and bases have pH 8-14.'
  }

  const generateResponse = async (userMessage: string): Promise<string> => {
    const message = userMessage.toLowerCase()
    
    // Check if the question is chemistry-related
    const chemistryKeywords = [
      'acid', 'base', 'ph', 'reaction', 'element', 'compound', 'chemical', 'molecule', 
      'atom', 'ion', 'bond', 'solution', 'concentration', 'mole', 'mass', 'formula',
      'equation', 'periodic', 'metal', 'gas', 'liquid', 'solid', 'catalyst', 'enzyme',
      'oxidation', 'reduction', 'equilibrium', 'temperature', 'pressure', 'volume',
      'safety', 'lab', 'experiment', 'beaker', 'test tube', 'precipitation', 'crystallization',
      'hydrogen', 'oxygen', 'carbon', 'nitrogen', 'sodium', 'chlorine', 'water', 'salt'
    ]
    
    const isChemistryRelated = chemistryKeywords.some(keyword => message.includes(keyword))
    
    if (!isChemistryRelated) {
      return "I can only answer chemistry-related questions. Please ask me something about chemistry!"
    }
    
    // Check for direct YES/NO questions first
    if (message.includes('is') && (message.includes('acidic') || message.includes('acid'))) {
      // Extract potential compound from question
      const compounds = ['h2so4', 'sulfuric acid', 'hcl', 'hydrochloric acid', 'naoh', 'sodium hydroxide', 'water', 'h2o', 'nacl', 'salt']
      const foundCompound = compounds.find(compound => message.includes(compound))
      
      if (message.includes('h2so4') || message.includes('sulfuric acid')) {
        return '✅ Yes, sulfuric acid (H₂SO₄) is strongly acidic with a very low pH (~1). It\'s highly corrosive and used in car batteries.'
      }
      if (message.includes('hcl') || message.includes('hydrochloric acid')) {
        return '✅ Yes, hydrochloric acid (HCl) is a strong acid with pH ~1. It\'s found in stomach acid.'
      }
      if (message.includes('naoh') || message.includes('sodium hydroxide')) {
        return '✅ No, sodium hydroxide (NaOH) is a strong base (alkaline) with a very high pH (~13).'
      }
      if (message.includes('water') || message.includes('h2o')) {
        return '✅ No, pure water is neutral with a pH of 7.'
      }
      if (message.includes('nacl') || message.includes('salt')) {
        return '✅ No, table salt (NaCl) is neutral with a pH around 7 when dissolved in water.'
      }
      
      // Check current elements for direct answer
      if (currentElements.length > 0) {
        const acidicElements = ['H', 'HCl', 'H2SO4', 'HNO3', 'CH3COOH']
        const basicElements = ['Na', 'K', 'NaOH', 'KOH', 'NH3']
        const neutralElements = ['O', 'N', 'Cl', 'NaCl', 'H2O']
        
        const hasAcidic = currentElements.some(el => acidicElements.includes(el))
        const hasBasic = currentElements.some(el => basicElements.includes(el))
        const hasNeutral = currentElements.some(el => neutralElements.includes(el))
        
        if (hasAcidic) return `✅ Yes, ${currentElements.join('+')} forms acidic compounds with pH less than 7.`
        if (hasBasic) return `✅ No, ${currentElements.join('+')} forms basic compounds with pH greater than 7.`
        if (hasNeutral) return `✅ No, ${currentElements.join('+')} forms neutral compounds with pH around 7.`
      }
      
      return 'I\'m not sure about this compound\'s acidity. Can you give more details about the specific substance?'
    }
    
    if (message.includes('is') && (message.includes('basic') || message.includes('base'))) {
      if (message.includes('naoh') || message.includes('sodium hydroxide')) {
        return '✅ Yes, sodium hydroxide (NaOH) is a strong base with pH ~13. It\'s very caustic and used in drain cleaners.'
      }
      if (message.includes('h2so4') || message.includes('sulfuric acid')) {
        return '✅ No, sulfuric acid (H₂SO₄) is strongly acidic, not basic.'
      }
      if (message.includes('water') || message.includes('h2o')) {
        return '✅ No, pure water is neutral with a pH of 7, neither acidic nor basic.'
      }
      if (message.includes('baking soda') || message.includes('sodium bicarbonate')) {
        return '✅ Yes, baking soda (NaHCO₃) is a mild base with pH around 8-9.'
      }
      
      return 'I\'m not sure about this compound\'s basicity. Can you give more details about the specific substance?'
    }
    
    if (message.includes('is') && message.includes('neutral')) {
      if (message.includes('water') || message.includes('h2o')) {
        return '✅ Yes, pure water is perfectly neutral with a pH of exactly 7.'
      }
      if (message.includes('nacl') || message.includes('salt')) {
        return '✅ Yes, table salt (NaCl) is neutral with a pH around 7 when dissolved in water.'
      }
      if (message.includes('h2so4') || message.includes('hcl')) {
        return '✅ No, acids like H₂SO₄ and HCl are not neutral - they\'re acidic with pH less than 7.'
      }
      
      return 'I\'m not sure about this compound\'s neutrality. Can you give more details?'
    }
    if (currentElements.length > 0) {
      if (message.includes('reaction') || message.includes('what happens') || message.includes('mix')) {
        return getSimpleReactionPrediction(currentElements)
      }
      if (message.includes('ph')) {
        return getSimplePHInfo(currentElements)
      }
      if (message.includes('acid') || message.includes('base')) {
        return getAcidBaseInfo(currentElements)
      }
    }
    
    // Simple, student-friendly responses
    if (message.includes('h2so4') || message.includes('sulfuric acid')) {
      return 'Yes! Sulfuric acid (H₂SO₄) is a strong acid with a very low pH (~1 for concentrated). It\'s highly corrosive, so handle with care.'
    }
    
    if (message.includes('hcl') && message.includes('naoh')) {
      return 'Hydrochloric acid reacts with sodium hydroxide to form water and sodium chloride (salt). It\'s a neutralization reaction: HCl + NaOH → H₂O + NaCl'
    }
    
    if (message.includes('pure water') && message.includes('ph')) {
      return 'Pure water has a neutral pH of 7 at room temperature.'
    }
    
    if (message.includes('baking soda') || message.includes('sodium bicarbonate')) {
      return 'Yes, baking soda (sodium bicarbonate, NaHCO₃) is a mild base with a pH around 8-9. It\'s safe and commonly used in cooking and cleaning.'
    }
    
    if (message.includes('ph') && !message.includes('formula')) {
      return 'pH measures how acidic or basic something is. Scale 0-14: 0-6 is acidic (lemon juice ~2), 7 is neutral (pure water), 8-14 is basic (soap ~10).'
    }
    
    if (message.includes('acid') && !message.includes('base')) {
      return 'Acids have pH less than 7, taste sour, and react with metals to produce hydrogen gas. Common acids: HCl (stomach acid), H₂SO₄ (car battery), CH₃COOH (vinegar).'
    }
    
    if (message.includes('base') && !message.includes('acid')) {
      return 'Bases have pH greater than 7, feel slippery, and neutralize acids. Common bases: NaOH (drain cleaner), NH₃ (ammonia), Ca(OH)₂ (lime).'
    }
    
    if (message.includes('safety') || message.includes('ppe')) {
      return 'Always wear safety goggles, gloves, and lab coat. Know where the eyewash station and fire extinguisher are. Never mix chemicals unless instructed!'
    }
    
    if (message.includes('water') && (message.includes('hydrogen') || message.includes('oxygen'))) {
      return 'Hydrogen and oxygen combine to make water: 2H₂ + O₂ → 2H₂O (liquid). This reaction releases lots of energy!'
    }
    
    if (message.includes('salt') && message.includes('water')) {
      return 'When you dissolve salt (NaCl) in water, it breaks into sodium ions (Na⁺) and chloride ions (Cl⁻). The solution conducts electricity!'
    }
    
    if (message.includes('periodic table') || message.includes('elements')) {
      return 'The periodic table organizes all chemical elements by their properties. Elements in the same column have similar behaviors!'
    }
    
    if (message.includes('electron') || message.includes('atom')) {
      return 'Atoms are made of protons (+), neutrons (neutral), and electrons (-). Electrons determine how atoms bond together!'
    }
    
    if (message.includes('help') || message.includes('what can you')) {
      return 'I help with chemistry questions! Ask me about acids, bases, reactions, pH, safety, or any chemistry topic. Keep it chemistry-related!'
    }
    
    // Default response for chemistry questions
    return 'That\'s a good chemistry question! Can you be more specific? I can help with reactions, pH, acids, bases, or safety tips.'
  }

  const getReactionPrediction = (elements: string[]): string => {
    if (elements.includes('H') && elements.includes('O')) {
      return 'Formation of water (H₂O): 2H₂ + O₂ → 2H₂O (ΔH = -483.6 kJ/mol, highly exothermic)'
    }
    if (elements.includes('Na') && elements.includes('Cl')) {
      return 'Formation of sodium chloride: 2Na + Cl₂ → 2NaCl (ΔH = -822 kJ/mol, ionic bonding)'
    }
    if (elements.includes('C') && elements.includes('O')) {
      return 'Combustion reaction: C + O₂ → CO₂ (complete) or 2C + O₂ → 2CO (incomplete), depending on oxygen availability'
    }
    if (elements.includes('N') && elements.includes('H')) {
      return 'Ammonia synthesis: N₂ + 3H₂ ⇌ 2NH₃ (Haber process, ΔH = -92 kJ/mol, reversible)'
    }
    if (elements.includes('Ca') && elements.includes('O')) {
      return 'Calcium oxide formation: 2Ca + O₂ → 2CaO (quicklime, ΔH = -1270 kJ/mol)'
    }
    return 'Multiple reaction pathways possible. Products depend on stoichiometry, temperature, pressure, and catalysts present.'
  }

  const getDetailedReactionPrediction = (elements: string[]): string => {
    return getReactionPrediction(elements)
  }

  const getElementProperties = (elements: string[]): string => {
    const properties = elements.map(element => {
      switch (element) {
        case 'H': return 'Hydrogen: 1 electron, 1.008 u, electronegativity 2.20, forms H⁺ and H⁻ ions'
        case 'O': return 'Oxygen: 6 valence electrons, 15.999 u, electronegativity 3.44, forms O²⁻ ions'
        case 'C': return 'Carbon: 4 valence electrons, 12.011 u, electronegativity 2.55, sp³/sp²/sp hybridization'
        case 'Na': return 'Sodium: 1 valence electron, 22.990 u, electronegativity 0.93, forms Na⁺ ions readily'
        case 'Cl': return 'Chlorine: 7 valence electrons, 35.453 u, electronegativity 3.16, forms Cl⁻ ions'
        case 'Fe': return 'Iron: transition metal, 55.845 u, multiple oxidation states (+2, +3), magnetic'
        case 'Li': return 'Lithium: smallest metal, 6.941 u, electronegativity 0.98, lightest solid element'
        case 'Ca': return 'Calcium: alkaline earth metal, 40.078 u, electronegativity 1.00, forms Ca²⁺ ions'
        case 'N': return 'Nitrogen: 5 valence electrons, 14.007 u, electronegativity 3.04, triple bond in N₂'
        case 'K': return 'Potassium: 1 valence electron, 39.098 u, electronegativity 0.82, larger than Na'
        default: return `${element}: Check periodic table for atomic mass, electronegativity, and valence electrons`
      }
    })
    return properties.join(' | ')
  }

  const getDetailedElementProperties = (elements: string[]): string => {
    return getElementProperties(elements)
  }

  const getBondingAnalysis = (elements: string[]): string => {
    if (elements.length < 2) return 'Need at least 2 elements to analyze bonding'
    
    const analysis = []
    for (let i = 0; i < elements.length - 1; i++) {
      const el1 = elements[i]
      const el2 = elements[i + 1]
      
      if ((el1 === 'Na' || el1 === 'K' || el1 === 'Li') && (el2 === 'Cl' || el2 === 'F')) {
        analysis.push(`${el1}-${el2}: Ionic bond (electronegativity difference > 1.7)`)
      } else if ((el1 === 'H' && el2 === 'O') || (el1 === 'O' && el2 === 'H')) {
        analysis.push(`${el1}-${el2}: Polar covalent bond (δ⁻O-Hδ⁺), allows hydrogen bonding`)
      } else if ((el1 === 'C' && el2 === 'H') || (el1 === 'H' && el2 === 'C')) {
        analysis.push(`${el1}-${el2}: Nonpolar covalent bond (similar electronegativity)`)
      } else if (el1 === 'C' && el2 === 'C') {
        analysis.push(`${el1}-${el2}: Covalent bond (single, double, or triple possible)`)
      } else {
        analysis.push(`${el1}-${el2}: Bond type depends on electronegativity difference and orbital overlap`)
      }
    }
    
    return analysis.join(' | ')
  }

  const getPHAnalysis = (elements: string[]): string => {
    const phAnalysis = []
    
    for (const element of elements) {
      switch (element) {
        case 'H':
          phAnalysis.push('H⁺ ions: pH < 7 (acidic), [H⁺] = 10^(-pH) M')
          break
        case 'Na':
          phAnalysis.push('Na⁺ + H₂O → NaOH: pH ≈ 12-13 (strong base)')
          break
        case 'K':
          phAnalysis.push('K⁺ + H₂O → KOH: pH ≈ 13-14 (stronger base than NaOH)')
          break
        case 'Li':
          phAnalysis.push('Li⁺ + H₂O → LiOH: pH ≈ 11-12 (moderate base)')
          break
        case 'Cl':
          phAnalysis.push('Cl⁻ ions: neutral in water, pH ≈ 7 (unless with H⁺ forming HCl)')
          break
        case 'O':
          phAnalysis.push('O²⁻ + H₂O → 2OH⁻: pH > 7 (basic), metal oxides typically basic')
          break
        case 'C':
          phAnalysis.push('CO₂ + H₂O ⇌ H₂CO₃: pH ≈ 5.6 (carbonic acid, weak acid)')
          break
        case 'Ca':
          phAnalysis.push('Ca²⁺ + H₂O → Ca(OH)₂: pH ≈ 12 (lime water, moderately basic)')
          break
        default:
          phAnalysis.push(`${element}: pH depends on oxidation state and hydrolysis reactions`)
      }
    }
    
    return phAnalysis.join(' | ')
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsTyping(true)

    // Simulate API delay
    setTimeout(async () => {
      const response = await generateResponse(inputMessage)
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response,
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, assistantMessage])
      setIsTyping(false)
    }, 1000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-full shadow-lg transition-colors z-50"
          >
            <Bot className="h-6 w-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed bottom-6 right-6 rounded-lg shadow-2xl border z-50 ${
              isDarkTheme 
                ? 'bg-slate-900 border-slate-700' 
                : 'bg-white border-slate-200'
            } ${
              isMinimized ? 'w-80 h-16' : 'w-80 h-96'
            }`}
          >
            {/* Header */}
            <div className={`flex items-center justify-between p-4 border-b rounded-t-lg ${
              isDarkTheme 
                ? 'border-slate-700 bg-purple-900' 
                : 'border-slate-200 bg-purple-50'
            }`}>
              <div className="flex items-center space-x-2">
                <Bot className="h-5 w-5 text-purple-600" />
                <span className={`font-semibold ${
                  isDarkTheme ? 'text-white' : 'text-black'
                }`}>Lab Assistant</span>
                {currentElements.length > 0 && (
                  <span className={`text-xs px-2 py-1 rounded ${
                    isDarkTheme 
                      ? 'bg-purple-800 text-purple-200' 
                      : 'bg-purple-200 text-purple-800'
                  }`}>
                    {currentElements.length} elements
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className={`p-1 rounded transition-colors ${
                    isDarkTheme 
                      ? 'hover:bg-purple-800 text-white' 
                      : 'hover:bg-purple-200 text-black'
                  }`}
                >
                  {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className={`p-1 rounded transition-colors ${
                    isDarkTheme 
                      ? 'hover:bg-purple-800 text-white' 
                      : 'hover:bg-purple-200 text-black'
                  }`}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 h-64">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg text-sm ${
                          message.type === 'user'
                            ? 'bg-purple-600 text-white'
                            : isDarkTheme
                            ? 'bg-slate-800 text-white'
                            : 'bg-slate-100 text-black'
                        }`}
                      >
                        {message.content}
                      </div>
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className={`p-3 rounded-lg text-sm ${
                        isDarkTheme 
                          ? 'bg-slate-800 text-white' 
                          : 'bg-slate-100 text-black'
                      }`}>
                        <div className="flex space-x-1">
                          <div className={`w-2 h-2 rounded-full animate-bounce ${
                            isDarkTheme ? 'bg-slate-400' : 'bg-slate-600'
                          }`}></div>
                          <div className={`w-2 h-2 rounded-full animate-bounce ${
                            isDarkTheme ? 'bg-slate-400' : 'bg-slate-600'
                          }`} style={{ animationDelay: '0.1s' }}></div>
                          <div className={`w-2 h-2 rounded-full animate-bounce ${
                            isDarkTheme ? 'bg-slate-400' : 'bg-slate-600'
                          }`} style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className={`p-4 border-t ${
                  isDarkTheme ? 'border-slate-700' : 'border-slate-200'
                }`}>
                  <div className="flex space-x-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask about chemistry, safety, or lab procedures..."
                      className={`flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm ${
                        isDarkTheme 
                          ? 'border-slate-600 bg-slate-800 text-white placeholder-slate-400' 
                          : 'border-slate-300 bg-white text-black placeholder-slate-500'
                      }`}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!inputMessage.trim() || isTyping}
                      className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default FloatingLabAssistant
