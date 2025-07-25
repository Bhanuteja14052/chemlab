'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Timer, Play, Pause, RotateCcw, Bell, Volume2, VolumeX, Clock } from 'lucide-react'

interface ReactionTimerProps {
  onTimeComplete?: (duration: number) => void
  onTimeUpdate?: (timeRemaining: number) => void
  autoStart?: boolean
  className?: string
}

interface TimerPreset {
  name: string
  duration: number // in seconds
  description: string
  icon: string
}

const TIMER_PRESETS: TimerPreset[] = [
  { name: 'Quick Test', duration: 30, description: 'Quick reaction check', icon: '⚡' },
  { name: 'Standard', duration: 120, description: 'Standard reaction time', icon: '🧪' },
  { name: 'Heating', duration: 300, description: 'For heating reactions', icon: '🔥' },
  { name: 'Crystallization', duration: 600, description: 'Crystal formation', icon: '💎' },
  { name: 'Custom', duration: 0, description: 'Set custom time', icon: '⚙️' }
]

export default function ReactionTimer({ 
  onTimeComplete, 
  onTimeUpdate, 
  autoStart = false,
  className = ''
}: ReactionTimerProps) {
  const [duration, setDuration] = useState(120) // Default 2 minutes
  const [timeRemaining, setTimeRemaining] = useState(120)
  const [isRunning, setIsRunning] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [customTime, setCustomTime] = useState({ minutes: 2, seconds: 0 })
  const [selectedPreset, setSelectedPreset] = useState(1) // Standard preset
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  
  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+Dyvmw2CypLs9u+f0xwLuPunVs+BCtLp9jFeSUAMYXP8+A2QAoUXrTqnqhVFApGn+P6ymw2CypLs9u+f0xwLuPgk1kEfFo2AEyQHBdoSQhGE0AAT+TXBz2AtUEVQ3u+8+c7VQaYaUyELJRpMwZwSk2MuZ5GEQ2nHDY2QCfzaGxtj6T4w4BVGhNkRGpZQ0IZCjOCCJg5/3GvTSoHMJoYqb6xCjQY6mJZdU8pGBVEIh9+VApCEQ24qY5LDQqQ0jdN2lEFcC7k2QcNq1sFJKNzAj2BM8O0QXu+8+c7VQaYaUyELJRpMwZwSk2MuZ5GEQ2nHDY2QCfzaGxtj6T4w4BVGhNkRGpZQ0IZCjOCCJg5/3GvTSoHMJoYqb6xCjQY6mJZdU8pGBVEIh9+VApCEQ24qY5LDQqQ0jdN2lEFcC7k2QcNq1sFJKNzAj2BM8O0QXu+8+c7VQaYaUyELJRpMwZwSk2MuZ5GEQ2nHDY2QCfzaGxtj6T4w4BVGhNkRGpZQ0IZCjOCCJg5/3GvTSoHMJoYqb6xCjQY6mJZdU8pGBVEIh9+VApCEQ24qY5LDQqQ0jdN2lEFcC7k2QcNq1s=')
  }, [])
  
  useEffect(() => {
    if (autoStart && !isRunning && timeRemaining > 0) {
      startTimer()
    }
  }, [autoStart])
  
  useEffect(() => {
    if (isRunning && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          const newTime = prev - 1
          onTimeUpdate?.(newTime)
          
          if (newTime <= 0) {
            setIsRunning(false)
            setIsCompleted(true)
            onTimeComplete?.(duration)
            playAlarm()
          }
          
          return newTime
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, timeRemaining, duration, onTimeComplete, onTimeUpdate])
  
  const playAlarm = () => {
    if (soundEnabled && audioRef.current) {
      audioRef.current.play().catch(console.error)
    }
  }
  
  const startTimer = () => {
    setIsRunning(true)
    setIsCompleted(false)
  }
  
  const pauseTimer = () => {
    setIsRunning(false)
  }
  
  const resetTimer = () => {
    setIsRunning(false)
    setIsCompleted(false)
    setTimeRemaining(duration)
  }
  
  const setPreset = (presetIndex: number) => {
    const preset = TIMER_PRESETS[presetIndex]
    setSelectedPreset(presetIndex)
    
    if (preset.name === 'Custom') {
      const totalSeconds = customTime.minutes * 60 + customTime.seconds
      setDuration(totalSeconds)
      setTimeRemaining(totalSeconds)
    } else {
      setDuration(preset.duration)
      setTimeRemaining(preset.duration)
    }
    
    setIsRunning(false)
    setIsCompleted(false)
  }
  
  const updateCustomTime = (minutes: number, seconds: number) => {
    setCustomTime({ minutes, seconds })
    if (selectedPreset === 4) { // Custom preset
      const totalSeconds = minutes * 60 + seconds
      setDuration(totalSeconds)
      setTimeRemaining(totalSeconds)
    }
  }
  
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  
  const progress = duration > 0 ? ((duration - timeRemaining) / duration) * 100 : 0
  
  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Timer className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Reaction Timer</h3>
        </div>
        
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`p-2 rounded-full transition-colors ${
            soundEnabled ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
          }`}
        >
          {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
        </button>
      </div>
      
      {/* Timer Display */}
      <div className="text-center mb-6">
        <motion.div
          className={`text-6xl font-mono font-bold mb-2 ${
            isCompleted ? 'text-red-500' : 
            timeRemaining <= 10 ? 'text-orange-500' : 
            'text-gray-900'
          }`}
          animate={
            isCompleted ? { scale: [1, 1.1, 1] } :
            timeRemaining <= 10 && isRunning ? { scale: [1, 1.05, 1] } : {}
          }
          transition={{ duration: 0.5, repeat: isCompleted ? 3 : (timeRemaining <= 10 && isRunning ? Infinity : 0) }}
        >
          {formatTime(timeRemaining)}
        </motion.div>
        
        {isCompleted && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center space-x-2 text-red-600 font-medium"
          >
            <Bell className="h-5 w-5 animate-bounce" />
            <span>Time Complete!</span>
          </motion.div>
        )}
      </div>
      
      {/* Progress Ring */}
      <div className="flex justify-center mb-6">
        <div className="relative w-32 h-32">
          <svg className="w-32 h-32 transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-gray-200"
            />
            <motion.circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className={isCompleted ? "text-red-500" : "text-blue-500"}
              strokeLinecap="round"
              strokeDasharray={351.86}
              animate={{ strokeDashoffset: 351.86 - (progress / 100) * 351.86 }}
              transition={{ duration: 0.5 }}
            />
          </svg>
          
          <div className="absolute inset-0 flex items-center justify-center">
            <Clock className={`h-8 w-8 ${isRunning ? 'text-blue-500' : 'text-gray-400'}`} />
          </div>
        </div>
      </div>
      
      {/* Control Buttons */}
      <div className="flex justify-center space-x-3 mb-6">
        <button
          onClick={isRunning ? pauseTimer : startTimer}
          disabled={timeRemaining <= 0 && !isCompleted}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          <span>{isRunning ? 'Pause' : 'Start'}</span>
        </button>
        
        <button
          onClick={resetTimer}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Reset</span>
        </button>
      </div>
      
      {/* Preset Buttons */}
      <div className="mb-4">
        <div className="text-sm font-medium text-gray-700 mb-2">Quick Presets:</div>
        <div className="grid grid-cols-2 gap-2">
          {TIMER_PRESETS.slice(0, 4).map((preset, index) => (
            <button
              key={index}
              onClick={() => setPreset(index)}
              className={`text-left p-3 rounded-lg border transition-colors ${
                selectedPreset === index 
                  ? 'bg-blue-50 border-blue-200 text-blue-900' 
                  : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-lg">{preset.icon}</span>
                <span className="font-medium text-sm">{preset.name}</span>
              </div>
              <div className="text-xs text-gray-600">{formatTime(preset.duration)}</div>
            </button>
          ))}
        </div>
      </div>
      
      {/* Custom Timer */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-3">
          <span className="text-lg">⚙️</span>
          <span className="font-medium text-sm">Custom Timer</span>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Minutes</label>
            <input
              type="number"
              min="0"
              max="99"
              value={customTime.minutes}
              onChange={(e) => updateCustomTime(parseInt(e.target.value) || 0, customTime.seconds)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
            />
          </div>
          
          <div>
            <label className="block text-xs text-gray-600 mb-1">Seconds</label>
            <input
              type="number"
              min="0"
              max="59"
              value={customTime.seconds}
              onChange={(e) => updateCustomTime(customTime.minutes, parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
            />
          </div>
        </div>
        
        <button
          onClick={() => setPreset(4)}
          className="w-full mt-3 px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
        >
          Set Custom Timer
        </button>
      </div>
      
      {/* Status Indicator */}
      <div className="mt-4 text-center">
        <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
          isCompleted ? 'bg-red-100 text-red-800' :
          isRunning ? 'bg-green-100 text-green-800' :
          'bg-gray-100 text-gray-600'
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            isCompleted ? 'bg-red-500' :
            isRunning ? 'bg-green-500 animate-pulse' :
            'bg-gray-400'
          }`} />
          <span>
            {isCompleted ? 'Completed' : isRunning ? 'Running' : 'Stopped'}
          </span>
        </div>
      </div>
    </div>
  )
}
