'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { MenuIcon, ShoppingBag } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { CartItem } from '@/types/cart'
import Menu from '@/components/Menu'
import Link from 'next/link'
import { Sora } from 'next/font/google'

const sora = Sora({ subsets: ['latin'] })

interface HeaderProps {
  onCartClick: () => void;
  cartItems: CartItem[];
}

export function Header({ onCartClick, cartItems }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [showCountdown, setShowCountdown] = useState(false)
  const [countdown, setCountdown] = useState('')
  const [isTransitioning, setIsTransitioning] = useState(false)
  
  // Banner text
  const bannerText = "KEDVEZMÉNYEINK CSAK MÁRCIUS 14-IG TARTANAK!"

  // Calculate and update countdown timer
  useEffect(() => {
    const calculateTimeRemaining = () => {
      const targetDate = new Date('2025-03-14T23:59:00')
      const now = new Date()
      const diff = targetDate.getTime() - now.getTime()
      
      if (diff <= 0) {
        setCountdown('Lejárt!')
        return
      }
      
      // Removed the unused 'days' variable
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)
      
      setCountdown(`MÁR CSAK ${hours} ÓRA ${minutes} PERC ${seconds} MP VAN HÁTRA`)
    }
    
    calculateTimeRemaining()
    const timerId = setInterval(calculateTimeRemaining, 1000)
    
    return () => clearInterval(timerId)
  }, [])

  // Alternating text effect
  useEffect(() => {
    const alternateText = () => {
      setIsTransitioning(true)
      setTimeout(() => {
        setShowCountdown(prev => !prev)
        setIsTransitioning(false)
      }, 500) // Transition duration
    }
    
    const intervalId = setInterval(alternateText, 5000) // Switch every 5 seconds
    
    return () => clearInterval(intervalId)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    handleScroll() // initial check
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const cartItemsCount = cartItems.reduce((total, item) => total + item.quantity, 0)

  return (
    <>
      {/* Fixed banner at the top with alternating text */}
      <div
        className="w-full bg-[#dc2626] text-white overflow-hidden h-10 flex items-center justify-center fixed top-0 left-0 z-50"
        suppressHydrationWarning
      >
        <div 
          className={`banner-text text-center text-xs sm:text-sm md:text-base lg:text-lg font-bold transition-opacity duration-500 ${
            isTransitioning ? 'opacity-0' : 'opacity-100'
          }`}
        >
          {showCountdown ? countdown : bannerText}
        </div>
      </div>

      {/* Header shifted down by the banner height (h-10 => top-10) */}
      <header
        className={`fixed top-10 left-0 right-0 z-[90] transition-all duration-300 ${
          isScrolled ? 'bg-white shadow-md' : 'bg-transparent'
        } ${sora.className}`}
      >
        <div className="container mx-auto px-4 py-2 flex justify-between items-center">
          <Button
            variant="ghost"
            size="icon"
            className={`${
              isScrolled
                ? 'text-gray-600 hover:text-gray-900'
                : 'text-black hover:text-gray-700'
            }`}
            onClick={() => setIsMenuOpen(true)}
          >
            <MenuIcon size={24} />
            <span className="sr-only">Menu</span>
          </Button>
          <div className="flex-grow flex justify-center">
            <Link href="/">
              <Image
                src={isScrolled ? "/transparentlogo.png" : "/transparentlogo.png"}
                alt="Logo"
                width={120}
                height={45}
                className="object-contain"
              />
            </Link>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className={`${
              isScrolled
                ? 'text-gray-600 hover:text-gray-900'
                : 'text-black hover:text-gray-700'
            } relative`}
            onClick={onCartClick}
          >
            <ShoppingBag size={24} />
            <span className="sr-only">Shopping cart</span>
            {cartItemsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#dc2626] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {cartItemsCount}
              </span>
            )}
          </Button>
        </div>
      </header>
      <Menu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      
      {/* Custom styles for the banner text on small screens */}
      <style jsx>{`
        @media (max-width: 359px) {
          .banner-text {
            font-size: 0.625rem; /* Adjust this value as needed */
          }
        }
      `}</style>
    </>
  )
}