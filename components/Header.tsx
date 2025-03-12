'use client'
import { useState, useEffect, useRef } from 'react'
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
  const [scrollX, setScrollX] = useState(0)
  const [countdown, setCountdown] = useState('')
  const animationRef = useRef<number | null>(null)
  
  // Original banner text
  const bannerText1 = "Kedvezményeink csak március 14-ig tartanak"
  // Larger spacer with more non-breaking spaces
  const spacer = "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0"

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
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)
      
      setCountdown(`Már csak ${days} nap ${hours} óra ${minutes} perc ${seconds} másodperc van hátra`)
    }
    
    calculateTimeRemaining()
    const timerId = setInterval(calculateTimeRemaining, 1000)
    
    return () => clearInterval(timerId)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    handleScroll() // initial check
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Animation for the scrolling banner
  useEffect(() => {
    const scrollBanner = () => {
      setScrollX(prevScrollX => {
        // Reset position when scrolled far enough to create seamless loop
        if (prevScrollX <= -2000) return 0
        return prevScrollX - 0.5 // Adjust speed here (smaller = slower)
      })
      animationRef.current = requestAnimationFrame(scrollBanner)
    }
    
    animationRef.current = requestAnimationFrame(scrollBanner)
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  const cartItemsCount = cartItems.reduce((total, item) => total + item.quantity, 0)

  // Create alternating text with the original message and countdown
  const bannerText2 = countdown
  const alternatingText = `${bannerText1}${spacer}${bannerText2}${spacer}`
  const repeatedText = `${alternatingText}${alternatingText}${alternatingText}`

  return (
    <>
      {/* Scrolling banner fixed at the top */}
      <div
        className="w-full bg-[#dc2626] text-white overflow-hidden h-10 flex items-center fixed top-0 left-0 z-50"
        suppressHydrationWarning
      >
        <div 
          className="whitespace-nowrap animate-none flex items-center text-xs sm:text-sm md:text-base lg:text-lg font-bold"
          style={{ transform: `translateX(${scrollX}px)` }}
        >
          {repeatedText}{repeatedText} {/* Double the content to ensure smooth looping */}
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
    </>
  )
}