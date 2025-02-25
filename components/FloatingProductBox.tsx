import React from 'react'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { motion } from 'framer-motion'
import { Sora } from 'next/font/google'

const sora = Sora({ subsets: ['latin'] })

interface FloatingProductBoxProps {
  product: {
    name: string
    mainImage: string
    price: number
    salePrice?: number
  }
  selectedSize: string
  quantity: number
  onAddToCart: () => void
}

export function FloatingProductBox({ product, selectedSize, quantity, onAddToCart }: FloatingProductBoxProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-4 flex items-center space-x-4 z-50 ${sora.className}`}
    >
      <Image
        src={`/uploads/${product.mainImage}`}
        alt={product.name}
        width={60}
        height={60}
        className="rounded-md object-cover"
      />
      <div className="flex-grow">
        <h3 className="font-semibold text-sm">{product.name}</h3>
        <p className="text-sm text-gray-600">Méret: {selectedSize}</p>
        <p className="text-sm text-gray-600">Mennyiség: {quantity}</p>
        <p className="text-sm font-bold">
          {product.salePrice ? (
            <>
              <span className="text-[#be2323]">{product.salePrice.toLocaleString()} Ft</span>
              <span className="text-gray-500 line-through ml-2">{product.price.toLocaleString()} Ft</span>
            </>
          ) : (
            <span>{product.price.toLocaleString()} Ft</span>
          )}
        </p>
      </div>
      <Button 
        onClick={onAddToCart} 
        className="whitespace-nowrap bg-black text-white hover:bg-gray-800 transition-colors duration-200 px-6 py-2 text-sm font-bold"
      >
        + Kosárba
      </Button>
    </motion.div>
  )
}