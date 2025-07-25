'use client'

import React, { memo } from 'react'
import { motion } from 'framer-motion'

interface OptimizedLoadingProps {
  message?: string
  type?: 'flask' | 'molecule' | 'reaction' | 'spinner'
  size?: 'sm' | 'md' | 'lg'
}

// Memoized component for better performance
const OptimizedLoading: React.FC<OptimizedLoadingProps> = memo(({ 
  message = 'Processing...', 
  type = 'spinner',
  size = 'md' 
}) => {
  // Size configurations
  const sizeClasses = {
    sm: { container: 'p-4', flask: 'w-12 h-16', text: 'text-xs' },
    md: { container: 'p-6', flask: 'w-16 h-20', text: 'text-sm' },
    lg: { container: 'p-8', flask: 'w-20 h-24', text: 'text-base' },
  }

  const currentSize = sizeClasses[size]

  if (type === 'flask') {
    return (
      <div className={`flex flex-col items-center justify-center ${currentSize.container}`}>
        {/* Professional Flask Animation */}
        <motion.div
          className={`relative ${currentSize.flask}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          {/* Flask Body */}
          <motion.div
            className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-10 h-10 bg-gradient-to-b from-blue-50 to-blue-200 rounded-full border-2 border-gray-300 shadow-md"
            animate={{
              scale: [1, 1.01, 1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {/* Liquid Level */}
            <motion.div
              className="absolute bottom-1 left-1 right-1 h-6 bg-gradient-to-t from-blue-300 to-blue-100 rounded-full"
              animate={{
                height: [24, 28, 24],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            
            {/* Single Gentle Bubble */}
            <motion.div
              className="absolute bottom-3 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white bg-opacity-70 rounded-full"
              animate={{
                y: [0, -6, 0],
                opacity: [0.3, 0.7, 0.3],
                scale: [0.8, 1.2, 0.8],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.div>
          
          {/* Flask Neck - Stable */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-2.5 h-6 bg-gradient-to-t from-gray-100 to-transparent border-l border-r border-gray-300" />
        </motion.div>
        
        {/* Professional Text */}
        <motion.p
          className={`mt-3 ${currentSize.text} text-gray-600 font-medium text-center max-w-xs`}
          animate={{
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {message}
        </motion.p>
      </div>
    )
  }

  if (type === 'molecule') {
    return (
      <div className={`flex flex-col items-center justify-center ${currentSize.container}`}>
        <div className="relative w-16 h-16">
          {/* Central Nucleus */}
          <motion.div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-red-400 rounded-full shadow-sm"
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          {/* Orbiting Electrons */}
          {[0, 120, 240].map((angle, index) => (
            <motion.div
              key={index}
              className="absolute top-1/2 left-1/2 w-1.5 h-1.5 rounded-full shadow-sm"
              style={{
                backgroundColor: ['#3b82f6', '#10b981', '#f59e0b'][index],
              }}
              animate={{
                rotate: [angle, angle + 360],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear",
                delay: index * 0.5,
              }}
              transformTemplate={({ rotate }) => 
                `translate(-50%, -50%) rotate(${rotate}deg) translateX(20px) rotate(-${rotate}deg)`
              }
            />
          ))}
        </div>
        
        <motion.p
          className={`mt-3 ${currentSize.text} text-gray-600 font-medium text-center`}
          animate={{
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {message}
        </motion.p>
      </div>
    )
  }

  if (type === 'reaction') {
    return (
      <div className={`flex flex-col items-center justify-center ${currentSize.container}`}>
        <div className="flex items-center space-x-2">
          {/* Reactant 1 */}
          <motion.div
            className="w-4 h-4 bg-blue-400 rounded-full shadow-sm"
            animate={{
              scale: [1, 1.1, 1],
              x: [0, 2, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          {/* Plus */}
          <motion.span
            className="text-gray-500 font-bold text-sm"
            animate={{
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            +
          </motion.span>
          
          {/* Reactant 2 */}
          <motion.div
            className="w-4 h-4 bg-green-400 rounded-full shadow-sm"
            animate={{
              scale: [1, 1.1, 1],
              x: [0, -2, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          {/* Arrow */}
          <motion.span
            className="text-gray-500 text-sm mx-1"
            animate={{
              x: [0, 2, 0],
            }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            →
          </motion.span>
          
          {/* Product */}
          <motion.div
            className="w-4 h-4 bg-purple-400 rounded-full shadow-sm"
            animate={{
              scale: [0.8, 1.2, 1],
            }}
            transition={{
              duration: 2.2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.3,
            }}
          />
        </div>
        
        <motion.p
          className={`mt-3 ${currentSize.text} text-gray-600 font-medium text-center`}
          animate={{
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {message}
        </motion.p>
      </div>
    )
  }

  // Default smooth spinner
  return (
    <div className={`flex flex-col items-center justify-center ${currentSize.container}`}>
      <motion.div
        className={`border-2 border-blue-500 border-t-transparent rounded-full ${
          size === 'sm' ? 'w-6 h-6' : size === 'lg' ? 'w-10 h-10' : 'w-8 h-8'
        }`}
        animate={{
          rotate: [0, 360],
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      
      <motion.p
        className={`mt-2 ${currentSize.text} text-gray-600 font-medium text-center`}
        animate={{
          opacity: [0.7, 1, 0.7],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {message}
      </motion.p>
    </div>
  )
})

OptimizedLoading.displayName = 'OptimizedLoading'

export default OptimizedLoading
