'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Sora } from 'next/font/google'
import Link from 'next/link'

const sora = Sora({ subsets: ['latin'] })

export default function HeroSection() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isVideoLoaded, setIsVideoLoaded] = useState(false)

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
    hidden: { opacity: 0, scale: 1.05 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        delay: 0.5,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  }

  return (
    <section
      className={`relative h-screen w-full overflow-hidden bg-white ${sora.className}`}
    >
      {/* Base Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-red-60" />

      {/* Curved Background Layers – maintain aspect ratio with slice */}
      <div className="absolute inset-0" aria-hidden="true">
        <svg
          className="w-full h-full"
          viewBox="0 0 1440 800"
          preserveAspectRatio="xMidYMid slice"
        >
          <path
            fill="rgba(255,240,240,1)"
            fillRule="evenodd"
            d="M0,0 C320,100 420,300 1440,400 L1440,800 L0,800 Z"
          />
        </svg>
      </div>
      <div className="absolute inset-0" aria-hidden="true">
        <svg
          className="w-full h-full"
          viewBox="0 0 1440 800"
          preserveAspectRatio="xMidYMid slice"
        >
          <path
            fill="rgba(255,230,230,1)"
            fillRule="evenodd"
            d="M1440,0 C1120,200 1020,400 0,300 L0,800 L1440,800 Z"
          />
        </svg>
      </div>
      <div className="absolute inset-0" aria-hidden="true">
        <svg
          className="w-full h-full"
          viewBox="0 0 1440 800"
          preserveAspectRatio="xMidYMid slice"
        >
          <path
            fill="rgba(255,245,245,1)"
            fillRule="evenodd"
            d="M0,600 C480,700 960,500 1440,600 L1440,800 L0,800 Z"
          />
        </svg>
      </div>

      {/* Main Content */}
      <div className="relative max-w-screen-xl mx-auto px-4 sm:px-8 py-16 h-full flex flex-col items-center justify-center mt-12 md:mt-0">
        {/* Added gap-16 (64px) and lg:gap-32 (128px) for even bigger spacing */}
        <div className="flex flex-col lg:flex-row items-center text-center lg:text-left gap-16 lg:gap-32 w-full">
          {/* Left Column: Text & Button - increased width and made fully fluid */}
          <div className="w-full lg:w-2/5 z-10 flex-shrink-0">
            <motion.h1
              className="font-bold mb-6 text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight text-gray-800"
              initial="hidden"
              animate={isLoaded ? 'visible' : 'hidden'}
              custom={0}
              variants={textVariants}
            >
              Ready
              <span className="text-[#dc2626]">Before</span>
              <br />
              You Need to Be
              <br />
        
            </motion.h1>
            <motion.p
              className="mb-8 text-gray-600 text-base sm:text-lg w-full max-w-xl"
              initial="hidden"
              animate={isLoaded ? 'visible' : 'hidden'}
              custom={1}
              variants={textVariants}
            >
              Connect ambiguous, siloed data into the most trusted, reusable resource for your organization.
            </motion.p>
            <motion.div
              initial="hidden"
              animate={isLoaded ? 'visible' : 'hidden'}
              variants={buttonVariants}
            >
              <Link href="/book-demo">
                <button className="px-6 py-3 bg-[#dc2626] text-white font-medium rounded-md hover:bg-red-700 transition shadow-lg hover:shadow-2xl transform hover:-translate-y-0.5">
                  Schedule a Demo
                </button>
              </Link>
            </motion.div>
          </div>

          {/* Right Column: Video Dashboard */}
          <div className="w-full lg:w-3/5 z-10 mt-4 lg:mt-0 flex justify-center">
            <motion.div
              className="w-full max-w-xl md:max-w-3xl relative"
              initial="hidden"
              animate={isLoaded ? 'visible' : 'hidden'}
              variants={videoVariants}
            >
              <div className="relative">
                {/* Background Accent */}
                <div className="absolute inset-0 bg-gradient-to-r from-red-100 to-red-50 rounded-xl transform translate-x-4 translate-y-4"></div>
                {/* Main Video Card with Enhanced Shadow */}
                <div className="relative bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-100">
                  {/* Card Header */}
                  <div className="h-12 bg-gray-100 border-b flex items-center px-4">
                    <div className="w-3 h-3 rounded-full bg-red-400 mr-2"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400 mr-2"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  {/* Video Container */}
                  <div className="relative aspect-video bg-gray-50">
                    {!isVideoLoaded && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                        <div className="animate-pulse flex flex-col items-center">
                          <div className="w-16 h-16 bg-gray-200 rounded-full mb-4"></div>
                          <div className="h-4 bg-gray-200 rounded w-32"></div>
                        </div>
                      </div>
                    )}
                    <video
                      className="w-full h-full object-cover"
                      onLoadedData={() => setIsVideoLoaded(true)}
                      autoPlay
                      muted
                      loop
                      playsInline
                    >
                      <source src="/api/placeholder/video" type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}