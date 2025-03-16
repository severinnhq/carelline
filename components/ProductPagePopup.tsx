'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'

const hungarianNames = [
  'N. Zsófia', 'K. Eszter', 'T. Anna', 'Sz. Viktória', 
  'H. Nóra', 'K. Dóra', 'V. Virág', 'M. Kata',
  'N. Emese', 'F. Veronika', 'B. Lilla', 'P. Tímea',
  'T. Adrienn', 'K. Orsolya', 'N. Katalin', 'Sz. Zsanett',
  'V. Boglárka', 'P. Diána', 'B. Erika', 'M. Anikó',
  'K. Edina', 'N. Beáta', 'S. Henrietta', 'H. Mária',
  'F. Éva', 'B. Margit', 'G. Judit', 'V. Ágnes',
  'R. Magdolna', 'Cs. Irén', 'K. Klára', 'N. Piroska',
  'T. Nikolett', 'B. Szilvia', 'K. Bianka', 'H. Petra',
  'V. Flóra', 'Sz. Gabriella', 'N. Réka', 'F. Zsuzsanna'
]

const hungarianCities = [
  'Budapestről', 'Debrecenből', 'Szegedről', 'Miskolcról', 'Pécsről', 
  'Győrből', 'Nyíregyházáról', 'Kecskemétről', 'Székesfehérvárról', 'Szombathelyről',
  'Sopronból', 'Veszprémből', 'Zalaegerszegről', 'Egerről', 'Nagykanizsáról',
  'Dunaújvárosból', 'Hódmezővásárhelyről', 'Szolnokról', 'Bajáról', 'Esztergomból',
  'Gödöllőről', 'Pápáról', 'Gyöngyösről', 'Kiskunfélegyházáról', 'Mosonmagyaróvárról',
  'Ajkáról', 'Békéscsabáról', 'Ceglédről', 'Kaposvárról', 'Ózdról',
  'Salgótarjánból', 'Siófokról', 'Szekszárdról', 'Váczról', 'Várpalotáról',
  'Hatvanból', 'Kazincbarcikáról', 'Keszthelyről', 'Tatabányáról', 'Szentendréről',
  'Gyuláról', 'Hajdúböszörményből', 'Jászberényből', 'Kiskunhalasról', 'Mátészalkáról'
]

interface Product {
  _id: string
  name: string
  mainImage: string
  // Other properties if needed
}

interface PopupInfo {
  name: string
  city: string
  baseMinutes: number  // The random starting minutes (between 5 and 20)
  startTimestamp: number  // When this popup info was generated
}

interface PopupInfoState extends PopupInfo {
  displayedMinutes: number  // baseMinutes + elapsed minutes
}

const LOCAL_STORAGE_KEY = (productId: string) => `popupInfo_${productId}`

// Generate a new random popup info
const generateRandomPurchase = (): PopupInfo => {
  const nameIndex = Math.floor(Math.random() * hungarianNames.length)
  const cityIndex = Math.floor(Math.random() * hungarianCities.length)
  const randomMinutes = Math.floor(Math.random() * 16) + 5 // random number between 5 and 20
  return {
    name: hungarianNames[nameIndex],
    city: hungarianCities[cityIndex],
    baseMinutes: randomMinutes,
    startTimestamp: Date.now()
  }
}

// Compute the displayed minutes as baseMinutes + elapsed full minutes
const computeDisplayedMinutes = (info: PopupInfo): number =>
  info.baseMinutes + Math.floor((Date.now() - info.startTimestamp) / 60000)

export const ProductPagePopup = ({ product }: { product: Product }) => {
  const [popupInfo, setPopupInfo] = useState<PopupInfoState | null>(null)
  const storageKey = LOCAL_STORAGE_KEY(product._id)

  // Initialize popup info when the component mounts or product changes.
  useEffect(() => {
    // Load from localStorage if available, otherwise generate new info.
    const loadPopupInfo = (): PopupInfoState => {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(storageKey)
        if (stored) {
          try {
            const parsed: PopupInfo = JSON.parse(stored)
            const displayed = computeDisplayedMinutes(parsed)
            // If the current displayed minutes haven't reached 25, use it.
            if (displayed < 25) {
              return { ...parsed, displayedMinutes: displayed }
            }
          } catch {
            // If parsing fails, fall through to generating new info.
            // Removed parameter to avoid unused variable warning
          }
        }
      }
      // Generate new info if none exists or if expired
      const newInfo = generateRandomPurchase()
      return { ...newInfo, displayedMinutes: newInfo.baseMinutes }
    }

    const info = loadPopupInfo()
    setPopupInfo(info)
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          name: info.name,
          city: info.city,
          baseMinutes: info.baseMinutes,
          startTimestamp: info.startTimestamp
        })
      )
    }
  }, [product._id, storageKey])

  // Update the displayed minutes every minute.
  useEffect(() => {
    const interval = setInterval(() => {
      setPopupInfo(prev => {
        if (!prev) return prev
        const newDisplayed = computeDisplayedMinutes(prev)
        // When the displayed minutes reach or exceed 25, generate new popup info.
        if (newDisplayed >= 25) {
          const newInfo = generateRandomPurchase()
          const updated = { ...newInfo, displayedMinutes: newInfo.baseMinutes }
          if (typeof window !== 'undefined') {
            localStorage.setItem(
              storageKey,
              JSON.stringify({
                name: updated.name,
                city: updated.city,
                baseMinutes: updated.baseMinutes,
                startTimestamp: updated.startTimestamp
              })
            )
          }
          return updated
        }
        // Otherwise, simply update the displayed minutes.
        return { ...prev, displayedMinutes: newDisplayed }
      })
    }, 60000) // update every minute

    return () => clearInterval(interval)
  }, [storageKey])

  // Auto-dismiss the popup after 5 seconds.
  useEffect(() => {
    const timer = setTimeout(() => {
      setPopupInfo(null)
    }, 5000)
    return () => clearTimeout(timer)
  }, [product._id])

  // If no popup info, do not render anything.
  if (!popupInfo) return null

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="fixed bottom-4 left-4 bg-white p-4 rounded-lg shadow-xl border border-gray-200 z-50 max-w-xs"
    >
      {/* Close button in the top right corner of the card */}
      <button 
        onClick={() => setPopupInfo(null)}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
      >
        ×
      </button>
      <div className="flex items-center gap-3">
        <Image
          src={`/uploads/${product.mainImage}`}
          alt={product.name}
          width={60}
          height={60}
          className="rounded-md"
        />
        <div className="flex flex-col">
          <div className="text-sm">
            <span className="font-bold">{popupInfo.name}</span> nemrég rendelt <span className="font-bold">{popupInfo.city}</span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {popupInfo.displayedMinutes} perccel ezelőtt
          </div>
        </div>
      </div>
    </motion.div>
  )
}