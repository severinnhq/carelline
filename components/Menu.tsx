'use client'

import React, { useEffect } from 'react'
import { X, Home, Star, Mail, Instagram, ListOrdered, HelpCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Sora } from 'next/font/google'

const sora = Sora({ subsets: ['latin'] })

interface MenuProps {
  isOpen: boolean;
  onClose: () => void;
}

// XIcon component remains the same...
const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 1200 1227"
    fill="currentColor"
    {...props}
  >
    <path d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 87.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1143.69H892.476L569.165 687.854V687.828Z"/>
  </svg>
)

const Menu: React.FC<MenuProps> = ({ isOpen, onClose }) => {
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

    // Extract the id from the href
    const id = href.split('#')[1]
    if (!id) return

    // Wait for the menu to close before scrolling
    setTimeout(() => {
      const element = document.getElementById(id)
      if (element) {
        // Adjust offset based on the section
        const offset = id === 'feature-section' ? 128 : 96 // Increased offset for feature section
        const elementPosition = element.getBoundingClientRect().top
        const offsetPosition = elementPosition + window.pageYOffset - offset

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        })
      }
    }, 300) // Matching the menu close animation duration
  }

  const menuItems = [
    { name: 'Home', icon: Home, href: '/', onClick: handleHomeClick },
    { name: 'Steps', icon: ListOrdered, href: '/#feature-section', onClick: (e: React.MouseEvent<HTMLAnchorElement>) => handleSmoothScroll(e, '/#feature-section') },
    { name: 'Reviews', icon: Star, href: '/#review-section', onClick: (e: React.MouseEvent<HTMLAnchorElement>) => handleSmoothScroll(e, '/#review-section') },
    { name: 'FAQ', icon: HelpCircle, href: '/#faq-section', onClick: (e: React.MouseEvent<HTMLAnchorElement>) => handleSmoothScroll(e, '/#faq-section') },
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
                    href="https://www.tiktok.com/@rewealedapparel" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-gray-400 hover:text-gray-500 transition-colors"
                  >
                    <span className="sr-only">TikTok</span>
                    <svg 
                      className="h-6 w-6" 
                      fill="currentColor" 
                      viewBox="0 0 24 24" 
                      aria-hidden="true"
                    >
                      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                    </svg>
                  </a>
                  <a 
                    href="https://www.instagram.com/rewealed" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-gray-400 hover:text-gray-500 transition-colors"
                  >
                    <span className="sr-only">Instagram</span>
                    <Instagram className="h-6 w-6" />
                  </a>
                  <a 
                    href="https://www.x.com/rewealed" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-gray-400 hover:text-gray-500 transition-colors"
                  >
                    <span className="sr-only">X</span>
                    <XIcon className="h-6 w-6" />
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