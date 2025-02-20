'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Sora } from 'next/font/google'
import Link from 'next/link'

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

  const buttonVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
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
    <section className={`relative min-h-screen w-full overflow-hidden ${sora.className}`}>
      {/* Background Design Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50" />
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl animate-blob" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000" />
      </div>

      <div className="relative max-w-screen-xl mx-auto px-4 sm:px-8 pb-16 h-full">
        <div className="flex flex-col lg:flex-row min-h-screen pt-16 md:pt-24 lg:pt-20">
          {/* Left Column: Hero Text, Description & Button */}
          <div className="lg:w-1/3 flex flex-col justify-center items-center text-center lg:items-start lg:text-left mt-16 sm:mt-24 md:mt-32 lg:mt-0">
            <motion.h1
              className="font-bold text-gray-900 mb-6 text-3xl sm:text-4xl md:text-5xl"
              initial="hidden"
              animate={isLoaded ? 'visible' : 'hidden'}
              custom={0}
              variants={textVariants}
            >
              Your Hero Text
            </motion.h1>
            <motion.p
              className="text-gray-700 mb-8 max-w-xs sm:max-w-sm mx-auto lg:mx-0 text-base sm:text-lg md:text-xl"
              initial="hidden"
              animate={isLoaded ? 'visible' : 'hidden'}
              custom={1}
              variants={textVariants}
            >
              This is a short description about your product or service.
            </motion.p>
            <motion.div
              initial="hidden"
              animate={isLoaded ? 'visible' : 'hidden'}
              variants={buttonVariants}
            >
              <Link href="/product/67b6f90829e091cfe70668a7/">
                <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-base sm:text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                  Get Started
                </button>
              </Link>
            </motion.div>
          </div>
          
          {/* Right Column: Video Placeholder */}
          <div className="lg:w-2/3 flex items-center justify-center lg:justify-end mt-16 sm:mt-24 lg:mt-0">
            <motion.div
              className="w-full bg-white/80 backdrop-blur-sm rounded-2xl aspect-video flex items-center justify-center shadow-2xl"
              style={{ minWidth: '300px', maxWidth: '650px' }}
              initial="hidden"
              animate={isLoaded ? 'visible' : 'hidden'}
              variants={videoVariants}
            >
              <span className="text-gray-600 text-base sm:text-lg">Video Placeholder</span>
            </motion.div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </section>
  )
}