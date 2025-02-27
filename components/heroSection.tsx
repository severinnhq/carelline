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

  // When video data loads, attempt to autoplay (while muted)
  // This function no longer automatically unmutes after a delay
  const handleVideoLoadedData = () => {
    setIsVideoLoaded(true)
    if (videoRef.current) {
      // Ensure it's muted so autoplay is allowed
      videoRef.current.muted = true
      videoRef.current
        .play()
        .catch((err) => {
          console.error('Autoplay failed:', err)
          setShowPlayButton(true)
        })
    }
  }

  // Fallback if autoplay is blocked: allow the user to click to start playback.
  const handlePlayButtonClick = () => {
    if (videoRef.current) {
      videoRef.current
        .play()
        .then(() => {
          setShowPlayButton(false)
          // Keep it muted - user can unmute manually if desired
        })
        .catch((err) => {
          console.error('Play button click failed:', err)
        })
    }
  }

  // Toggle mute state when the sound button is clicked.
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted
      setIsMuted(videoRef.current.muted)
    }
  }

  // Keep the video playing on page focus or visibility change.
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

  // Animation variants for Framer Motion
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
  
  // Badge animation
  const badgeVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay: 0.1,
        ease: 'easeOut',
      },
    },
  }
  
  // Circle vibration animation
  const circleVibrateVariants = {
    animate: {
      scale: [1, 1.2, 1],
      opacity: [0.7, 1, 0.7],
      transition: {
        repeat: Infinity,
        duration: 1.5,
        ease: "easeInOut",
      }
    }
  }

  // Avatar component animation
  const avatarComponentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay: 0.6,
        ease: 'easeOut',
      },
    },
  }

  // Choose an alternative video source if there is an error.
  const videoSrc = videoError ? '/api/placeholder/video' : '/uploads/herovideo.mp4'

  return (
    <section className={`relative h-screen w-full overflow-hidden bg-white ${sora.className}`}>
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
      <div className="relative max-w-screen-xl mx-auto px-4 sm:px-8 py-16 h-full flex flex-col items-center justify-center mt-12 md:mt-0">
        <div className="flex flex-col lg:flex-row items-center text-center lg:text-left gap-16 lg:gap-32 w-full">
          {/* Left Column: Text & Button */}
          <div className="w-full lg:w-2/5 z-10 flex-shrink-0">
            {/* Updated Badge with additional space between circle and text */}
            <motion.div
              initial="hidden"
              animate={isLoaded ? 'visible' : 'hidden'}
              variants={badgeVariants}
              className="inline-flex items-center gap-3 px-2.5 py-0.5 rounded-full bg-white shadow-sm border border-gray-100 mb-4 mx-auto lg:mx-0"
            >
              <motion.div
                animate="animate"
                variants={circleVibrateVariants}
              >
                {/* Custom SVG circle that's fully green instead of using the Lucide Circle component */}
                <svg width="8" height="8" viewBox="0 0 8 8" className="text-green-500">
                  <circle cx="4" cy="4" r="4" fill="currentColor" />
                </svg>
              </motion.div>
              <span className="text-xs text-black tracking-wide font-medium">
                 Jelenleg csak <span className="font-bold">11</span> van raktáron
              </span>
            </motion.div>
            
            <motion.h1
              className="font-bold mb-6 text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight text-gray-800"
              initial="hidden"
              animate={isLoaded ? 'visible' : 'hidden'}
              custom={0}
              variants={textVariants}
            >
              Legyen kéznél
              <span className="text-[#dc2626]"> vészhelyzetben</span>
              <br />
   
            </motion.h1>
            <motion.p
              className="mb-8 text-gray-600 text-base sm:text-lg w-full max-w-xl"
              initial="hidden"
              animate={isLoaded ? 'visible' : 'hidden'}
              custom={1}
              variants={textVariants}
            >
             Innovatív fulladásgátló eszközünk másodpercek alatt tisztítja meg a légutat!
            </motion.p>
            <motion.div
              initial="hidden"
              animate={isLoaded ? 'visible' : 'hidden'}
              variants={buttonVariants}
              className="mb-12" /* Increased spacing from mb-6 to mb-12 */
            >
              <Link href="/product/67b6f90829e091cfe70668a7">
                <button className="px-6 py-3 bg-[#dc2626] text-white font-medium rounded-md hover:bg-red-700 transition shadow-lg hover:shadow-2xl transform hover:-translate-y-0.5">
                  Felkészülök
                </button>
              </Link>
            </motion.div>
            
            {/* Added Saved Children Section with baby emoji instead of avatar images */}
            <motion.div 
              initial="hidden"
              animate={isLoaded ? 'visible' : 'hidden'}
              variants={avatarComponentVariants}
              className="inline-flex items-center rounded-full border border-gray-200 bg-white p-2 shadow shadow-black/5 mx-auto lg:mx-0"
            >
              {/* Single baby emoji */}
              <div className="flex items-center justify-center w-6 h-6 bg-blue-50 rounded-full">
                <span className="text-lg" role="img" aria-label="Baby">👶👴</span>
              </div>
              <p className="px-2 text-xs text-gray-600 whitespace-nowrap">
                 <strong className="font-bold text-gray-900">122</strong> regisztrált életett mentettünk meg
              </p>
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
                {/* Main Video Card */}
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
                    {/* Overlay play button if autoplay was blocked */}
                    {showPlayButton && (
                      <button
                        onClick={handlePlayButtonClick}
                        className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50"
                        aria-label="Play Video"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-12 w-12 text-white"
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
                    {/* Sound Toggle Button */}
                    <button
                      onClick={toggleMute}
                      className="absolute bottom-4 right-4 z-20 bg-white p-2 rounded-full hover:bg-white/90 focus:outline-none shadow-md transition-all"
                      aria-label={isMuted ? 'Unmute video' : 'Mute video'}
                    >
                      {isMuted ? (
                        // Muted icon - with speaker and X
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6 text-gray-800"
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
                        // Unmuted icon - with speaker and sound waves
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6 text-gray-800"
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