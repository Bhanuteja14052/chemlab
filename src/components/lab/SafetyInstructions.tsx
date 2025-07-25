'use client'

import { useState } from 'react'
import { AlertTriangle, Shield, Eye, Droplets, Flame, X } from 'lucide-react'

const SafetyInstructions = () => {
  const [currentSection, setCurrentSection] = useState(0)

  const safetyInstructions = [
    {
      title: "Personal Protective Equipment (PPE)",
      icon: Shield,
      content: [
        "Always wear safety goggles when handling any chemicals",
        "Use gloves when working with corrosive or toxic substances",
        "Wear closed-toe shoes and long pants in the laboratory",
        "Keep a lab coat or apron on at all times during experiments",
        "Tie back long hair and avoid loose clothing"
      ]
    },
    {
      title: "Chemical Handling",
      icon: Droplets,
      content: [
        "Read all chemical labels and safety data sheets before use",
        "Never mix chemicals unless specifically instructed",
        "Add acid to water, never water to acid",
        "Use the minimum amount of chemicals necessary",
        "Store chemicals in their designated locations"
      ]
    },
    {
      title: "Fire Safety",
      icon: Flame,
      content: [
        "Know the location of fire extinguishers and safety showers",
        "Keep flammable materials away from heat sources",
        "Never leave heating equipment unattended",
        "In case of fire, evacuate immediately and notify authorities",
        "Use a fire blanket for small fires involving clothing"
      ]
    },
    {
      title: "Emergency Procedures",
      icon: AlertTriangle,
      content: [
        "Know the location of first aid kits and emergency exits",
        "Report all accidents and injuries immediately",
        "In case of chemical spills, contain and clean up properly",
        "Use eyewash stations for 15 minutes if chemicals contact eyes",
        "Never work alone in the laboratory"
      ]
    }
  ]

  return (
    <div className="bg-white rounded-lg p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Shield className="h-8 w-8 text-red-600" />
        <div>
          <h2 className="text-lg font-bold text-black">Laboratory Safety Instructions</h2>
          <p className="text-gray-600 text-sm">Essential guidelines for safe laboratory practices</p>
        </div>
      </div>

      {/* Section Navigation */}
      <div className="flex space-x-1 mb-4 overflow-x-auto">
        {safetyInstructions.map((section, index) => (
          <button
            key={index}
            onClick={() => setCurrentSection(index)}
            className={`flex items-center space-x-1 px-3 py-1 rounded-md whitespace-nowrap transition-colors text-xs ${
              currentSection === index
                ? 'bg-red-100 text-red-800 border border-red-300'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <section.icon className="h-3 w-3" />
            <span className="font-medium">{section.title}</span>
          </button>
        ))}
      </div>

      {/* Current Section Content */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-3">
          {(() => {
            const Icon = safetyInstructions[currentSection].icon
            return <Icon className="h-5 w-5 text-red-600" />
          })()}
          <h3 className="text-base font-semibold text-black">
            {safetyInstructions[currentSection].title}
          </h3>
        </div>

        <div className="space-y-2">
          {safetyInstructions[currentSection].content.map((instruction, index) => (
            <div key={index} className="flex items-start space-x-2">
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0" />
              <p className="text-gray-800 text-sm leading-relaxed">{instruction}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-4">
        <button
          onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
          disabled={currentSection === 0}
          className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
        >
          Previous
        </button>
        
        <span className="flex items-center space-x-2 text-xs text-gray-600">
          <span>{currentSection + 1} of {safetyInstructions.length}</span>
        </span>
        
        <button
          onClick={() => setCurrentSection(Math.min(safetyInstructions.length - 1, currentSection + 1))}
          disabled={currentSection === safetyInstructions.length - 1}
          className="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
        >
          Next
        </button>
      </div>

      {/* Quick Reference Card */}
      <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <div className="flex items-center space-x-2 mb-1">
          <Eye className="h-4 w-4 text-yellow-600" />
          <h4 className="font-semibold text-black text-sm">Quick Safety Reminder</h4>
        </div>
        <p className="text-xs text-gray-700">
          When in doubt, ask for help. Safety is everyone's responsibility in the laboratory.
          Always prioritize safety over speed or convenience.
        </p>
      </div>
    </div>
  )
}

export default SafetyInstructions
