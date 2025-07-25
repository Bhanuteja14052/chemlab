'use client'

import React, { useState, useEffect } from 'react'
import { motion, useSpring, useTransform } from 'framer-motion'
import { Scale, Target, AlertCircle, Minus, Plus } from 'lucide-react'

interface DigitalScaleProps {
  targetWeight: number
  currentWeight: number
  onWeightChange: (weight: number) => void
  maxWeight?: number
  precision?: number
  unit?: 'g' | 'mg' | 'kg'
  className?: string
}

// Convert between units
const convertWeight = (weight: number, fromUnit: string, toUnit: string): number => {
  const toGrams: Record<string, number> = {
    'mg': 0.001,
    'g': 1,
    'kg': 1000
  }
  
  const fromGrams: Record<string, number> = {
    'mg': 1000,
    'g': 1,
    'kg': 0.001
  }
  
  const grams = weight * toGrams[fromUnit]
  return grams * fromGrams[toUnit]
}

// Get molecular weight database for elements (using symbols)
const getElementMolecularWeight = (element: string): number => {
  const weights: Record<string, number> = {
    'H': 1.008,    // Hydrogen
    'He': 4.003,   // Helium
    'Li': 6.941,   // Lithium
    'Be': 9.012,   // Beryllium
    'B': 10.811,   // Boron
    'C': 12.011,   // Carbon
    'N': 14.007,   // Nitrogen
    'O': 15.999,   // Oxygen
    'F': 18.998,   // Fluorine
    'Ne': 20.180,  // Neon
    'Na': 22.990,  // Sodium
    'Mg': 24.305,  // Magnesium
    'Al': 26.982,  // Aluminum
    'Si': 28.085,  // Silicon
    'P': 30.974,   // Phosphorus
    'S': 32.066,   // Sulfur
    'Cl': 35.453,  // Chlorine
    'Ar': 39.948,  // Argon
    'K': 39.098,   // Potassium
    'Ca': 40.078,  // Calcium
    'Fe': 55.845,  // Iron
    'Cu': 63.546,  // Copper
    'Zn': 65.38,   // Zinc
    'Ag': 107.868, // Silver
    'Au': 196.967, // Gold
    'Pb': 207.2,   // Lead
    'Iron': 55.845,
    'Copper': 63.546,
    'Zinc': 65.38,
    
    // Common compounds
    'Water': 18.015,
    'Sodium Chloride': 58.44,
    'Carbon Dioxide': 44.01,
    'Methane': 16.04,
    'Ammonia': 17.031,
    'Hydrochloric Acid': 36.458,
    'Sulfuric Acid': 98.079,
    'Acetic Acid': 60.052
  }
  
  return weights[element] || 50 // Default molecular weight
}

export default function DigitalScale({ 
  targetWeight, 
  currentWeight, 
  onWeightChange, 
  maxWeight = 500,
  precision = 2,
  unit = 'g',
  className = ''
}: DigitalScaleProps) {
  const [displayWeight, setDisplayWeight] = useState(currentWeight)
  const [isStabilizing, setIsStabilizing] = useState(false)
  const [selectedUnit, setSelectedUnit] = useState(unit)
  
  // Spring animation for weight changes
  const weightSpring = useSpring(displayWeight, {
    stiffness: 150,
    damping: 20
  })
  
  // Transform weight to scale platform tilt
  const platformTilt = useTransform(weightSpring, [0, maxWeight], [0, -2])
  
  useEffect(() => {
    setDisplayWeight(currentWeight)
    if (currentWeight !== displayWeight) {
      setIsStabilizing(true)
      setTimeout(() => setIsStabilizing(false), 800)
    }
  }, [currentWeight, displayWeight])
  
  const adjustWeight = (delta: number) => {
    const newWeight = Math.max(0, Math.min(maxWeight, currentWeight + delta))
    onWeightChange(Number(newWeight.toFixed(precision)))
  }
  
  const getDifference = () => {
    const diff = currentWeight - targetWeight
    return {
      value: Math.abs(diff),
      status: Math.abs(diff) < 0.1 ? 'exact' : diff > 0 ? 'over' : 'under'
    }
  }
  
  const difference = getDifference()
  const convertedWeight = convertWeight(displayWeight, 'g', selectedUnit)
  const convertedTarget = convertWeight(targetWeight, 'g', selectedUnit)
  
  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Scale className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Digital Scale</h3>
        </div>
        
        {/* Unit Selector */}
        <select 
          value={selectedUnit}
          onChange={(e) => setSelectedUnit(e.target.value as 'g' | 'mg' | 'kg')}
          className="text-sm border border-gray-300 rounded px-2 py-1"
        >
          <option value="mg">mg</option>
          <option value="g">g</option>
          <option value="kg">kg</option>
        </select>
      </div>
      
      {/* Scale Platform */}
      <div className="relative mb-6">
        <motion.div 
          className="bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg p-6 border-2 border-gray-400 shadow-inner"
          style={{ rotateX: platformTilt }}
        >
          {/* Scale Surface */}
          <div className="bg-gray-100 rounded border border-gray-300 h-16 flex items-center justify-center relative overflow-hidden">
            {/* Weight visualization */}
            <motion.div
              className="absolute bottom-0 left-0 right-0 bg-blue-200 opacity-50"
              animate={{ height: `${(currentWeight / maxWeight) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
            
            {/* Stabilizing indicator */}
            {isStabilizing && (
              <motion.div
                className="absolute inset-0 bg-yellow-200 opacity-30"
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              />
            )}
            
            <div className="relative z-10 text-center">
              <div className="text-xs text-gray-600">Sample on scale</div>
            </div>
          </div>
        </motion.div>
        
        {/* Scale Base */}
        <div className="bg-gray-400 h-2 rounded-b-lg shadow-lg" />
      </div>
      
      {/* Digital Display */}
      <div className="bg-black rounded-lg p-4 mb-4">
        <div className="text-center">
          <motion.div 
            className="text-2xl font-mono text-green-400 mb-1"
            animate={isStabilizing ? { opacity: [1, 0.7, 1] } : {}}
            transition={{ duration: 0.3, repeat: isStabilizing ? Infinity : 0 }}
          >
            {displayWeight.toFixed(1)} {selectedUnit}
          </motion.div>
          
          {isStabilizing && (
            <div className="text-xs text-yellow-400 animate-pulse">
              Stabilizing...
            </div>
          )}
        </div>
      </div>
      
      {/* Weight Controls */}
      <div className="grid grid-cols-5 gap-2 mb-4">
        <button
          onClick={() => adjustWeight(-10)}
          className="flex items-center justify-center p-2 bg-red-100 hover:bg-red-200 rounded text-red-700 transition-colors"
        >
          <Minus className="h-4 w-4" />
          <span className="text-xs ml-1">10g</span>
        </button>
        <button
          onClick={() => adjustWeight(-1)}
          className="flex items-center justify-center p-2 bg-red-50 hover:bg-red-100 rounded text-red-600 transition-colors"
        >
          <Minus className="h-4 w-4" />
          <span className="text-xs ml-1">1g</span>
        </button>
        
        <button
          onClick={() => onWeightChange(0)}
          className="flex items-center justify-center p-2 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 transition-colors"
        >
          <span className="text-xs">Tare</span>
        </button>
        
        <button
          onClick={() => adjustWeight(1)}
          className="flex items-center justify-center p-2 bg-green-50 hover:bg-green-100 rounded text-green-600 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span className="text-xs ml-1">1g</span>
        </button>
        <button
          onClick={() => adjustWeight(10)}
          className="flex items-center justify-center p-2 bg-green-100 hover:bg-green-200 rounded text-green-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span className="text-xs ml-1">10g</span>
        </button>
      </div>
      
      {/* Target Comparison */}
      <div className="bg-gray-50 rounded-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Target Weight:</span>
          <span className="text-sm font-mono">{convertedTarget.toFixed(precision)} {selectedUnit}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Target className="h-4 w-4 text-gray-600" />
          <div className="flex-1">
            <div className="text-sm">
              <span className={`font-medium ${
                difference.status === 'exact' ? 'text-green-600' :
                difference.status === 'over' ? 'text-red-600' : 'text-yellow-600'
              }`}>
                {difference.status === 'exact' ? 'Perfect!' :
                 difference.status === 'over' ? `${convertWeight(difference.value, 'g', selectedUnit).toFixed(precision)} ${selectedUnit} over` :
                 `${convertWeight(difference.value, 'g', selectedUnit).toFixed(precision)} ${selectedUnit} under`}
              </span>
            </div>
          </div>
          
          {difference.status !== 'exact' && (
            <AlertCircle className={`h-4 w-4 ${
              difference.status === 'over' ? 'text-red-500' : 'text-yellow-500'
            }`} />
          )}
        </div>
        
        {/* Progress Bar */}
        <div className="mt-2 bg-gray-200 rounded-full h-2">
          <motion.div
            className={`h-2 rounded-full ${
              difference.status === 'exact' ? 'bg-green-500' :
              difference.status === 'over' ? 'bg-red-500' : 'bg-yellow-500'
            }`}
            animate={{ width: `${Math.min(100, (currentWeight / targetWeight) * 100)}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
      
      {/* Quick Presets */}
      <div className="mt-4">
        <div className="text-xs text-gray-600 mb-2">Quick Presets:</div>
        <div className="grid grid-cols-4 gap-1">
          {[1, 5, 10, 25].map(preset => (
            <button
              key={preset}
              onClick={() => onWeightChange(preset)}
              className="text-xs py-1 px-2 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
            >
              {preset}g
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
