'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { MenuIcon, ShoppingBag } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { CartItem } from '@/types/cart'
import Menu from '@/components/Menu'

interface WhiteHeaderProps {
  onCartClick: () => void;
  cartItems: CartItem[];
}

export function WhiteHeader({ onCartClick, cartItems }: WhiteHeaderProps) { 
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showCountdown, setShowCountdown] = useState(false)
  const [countdown, setCountdown] = useState('')
  const [isTransitioning, setIsTransitioning] = useState(false)

  const cartItemsCount = cartItems.reduce((total, item) => total + item.quantity, 0)

  // Banner text
  const bannerText = "KEDVEZMÉNYEINK CSAK MÁRCIUS 16-IG TARTANAK!"

  // Calculate and update countdown timer
  useEffect(() => {
    const calculateTimeRemaining = () => {
      const targetDate = new Date('2025-03-16T23:59:00')
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

  const handleLogoClick = () => {
    sessionStorage.removeItem('productListScrollPosition')
  }

  return (
    <>
      {/* Fixed banner at the top with alternating text */}
      <div
        className="w-full bg-[#dc2626] text-white overflow-hidden h-10 flex items-center justify-center fixed top-0 left-0 z-50"
        suppressHydrationWarning
      >
        <div 
          className={`text-center text-xs sm:text-sm md:text-base lg:text-lg font-bold transition-opacity duration-500 ${
            isTransitioning ? 'opacity-0' : 'opacity-100'
          }`}
        >
          {showCountdown ? countdown : bannerText}
        </div>
      </div>

      {/* White Header shifted down by banner height (h-10 => top-10) */}
      <header className="fixed top-10 left-0 right-0 z-50 bg-white shadow-md">
        <div className="container mx-auto px-4 py-2 flex justify-between items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-gray-600 hover:text-gray-900"
            onClick={() => setIsMenuOpen(true)}
          >
            <MenuIcon size={24} />
            <span className="sr-only">Menu</span>
          </Button>

          <div className="flex-grow flex justify-center">
            <Link href="/" onClick={handleLogoClick}>
              <Image
                src="/blacklogo.png"
                alt="Logo"
                width={120}
                height={45}
                className="object-contain cursor-pointer"
              />
            </Link>
          </div>

          <Button 
            variant="ghost" 
            size="icon" 
            className="text-gray-600 hover:text-gray-900 relative"
            onClick={onCartClick}
          >
            <ShoppingBag size={24} />
            <span className="sr-only">Shopping cart</span>
            {cartItemsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {cartItemsCount}
              </span>
            )}
          </Button>
        </div>
      </header>
      <Menu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  )
}