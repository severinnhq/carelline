'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Sora } from 'next/font/google'

const sora = Sora({ subsets: ['latin'] })

export default function HeroSection() {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

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

  const videoVariants = {
    hidden: { opacity: 0, scale: 1.1, rotate: -3 },
    visible: {
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: {
        duration: 0.6,
        delay: 0.5,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  }

  return (
    <section className={`relative min-h-screen w-full bg-white ${sora.className}`}>
      <div className="max-w-screen-xl mx-auto px-4 sm:px-8 pb-16 h-full">
        <div className="flex flex-col lg:flex-row min-h-screen pt-16 md:pt-24 lg:pt-20">
          {/* Left Column: Hero Text, Description & Button */}
          <div className="lg:w-1/3 flex flex-col justify-center items-center text-center lg:items-start lg:text-left mt-16 sm:mt-24 md:mt-32 lg:mt-0">
            <motion.h1
              className="font-bold text-black mb-6 text-3xl sm:text-4xl md:text-5xl"
              initial="hidden"
              animate={isLoaded ? 'visible' : 'hidden'}
              custom={0}
              variants={textVariants}
            >
              Your Hero Text
            </motion.h1>
            <motion.p
              className="text-black mb-8 max-w-xs sm:max-w-sm mx-auto lg:mx-0 text-base sm:text-lg md:text-xl"
              initial="hidden"
              animate={isLoaded ? 'visible' : 'hidden'}
              custom={1}
              variants={textVariants}
            >
              This is a short description about your product or service.
            </motion.p>
            <motion.button
              className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-base sm:text-lg"
              initial="hidden"
              animate={isLoaded ? 'visible' : 'hidden'}
              custom={2}
              variants={textVariants}
            >
              Get Started
            </motion.button>
          </div>
          {/* Right Column: Video Placeholder */}
          <div className="lg:w-2/3 flex items-center justify-center lg:justify-end mt-16 sm:mt-24 lg:mt-0">
            <motion.div
              className="w-full bg-gray-300 rounded-lg aspect-video flex items-center justify-center"
              style={{ minWidth: '300px', maxWidth: '650px' }}
              initial="hidden"
              animate={isLoaded ? 'visible' : 'hidden'}
              variants={videoVariants}
            >
              <span className="text-black text-base sm:text-lg">Video Placeholder</span>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}