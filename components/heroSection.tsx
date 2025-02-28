'use client'
import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Sora } from 'next/font/google'
import Link from 'next/link'
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import * as React from "react";
import { cn } from "@/lib/utils";

const sora = Sora({ subsets: ['latin'] })

// Avatar Components
const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full", className)}
    {...props}
  />
));
Avatar.displayName = AvatarPrimitive.Root.displayName;

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full", className)}
    {...props}
  />
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-[inherit] bg-secondary text-xs",
      className,
    )}
    {...props}
  />
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

export default function HeroSection() {
  // Start with isMuted true so that autoplay can work
  const [isLoaded, setIsLoaded] = useState(false)
  const [isVideoLoaded, setIsVideoLoaded] = useState(false)
  const [videoError, setVideoError] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [showPlayButton, setShowPlayButton] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    setIsLoaded(true)
    // IMPORTANT: Reset muted state whenever component mounts
    setIsMuted(true)
    if (videoRef.current) {
      videoRef.current.muted = true
    }
    // If the video element is already ready, show it
    if (videoRef.current && videoRef.current.readyState >= 3) {
      setIsVideoLoaded(true)
    }
    // Fallback timer: reveal the video container after 5 seconds even if load events haven't fired
    const timer = setTimeout(() => {
      setIsVideoLoaded(true)
    }, 5000)
    return () => clearTimeout(timer)
  }, [])

  const handleVideoLoadedData = () => {
    setIsVideoLoaded(true)
    if (videoRef.current) {
      videoRef.current.muted = true
      videoRef.current
        .play()
        .catch((err) => {
          console.error('Autoplay failed:', err)
          setShowPlayButton(true)
        })
    }
  }

  const handlePlayButtonClick = () => {
    if (videoRef.current) {
      videoRef.current
        .play()
        .then(() => {
          setShowPlayButton(false)
        })
        .catch((err) => {
          console.error('Play button click failed:', err)
        })
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted
      setIsMuted(videoRef.current.muted)
    }
  }

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && videoRef.current) {
        videoRef.current.play().catch((err) =>
          console.error('Video play failed on visibility change:', err)
        )
      }
    }
    const handleFocus = () => {
      if (videoRef.current) {
        videoRef.current.play().catch((err) =>
          console.error('Video play failed on focus:', err)
        )
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
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
        delay: 0.5, // Added delay here to make button appear after headline and subheadline
        ease: 'easeOut',
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
  const testimonialsVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay: 0.7,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  }

  const videoSrc = videoError ? '/api/placeholder/video' : '/uploads/herovideo.mp4'

  return (
    <section className={`relative min-h-screen w-full overflow-hidden bg-white pt-24 lg:pt-32 ${sora.className}`}>
      <style jsx>{`
        @media (max-width: 500px) {
          .hero-heading {
            font-size: 2rem;
          }
        }
      `}</style>
      
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

      {/* Main Content - changed to better handle mob ile layo ut */}
      <div className="relative max-w-screen-xl mx-auto px-4 sm:px-8 py-8 sm:py-12 md:py-16 flex flex-col items-center justify-center">
        <div className="flex flex-col lg:flex-row items-center text-center lg:text-left gap-8 lg:gap-16 w-full">
          {/* Left Column: Text & Button */}
          <div className="w-full lg:w-2/5 z-10 flex-shrink-0">
          <motion.h1
            className="hero-heading font-extrabold text-black mb-4 sm:mb-6 text-4xl sm:text-5xl md:text-5xl xl:text-6xl leading-tight mt-4 sm:mt-8 lg:mt-0 tracking-tight w-11/12 sm:w-full mx-auto lg:mx-0"
            initial="hidden"
            animate={isLoaded ? 'visible' : 'hidden'}
            custom={0}
            variants={textVariants}
          >
            <span className="block">Legyen kéznél</span>
            <span className="text-purple-600 block" style={{ color: '#dc2626' }}>
              vészhelyzetben
            </span>
          </motion.h1>
          <motion.p
            className="mb-6 sm:mb-8 text-gray-600 text-base sm:text-lg w-10/12 sm:w-8/12 max-w-lg mx-auto lg:mx-0 text-center lg:text-left"
            initial="hidden"
            animate={isLoaded ? 'visible' : 'hidden'}
            custom={1}
            variants={textVariants}
          >
              Fulladásgátló eszközeink pillanatok alatt tisztítják meg a légutat!
            </motion.p>
            <motion.div
              initial="hidden"
              animate={isLoaded ? 'visible' : 'hidden'}
              variants={buttonVariants}
              className="mb-6 sm:mb-8 text-center lg:text-left"
            >
              <Link href="/product/67c1cce79beb94961403e8f1">
                <button 
                  className="text-white font-semibold rounded-md transition shadow-lg hover:shadow-2xl transform hover:-translate-y-0.5 text-base sm:text-lg" 
                  style={{ 
                    padding: "0.7rem 1.5rem", 
                    backgroundColor: "#dc2626",  
                    color: "white" 
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#dc2626"}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#dc2626"}
                >
                  LEGYEN FELKÉSZÜLVE!
                </button>
              </Link>
            </motion.div>
            
            {/* Testimonials Section - Redesigned to have images and stars inline */}
            <motion.div
              initial="hidden"
              animate={isLoaded ? 'visible' : 'hidden'}
              variants={testimonialsVariant}
              className="flex flex-col items-center lg:items-start mb-6"
            >
              <div className="flex items-center w-auto">
                {/* Profile Images - Made smaller and placed inline */}
                <div className="flex -space-x-2 mr-2">
                  <div className="w-6 h-6 rounded-full border-2 border-white overflow-hidden bg-gray-200 z-50">
                    <img src="/api/placeholder/24/24" alt="User 1" className="w-full h-full object-cover" />
                  </div>
                  <div className="w-6 h-6 rounded-full border-2 border-white overflow-hidden bg-gray-200 z-40">
                    <img src="/api/placeholder/24/24" alt="User 2" className="w-full h-full object-cover" />
                  </div>
                  <div className="w-6 h-6 rounded-full border-2 border-white overflow-hidden bg-gray-200 z-30">
                    <img src="/api/placeholder/24/24" alt="User 3" className="w-full h-full object-cover" />
                  </div>
                  <div className="w-6 h-6 rounded-full border-2 border-white overflow-hidden bg-gray-200 z-20">
                    <img src="/api/placeholder/24/24" alt="User 4" className="w-full h-full object-cover" />
                  </div>
                  <div className="w-6 h-6 rounded-full border-2 border-white overflow-hidden bg-gray-200 z-10">
                    <img src="/api/placeholder/24/24" alt="User 5" className="w-full h-full object-cover" />
                  </div>
                </div>
                
                {/* Stars - Placed to the right of the images */}
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg 
                      key={star} 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-4 w-4 text-yellow-400" 
                      viewBox="0 0 20 20" 
                      fill="currentColor"
                    >
                      <path 
                        d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" 
                      />
                    </svg>
                  ))}
                </div>
              </div>
              
              {/* Text - Width matches the inline elements above */}
              <p className="text-gray-600 text-sm mt-1 text-center lg:text-left" style={{ width: "fit-content" }}>
                <span className="font-semibold">122</span> regisztrált életet mentettünk!
              </p>
            </motion.div>
          </div>

          {/* Right Column: Video Dashboard - Fixed for mobile view */}
          <div className="w-full lg:w-3/5 z-10 flex justify-center">
            <motion.div
              className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl relative"
              initial="hidden"
              animate={isLoaded ? 'visible' : 'hidden'}
              variants={videoVariants}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-red-100 to-red-50 rounded-xl transform translate-x-2 sm:translate-x-4 translate-y-2 sm:translate-y-4"></div>
                <div className="relative bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-100">
                  <div className="h-8 sm:h-10 md:h-12 bg-gray-100 border-b flex items-center px-4">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-red-400 mr-2"></div>
                    <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-yellow-400 mr-2"></div>
                    <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-green-400"></div>
                  </div>
                  <div className="relative aspect-video bg-gray-50">
                    {!isVideoLoaded && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                        <div className="animate-pulse flex flex-col items-center">
                          <div className="w-10 h-10 sm:w-16 sm:h-16 bg-gray-200 rounded-full mb-4"></div>
                          <div className="h-3 sm:h-4 bg-gray-200 rounded w-24 sm:w-32"></div>
                        </div>
                      </div>
                    )}
                    <video
                      ref={videoRef}
                      className={`w-full h-full object-cover ${isVideoLoaded ? 'block' : 'hidden'}`}
                      onLoadedData={handleVideoLoadedData}
                      onError={() => {
                        console.error('Video failed to load')
                        setVideoError(true)
                        setIsVideoLoaded(true)
                      }}
                      loop
                      playsInline
                      autoPlay
                      muted={isMuted}
                      src={videoSrc}
                    >
                      Your browser does not support the video tag.
                    </video>
                    {showPlayButton && (
                      <button
                        onClick={handlePlayButtonClick}
                        className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50"
                        aria-label="Play Video"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-8 w-8 sm:h-12 sm:w-12 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M14.752 11.168l-5.197-3.03A1 1 0 008 9.03v5.94a1 1 0 001.555.832l5.197-3.03a1 1 0 000-1.664z"
                          />
                        </svg>
                      </button>
                    )}
                    <button
                      onClick={toggleMute}
                      className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 z-20 bg-white p-1.5 sm:p-2 rounded-full hover:bg-white/90 focus:outline-none shadow-md transition-all"
                      aria-label={isMuted ? 'Unmute video' : 'Mute video'}
                    >
                      {isMuted ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 sm:h-6 sm:w-6 text-gray-800"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5L6 9H2v6h4l5 4V5z" />
                          <g transform="translate(3, 4)">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6l4 4m0-4l-4 4" />
                          </g>
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 sm:h-6 sm:w-6 text-gray-800"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5L6 9H2v6h4l5 4V5z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.54 8.46a5 5 0 010 7.07" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.07 4.93a10 10 0 010 14.14" />
                        </svg>
                      )}
                    </button>
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