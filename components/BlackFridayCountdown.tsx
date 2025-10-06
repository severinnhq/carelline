'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { toast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Image from 'next/image'
import { Toaster } from "@/components/ui/toaster"

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const DROP_TIME = new Date('2024-12-06T21:00:00-05:00') // December 6,  2024, 9:00 PM ET

export default function NextDropCountdown() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [email, setEmail] = useState('')
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    const calculateTimeLeft = () => {
      const now = new Date('2024-11-29T21:30:00-05:00') // Current time set to November 29, 2024, 9:30 PM ET
      const difference = +DROP_TIME - +now
      
      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        }
      }

      return { days: 0, hours: 0, minutes: 0, seconds: 0 }
    }

    setTimeLeft(calculateTimeLeft())

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        toast({
          title: "Success!",
          description: "You'll be notified when the next drop starts!",
          duration: 5000,
        })
        setEmail('')
      } else {
        throw new Error('Failed to subscribe')
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to subscribe. Please try again.",
        variant: "destructive",
      })
    }
  }

  const timeComponents = Object.entries(timeLeft).map(([interval, value]) => (
    <motion.div
      key={interval}
      className="flex flex-col items-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <span className="text-4xl md:text-6xl font-bold mb-2 text-white">
        {value.toString().padStart(2, '0')}
      </span>
      <span className="text-sm md:text-lg text-gray-300 capitalize">{interval}</span>
    </motion.div>
  ))

  if (!isClient) {
    return null // or a loabvdin g spinner
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-12 bg-black"
      >
        <Image
          src="/whiterewealed.png"
          alt="Store Logo"
          width={300}
          height={90}
          className="object-contain"
        />
      </motion.div>
      
      <motion.div 
        className="flex justify-center items-center mb-12"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className="grid grid-cols-4 gap-4 md:gap-8">
          {timeComponents}
        </div>
      </motion.div>
      
      <motion.form
        className="flex flex-col items-center gap-4 w-full max-w-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        onSubmit={handleSubmit}
      >
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full h-12 border-2 border-gray-600 focus:border-white transition-colors duration-200"
        />
        <Button 
          type="submit" 
          className="w-full px-8 py-3 bg-white text-black hover:bg-gray-200 transition-colors duration-200"
        >
          Notify Me
        </Button>
      </motion.form>
      <Toaster />
    </div>
  )
}