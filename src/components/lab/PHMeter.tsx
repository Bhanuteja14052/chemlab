'use client'

import React, { useEffect, useState } from 'react'
import { motion, useSpring, useTransform } from 'framer-motion'
import { Droplets, AlertTriangle, CheckCircle, Beaker } from 'lucide-react'

interface PHMeterProps {
  elements: string[]
  temperature: number
  reactionResult?: any // Add reaction result to get state information
  className?: string
  onConversion?: (convertedResult: any) => void // Add callback for conversion
}

// Theme hook
const useTheme = () => {
  const [isDarkTheme, setIsDarkTheme] = useState(false)
  
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
  
  return isDarkTheme
}

// Check if pH measurement is applicable for the given substance and state
const isPHApplicable = (elements: string[], state?: string, reactionResult?: any): { applicable: boolean; reason?: string } => {
  // Check reaction result state first (more specific than general state)
  const stateToCheck = reactionResult?.state || state
  
  if (stateToCheck) {
    const lowerState = stateToCheck.toLowerCase()
    
    // ✅ pH applicable for aqueous solutions
    if (lowerState.includes('aqueous') || lowerState.includes('solution') || lowerState.includes('dissolved')) {
      return { applicable: true }
    }
    
    // ❌ pH not applicable for solids
    if (lowerState.includes('solid') || lowerState.includes('crystal') || lowerState.includes('powder')) {
      return { applicable: false, reason: "pH not applicable for solid substances. Use 'Convert to suitable testing form' if available." }
    }
    
    // ❌ pH not applicable for gases (unless specifically dissolved)
    if (lowerState.includes('gas') || lowerState.includes('gaseous') || lowerState.includes('vapor')) {
      return { applicable: false, reason: "pH not applicable for gaseous substances. Use 'Convert to suitable testing form' to dissolve in water." }
    }
    
    // Check for liquid state (could be aqueous)
    if (lowerState.includes('liquid')) {
      // Additional check for compound type
      if (reactionResult?.compoundName) {
        const compoundName = reactionResult.compoundName.toLowerCase()
        if (compoundName.includes('acid') || compoundName.includes('base') || compoundName.includes('hydroxide')) {
          return { applicable: true }
        }
      }
      return { applicable: true } // Assume liquid can have pH measured
    }
    
    // ❌ pH not applicable for other non-aqueous states
    if (lowerState.includes('plasma') || lowerState.includes('unknown')) {
      return { applicable: false, reason: "pH not applicable for this state of matter" }
    }
  }
  
  // Check for pure elements that don't form ionic solutions
  const inertElements = ['He', 'Ne', 'Ar', 'Kr', 'Xe', 'Rn'] // Noble gases
  const metalElements = ['Au', 'Ag', 'Pt', 'Cu', 'Fe', 'Zn', 'Al', 'Pb', 'Sn', 'Ni'] // Pure metals
  const diatomicGases = ['H2', 'N2', 'O2', 'F2', 'Cl2', 'Br2', 'I2'] // Diatomic gases
  
  // If only one element and it's inert/pure
  if (elements.length === 1) {
    const element = elements[0]
    
    if (inertElements.includes(element)) {
      return { applicable: false, reason: "pH not applicable for noble gases" }
    }
    
    if (metalElements.includes(element)) {
      return { applicable: false, reason: "pH not applicable for pure metals" }
    }
    
    if (diatomicGases.includes(element)) {
      return { applicable: false, reason: "pH not applicable for pure gases. Use 'Convert to suitable testing form' if available." }
    }
  }
  
  // Check for known acids and bases that form aqueous solutions
  const aqueousAcids = [
    'HCl', 'H2SO4', 'HNO3', 'CH3COOH', 'C6H8O7', 'H2CO3', 'HF', 'HBr', 'HI',
    'H3PO4', 'H2S', 'HCOOH', 'C2H2O4', 'H2C2O4'
  ]
  
  const aqueousBases = [
    'NaOH', 'KOH', 'Ca(OH)2', 'Mg(OH)2', 'Ba(OH)2', 'LiOH', 'NH4OH',
    'Na2CO3', 'K2CO3', 'NaHCO3', 'KHCO3'
  ]
  
  const neutralSalts = [
    'NaCl', 'KCl', 'CaCl2', 'MgCl2', 'Na2SO4', 'K2SO4', 'CaSO4', 'MgSO4',
    'NaNO3', 'KNO3', 'Ca(NO3)2', 'Mg(NO3)2', 'H2O'
  ]
  
  // Check if any element forms a known aqueous compound
  const hasAqueousCompound = elements.some(element => 
    aqueousAcids.includes(element) || 
    aqueousBases.includes(element) || 
    neutralSalts.includes(element) ||
    element === 'H' // Hydrogen ions
  )
  
  if (hasAqueousCompound) {
    return { applicable: true }
  }
  
  // Check reaction result for specific compound names
  if (reactionResult?.compoundName) {
    const compoundName = reactionResult.compoundName.toLowerCase()
    
    // Known aqueous compounds
    if (compoundName.includes('acid') || 
        compoundName.includes('hydroxide') || 
        compoundName.includes('solution') ||
        compoundName.includes('dissolved') ||
        compoundName.includes('water')) {
      return { applicable: true }
    }
    
    // Known non-aqueous compounds
    if (compoundName.includes('gas') || 
        compoundName.includes('solid') || 
        compoundName.includes('crystal') ||
        compoundName.includes('metal') ||
        (compoundName.includes('oxide') && !compoundName.includes('hydroxide'))) {
      return { applicable: false, reason: "pH not applicable for this compound state" }
    }
  }
  
  // Check for convertible compounds (gases that can dissolve)
  const convertibleGases = ['NH3', 'CO2', 'SO2', 'SO3', 'NO2', 'NO', 'H2S']
  const hasConvertible = elements.some(element => convertibleGases.includes(element))
  
  if (hasConvertible) {
    return { applicable: false, reason: "pH not applicable for gas. Use 'Convert to suitable testing form' to dissolve in water." }
  }
  
  // If we have multiple elements without clear state, assume they might form a solution
  if (elements.length > 1) {
    return { applicable: true }
  }
  
  // Default: not applicable for single unknown elements
  return { applicable: false, reason: "pH measurement requires aqueous solutions or dissolved compounds" }
}

// Chemical pH values database
const getElementPH = (element: string): number => {
  const phValues: Record<string, number> = {
    // Acids
    'H': 1.0,     // Hydrogen
    'HCl': 1.0,   // Hydrochloric Acid
    'H2SO4': 1.2, // Sulfuric Acid
    'HNO3': 1.5,  // Nitric Acid
    'CH3COOH': 2.4, // Acetic Acid
    'C6H8O7': 2.1,  // Citric Acid
    'H2CO3': 3.8,   // Carbonic Acid
    
    // Bases
    'NaOH': 13.0, // Sodium Hydroxide
    'KOH': 13.5,  // Potassium Hydroxide
    'Ca(OH)2': 12.4, // Calcium Hydroxide
    'NH3': 11.1,  // Ammonia
    'NaHCO3': 8.3, // Sodium Bicarbonate
    'Na': 12.0,   // Sodium
    'K': 12.5,    // Potassium
    'Ca': 11.8,   // Calcium
    'Li': 12.2,   // Lithium
    
    // Neutral/Salt compounds
    'H2O': 7.0,   // Water
    'NaCl': 7.0,  // Sodium Chloride
    'KCl': 7.0,   // Potassium Chloride
    'CO2': 5.6,   // Carbon Dioxide (when dissolved)
    'O': 7.0,     // Oxygen
    'O2': 7.0,    // Oxygen gas
    'N': 7.0,     // Nitrogen
    'N2': 7.0,    // Nitrogen gas
    'Cl': 6.5,    // Chlorine
    'Cl2': 6.5,   // Chlorine gas
    
    // Metals (when in aqueous solution)
    'Fe': 6.8,    // Iron
    'Cu': 6.2,    // Copper
    'Zn': 6.4,    // Zinc
    'Al': 6.1,    // Aluminum
    'Mg': 7.2,    // Magnesium
    'Ag': 6.9,    // Silver
    'Au': 7.0,    // Gold
    'Pb': 6.3,    // Lead
    'Sn': 6.5,    // Tin
    'Ni': 6.6,    // Nickel
    
    // Default fallback
    'default': 7
  }
  
  return phValues[element] || phValues['default']
}

// Calculate combined pH from multiple elements
const calculateCombinedPH = (elements: string[], temperature: number): number => {
  if (elements.length === 0) return 7
  
  let totalH = 0
  let totalOH = 0
  
  elements.forEach(element => {
    const ph = getElementPH(element)
    const h = Math.pow(10, -ph)
    const oh = Math.pow(10, -(14 - ph))
    
    totalH += h
    totalOH += oh
  })
  
  // Average the concentrations
  const avgH = totalH / elements.length
  const avgOH = totalOH / elements.length
  
  // Calculate final pH
  let finalPH = -Math.log10(avgH)
  
  // Temperature effect (pH decreases with temperature for most solutions)
  const tempEffect = (temperature - 25) * 0.01
  finalPH -= tempEffect
  
  // Ensure pH stays within reasonable bounds
  return Math.max(0, Math.min(14, finalPH))
}

// Get pH color
const getPHColor = (ph: number): string => {
  if (ph < 2) return '#ff0000' // Strong acid - red
  if (ph < 4) return '#ff6600' // Acid - orange
  if (ph < 6) return '#ffaa00' // Weak acid - yellow-orange
  if (ph < 7.5) return '#00ff00' // Neutral - green
  if (ph < 10) return '#0066ff' // Weak base - blue
  if (ph < 12) return '#3300ff' // Base - dark blue
  return '#6600ff' // Strong base - purple
}

// Conversion mapping for gases and solids to aqueous forms
const conversionMap: Record<string, { name: string; formula: string; ph: number; description: string }> = {
  'NH3': { name: 'Ammonium Hydroxide', formula: 'NH₄OH', ph: 11.0, description: 'Dissolved ammonia gas in water' },
  'CO2': { name: 'Carbonic Acid', formula: 'H₂CO₃', ph: 4.5, description: 'Dissolved carbon dioxide in water' },
  'SO2': { name: 'Sulfurous Acid', formula: 'H₂SO₃', ph: 2.5, description: 'Dissolved sulfur dioxide in water' },
  'SO3': { name: 'Sulfuric Acid', formula: 'H₂SO₄', ph: 1.2, description: 'Dissolved sulfur trioxide in water' },
  'NO2': { name: 'Nitrous Acid', formula: 'HNO₂', ph: 3.2, description: 'Dissolved nitrogen dioxide in water' },
  'NO': { name: 'Nitric Acid', formula: 'HNO₃', ph: 1.5, description: 'Dissolved nitric oxide in water' },
  'P2O5': { name: 'Phosphoric Acid', formula: 'H₃PO₄', ph: 2.1, description: 'Dissolved phosphorus pentoxide in water' },
  'NACL': { name: 'Sodium Chloride Solution', formula: 'NaCl(aq)', ph: 7.0, description: 'Dissolved salt in water' },
  'KCL': { name: 'Potassium Chloride Solution', formula: 'KCl(aq)', ph: 7.0, description: 'Dissolved potassium chloride in water' },
  'CACL2': { name: 'Calcium Chloride Solution', formula: 'CaCl₂(aq)', ph: 6.8, description: 'Dissolved calcium chloride in water' },
  'MGSO4': { name: 'Magnesium Sulfate Solution', formula: 'MgSO₄(aq)', ph: 6.5, description: 'Dissolved magnesium sulfate in water' },
  'NA2CO3': { name: 'Sodium Carbonate Solution', formula: 'Na₂CO₃(aq)', ph: 11.5, description: 'Dissolved sodium carbonate in water' },
  'CAO': { name: 'Calcium Hydroxide', formula: 'Ca(OH)₂', ph: 12.4, description: 'Dissolved lime in water' },
  'NA2O': { name: 'Sodium Hydroxide', formula: 'NaOH', ph: 13.0, description: 'Dissolved sodium oxide in water' },
  'HCL': { name: 'Hydrochloric Acid', formula: 'HCl(aq)', ph: 1.0, description: 'Dissolved hydrogen chloride gas in water' },
  // Element combinations that can be converted
  'H+CL': { name: 'Hydrochloric Acid', formula: 'HCl(aq)', ph: 1.0, description: 'Hydrogen and chlorine dissolved in water' },
  'NA+CL': { name: 'Sodium Chloride Solution', formula: 'NaCl(aq)', ph: 7.0, description: 'Sodium and chlorine dissolved in water' },
  'CA+O': { name: 'Calcium Hydroxide', formula: 'Ca(OH)₂', ph: 12.4, description: 'Calcium oxide dissolved in water' },
  'N+H': { name: 'Ammonium Hydroxide', formula: 'NH₄OH', ph: 11.0, description: 'Nitrogen and hydrogen dissolved in water' },
  'C+O': { name: 'Carbonic Acid', formula: 'H₂CO₃', ph: 4.5, description: 'Carbon and oxygen dissolved in water' }
}

// Check if a substance can be converted to aqueous form
const canConvertToAqueous = (elements: string[], reactionResult?: any): string | null => {
  // Check if we have a reaction result with a formula
  if (reactionResult?.chemicalFormula) {
    // Remove subscripts and convert to uppercase for matching
    const cleanFormula = reactionResult.chemicalFormula.replace(/[₀₁₂₃₄₅₆₇₈₉]/g, (match: string) => {
      const subscripts = '₀₁₂₃₄₅₆₇₈₉'
      const numbers = '0123456789'
      return numbers[subscripts.indexOf(match)]
    }).toUpperCase()
    
    if (conversionMap[cleanFormula]) {
      return cleanFormula
    }
  }
  
  // Check for direct element combinations
  const elementKey = elements.sort().join('+').toUpperCase()
  if (conversionMap[elementKey]) {
    return elementKey
  }
  
  // Fallback to element-based detection
  const compound = elements.join('').toUpperCase()
  if (conversionMap[compound]) {
    return compound
  }
  
  // Check common combinations
  if (elements.includes('H') && elements.includes('Cl')) {
    return 'H+CL'
  }
  if (elements.includes('Na') && elements.includes('Cl')) {
    return 'NA+CL'  
  }
  if (elements.includes('Ca') && elements.includes('O')) {
    return 'CA+O'
  }
  if (elements.includes('N') && elements.includes('H')) {
    return 'N+H'
  }
  if (elements.includes('C') && elements.includes('O')) {
    return 'C+O'
  }
  
  return null
}

// Get pH status
const getPHStatus = (ph: number): { status: string; icon: React.ReactNode; color: string } => {
  if (ph < 3 || ph > 11) {
    return {
      status: 'Dangerous',
      icon: <AlertTriangle className="h-4 w-4" />,
      color: 'text-red-600'
    }
  } else if (ph < 5 || ph > 9) {
    return {
      status: 'Caution',
      icon: <AlertTriangle className="h-4 w-4" />,
      color: 'text-yellow-600'
    }
  } else {
    return {
      status: 'Safe',
      icon: <CheckCircle className="h-4 w-4" />,
      color: 'text-green-600'
    }
  }
}

export default function PHMeter({ elements, temperature, reactionResult, className = '', onConversion }: PHMeterProps) {
  const [currentPH, setCurrentPH] = useState(7)
  const [isAnimating, setIsAnimating] = useState(false)
  const [phApplicability, setPHApplicability] = useState<{ applicable: boolean; reason?: string }>({ applicable: true })
  const [isConverted, setIsConverted] = useState(false)
  const [convertedData, setConvertedData] = useState<{ name: string; formula: string; ph: number; description: string } | null>(null)
  const [isConverting, setIsConverting] = useState(false)
  const isDarkTheme = useTheme()
  
  // Spring animation for smooth pH changes
  const phSpring = useSpring(currentPH, {
    stiffness: 100,
    damping: 15
  })
  
  // Transform pH value to indicator position (0-100%)
  const indicatorPosition = useTransform(phSpring, [0, 14], [0, 100])
  
  // Handle conversion to aqueous form
  const handleConversion = async () => {
    const convertibleKey = canConvertToAqueous(elements, reactionResult)
    
    if (!convertibleKey) {
      setConvertedData({
        name: 'Conversion Failed',
        formula: '',
        ph: 7,
        description: 'Conversion to a suitable testing form is not possible for this substance.'
      })
      setIsConverted(true)
      return
    }
    
    setIsConverting(true)
    
    // Simulate conversion process
    setTimeout(() => {
      const conversion = conversionMap[convertibleKey]
      setConvertedData(conversion)
      setCurrentPH(conversion.ph)
      setIsConverted(true)
      setIsConverting(false)
      
      // Update applicability to show pH meter
      setPHApplicability({ applicable: true })
      
      // Create new converted reaction result
      const convertedResult = {
        ...reactionResult,
        compoundName: conversion.name,
        chemicalFormula: conversion.formula,
        state: 'aqueous',
        color: conversion.ph > 7 ? '#0066ff' : conversion.ph < 7 ? '#ff6600' : '#00ff00',
        explanation: `${conversion.description}. pH: ${conversion.ph}`
      }
      
      // Notify parent component of conversion
      if (onConversion) {
        onConversion(convertedResult)
      }
      
      // Trigger animation
      setIsAnimating(true)
      setTimeout(() => setIsAnimating(false), 1000)
    }, 1500) // 1.5 second delay for conversion animation
  }
  
  useEffect(() => {
    // Reset conversion state when elements change
    setIsConverted(false)
    setConvertedData(null)
    setIsConverting(false)
    
    // Check if pH measurement is applicable for current substance/state
    const applicability = isPHApplicable(elements, reactionResult?.state, reactionResult)
    setPHApplicability(applicability)
    
    if (applicability.applicable) {
      const newPH = calculateCombinedPH(elements, temperature)
      
      if (Math.abs(newPH - currentPH) > 0.1) {
        setIsAnimating(true)
        setCurrentPH(newPH)
        
        // Stop animation after a delay
        setTimeout(() => setIsAnimating(false), 1000)
      }
    }
  }, [elements, temperature, currentPH, reactionResult?.state])
  
  const phColor = getPHColor(currentPH)
  const phStatus = getPHStatus(currentPH)
  
  return (
    <div className={`rounded-lg border p-4 ${
      isDarkTheme 
        ? 'bg-slate-900 border-slate-700' 
        : 'bg-white border-slate-200'
    } ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Droplets className="h-5 w-5 text-blue-600" />
          <h3 className={`font-semibold ${
            isDarkTheme ? 'text-white' : 'text-black'
          }`}>pH Meter</h3>
        </div>
        
        <div className={`flex items-center space-x-1 ${phStatus.color}`}>
          {phStatus.icon}
          <span className="text-sm font-medium">{phStatus.status}</span>
        </div>
      </div>
      
      {/* pH Content - Show different content based on applicability */}
      {phApplicability.applicable || isConverted ? (
        <>
          {/* Conversion Status */}
          {isConverted && convertedData && (
            <div className={`mb-4 p-3 rounded-lg border ${
              isDarkTheme 
                ? 'bg-blue-900/20 border-blue-700' 
                : 'bg-blue-50 border-blue-200'
            }`}>
              <div className="flex items-center space-x-2 mb-2">
                <Beaker className="h-4 w-4 text-blue-600" />
                <span className={`text-sm font-medium ${
                  isDarkTheme ? 'text-blue-300' : 'text-blue-800'
                }`}>
                  {convertedData.formula ? 'Converted to Aqueous Form' : 'Conversion Result'}
                </span>
              </div>
              {convertedData.formula ? (
                <div className={`text-sm ${
                  isDarkTheme ? 'text-blue-200' : 'text-blue-700'
                }`}>
                  <strong>{convertedData.name}</strong> ({convertedData.formula})
                  <br />
                  <span className="text-xs">{convertedData.description}</span>
                </div>
              ) : (
                <div className={`text-sm ${
                  isDarkTheme ? 'text-red-300' : 'text-red-600'
                }`}>
                  {convertedData.description}
                </div>
              )}
            </div>
          )}

          {/* Only show pH meter if conversion was successful or originally applicable */}
          {(phApplicability.applicable || (isConverted && convertedData?.formula)) && (
            <>
              {/* pH Scale */}
              <div className="relative mb-4">
                {/* Background gradient */}
                <div 
                  className="h-8 rounded-lg"
                  style={{
                    background: 'linear-gradient(to right, #ff0000 0%, #ff6600 14%, #ffaa00 28%, #00ff00 43%, #00ff00 57%, #0066ff 71%, #3300ff 85%, #6600ff 100%)'
                  }}
                />
                
                {/* pH Scale Numbers */}
                <div className="flex justify-between text-xs text-gray-600 mt-1">
                  {[0, 2, 4, 6, 7, 8, 10, 12, 14].map(num => (
                    <span key={num} className="font-medium">{num}</span>
                  ))}
                </div>
                
                {/* pH Indicator */}
                <motion.div
                  className="absolute top-0 w-1 h-8 bg-black rounded-full shadow-lg"
                  style={{
                    left: indicatorPosition,
                    x: '-50%'
                  }}
                  animate={isAnimating ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.5 }}
                />
              </div>
              
              {/* Current pH Display */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <motion.div 
                    className="text-3xl font-bold mb-1"
                    style={{ color: phColor }}
                    animate={isAnimating ? { scale: [1, 1.1, 1] } : {}}
                  >
                    {currentPH.toFixed(1)}
                  </motion.div>
                  <div className="text-sm text-gray-600">Current pH</div>
                </div>
                
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-700 mb-1">
                    {temperature}°C
                  </div>
                  <div className="text-sm text-gray-600">Temperature</div>
                </div>
              </div>
              
              {/* pH Categories */}
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center p-2 bg-red-50 rounded">
                  <div className="font-medium text-red-700">Acidic</div>
                  <div className="text-red-600">0-6.9</div>
                </div>
                <div className="text-center p-2 bg-green-50 rounded">
                  <div className="font-medium text-green-700">Neutral</div>
                  <div className="text-green-600">7.0</div>
                </div>
                <div className="text-center p-2 bg-blue-50 rounded">
                  <div className="font-medium text-blue-700">Basic</div>
                  <div className="text-blue-600">7.1-14</div>
                </div>
              </div>
            </>
          )}
        </>
      ) : (
        /* Non-applicable pH Display */
        <div className="text-center py-8">
          <div className="text-4xl mb-3">🚫</div>
          <div className={`text-lg font-semibold mb-2 ${
            isDarkTheme ? 'text-white' : 'text-black'
          }`}>pH Not Applicable</div>
          <div className={`text-sm mb-4 ${
            isDarkTheme ? 'text-slate-300' : 'text-black'
          }`}>
            {phApplicability.reason || "pH measurement not applicable for this substance"}
          </div>
          
          {/* Conversion Button */}
          {!isConverting && canConvertToAqueous(elements, reactionResult) && (
            <motion.button
              onClick={handleConversion}
              className={`px-4 py-2 rounded-lg font-medium transition-colors mb-4 ${
                isDarkTheme
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="flex items-center space-x-2">
                <Beaker className="h-4 w-4" />
                <span>Convert to suitable testing form</span>
              </div>
            </motion.button>
          )}

          {/* Converting Animation */}
          {isConverting && (
            <div className="mb-4">
              <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg ${
                isDarkTheme 
                  ? 'bg-blue-900/30 text-blue-300' 
                  : 'bg-blue-100 text-blue-700'
              }`}>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Beaker className="h-4 w-4" />
                </motion.div>
                <span className="text-sm font-medium">Dissolving substance in water...</span>
              </div>
            </div>
          )}
          
          <div className={`text-xs p-3 rounded ${
            isDarkTheme 
              ? 'text-slate-300 bg-slate-800' 
              : 'text-black bg-slate-100'
          }`}>
            💡 <strong>Tip:</strong> pH can only be measured for aqueous solutions (dissolved in water) or liquid acids/bases.
          </div>
        </div>
      )}
      
      {/* pH Scale Reference - Always show for educational purpose */}
      {!phApplicability.applicable && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="text-sm font-medium text-blue-800 mb-2">pH Scale Reference:</div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center p-2 bg-red-100 rounded">
              <div className="font-medium text-red-700">Acidic</div>
              <div className="text-red-600">0-6.9</div>
            </div>
            <div className="text-center p-2 bg-green-100 rounded">
              <div className="font-medium text-green-700">Neutral</div>
              <div className="text-green-600">7.0</div>
            </div>
            <div className="text-center p-2 bg-blue-100 rounded">
              <div className="font-medium text-blue-700">Basic</div>
              <div className="text-blue-600">7.1-14</div>
            </div>
          </div>
        </div>
      )}
      
      {/* Active Elements Display */}
      {elements.length > 0 && (
        <div className={`mt-3 pt-3 border-t ${
          isDarkTheme ? 'border-slate-700' : 'border-slate-200'
        }`}>
          <div className={`text-xs mb-1 ${
            isDarkTheme ? 'text-slate-300' : 'text-black'
          }`}>Active Elements:</div>
          <div className="flex flex-wrap gap-1">
            {elements.slice(0, 3).map((element, index) => (
              <span 
                key={index}
                className={`inline-block px-2 py-1 rounded text-xs ${
                  isDarkTheme 
                    ? 'bg-slate-700 text-white' 
                    : 'bg-slate-100 text-black'
                }`}
              >
                {element}
              </span>
            ))}
            {elements.length > 3 && (
              <span className={`text-xs ${
                isDarkTheme ? 'text-slate-400' : 'text-black'
              }`}>+{elements.length - 3} more</span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
