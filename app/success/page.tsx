'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function SuccessPage() {
  const router = useRouter()

  useEffect(() => {
    // Clear the cart
    localStorage.removeItem('cartItems')
  }, [])

  return (
    <div className="container mx-auto p-4 h-screen flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Sikeres rendelés!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center mb-4">
          Rendelésed sikeresen rögzítésre került. Amint feladjuk a terméket/termékeket, küldünk egy e-mailt a szállítási információkkal kapcsolatban.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={() => router.push('/')} variant="outline" className="w-full">
          Vissza a kezdőlapra
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

