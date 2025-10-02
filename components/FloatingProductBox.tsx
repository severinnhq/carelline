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
    categories?: string[]
  }
  selectedSize: string
  quantity: number
  onAddToCart: () => void
  selectedImage: string
  selectedCharacterName: string
  setSelectedCharacter: (img: string, name: string) => void
}

export function FloatingProductBox({
  product,
  quantity,
  onAddToCart,
  selectedImage,
  selectedCharacterName,
  setSelectedCharacter,
}: FloatingProductBoxProps) {
  // character images & names
  const characterImages = [
    "prod9zumi.png",
    "prod9mezi.png",
    "prod9pillepihe.png",
    "prod9pofike.png",
    "prod9tekike.png",
    "prod9bekaur.png",
    "prod9leo.png",
    "prod9tuzi.png",
    "prod9uniponi.png",
  ]

  const characterNames = [
    "Zümi",
    "Mézi",
    "Pillepihe",
    "Pöfike",
    "Tekike",
    "Béka úr",
    "Leó",
    "Tüzi",
    "Unipóni",
  ]

  // find the index of current image
  const selectedIndex = characterImages.findIndex(img => img === selectedImage)

  const displayedImage =
    product?.categories?.includes("multioption") && selectedIndex >= 0
      ? characterImages[selectedIndex]
      : product.mainImage

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-4 flex items-center space-x-4 z-50 ${sora.className} hidden lg:flex`}
    >
      <Image
        src={`/uploads/${displayedImage}`}
        alt={product.name}
        width={60}
        height={60}
        className="rounded-md object-cover"
      />
      <div className="flex-grow space-y-1">
        <h3 className="font-bold text-sm">{product.name}</h3>

        {product?.categories?.includes("multioption") && (
          <div className="text-sm">
            <label htmlFor="karakter" className="mr-2">
              Karakter:
            </label>
       <select
  id="karakter"
  value={selectedCharacterName}
  onChange={(e) => {
    const idx = characterNames.findIndex(name => name === e.target.value)
    if (idx >= 0) {
      setSelectedCharacter(characterImages[idx], characterNames[idx])
    }
  }}
>
  {characterNames.map((name, i) => (
    <option key={i} value={name}>
      {name}
    </option>
  ))}
</select>

          </div>
        )}

        <p className="text-sm text-gray-600">Mennyiség: {quantity}</p>
        <p className="text-sm font-bold">
          {product.salePrice ? (
            <>
              <span className="text-[#dc2626]">
                {Math.round(product.salePrice).toLocaleString("hu-HU")} Ft
              </span>
              <span className="text-gray-500 line-through ml-2">
                {Math.round(product.price).toLocaleString("hu-HU")} Ft
              </span>
            </>
          ) : (
            <span>{Math.round(product.price).toLocaleString("hu-HU")} Ft</span>
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
