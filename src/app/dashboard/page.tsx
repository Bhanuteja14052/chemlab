'use client'

import { useState, useEffect } from 'react'
import { UserButton, useUser } from '@clerk/nextjs'
import { motion } from 'framer-motion'
import { FlaskConical, Beaker, Atom, History, BookOpen, Settings } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const { user } = useUser()
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

  return (
    <div className={`min-h-screen ${
      isDarkTheme 
        ? 'bg-gradient-to-br from-slate-900 to-slate-800' 
        : 'bg-gradient-to-br from-blue-50 to-indigo-100'
    }`}>
      {/* Navigation */}
      <nav className={`backdrop-blur-md border-b ${
        isDarkTheme 
          ? 'bg-slate-900/80 border-slate-700' 
          : 'bg-white/80 border-blue-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <FlaskConical className="h-8 w-8 text-blue-600" />
              <span className={`text-xl font-bold ${
                isDarkTheme ? 'text-white' : 'text-black'
              }`}>AI Chemistry Lab</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className={isDarkTheme ? 'text-slate-300' : 'text-black'}>Welcome, {user?.firstName || 'Scientist'}!</span>
              <UserButton />
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className={`text-4xl md:text-5xl font-bold mb-4 ${
            isDarkTheme ? 'text-white' : 'text-black'
          }`}>
            Welcome to Your Lab
          </h1>
          <p className={`text-xl max-w-3xl mx-auto ${
            isDarkTheme ? 'text-slate-300' : 'text-black'
          }`}>
            Choose your experimentation mode and start exploring the fascinating world of chemistry
          </p>
        </motion.div>

        {/* Mode Selection */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Link href="/play" className="block group">
              <div className="bg-gradient-to-br from-green-100 to-emerald-100 p-8 rounded-2xl shadow-lg border border-green-200 hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <div className="bg-green-600 w-20 h-20 rounded-xl flex items-center justify-center mb-6 group-hover:bg-green-700 transition-colors">
                  <Beaker className="h-10 w-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">🎮 Play Mode</h2>
                <p className="text-gray-700 mb-6">
                  Freely explore chemistry by combining elements and compounds. 
                  Get AI-powered predictions without complex parameters.
                </p>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    Drag & drop elements
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    AI reaction predictions
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    Visual color changes
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    Safe experimentation
                  </li>
                </ul>
                <div className="mt-6 text-green-600 font-semibold group-hover:text-green-700">
                  Start Playing →
                </div>
              </div>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Link href="/practical" className="block group">
              <div className="bg-gradient-to-br from-purple-100 to-indigo-100 p-8 rounded-2xl shadow-lg border border-purple-200 hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <div className="bg-purple-600 w-20 h-20 rounded-xl flex items-center justify-center mb-6 group-hover:bg-purple-700 transition-colors">
                  <Atom className="h-10 w-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">🧑‍🔬 Practical Mode</h2>
                <p className="text-gray-700 mb-6">
                  Conduct realistic experiments with precise lab parameters. 
                  Control temperature, pressure, and volume for accurate results.
                </p>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                    Temperature controls
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                    Pressure & volume settings
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                    Scientific accuracy
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                    Detailed analysis
                  </li>
                </ul>
                <div className="mt-6 text-purple-600 font-semibold group-hover:text-purple-700">
                  Start Experimenting →
                </div>
              </div>
            </Link>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="grid md:grid-cols-3 gap-6"
        >
          <Link href="/history" className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-blue-100 hover:shadow-xl transition-all group">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <History className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Experiment History</h3>
                <p className="text-gray-600">View your saved experiments</p>
              </div>
            </div>
          </Link>

          <Link href="/tutorials" className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-blue-100 hover:shadow-xl transition-all group">
            <div className="flex items-center space-x-4">
              <div className="bg-orange-100 w-12 h-12 rounded-lg flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                <BookOpen className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Tutorials</h3>
                <p className="text-gray-600">Learn chemistry concepts</p>
              </div>
            </div>
          </Link>

          <Link href="/settings" className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-blue-100 hover:shadow-xl transition-all group">
            <div className="flex items-center space-x-4">
              <div className="bg-gray-100 w-12 h-12 rounded-lg flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                <Settings className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Settings</h3>
                <p className="text-gray-600">Customize your experience</p>
              </div>
            </div>
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
