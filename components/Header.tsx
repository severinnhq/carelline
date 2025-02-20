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

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll() // Check initial scroll position

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const cartItemsCount = cartItems.reduce((total, item) => total + item.quantity, 0)

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-[90] transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md' : 'bg-gray-300'
      } ${sora.className}`}>
        <div className="container mx-auto px-4 py-2 flex justify-between items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className={`${isScrolled ? 'text-gray-600 hover:text-gray-900' : 'text-white hover:text-gray-200'}`}
            onClick={() => setIsMenuOpen(true)}
          >
            <MenuIcon size={24} />
            <span className="sr-only">Menu</span>
          </Button>

          <div className="flex-grow flex justify-center">
            <Link href="/">
              <Image
                src={isScrolled ? "/blacklogo.png" : "/whitelogo.png"}
                alt="Logo"
                width={160}
                height={60}
                className="object-contain"
              />
            </Link>
          </div>

          <Button 
            variant="ghost" 
            size="icon" 
            className={`${isScrolled ? 'text-gray-600 hover:text-gray-900' : 'text-white hover:text-gray-200'} relative`}
            onClick={onCartClick}
          >
            <ShoppingBag size={24} />
            <span className="sr-only">Shopping cart</span>
            {cartItemsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#be2323] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
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

