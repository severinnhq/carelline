'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from 'framer-motion'
import { Sora } from 'next/font/google'

const sora = Sora({ subsets: ['latin'] })

interface Product {
  _id: string
  name: string
  price: number
  salePrice?: number
  mainImage: string
  sizes: string[]
}

interface CartModalProps {
  product: Product
  onClose: () => void
  onAddToCart: (size: string) => void
}

const CartModal: React.FC<CartModalProps> = ({ product, onClose, onAddToCart }) => {
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(true)

  useEffect(() => {
    const firstAvailableSize = product.sizes[0];
    if (firstAvailableSize) {
      setSelectedSize(firstAvailableSize);
    }
  }, [product.sizes]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleAddToCart = () => {
    if (product.sizes.includes('One Size')) {
      onAddToCart('One Size')
    } else if (selectedSize) {
      onAddToCart(selectedSize)
    }
    setIsOpen(false)
  }

  const handleClose = () => {
    setIsOpen(false)
  }



  return (
    <AnimatePresence onExitComplete={onClose}>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className={`fixed bg-white rounded-t-lg md:rounded-lg shadow-lg w-full md:w-96 z-[60] overflow-hidden bottom-0 left-0 right-0 md:right-4 md:left-auto max-w-full max-h-[90vh] md:max-h-[80vh] overflow-y-auto ${sora.className}`}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.3 }}
              className="p-4"
            >
              <button 
                onClick={handleClose} 
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
              >
                <X size={20} />
              </button>
              <div className="flex items-center mb-4">
                <Image
                  src={`/uploads/${product.mainImage}`}
                  alt={product.name}
                  width={80}
                  height={80}
                  className="rounded object-cover mr-4"
                />
                <div>
                  <h3 className="text-base font-bold">{product.name}</h3>
                  <p className="mt-1">
                    {product.salePrice ? (
                      <>
                        <span className="text-[#dc2626] font-semibold text-lg">{product.salePrice.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, " ")} Ft</span>
                        <span className="text-gray-500 line-through ml-2 text-sm">{product.price.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, " ")} Ft</span>
                      </>
                    ) : (
                      <span className="font-bold text-lg">{product.price.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, " ")} Ft</span>
                    )}
                  </p>
                </div>
              </div>
             
            
              <Button 
                className="w-full bg-[#dc2626] text-white  transition-colors duration-200" 
                disabled={!selectedSize && !product.sizes.includes('One Size')}
                onClick={handleAddToCart}
              >
                + Kosárba
              </Button>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default CartModal