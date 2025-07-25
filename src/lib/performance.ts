// Performance optimization utilities for Myche Lab
export const performanceOptimizations = {
  // Debounce function for API calls
  debounce: <T extends (...args: any[]) => void>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout
    return (...args: Parameters<T>) => {
      clearTimeout(timeout)
      timeout = setTimeout(() => func(...args), wait)
    }
  },

  // Throttle function for performance-critical operations
  throttle: <T extends (...args: any[]) => void>(
    func: T,
    limit: number
  ): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args)
        inThrottle = true
        setTimeout(() => (inThrottle = false), limit)
      }
    }
  },

  // Memoization for expensive calculations
  memoize: <T extends (...args: any[]) => any>(fn: T): T => {
    const cache = new Map()
    return ((...args: Parameters<T>): ReturnType<T> => {
      const key = JSON.stringify(args)
      if (cache.has(key)) {
        return cache.get(key)
      }
      const result = fn(...args)
      cache.set(key, result)
      return result
    }) as T
  },

  // Animation performance optimization
  optimizeAnimation: {
    // Reduced motion preferences
    respectReducedMotion: () => {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches
    },

    // Get optimal animation duration based on device performance
    getOptimalDuration: (baseDuration: number): number => {
      // Use performance API to detect slow devices
      const connection = (navigator as any).connection
      if (connection && connection.effectiveType) {
        const effectiveType = connection.effectiveType
        if (effectiveType === 'slow-2g' || effectiveType === '2g') {
          return baseDuration * 1.5 // Slower animations for slow connections
        }
        if (effectiveType === '3g') {
          return baseDuration * 1.2
        }
      }
      return baseDuration
    },

    // Smooth animation easing for better UX
    easings: {
      smooth: [0.25, 0.1, 0.25, 1],
      bouncy: [0.68, -0.55, 0.265, 1.55],
      gentle: [0.4, 0, 0.2, 1],
    }
  },

  // Memory management for large datasets
  memoryManagement: {
    // Clean up unused objects
    cleanup: (objectsToClean: any[]) => {
      objectsToClean.forEach(obj => {
        if (obj && typeof obj === 'object') {
          Object.keys(obj).forEach(key => {
            obj[key] = null
          })
        }
      })
    },

    // Batch operations for better performance
    batchOperation: <T>(
      items: T[],
      operation: (item: T) => void,
      batchSize: number = 10
    ): Promise<void> => {
      return new Promise((resolve) => {
        let index = 0
        
        const processBatch = () => {
          const endIndex = Math.min(index + batchSize, items.length)
          
          for (let i = index; i < endIndex; i++) {
            operation(items[i])
          }
          
          index = endIndex
          
          if (index < items.length) {
            // Use requestIdleCallback if available, otherwise setTimeout
            if (window.requestIdleCallback) {
              window.requestIdleCallback(processBatch)
            } else {
              setTimeout(processBatch, 0)
            }
          } else {
            resolve()
          }
        }
        
        processBatch()
      })
    }
  },

  // Loading state management
  loadingStates: {
    // Minimum loading time to prevent flickering
    withMinimumDuration: async <T>(
      promise: Promise<T>,
      minimumMs: number = 500
    ): Promise<T> => {
      const [result] = await Promise.all([
        promise,
        new Promise(resolve => setTimeout(resolve, minimumMs))
      ])
      return result
    },

    // Progressive loading for better perceived performance
    progressiveLoad: async (
      stages: Array<() => Promise<any>>,
      onProgress?: (stage: number, total: number) => void
    ): Promise<any[]> => {
      const results: any[] = []
      
      for (let i = 0; i < stages.length; i++) {
        const result = await stages[i]()
        results.push(result)
        
        if (onProgress) {
          onProgress(i + 1, stages.length)
        }
      }
      
      return results
    }
  }
}

// Export individual utilities for convenience
export const { debounce, throttle, memoize } = performanceOptimizations
export const { optimizeAnimation, memoryManagement, loadingStates } = performanceOptimizations

export default performanceOptimizations
