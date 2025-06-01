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
  
  // Updated banner-related state
  const [bannerIndex, setBannerIndex] = useState(0)
  const [countdown, setCountdown] = useState('')
  const [isTransitioning, setIsTransitioning] = useState(false)

  const bannerText = "NYÁR INDÍTÓ AKCIÓ CSAK JÚNIUS 4-IG!!"
  const bankText = `BANKKÁRTYÁS FIZETÉS ESETÉN -10% A "NYAR10" KÓDDAL`

  const cartItemsCount = cartItems.reduce((total, item) => total + item.quantity, 0)

  // Countdown timer effect
  useEffect(() => {
    const calculateTimeRemaining = () => {
      const targetDate = new Date('2025-06-04T23:59:00')
      const now = new Date()
      const diff = targetDate.getTime() - now.getTime()
      if (diff <= 0) {
        setCountdown('Lejárt!')
        return
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      if (days <= 0) {
        setCountdown(`MÁR CSAK ${hours} ÓRA VAN HÁTRA`)
      } else {
        setCountdown(`MÁR CSAK ${days} NAP ${hours} ÓRA VAN HÁTRA`)
      }
    }
    calculateTimeRemaining()
    const timerId = setInterval(calculateTimeRemaining, 1000)
    return () => clearInterval(timerId)
  }, [])

  // Banner text rotation effect
  useEffect(() => {
    const alternateText = () => {
      setIsTransitioning(true)
      setTimeout(() => {
        setBannerIndex(prev => (prev + 1) % 3)
        setIsTransitioning(false)
      }, 500)
    }
    const intervalId = setInterval(alternateText, 5000)
    return () => clearInterval(intervalId)
  }, [])

  const handleLogoClick = () => sessionStorage.removeItem('productListScrollPosition')

  const currentText = bannerIndex === 0
    ? bannerText
    : bannerIndex === 1
    ? bankText
    : countdown

  return (
    <>
      {/* Red banner with rotating messages */}
      <div className="w-full bg-[#dc2626] text-white h-10 flex items-center justify-center fixed top-0 left-0 z-50 overflow-hidden" suppressHydrationWarning>
        <div className={`text-center text-xs sm:text-sm md:text-base lg:text-lg font-bold transition-opacity duration-500 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
          {currentText}
        </div>
      </div>

      {/* Header shifted down by banner height */}
      <header className="fixed top-10 left-0 right-0 z-50 bg-white shadow-md">
        <div className="container mx-auto px-4 py-2 flex justify-between items-center">
          <Button variant="ghost" size="icon" className="text-gray-600 hover:text-gray-900" onClick={() => setIsMenuOpen(true)}>
            <MenuIcon size={24} />
            <span className="sr-only">Menu</span>
          </Button>

          <div className="flex-grow flex justify-center">
            <Link href="/" onClick={handleLogoClick}>
              <Image src="/blacklogo.png" alt="Logo" width={120} height={45} className="object-contain cursor-pointer" />
            </Link>
          </div>

          <Button variant="ghost" size="icon" className="text-gray-600 hover:text-gray-900 relative" onClick={onCartClick}>
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
