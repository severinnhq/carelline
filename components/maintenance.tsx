'use client'
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Sora } from 'next/font/google'
import Image from 'next/image'

const sora = Sora({ subsets: ['latin'] })

interface MaintenanceProps {
  isMaintenanceMode?: boolean;
  onToggleMode?: () => void;
  adminControls?: boolean;
}

export default function Maintenance({ 
  isMaintenanceMode = false
}: MaintenanceProps) {
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isLoaded, setIsLoaded] = useState(false)

  // Set loaded state once component mounts
  useEffect(() => {
    setIsLoaded(true)
    
    // Disable scrolling when in maintenance mode
    if (isMaintenanceMode && typeof window !== 'undefined') {
      document.body.style.overflow = 'hidden'
      
      // Cleanup function
      return () => {
        document.body.style.overflow = 'auto'
      }
    }
  }, [isMaintenanceMode])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Kérjük, adjon meg egy érvényes email címet.')
      setIsLoading(false)
      return
    }

    try {
      // Send email to our API endpoint
      const response = await fetch('/api/maintenance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      
      if (response.ok) {
        setIsSubmitted(true);
      } else {
        setError(data.error || 'Hiba történt a küldés során. Kérjük, próbálja újra később.');
      }
    } catch {
      setError('Hiba történt a küldés során. Kérjük, próbálja újra később.');
    } finally {
      setIsLoading(false);
    }
  }

  const textVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay: 0.2 + i * 0.1,
        ease: [0.25, 0.1, 0.25, 1],
      },
    }),
  }

  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay: 0.6,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  }

  // If we're not in maintenance mode, don't render anything
  if (!isMaintenanceMode) return null;

  return (
    <section 
      className={`fixed inset-0 z-50 flex items-center min-h-screen w-full ${sora.className}`}
      style={{ overflow: 'hidden' }}
    >
      {/* Base Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-red-100" />

      {/* Curved Background Layers */}
      <div className="absolute inset-0" aria-hidden="true">
        <svg className="w-full h-full" viewBox="0 0 1440 800" preserveAspectRatio="xMidYMid slice">
          <path
            fill="rgba(255,240,240,1)"
            fillRule="evenodd"
            d="M0,0 C320,100 420,300 1440,400 L1440,800 L0,800 Z"
          />
        </svg>
      </div>
      <div className="absolute inset-0" aria-hidden="true">
        <svg className="w-full h-full" viewBox="0 0 1440 800" preserveAspectRatio="xMidYMid slice">
          <path
            fill="rgba(255,230,230,1)"
            fillRule="evenodd"
            d="M1440,0 C1120,200 1020,400 0,300 L0,800 L1440,800 Z"
          />
        </svg>
      </div>
      <div className="absolute inset-0" aria-hidden="true">
        <svg className="w-full h-full" viewBox="0 0 1440 800" preserveAspectRatio="xMidYMid slice">
          <path
            fill="rgba(255,245,245,1)"
            fillRule="evenodd"
            d="M0,600 C480,700 960,500 1440,600 L1440,800 L0,800 Z"
          />
        </svg>
      </div>

      {/* Main Content */}
      <div className="relative max-w-screen-xl mx-auto px-4 sm:px-8 py-20 sm:py-24 md:py-28 flex flex-col items-center justify-center w-full">
        <div className="w-full max-w-md z-10 flex flex-col items-center text-center">
          {/* Logo */}
          <motion.div
            className="mb-8"    
            initial={{ opacity: 0, y: -20 }}
            animate={isLoaded ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
            transition={{ duration: 0.6 }}
          >
            <Image
              src="/transparentlogo.png" // Replace with your actual logo path
              alt="Website Logo"
              width={140}
              height={50}
              className="h-20 w-auto"
            />
          </motion.div>

          {/* Header - No icon now */}
          <motion.h1
            className="font-black text-black mb-6 text-3xl sm:text-4xl leading-tight tracking-tight"
            initial="hidden"
            animate={isLoaded ? 'visible' : 'hidden'}
            custom={0}
            variants={textVariants}
          >
            <span className="block">Karbantartás alatt</span>
            <span className="text-red-600 block">Hamarosan visszatérünk!</span>
          </motion.h1>

          {/* Email Form */}
          <motion.div
            className="w-full max-w-md"
            initial="hidden"
            animate={isLoaded ? 'visible' : 'hidden'}
            variants={formVariants}
          >
            {!isSubmitted ? (
              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <h2 className="text-lg font-semibold mb-4 text-gray-800">Értesítjük, amint újra elérhetőek vagyunk!</h2>
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <input
                      type="email"
                      id="email"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="pelda@email.hu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-red-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-red-700 transition duration-300 flex items-center justify-center"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : null}
                    {isLoading ? 'Küldés...' : 'Értesítsenek'}
                  </button>
                </form>
              </div>
            ) : (
              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold mb-2 text-gray-800">Köszönjük!</h2>
                <p className="text-gray-600">Értesíteni fogjuk, amikor weboldalunk újra elérhető lesz.</p>
              </div>
            )}
          </motion.div>

          {/* Footer */}
          <motion.p
            className="mt-8 text-sm text-gray-500"
            initial={{ opacity: 0 }}
            animate={isLoaded ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            Kérdése van? Írjon nekünk az <a href="mailto:carelline@outlook.com" className="text-red-600 hover:underline">carelline@outlook.com</a> címre.
          </motion.p>
        </div>
      </div>
    </section>
  )
}