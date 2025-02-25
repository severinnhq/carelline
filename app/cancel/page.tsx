'use client'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { XCircle } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function CancelPage() {
  const router = useRouter()
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
            <div className="p-4 bg-red-100 rounded-full">
              <XCircle className="w-16 h-16 text-red-600" strokeWidth={1.5} />
            </div>
          </motion.div>
          <CardTitle className="text-3xl font-extrabold text-center text-green-900">
            Rendelés törölve
          </CardTitle>
        </CardHeader>
       
        <CardContent className="p-8">
          <p className="text-center text-gray-700 mb-6 leading-relaxed">
            Sajnáljuk, hogy elállt a rendelésétől. Ha problémát tapasztal a rendelés leadásakor, vagy kérdései vannak, kérjük, vegye fel a kapcsolatot ügyfélszolgálatunkkal.
          </p>
          <div className="text-center text-sm text-green-700 space-y-1">
            <p>✉️ carelline@outlook.com</p>
          </div>
        </CardContent>
        <CardFooter className="p-8 pt-0">
          <div className="w-full space-y-4">
            <Button
              onClick={() => router.push('/')}
              className="w-full bg-red-600 hover:bg-red-700 text-white h-12 rounded-xl transition-all duration-300"
            >
              Vissza a kezdőlapra
            </Button>
           
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  )
}