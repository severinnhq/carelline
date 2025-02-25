'use client'

import { useRouter } from 'next/navigation'
import { XCircle } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function CancelPage() {
  const router = useRouter()

  return (
    <div className="container mx-auto p-4 h-screen flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <XCircle className="w-16 h-16 text-red-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Rendelés törölve</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center mb-4">
            Sajnáljuk, hogy elállt a rendelésétől. Ha problémát tapasztal a rendelés leadásakor, vagy kérdései vannak, kérjük, vegye fel a kapcsolatot ügyfélszolgálatunkkal.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center gap-4">
          <Button onClick={() => router.push('/')} variant="outline" className="w-full">
            Vissza a kezdőlapra
          </Button>
         
        </CardFooter>
      </Card>
    </div>
  )
}
