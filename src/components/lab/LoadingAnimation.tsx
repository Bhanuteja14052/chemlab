'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface LoadingAnimationProps {
  message?: string
  type?: 'beaker' | 'molecule' | 'reaction' | 'default'
}

const LoadingAnimation: React.FC<LoadingAnimationProps> = ({ 
  message = 'Loading...', 
  type = 'default' 
}) => {
  if (type === 'beaker') {
    return (
      <div className="flex flex-col items-center justify-center p-6">
        <div className="relative">
          {/* Stable Round Bottom Flask */}
          <motion.div
            className="relative w-16 h-20"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Flask Base - Round Bottom */}
            <motion.div
              className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-gradient-to-b from-blue-100 to-blue-300 rounded-full border-2 border-gray-400"
              animate={{
                scale: [1, 1.02, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {/* Gentle Bubbles */}
              <motion.div
                className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-white bg-opacity-60 rounded-full"
                animate={{
                  y: [0, -8, 0],
                  opacity: [0.3, 0.8, 0.3],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <motion.div
                className="absolute bottom-1 left-1/3 w-1 h-1 bg-white bg-opacity-50 rounded-full"
                animate={{
                  y: [0, -6, 0],
                  opacity: [0.2, 0.7, 0.2],
                }}
                transition={{
                  duration: 2.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5,
                }}
              />
            </motion.div>
            
            {/* Flask Neck */}
            <motion.div
              className="absolute top-0 left-1/2 transform -translate-x-1/2 w-3 h-8 bg-gradient-to-t from-blue-50 to-transparent border-l-2 border-r-2 border-gray-400"
              animate={{
                scaleY: [1, 1.01, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.div>
          
          {/* Subtle Steam Effect */}
          <motion.div
            className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-lg opacity-60"
            animate={{
              y: [0, -4, 0],
              opacity: [0.4, 0.7, 0.4],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            ⚗️
          </motion.div>
        </div>
        
        <motion.p
          className="mt-4 text-sm text-gray-600 font-medium text-center"
          animate={{
            opacity: [0.7, 1, 0.7],
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
      <div className="flex flex-col items-center justify-center p-6">
        <div className="relative w-20 h-20">
          {/* Central Atom */}
          <motion.div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-red-500 rounded-full shadow-lg"
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          {/* Orbiting Atoms - Smooth Circular Motion */}
          {[0, 72, 144, 216, 288].map((angle, index) => (
            <motion.div
              key={index}
              className="absolute top-1/2 left-1/2 w-2.5 h-2.5 rounded-full shadow-sm"
              style={{
                backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index],
              }}
              animate={{
                rotate: [0, 360],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "linear",
                delay: index * 0.2,
              }}
              transformTemplate={({ rotate }) => 
                `translate(-50%, -50%) rotate(${rotate}deg) translateX(25px) rotate(-${rotate}deg)`
              }
            />
          ))}
        </div>
        
        <motion.p
          className="mt-4 text-sm text-gray-600 font-medium text-center"
          animate={{
            opacity: [0.7, 1, 0.7],
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
      <div className="flex flex-col items-center justify-center p-6">
        <div className="flex items-center space-x-3">
          {/* Reactant A */}
          <motion.div
            className="w-6 h-6 bg-blue-500 rounded-full shadow-md"
            animate={{
              scale: [1, 1.1, 1],
              x: [0, 5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          {/* Plus Sign */}
          <motion.div
            className="text-lg font-bold text-gray-500"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.8, 1, 0.8],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            +
          </motion.div>
          
          {/* Reactant B */}
          <motion.div
            className="w-6 h-6 bg-green-500 rounded-full shadow-md"
            animate={{
              scale: [1, 1.1, 1],
              x: [0, -5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          {/* Arrow */}
          <motion.div
            className="text-lg text-gray-500"
            animate={{
              x: [0, 3, 0],
              opacity: [0.8, 1, 0.8],
            }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            →
          </motion.div>
          
          {/* Product */}
          <motion.div
            className="w-6 h-6 bg-purple-500 rounded-full shadow-md"
            animate={{
              scale: [0.8, 1.2, 1],
              opacity: [0.6, 1, 0.8],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5,
            }}
          />
        </div>
        
        <motion.p
          className="mt-4 text-sm text-gray-600 font-medium text-center"
          animate={{
            opacity: [0.7, 1, 0.7],
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

  // Default smooth loading spinner
  return (
    <div className="flex flex-col items-center justify-center p-6">
      <motion.div
        className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full"
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
        className="mt-3 text-sm text-gray-600 font-medium text-center"
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
}

export default LoadingAnimation
