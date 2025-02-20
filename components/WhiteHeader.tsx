'use client'

import { useState } from 'react'
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

  const cartItemsCount = cartItems.reduce((total, item) => total + item.quantity, 0)

  const handleLogoClick = () => {
    sessionStorage.removeItem('productListScrollPosition');
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
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

