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

export function FloatingProductBox({ product, quantity, onAddToCart }: FloatingProductBoxProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-4 flex items-center space-x-4 z-50 ${sora.className} hidden lg:flex`}
    >
      <Image
        src={`/uploads/${product.mainImage}`}
        alt={product.name}
        width={60}
        height={60}
        className="rounded-md object-cover"
      />
      <div className="flex-grow space-y-1">
        <h3 className="font-bold text-sm">{product.name}</h3>

        <p className="text-sm text-gray-600">Mennyiség: {quantity}</p>
        <p className="text-sm font-bold">
          {product.salePrice ? (
            <>
              <span className="text-[#dc2626]">{Math.round(product.salePrice).toLocaleString('hu-HU')} Ft</span>
              <span className="text-gray-500 line-through ml-2">{Math.round(product.price).toLocaleString('hu-HU')} Ft</span>
            </>
          ) : (
            <span>{Math.round(product.price).toLocaleString('hu-HU')} Ft</span>
          )}
        </p>
      </div>
      <Button 
        onClick={onAddToCart} 
        className="whitespace-nowrap bg-[#dc2626] text-white transition-colors duration-200 px-6 py-2 text-sm font-semibold"
      >
        + Kosárba
      </Button>
    </motion.div>
  )
}