import Link from 'next/link'
import { SignedIn, SignedOut, SignInButton, SignUpButton } from '@clerk/nextjs'
import { Beaker, Zap, Users, Shield, ArrowRight, FlaskConical, Atom } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Navigation */}
      <nav className="flex justify-between items-center p-6 backdrop-blur-sm bg-white/80 border-b border-white/20">
        <div className="flex items-center space-x-2">
          <FlaskConical className="h-8 w-8 text-blue-600" />
          <span className="text-2xl font-bold text-gray-900">AI Chemistry Lab</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="px-4 py-2 text-blue-600 hover:text-blue-700 transition-colors">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Get Started
              </button>
            </SignUpButton>
          </SignedOut>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <Atom className="h-20 w-20 text-blue-600 animate-spin-slow" />
                <div className="absolute inset-0 bg-blue-400/20 rounded-full blur-xl"></div>
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              AI-Powered
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Virtual Chemistry Lab
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Conduct safe chemical experiments with AI-powered predictions, interactive lab equipment, 
              and real-time safety guidance. Perfect for students, educators, and chemistry enthusiasts.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <SignedOut>
                <SignUpButton mode="modal">
                  <button className="relative px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-lg font-semibold flex items-center justify-center space-x-3 smoke-effect group">
                    <div className="relative">
                      <FlaskConical className="h-7 w-7" />
                      <div className="smoke-particle-1"></div>
                      <div className="smoke-particle-2"></div>
                      <div className="smoke-particle-3"></div>
                      <div className="smoke-particle-4"></div>
                      <div className="smoke-particle-5"></div>
                      <div className="smoke-particle-6"></div>
                      <div className="smoke-particle-7"></div>
                      <div className="smoke-particle-8"></div>
                      <div className="smoke-particle-9"></div>
                      <div className="smoke-particle-10"></div>
                    </div>
                    <span>Start Experimenting</span>
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <Link 
                  href="/dashboard"
                  className="relative px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-lg font-semibold flex items-center justify-center space-x-3 smoke-effect group"
                >
                  <div className="relative">
                    <FlaskConical className="h-7 w-7" />
                    <div className="smoke-particle-1"></div>
                    <div className="smoke-particle-2"></div>
                    <div className="smoke-particle-3"></div>
                    <div className="smoke-particle-4"></div>
                    <div className="smoke-particle-5"></div>
                    <div className="smoke-particle-6"></div>
                    <div className="smoke-particle-7"></div>
                    <div className="smoke-particle-8"></div>
                    <div className="smoke-particle-9"></div>
                    <div className="smoke-particle-10"></div>
                  </div>
                  <span>Enter Lab</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </SignedIn>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our Virtual Lab?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience the future of chemistry education with cutting-edge AI and interactive simulations
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Zap className="h-8 w-8 text-yellow-500" />,
                title: "AI Predictions",
                description: "Get instant AI-powered predictions for chemical reactions, compound properties, and safety warnings"
              },
              {
                icon: <Shield className="h-8 w-8 text-green-500" />,
                title: "Safe Environment",
                description: "Experiment without physical risks. Perfect for dangerous reactions and rare chemicals"
              },
              {
                icon: <Users className="h-8 w-8 text-blue-500" />,
                title: "Educational Focus",
                description: "Designed for students and educators with guided experiments and learning resources"
              },
              {
                icon: <Beaker className="h-8 w-8 text-purple-500" />,
                title: "Interactive Lab",
                description: "Drag-and-drop interface with realistic lab equipment and visual reactions"
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:shadow-lg transition-all duration-300">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-center">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Lab Modes Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Choose Your Lab Experience
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Two distinct modes tailored for different learning objectives and skill levels
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-8 text-white relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center mb-4">
                  <Beaker className="h-8 w-8 mr-3" />
                  <h3 className="text-2xl font-bold">Play Mode</h3>
                </div>
                <p className="text-blue-100 mb-6">
                  Casual exploration and experimentation. Perfect for beginners to discover chemistry through interactive play.
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-blue-200 rounded-full mr-3"></div>
                    <span>Simple drag-and-drop interface</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-blue-200 rounded-full mr-3"></div>
                    <span>AI-powered reaction predictions</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-blue-200 rounded-full mr-3"></div>
                    <span>Visual chemical reactions</span>
                  </li>
                </ul>
                <SignedIn>
                  <Link 
                    href="/play"
                    className="inline-flex items-center px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-semibold"
                  >
                    Start Playing
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </SignedIn>
                <SignedOut>
                  <SignUpButton mode="modal">
                    <button className="inline-flex items-center px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-semibold">
                      Get Started
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </button>
                  </SignUpButton>
                </SignedOut>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-8 text-white relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center mb-4">
                  <FlaskConical className="h-8 w-8 mr-3" />
                  <h3 className="text-2xl font-bold">Practical Mode</h3>
                </div>
                <p className="text-purple-100 mb-6">
                  Advanced laboratory simulation with precise measurements, temperature control, and realistic experimental conditions.
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-purple-200 rounded-full mr-3"></div>
                    <span>Parameter controls (temp, pressure, volume)</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-purple-200 rounded-full mr-3"></div>
                    <span>Precise measurement tools</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-purple-200 rounded-full mr-3"></div>
                    <span>Advanced safety protocols</span>
                  </li>
                </ul>
                <SignedIn>
                  <Link 
                    href="/practical"
                    className="inline-flex items-center px-6 py-3 bg-white text-purple-600 rounded-lg hover:bg-purple-50 transition-colors font-semibold"
                  >
                    Enter Lab
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </SignedIn>
                <SignedOut>
                  <SignUpButton mode="modal">
                    <button className="inline-flex items-center px-6 py-3 bg-white text-purple-600 rounded-lg hover:bg-purple-50 transition-colors font-semibold">
                      Get Started
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </button>
                  </SignUpButton>
                </SignedOut>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 md:p-12 text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Start Your Chemistry Journey?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of students and educators exploring chemistry in a safe, interactive virtual environment.
            </p>
            <SignedOut>
              <SignUpButton mode="modal">
                <button className="px-8 py-4 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-colors text-lg font-semibold flex items-center justify-center space-x-2 mx-auto">
                  <Beaker className="h-5 w-5" />
                  <span>Create Free Account</span>
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Link 
                href="/dashboard"
                className="inline-flex items-center px-8 py-4 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-colors text-lg font-semibold space-x-2"
              >
                <Beaker className="h-5 w-5" />
                <span>Enter Your Lab</span>
              </Link>
            </SignedIn>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <FlaskConical className="h-6 w-6 text-blue-400" />
              <span className="text-xl font-bold">AI Chemistry Lab</span>
            </div>
            <p className="text-gray-400 text-center md:text-right">
              © 2025 AI Chemistry Lab. Making chemistry education accessible and safe.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}