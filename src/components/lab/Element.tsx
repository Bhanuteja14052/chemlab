'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface ElementProps {
  symbol: string
  name: string
  color: string
  safetyLevel: 'safe' | 'caution' | 'dangerous'
  atomicNumber: number
}

export default function Element({ symbol, name, color, safetyLevel, atomicNumber }: ElementProps) {
  const [isDarkTheme, setIsDarkTheme] = useState(false)

  // Check theme on mount and listen for changes
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
  const handleClick = () => {
    console.log('Element clicked:', name, symbol)
  }

  const safetyColors = {
    safe: isDarkTheme 
      ? 'border-green-400 bg-green-900/30' 
      : 'border-green-400 bg-green-50',
    caution: isDarkTheme 
      ? 'border-yellow-400 bg-yellow-900/30' 
      : 'border-yellow-400 bg-yellow-50',
    dangerous: isDarkTheme 
      ? 'border-red-400 bg-red-900/30' 
      : 'border-red-400 bg-red-50'
  }

  const safetyIcons = {
    safe: '✓',
    caution: '⚠',
    dangerous: '⚠'
  }

  return (
    <div className="relative w-full h-full"> {/* Remove max-width constraint */}
      <motion.div
        onClick={handleClick}
        className={`
          relative w-full aspect-square rounded-xl border-2 cursor-pointer
          ${safetyColors[safetyLevel]} 
          hover:shadow-lg transition-all duration-200 select-none p-2
          min-h-[60px] max-h-[80px]
        `}
        whileHover={{ scale: 1.03, y: -1 }}
        whileTap={{ scale: 0.97 }}
      >
        {/* Atomic Number */}
        <div className={`absolute top-1 left-1 text-xs ${
          isDarkTheme ? 'text-slate-400' : 'text-black'
        }`}>
          {atomicNumber}
        </div>
        
        {/* Safety indicator */}
        <div className={`absolute top-1 right-1 text-xs ${
          safetyLevel === 'safe' ? 'text-green-600' : 
          safetyLevel === 'caution' ? 'text-yellow-600' : 'text-red-600'
        }`}>
          {safetyIcons[safetyLevel]}
        </div>
        
        {/* Element Symbol */}
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className={`text-2xl font-bold mb-1 ${
              isDarkTheme ? 'text-white' : 'text-black'
            }`}>
              {symbol}
            </div>
          </div>
        </div>
        
        {/* Visual element representation */}
        <div 
          className="absolute inset-2 rounded-lg opacity-20"
          style={{ 
            backgroundColor: color === 'colorless' ? (isDarkTheme ? '#374151' : '#e5e7eb') : color,
            border: `1px solid ${color === 'colorless' ? (isDarkTheme ? '#4b5563' : '#d1d5db') : color}`
          }}
        />
      </motion.div>
      
      {/* Element Name - positioned outside the tile */}
      <div className={`mt-2 text-xs text-center font-medium truncate px-1 ${
        isDarkTheme ? 'text-white' : 'text-black'
      }`}>
        {name}
      </div>
    </div>
  )
}
