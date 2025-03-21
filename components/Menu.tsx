// Menu.tsx
'use client'
import React, { useEffect } from 'react'
import { X, Home, Star, ListOrdered, HelpCircle, Mail, Facebook, Instagram, ShoppingBag } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Sora } from 'next/font/google'
import { getScrollOffset } from '@/utils/scrollUtils'

const sora = Sora({ subsets: ['latin'] })

interface MenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const Menu: React.FC<MenuProps> = ({ isOpen, onClose }) => {
  const router = useRouter()
  const pathname = usePathname()
  const isHomePage = pathname === '/'

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const handleHomeClick = () => {
    sessionStorage.removeItem('productListScrollPosition')
    onClose()
  }

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    onClose()

    const id = href.split('#')[1]
    if (!id) return

    if (isHomePage) {
      // We're already on the home page, just scroll to the section
      setTimeout(() => {
        const element = document.getElementById(id)
        if (element) {
          const offset = getScrollOffset(id)
          const elementPosition = element.getBoundingClientRect().top
          const offsetPosition = elementPosition + window.scrollY - offset

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          })
        }
      }, 300)
    } else {
      // We're not on the home page, navigate to home page first and then scroll
      router.push('/')
      
      // Need to wait a bit longer for the page to load before scrolling
      setTimeout(() => {
        const element = document.getElementById(id)
        if (element) {
          const offset = getScrollOffset(id)
          const elementPosition = element.getBoundingClientRect().top
          const offsetPosition = elementPosition + window.scrollY - offset

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          })
        }
      }, 600)
    }
  }

  const menuItems = [
    { name: 'Főoldal', icon: Home, href: '/', onClick: handleHomeClick },
    { name: 'Termékek', icon: ShoppingBag, href: '/#products', onClick: (e: React.MouseEvent<HTMLAnchorElement>) => handleSmoothScroll(e, '/#products') },
    { name: 'Vélemények', icon: Star, href: '/#review-section', onClick: (e: React.MouseEvent<HTMLAnchorElement>) => handleSmoothScroll(e, '/#review-section') },
    { name: 'Használat', icon: ListOrdered, href: '/#feature-section', onClick: (e: React.MouseEvent<HTMLAnchorElement>) => handleSmoothScroll(e, '/#feature-section') },
    { name: 'GYIK', icon: HelpCircle, href: '/#faq-section', onClick: (e: React.MouseEvent<HTMLAnchorElement>) => handleSmoothScroll(e, '/#faq-section') },
  ]

  return (
    <div 
      className={`fixed inset-0 z-[100] ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'} ${sora.className}`}
      aria-hidden={!isOpen}
    >
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className={`absolute inset-0 bg-black bg-opacity-50 transition-opacity ${isOpen ? 'opacity-100 cursor-close' : 'opacity-0'}`} 
          onClick={onClose}
          aria-label="Close menu"
        />
        <motion.div
          initial={{ x: 'calc(-100% - 1rem)' }}
          animate={{ x: isOpen ? '0%' : 'calc(-100% - 1rem)' }}
          transition={{ type: 'tween', ease: 'easeOut', duration: 0.3 }}
          className="fixed inset-y-0 md:inset-y-4 left-0 md:left-4 w-full md:w-auto md:max-w-lg flex p-4 md:p-0"
        >
          <div className="relative w-full md:w-[400px] flex">
            <div className="absolute inset-0 bg-white shadow-xl rounded-lg" />
            <div className="relative flex-1 flex flex-col h-full p-4 bg-white rounded-lg overflow-hidden">
              <div className="flex-shrink-0 py-2">
                <div className="flex items-start justify-end">
                  <button
                    type="button"
                    className="p-2 text-gray-400 hover:text-gray-500 rounded-full hover:bg-gray-100 transition-colors"
                    onClick={onClose}
                    aria-label="Close menu"
                  >
                    <X size={24} aria-hidden="true" />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                <nav className="space-y-4 py-6">
                  {menuItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="flex items-center p-3 text-base font-medium text-gray-900 rounded-lg hover:bg-gray-100 group transition-colors"
                      onClick={item.onClick}
                    >
                      <item.icon className="w-6 h-6 text-gray-500 transition duration-75 group-hover:text-gray-900" />
                      <span className="ml-3">{item.name}</span>
                    </Link>
                  ))}
                </nav>
              </div>
              <div className="flex-shrink-0 py-6">
                <div className="flex justify-center space-x-6">
                  <a 
                    href="https://www.facebook.com/profile.php?id=61573174178989" 
                    className="text-gray-400 hover:text-gray-500 transition-colors"
                  >
                    <span className="sr-only">Facebook</span>
                    <Facebook className="h-6 w-6" />
                  </a>
                  <a 
                    href="https://www.instagram.com/carelline_official" 
                    className="text-gray-400 hover:text-gray-500 transition-colors"
                  >
                    <span className="sr-only">Instagram</span>
                    <Instagram className="h-6 w-6" />
                  </a>
                  <a 
                    href="mailto:support@carelline.com" 
                    className="text-gray-400 hover:text-gray-500 transition-colors"
                  >
                    <span className="sr-only">Email</span>
                    <Mail className="h-6 w-6" />
                  </a>
                </div>
              </div>    
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Menu