'use client'

import { useEffect, useRef, useState } from 'react'

export interface LabSoundsContextType {
  playBubbling: () => void
  playHeating: () => void
  playGlassClick: () => void
  playSuccess: () => void
  playWarning: () => void
  playTimer: () => void
  playPourLiquid: () => void
  playElementDrop: () => void
  setMasterVolume: (volume: number) => void
  toggleSounds: () => void
  isSoundEnabled: boolean
}

// Audio data URLs for different lab sounds
const SOUND_DATA: Record<string, string> = {
  bubbling: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+Dyvmw2CypLs9u+f0xwLuPunVs+BCtLp9jFeSUAMYXP8+A2QAoUXrTqnqhVFApGn+P6ymw2CypLs9u+f0xwLuPgk1k=',
  heating: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+Dyvmw2CypLs9u+f0xwLuPunVs+BCtLp9jFeSUAMYXP8+A2QAoUXrTqnqhVFApGn+P6ymw2CypLs9u+f0xwLuPgk1k=',
  glassClick: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+Dyvmw2CypLs9u+f0xwLuPunVs+BCtLp9jFeSUAMYXP8+A2QAoUXrTqnqhVFApGn+P6ymw2CypLs9u+f0xwLuPgk1k=',
  success: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+Dyvmw2CypLs9u+f0xwLuPunVs+BCtLp9jFeSUAMYXP8+A2QAoUXrTqnqhVFApGn+P6ymw2CypLs9u+f0xwLuPgk1k=',
  warning: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+Dyvmw2CypLs9u+f0xwLuPunVs+BCtLp9jFeSUAMYXP8+A2QAoUXrTqnqhVFApGn+P6ymw2CypLs9u+f0xwLuPgk1k=',
  timer: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+Dyvmw2CypLs9u+f0xwLuPunVs+BCtLp9jFeSUAMYXP8+A2QAoUXrTqnqhVFApGn+P6ymw2CypLs9u+f0xwLuPgk1k=',
  pourLiquid: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+Dyvmw2CypLs9u+f0xwLuPunVs+BCtLp9jFeSUAMYXP8+A2QAoUXrTqnqhVFApGn+P6ymw2CypLs9u+f0xwLuPgk1k=',
  elementDrop: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+Dyvmw2CypLs9u+f0xwLuPunVs+BCtLp9jFeSUAMYXP8+A2QAoUXrTqnqhVFApGn+P6ymw2CypLs9u+f0xwLuPgk1k='
}

class LabSoundsManager {
  private audioContext: AudioContext | null = null
  private sounds: Map<string, AudioBuffer> = new Map()
  private masterVolume = 0.5
  private isEnabled = true
  private isInitialized = false

  async initialize() {
    if (this.isInitialized) return

    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      
      // Load and decode all sounds
      for (const [name, dataUrl] of Object.entries(SOUND_DATA)) {
        try {
          const response = await fetch(dataUrl)
          const arrayBuffer = await response.arrayBuffer()
          const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer)
          this.sounds.set(name, audioBuffer)
        } catch (error) {
          console.warn(`Failed to load sound: ${name}`, error)
          // Create a simple beep as fallback
          this.sounds.set(name, this.createBeepBuffer())
        }
      }
      
      this.isInitialized = true
    } catch (error) {
      console.warn('Failed to initialize audio context:', error)
    }
  }

  private createBeepBuffer(): AudioBuffer {
    if (!this.audioContext) throw new Error('AudioContext not initialized')
    
    const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.1, this.audioContext.sampleRate)
    const data = buffer.getChannelData(0)
    
    for (let i = 0; i < data.length; i++) {
      data[i] = Math.sin(2 * Math.PI * 440 * i / this.audioContext.sampleRate) * 0.1
    }
    
    return buffer
  }

  async playSound(soundName: string, volume = 1, loop = false) {
    if (!this.isEnabled || !this.audioContext || !this.isInitialized) return

    try {
      // Resume AudioContext if suspended (browser autoplay policy)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume()
      }

      const buffer = this.sounds.get(soundName)
      if (!buffer) return

      const source = this.audioContext.createBufferSource()
      const gainNode = this.audioContext.createGain()

      source.buffer = buffer
      source.loop = loop
      gainNode.gain.value = this.masterVolume * volume

      source.connect(gainNode)
      gainNode.connect(this.audioContext.destination)

      source.start(0)

      return source
    } catch (error) {
      console.warn(`Failed to play sound: ${soundName}`, error)
    }
  }

  setMasterVolume(volume: number) {
    this.masterVolume = Math.max(0, Math.min(1, volume))
  }

  toggleSounds() {
    this.isEnabled = !this.isEnabled
  }

  setSoundsEnabled(enabled: boolean) {
    this.isEnabled = enabled
  }

  get isSoundEnabled() {
    return this.isEnabled
  }
}

// Global sounds manager instance
let soundsManager: LabSoundsManager | null = null

export const useLabSounds = (): LabSoundsContextType => {
  const [isSoundEnabled, setIsSoundEnabled] = useState(true)
  const initRef = useRef(false)

  useEffect(() => {
    if (!initRef.current) {
      initRef.current = true
      
      if (typeof window !== 'undefined') {
        soundsManager = new LabSoundsManager()
        
        // Initialize on first user interaction
        const initAudio = () => {
          soundsManager?.initialize()
          document.removeEventListener('click', initAudio)
          document.removeEventListener('keydown', initAudio)
        }
        
        document.addEventListener('click', initAudio)
        document.addEventListener('keydown', initAudio)
      }
    }
  }, [])

  const playBubbling = () => {
    soundsManager?.playSound('bubbling', 0.3, true)
  }

  const playHeating = () => {
    soundsManager?.playSound('heating', 0.4, true)
  }

  const playGlassClick = () => {
    soundsManager?.playSound('glassClick', 0.6)
  }

  const playSuccess = () => {
    soundsManager?.playSound('success', 0.7)
  }

  const playWarning = () => {
    soundsManager?.playSound('warning', 0.8)
  }

  const playTimer = () => {
    soundsManager?.playSound('timer', 0.5)
  }

  const playPourLiquid = () => {
    soundsManager?.playSound('pourLiquid', 0.4)
  }

  const playElementDrop = () => {
    soundsManager?.playSound('elementDrop', 0.5)
  }

  const setMasterVolume = (volume: number) => {
    soundsManager?.setMasterVolume(volume)
  }

  const toggleSounds = () => {
    soundsManager?.toggleSounds()
    setIsSoundEnabled(soundsManager?.isSoundEnabled ?? true)
  }

  return {
    playBubbling,
    playHeating,
    playGlassClick,
    playSuccess,
    playWarning,
    playTimer,
    playPourLiquid,
    playElementDrop,
    setMasterVolume,
    toggleSounds,
    isSoundEnabled
  }
}

// React component for sound controls
interface LabSoundControlsProps {
  className?: string
}

export default function LabSoundControls({ className = '' }: LabSoundControlsProps) {
  const sounds = useLabSounds()
  const [volume, setVolume] = useState(50)

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value)
    setVolume(newVolume)
    sounds.setMasterVolume(newVolume / 100)
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
        <span className="mr-2">🔊</span>
        Lab Sounds
      </h3>
      
      {/* Master Volume */}
      <div className="mb-4">
        <label className="block text-sm text-gray-600 mb-2">
          Master Volume: {volume}%
        </label>
        <input
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={handleVolumeChange}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
      </div>
      
      {/* Sound Toggle */}
      <div className="mb-4">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={sounds.isSoundEnabled}
            onChange={sounds.toggleSounds}
            className="rounded border-gray-300"
          />
          <span className="text-sm text-gray-700">Enable Lab Sounds</span>
        </label>
      </div>
      
      {/* Sound Test Buttons */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Test Sounds:</h4>
        
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            onClick={sounds.playBubbling}
            className="px-2 py-1 bg-blue-100 hover:bg-blue-200 rounded text-blue-800 transition-colors"
          >
            🫧 Bubbling
          </button>
          
          <button
            onClick={sounds.playHeating}
            className="px-2 py-1 bg-red-100 hover:bg-red-200 rounded text-red-800 transition-colors"
          >
            🔥 Heating
          </button>
          
          <button
            onClick={sounds.playGlassClick}
            className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-800 transition-colors"
          >
            🧪 Glass
          </button>
          
          <button
            onClick={sounds.playSuccess}
            className="px-2 py-1 bg-green-100 hover:bg-green-200 rounded text-green-800 transition-colors"
          >
            ✅ Success
          </button>
          
          <button
            onClick={sounds.playWarning}
            className="px-2 py-1 bg-yellow-100 hover:bg-yellow-200 rounded text-yellow-800 transition-colors"
          >
            ⚠️ Warning
          </button>
          
          <button
            onClick={sounds.playTimer}
            className="px-2 py-1 bg-purple-100 hover:bg-purple-200 rounded text-purple-800 transition-colors"
          >
            ⏰ Timer
          </button>
        </div>
      </div>
    </div>
  )
}
