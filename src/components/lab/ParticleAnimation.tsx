'use client'

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

interface Particle {
  id: string
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
  color: string
  type: 'bubble' | 'steam' | 'spark' | 'smoke' | 'collision'
}

interface ParticleSystemProps {
  isActive: boolean
  type: 'reaction' | 'heating' | 'bubbling' | 'collision' | 'crystallization'
  intensity?: number
  width?: number
  height?: number
  className?: string
}

interface ParticleAnimationProps {
  elements: string[]
  temperature: number
  isReacting: boolean
  reactionType?: 'endothermic' | 'exothermic' | 'neutral'
  className?: string
}

// Particle behavior configurations
const PARTICLE_CONFIGS = {
  reaction: {
    count: 20,
    colors: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'],
    size: { min: 2, max: 6 },
    speed: { min: 0.5, max: 2 },
    life: { min: 60, max: 120 }
  },
  heating: {
    count: 15,
    colors: ['#ff6b6b', '#ff8e53', '#ff6348', '#e17055'],
    size: { min: 1, max: 4 },
    speed: { min: 0.3, max: 1.5 },
    life: { min: 40, max: 80 }
  },
  bubbling: {
    count: 10,
    colors: ['rgba(255,255,255,0.8)', 'rgba(173,216,230,0.7)', 'rgba(135,206,250,0.6)'],
    size: { min: 3, max: 8 },
    speed: { min: 0.5, max: 1.2 },
    life: { min: 80, max: 150 }
  },
  collision: {
    count: 30,
    colors: ['#ffd93d', '#ff6b35', '#f7931e', '#ffb84d'],
    size: { min: 1, max: 5 },
    speed: { min: 1, max: 4 },
    life: { min: 20, max: 60 }
  },
  crystallization: {
    count: 8,
    colors: ['#a8e6cf', '#dcedc1', '#b8b8ff', '#c7ceea'],
    size: { min: 2, max: 7 },
    speed: { min: 0.1, max: 0.8 },
    life: { min: 100, max: 200 }
  }
}

class ParticleEngine {
  private particles: Particle[] = []
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private animationFrame: number | null = null
  private isRunning = false

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Unable to get 2D context')
    this.ctx = context
  }

  private createParticle(type: keyof typeof PARTICLE_CONFIGS, x?: number, y?: number): Particle {
    const config = PARTICLE_CONFIGS[type]
    const centerX = x ?? this.canvas.width / 2
    const centerY = y ?? this.canvas.height / 2
    
    const angle = Math.random() * Math.PI * 2
    const speed = config.speed.min + Math.random() * (config.speed.max - config.speed.min)
    const life = config.life.min + Math.random() * (config.life.max - config.life.min)
    
    return {
      id: Math.random().toString(36).substr(2, 9),
      x: centerX + (Math.random() - 0.5) * 40,
      y: centerY + (Math.random() - 0.5) * 40,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - (type === 'bubbling' ? Math.random() * 2 : 0),
      life,
      maxLife: life,
      size: config.size.min + Math.random() * (config.size.max - config.size.min),
      color: config.colors[Math.floor(Math.random() * config.colors.length)],
      type: type === 'bubbling' ? 'bubble' : type === 'heating' ? 'steam' : 'spark'
    }
  }

  private updateParticle(particle: Particle): boolean {
    // Update position
    particle.x += particle.vx
    particle.y += particle.vy
    
    // Apply gravity for bubbles
    if (particle.type === 'bubble') {
      particle.vy -= 0.05 // Bubbles rise
      particle.vx *= 0.99 // Air resistance
    } else if (particle.type === 'steam') {
      particle.vy -= 0.03 // Steam rises
      particle.vx *= 0.98
    } else {
      particle.vy += 0.02 // Gravity for other particles
      particle.vx *= 0.95 // Friction
    }
    
    // Update life
    particle.life--
    
    // Remove particles that are out of bounds or dead
    return particle.life > 0 && 
           particle.x > -50 && particle.x < this.canvas.width + 50 &&
           particle.y > -50 && particle.y < this.canvas.height + 50
  }

  private renderParticle(particle: Particle) {
    const alpha = particle.life / particle.maxLife
    const size = particle.size * alpha
    
    this.ctx.save()
    this.ctx.globalAlpha = alpha
    
    if (particle.type === 'bubble') {
      // Draw bubble with gradient
      const gradient = this.ctx.createRadialGradient(
        particle.x, particle.y, 0,
        particle.x, particle.y, size
      )
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)')
      gradient.addColorStop(0.7, particle.color)
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0.1)')
      
      this.ctx.fillStyle = gradient
      this.ctx.beginPath()
      this.ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2)
      this.ctx.fill()
      
      // Add bubble highlight
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
      this.ctx.beginPath()
      this.ctx.arc(particle.x - size * 0.3, particle.y - size * 0.3, size * 0.3, 0, Math.PI * 2)
      this.ctx.fill()
    } else if (particle.type === 'steam') {
      // Draw steam wispy effect
      this.ctx.fillStyle = particle.color
      this.ctx.beginPath()
      this.ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2)
      this.ctx.fill()
      
      // Add blur effect
      this.ctx.filter = 'blur(1px)'
      this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.3})`
      this.ctx.beginPath()
      this.ctx.arc(particle.x, particle.y, size * 1.5, 0, Math.PI * 2)
      this.ctx.fill()
      this.ctx.filter = 'none'
    } else {
      // Draw spark/regular particle
      this.ctx.fillStyle = particle.color
      this.ctx.beginPath()
      this.ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2)
      this.ctx.fill()
      
      // Add glow effect for sparks
      if (particle.type === 'spark') {
        this.ctx.shadowColor = particle.color
        this.ctx.shadowBlur = size * 2
        this.ctx.fillStyle = particle.color
        this.ctx.beginPath()
        this.ctx.arc(particle.x, particle.y, size * 0.5, 0, Math.PI * 2)
        this.ctx.fill()
        this.ctx.shadowBlur = 0
      }
    }
    
    this.ctx.restore()
  }

  private animate = () => {
    if (!this.isRunning) return
    
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    
    // Update and render particles
    this.particles = this.particles.filter(particle => {
      const isAlive = this.updateParticle(particle)
      if (isAlive) {
        this.renderParticle(particle)
      }
      return isAlive
    })
    
    this.animationFrame = requestAnimationFrame(this.animate)
  }

  start(type: keyof typeof PARTICLE_CONFIGS, intensity = 1) {
    this.isRunning = true
    
    // Create initial particles
    const config = PARTICLE_CONFIGS[type]
    const count = Math.floor(config.count * intensity)
    
    for (let i = 0; i < count; i++) {
      this.particles.push(this.createParticle(type))
    }
    
    // Start animation loop
    this.animate()
    
    // Continue spawning particles for ongoing effects
    if (type === 'bubbling' || type === 'heating') {
      const spawnInterval = setInterval(() => {
        if (!this.isRunning) {
          clearInterval(spawnInterval)
          return
        }
        
        // Spawn new particles occasionally
        if (Math.random() < 0.3) {
          this.particles.push(this.createParticle(type))
        }
      }, 200)
    }
  }

  stop() {
    this.isRunning = false
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame)
      this.animationFrame = null
    }
  }

  burst(type: keyof typeof PARTICLE_CONFIGS, x?: number, y?: number) {
    const config = PARTICLE_CONFIGS[type]
    const count = config.count
    
    for (let i = 0; i < count; i++) {
      this.particles.push(this.createParticle(type, x, y))
    }
  }

  resize(width: number, height: number) {
    this.canvas.width = width
    this.canvas.height = height
  }
}

// Basic particle system component
export function ParticleSystem({ 
  isActive, 
  type, 
  intensity = 1, 
  width = 300, 
  height = 200, 
  className = '' 
}: ParticleSystemProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<ParticleEngine | null>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    canvas.width = width
    canvas.height = height

    engineRef.current = new ParticleEngine(canvas)

    return () => {
      engineRef.current?.stop()
    }
  }, [width, height])

  useEffect(() => {
    if (!engineRef.current) return

    if (isActive) {
      engineRef.current.start(type, intensity)
    } else {
      engineRef.current.stop()
    }

    return () => {
      engineRef.current?.stop()
    }
  }, [isActive, type, intensity])

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none ${className}`}
      style={{ width, height }}
    />
  )
}

// Advanced particle animation component for chemical reactions
export default function ParticleAnimation({ 
  elements, 
  temperature, 
  isReacting, 
  reactionType = 'neutral',
  className = '' 
}: ParticleAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<ParticleEngine | null>(null)
  const [dimensions, setDimensions] = useState({ width: 400, height: 300 })

  // Determine particle effects based on conditions
  const getParticleType = (): keyof typeof PARTICLE_CONFIGS => {
    if (isReacting) {
      if (reactionType === 'exothermic') return 'heating'
      if (reactionType === 'endothermic') return 'crystallization'
      return 'reaction'
    }
    
    if (temperature > 60) return 'heating'
    if (temperature > 30) return 'bubbling'
    
    return 'crystallization'
  }

  const getIntensity = (): number => {
    let intensity = 0.5
    
    if (isReacting) intensity += 0.5
    if (temperature > 50) intensity += (temperature - 50) / 100
    if (elements.length > 2) intensity += elements.length * 0.1
    
    return Math.min(intensity, 2)
  }

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const updateDimensions = () => {
      const rect = canvas.getBoundingClientRect()
      setDimensions({ width: rect.width || 400, height: rect.height || 300 })
    }

    updateDimensions()
    engineRef.current = new ParticleEngine(canvas)

    window.addEventListener('resize', updateDimensions)
    return () => {
      engineRef.current?.stop()
      window.removeEventListener('resize', updateDimensions)
    }
  }, [])

  useEffect(() => {
    if (!engineRef.current) return

    engineRef.current.resize(dimensions.width, dimensions.height)
    
    const particleType = getParticleType()
    const intensity = getIntensity()
    
    if (isReacting || temperature > 25) {
      engineRef.current.start(particleType, intensity)
    } else {
      engineRef.current.stop()
    }

    return () => {
      engineRef.current?.stop()
    }
  }, [elements, temperature, isReacting, reactionType, dimensions])

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none w-full h-full"
        width={dimensions.width}
        height={dimensions.height}
      />
      
      {/* Overlay effects */}
      {isReacting && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.1 }}
          style={{
            background: reactionType === 'exothermic' 
              ? 'radial-gradient(circle, rgba(255,107,107,0.2) 0%, transparent 70%)'
              : reactionType === 'endothermic'
              ? 'radial-gradient(circle, rgba(116,185,255,0.2) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)'
          }}
        />
      )}
      
      {/* Temperature heat shimmer effect */}
      {temperature > 80 && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{
            background: [
              'linear-gradient(45deg, transparent 0%, rgba(255,107,107,0.05) 50%, transparent 100%)',
              'linear-gradient(55deg, transparent 0%, rgba(255,107,107,0.1) 50%, transparent 100%)',
              'linear-gradient(35deg, transparent 0%, rgba(255,107,107,0.05) 50%, transparent 100%)'
            ]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
    </div>
  )
}
