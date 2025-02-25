// SuccessPage.tsx
'use client'

import { motion } from 'framer-motion'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function SuccessPage() {
  const router = useRouter()

  useEffect(() => {
    localStorage.removeItem('cartItems')
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 flex items-center justify-center p-4"
    >
      <Card className="w-full max-w-md shadow-xl rounded-2xl overflow-hidden border-0">
        <CardHeader className="bg-green-50/50 p-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="flex justify-center mb-6"
          >
            <div className="p-4 bg-green-100 rounded-full">
              <CheckCircle className="w-16 h-16 text-green-600" strokeWidth={1.5} />
            </div>
          </motion.div>
          <CardTitle className="text-3xl font-extrabold text-center text-green-900">
            Sikeres rendelés!
          </CardTitle>
        </CardHeader>

        <CardContent className="p-8">
          <p className="text-center text-gray-700 mb-6 leading-relaxed">
            Rendelése sikeresen rögzítésre került. Amint feladjuk a terméket/termékeket, küldünk egy e-mailt a szállítási információkkal kapcsolatban.
          </p>
          
        </CardContent>

        <CardFooter className="p-8 pt-0">
        <Button 
              onClick={() => router.push('/')}
              className="w-full bg-red-600 hover:bg-red-700 text-white h-12 rounded-xl transition-all duration-300"
            >
              Vissza a kezdőlapra
            </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}