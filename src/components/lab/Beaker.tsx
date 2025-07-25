'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import ClientOnly from '@/components/common/ClientOnly'
import { getStateOfMatter, formatStateDisplay } from '@/utils/stateOfMatter'

interface BeakerProps {
  id: string
  contents: string[]
  color: string
  onDrop: (element: string) => void
  size?: 'small' | 'medium' | 'large'
  compoundState?: 'liquid' | 'gas' | 'solid' | 'aqueous' | 'plasma'
  isReacting?: boolean
}

// Helper function to get container name based on state
const getContainerName = (state: string): string => {
  const stateInfo = getStateOfMatter(state)
  
  switch (state.toLowerCase()) {
    case 'liquid':
    case 'aqueous':
      return 'Beaker'
    case 'gas':
      return 'Test Tube'
    case 'solid':
      return 'Petri Dish'
    case 'plasma':
      return 'Plasma Chamber'
    default:
      return 'Container'
  }
}

export default function Beaker({ 
  id, 
  contents, 
  color, 
  size = 'medium', 
  compoundState = 'liquid',
  isReacting = false 
}: BeakerProps) {
  const [isHovered, setIsHovered] = useState(false)

  const sizeClasses = {
    small: 'w-20 h-24',
    medium: 'w-24 h-32',
    large: 'w-32 h-40'
  }

  const liquidHeight = contents.length > 0 ? Math.min(50 + contents.length * 20, 80) : 0
  const stateInfo = getStateOfMatter(compoundState)

  return (
    <ClientOnly fallback={
      <div className={`relative ${sizeClasses[size]} bg-gray-100 rounded-lg animate-pulse`}>
        <div className="w-full h-full bg-gray-200 rounded-lg"></div>
      </div>
    }>
      <div className={`relative ${sizeClasses[size]}`}>
        <motion.div
          className="w-full h-full cursor-pointer select-none"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Container based on compound state */}
          <div className="relative w-full h-full">
            {/* Safe Reacting Animation - no hydration issues */}
            {isReacting && (
              <div className="absolute inset-0 z-10 flex items-center justify-center">
                <motion.div
                  className="text-3xl filter drop-shadow-lg"
                  animate={{ 
                    rotate: [0, 360],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity, 
                    ease: "easeInOut"
                  }}
                >
                  ⚗️
                </motion.div>
              </div>
            )}

            {/* Container type based on compound state */}
            {(compoundState === 'liquid' || compoundState === 'aqueous') && (
              /* Beaker for liquids */
              <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow-lg">
                {/* Glass outline */}
                <path
                  d="M20 20 L20 70 Q20 90 40 90 L60 90 Q80 90 80 70 L80 20"
                  fill="rgba(200, 230, 255, 0.3)"
                  stroke="rgba(100, 150, 200, 0.8)"
                  strokeWidth="2"
                />
                
                {/* Liquid */}
                {liquidHeight > 0 && (
                  <motion.path
                    d={`M20 ${90 - liquidHeight * 0.7} Q20 90 40 90 L60 90 Q80 90 80 ${90 - liquidHeight * 0.7}`}
                    fill={color}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.8 }}
                    transition={{ duration: 0.5 }}
                  />
                )}
                
                {/* Beaker rim */}
                <rect x="15" y="18" width="70" height="4" fill="rgba(100, 150, 200, 0.8)" rx="2" />
              
              {/* Pour spout */}
              <path d="M75 18 Q82 18 82 25" fill="none" stroke="rgba(100, 150, 200, 0.8)" strokeWidth="2" />
            </svg>
          )}

          {compoundState === 'gas' && (
            /* Test tube for gases */
            <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow-lg">
              {/* Test tube main body */}
              <path
                d="M 40 15 L 40 85 Q 40 95 50 95 Q 60 95 60 85 L 60 15 Z"
                fill="rgba(240, 248, 255, 0.9)"
                stroke="rgba(70, 130, 180, 0.8)"
                strokeWidth="2.5"
              />
              
              {/* Test tube rim/opening */}
              <rect 
                x="38" 
                y="12" 
                width="24" 
                height="6" 
                fill="rgba(70, 130, 180, 0.9)" 
                rx="3" 
              />
              
              {/* Glass highlight */}
              <path
                d="M 42 15 L 42 85 Q 42 90 45 90"
                fill="none"
                stroke="rgba(255, 255, 255, 0.6)"
                strokeWidth="2"
              />
              
              {/* Gas content */}
              {contents.length > 0 && (
                <motion.path
                  d="M 42 20 L 42 80 Q 42 88 50 88 Q 58 88 58 80 L 58 20 Z"
                  fill={color}
                  opacity="0.3"
                  animate={{ 
                    opacity: [0.2, 0.5, 0.2],
                    scaleY: [0.95, 1.02, 0.95]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
              )}
              
              {/* Gas particles animation */}
              {contents.length > 0 && (
                <>
                  {[...Array(5)].map((_, i) => (
                    <motion.circle
                      key={i}
                      cx={35 + (i % 3) * 10}
                      cy={30 + Math.floor(i / 3) * 15}
                      r="2"
                      fill={color}
                      animate={{
                        cx: [35 + (i % 3) * 10, 45 + (i % 3) * 8, 35 + (i % 3) * 10],
                        cy: [30 + Math.floor(i / 3) * 15, 40 + Math.floor(i / 3) * 12, 30 + Math.floor(i / 3) * 15],
                        opacity: [0.6, 1, 0.6]
                      }}
                      transition={{
                        duration: 1.5 + i * 0.2,
                        repeat: Infinity,
                        delay: i * 0.3
                      }}
                    />
                  ))}
                </>
              )}
            </svg>
          )}

          {(compoundState === 'solid' || compoundState === 'plasma') && (
            /* Petri dish for solids */
            <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow-lg">
              {/* Dish outline */}
              <ellipse
                cx="50"
                cy="70"
                rx="35"
                ry="25"
                fill="rgba(200, 230, 255, 0.3)"
                stroke="rgba(100, 150, 200, 0.8)"
                strokeWidth="2"
              />
              
              {/* Solid content */}
              {contents.length > 0 && (
                <motion.ellipse
                  cx="50"
                  cy="72"
                  rx="30"
                  ry="20"
                  fill={color}
                  opacity="0.8"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5 }}
                />
              )}
              
              {/* Dish rim */}
              <ellipse cx="50" cy="65" rx="35" ry="25" fill="none" stroke="rgba(100, 150, 200, 0.8)" strokeWidth="1" />
              
              {/* Solid particles/crystals */}
              {contents.length > 0 && compoundState === 'solid' && (
                <>
                  {[...Array(8)].map((_, i) => (
                    <motion.polygon
                      key={i}
                      points={`${40 + (i % 4) * 5},${65 + Math.floor(i / 4) * 8} ${42 + (i % 4) * 5},${67 + Math.floor(i / 4) * 8} ${44 + (i % 4) * 5},${65 + Math.floor(i / 4) * 8} ${42 + (i % 4) * 5},${63 + Math.floor(i / 4) * 8}`}
                      fill={color}
                      animate={{
                        scale: [0.8, 1.2, 0.8],
                        opacity: [0.7, 1, 0.7]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.2
                      }}
                    />
                  ))}
                </>
              )}
              
              {/* Plasma effects */}
              {contents.length > 0 && compoundState === 'plasma' && (
                <>
                  {[...Array(6)].map((_, i) => (
                    <motion.circle
                      key={i}
                      cx={35 + (i % 3) * 10}
                      cy={65 + Math.floor(i / 3) * 8}
                      r="3"
                      fill={color}
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.5, 1, 0.5]
                      }}
                      transition={{
                        duration: 0.8,
                        repeat: Infinity,
                        delay: i * 0.1
                      }}
                    />
                  ))}
                </>
              )}
            </svg>
          )}

        {/* Bubbles animation when contents are added (for liquids only) */}
        {contents.length > 0 && (compoundState === 'liquid' || compoundState === 'aqueous') && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-white rounded-full opacity-50"
                style={{
                  left: `${30 + i * 15}%`,
                  bottom: '20%'
                }}
                animate={{
                  y: [-20, -40, -20],
                  opacity: [0.5, 0.8, 0.5]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.3
                }}
              />
            ))}
          </div>
        )}

        {/* Hover label */}
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap"
          >
            {contents.length > 0 ? 
              `${getContainerName(compoundState)}: ${contents.join(' + ')}` : 
              getContainerName(compoundState)
            }
          </motion.div>
        )}

        {/* State indicator with proper emoji and text */}
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-center">
          <div className="text-xs text-gray-600">
            {formatStateDisplay(compoundState, 'full')}
          </div>
        </div>
        </div>
      </motion.div>
    </div>
  </ClientOnly>
  )
}
