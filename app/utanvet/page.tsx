'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertCircle, ShoppingBag, ArrowLeft, Info } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/lib/CartContext'
import { motion } from 'framer-motion'

export interface CartItem {
  product: {
    _id: string
    name: string
    mainImage: string
    price: number
    salePrice?: number
  }
  size: string
  quantity: number
  characterName?: string
  selectedImage?: string
}


interface FormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  postalCode: string
  country: string
  county: string
  notes: string
  sameAsBilling: boolean
  billingFirstName: string
  billingLastName: string
  billingAddress: string
  billingCity: string
  billingPostalCode: string
  billingCountry: string
  billingCounty: string
  shippingType: 'standard' | 'express'
}

const initialFormData: FormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  postalCode: '',
  country: 'HU',
  county: '',
  notes: '',
  sameAsBilling: true,
  billingFirstName: '',
  billingLastName: '',
  billingAddress: '',
  billingCity: '',
  billingPostalCode: '',
  billingCountry: 'HU',
  billingCounty: '',
  shippingType: 'standard'
}

interface OrderSummary {
  orderId: string
  orderNumber: string
  cartItems: CartItem[]
  formData: FormData
  totals: ReturnType<typeof calculateTotal>
}

function calculateTotal(cartItems: CartItem[], shippingType: 'standard' | 'express') {
  const subtotal = cartItems.reduce(
    (total, item) =>
      total + (item.product.salePrice || item.product.price) * item.quantity,
    0
  )

  const freeShippingThreshold = 30000
  const isStandardShippingFree = subtotal >= freeShippingThreshold
  const standardShippingCost = isStandardShippingFree ? 0 : 1990
  const expressShippingCost = 3990

  const shippingCost =
    shippingType === 'standard' ? standardShippingCost : expressShippingCost

  const cashOnDeliveryFee = 590

  const total = subtotal + shippingCost + cashOnDeliveryFee

  return {
    subtotal,
    standardShippingCost,
    expressShippingCost,
    isStandardShippingFree,
    shippingCost,
    cashOnDeliveryFee,
    total
  }
}

const UtanvetPage = () => {
  const { cartItems, clearCart } = useCart()
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [orderSummary, setOrderSummary] = useState<OrderSummary | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (cartItems.length === 0 && !orderSummary) {
      router.push('/')
    }
  }, [cartItems, router, orderSummary])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleShippingChange = (type: 'standard' | 'express') => {
    setFormData((prev) => ({ ...prev, shippingType: type }))
  }

  const validateForm = () => {
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'postalCode']
    for (const field of requiredFields) {
      if (!formData[field as keyof FormData]) {
        setError(`Kérjük töltse ki a csillaggal jelölt mezőket!`)
        return false
      }
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('Kérjük, adjon meg egy érvényes email címet')
      return false
    }
    const phoneRegex = /^[0-9+\-\s]{6,15}$/
    if (!phoneRegex.test(formData.phone)) {
      setError('Kérjük, adjon meg egy érvényes telefonszámot')
      return false
    }
    if (formData.country === 'HU' && !/^\d{4}$/.test(formData.postalCode)) {
      setError('Kérjük, adjon meg egy érvényes irányítószámot (4 számjegy)')
      return false
    }
    if (!formData.sameAsBilling) {
      const requiredBillingFields = [
        'billingFirstName',
        'billingLastName',
        'billingAddress',
        'billingCity',
        'billingPostalCode'
      ]
      for (const field of requiredBillingFields) {
        if (!formData[field as keyof FormData]) {
          setError(`Kérjük, töltse ki a(z) ${field} mezőt`)
          return false
        }
      }
      if (formData.billingCountry === 'HU' && !/^\d{4}$/.test(formData.billingPostalCode)) {
        setError('Kérjük, adjon meg egy érvényes számlázási irányítószámot (4 számjegy)')
        return false
      }
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!validateForm()) {
      return
    }

    if (cartItems.length === 0) {
      setError('A kosár üres')
      return
    }

    setIsLoading(true)

    try {
      const totals = calculateTotal(cartItems, formData.shippingType)
      // Prepare shipping and billing details as required by your API
      const billingDetails = formData.sameAsBilling
        ? {
            name: `${formData.firstName} ${formData.lastName}`,
            address: {
              line1: formData.address,
              city: formData.city,
              postal_code: formData.postalCode,
              country: formData.country,
              state: "nostate"
            },
            email: formData.email,
            phone: formData.phone
          }
        : {
            name: `${formData.billingFirstName} ${formData.billingLastName}`,
            address: {
              line1: formData.billingAddress,
              city: formData.billingCity,
              postal_code: formData.billingPostalCode,
              country: formData.billingCountry,
              state: "nostate"
            },
            email: formData.email,
            phone: formData.phone
          }

      const shippingDetails = {
        name: `${formData.firstName} ${formData.lastName}`,
        address: {
          line1: formData.address,
          city: formData.city,
          postal_code: formData.postalCode,
          country: formData.country,
          state: "nostate"
        },
        phone: formData.phone
      }

      const compactCartItems = cartItems.map((item) => ({
        n: item.product.name,
        s: item.size,
        q: item.quantity,
        p: item.product.salePrice || item.product.price
      }))

      const shippingTypeName =
        formData.shippingType === 'standard'
          ? totals.isStandardShippingFree
            ? 'Free Standard Shipping'
            : 'Standard Shipping'
          : 'Express Shipping'

      const response = await fetch('/api/utanvet-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          items: compactCartItems,
          shippingDetails,
          billingDetails,
          amount: totals.total,
          currency: 'huf',
          notes: formData.notes,
          shippingType: shippingTypeName,
          cashOnDeliveryFee: totals.cashOnDeliveryFee,
          email: formData.email
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Sikertelen rendelés, kérjük próbálja újra.')
      }

      // Capture order details from API response along with current form/cart data
      const data = await response.json()
      setOrderSummary({
        orderId: data.orderId,
        orderNumber: data.orderNumber,
        cartItems: [...cartItems],
        formData,
        totals
      })

      // Clear cart after submission
      clearCart()
      setIsModalOpen(true)
    } catch (err) {
      console.error('Order submission failed:', err)
      setError(err instanceof Error ? err.message : 'Sikertelen rendelés, kérjük próbálja újra.')
      setIsLoading(false)
    }
  }

  const totals = calculateTotal(cartItems, formData.shippingType)

  return (
    <div className="max-w-7xl mx-auto pt-[4rem] pb-[8rem] px-4 relative">
      <Link href="/#products" className="inline-flex items-center text-sm font-medium mb-6 hover:underline">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Vissza a vásárláshoz
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-7">
          <h1 className="text-2xl font-bold mb-6">Készpénzes fizetés</h1>

          {error && (
            <div className="mb-6">
              <AlertCircle className="inline-block h-5 w-5 text-red-600 mr-2" />
              <span className="text-red-600 text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Shipping Details */}
              <div>
                <h2 className="text-lg font-medium mb-4">Szállítási adatok</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Vezetéknév*</Label>
                    <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleInputChange} required />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Keresztnév*</Label>
                    <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleInputChange} required />
                  </div>
                </div>

                <div className="mt-4">
                  <Label htmlFor="email">Email cím*</Label>
                  <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} required />
                </div>

                <div className="mt-4">
                  <Label htmlFor="phone">Telefonszám*</Label>
                  <Input id="phone" name="phone" value={formData.phone} onChange={handleInputChange} required />
                </div>

                <div className="mt-4">
                  <Label htmlFor="address">Cím*</Label>
                  <Input id="address" name="address" value={formData.address} onChange={handleInputChange} required />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label htmlFor="city">Város*</Label>
                    <Input id="city" name="city" value={formData.city} onChange={handleInputChange} required />
                  </div>
                  <div>
                    <Label htmlFor="postalCode">Irányítószám*</Label>
                    <Input id="postalCode" name="postalCode" value={formData.postalCode} onChange={handleInputChange} required />
                  </div>
                </div>

                <div className="mt-4">
                  <div>
                    <Label htmlFor="country">Ország*</Label>
                    <Select value="HU" onValueChange={(value) => handleSelectChange('country', value)} disabled>
                      <SelectTrigger>
                        <SelectValue placeholder="Válasszon országot">Magyarország</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="HU">Magyarország</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="mt-4">
                  <Label htmlFor="notes">Megjegyzés a rendeléshez</Label>
                  <Input id="notes" name="notes" value={formData.notes} onChange={handleInputChange} />
                </div>
              </div>

              {/* Billing Details */}
              <div>
                <h2 className="text-lg font-medium mb-4">Számlázási adatok</h2>
                <div className="flex items-center space-x-2 mb-4">
                  <input
                    type="checkbox"
                    id="sameAsBilling"
                    name="sameAsBilling"
                    checked={formData.sameAsBilling}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="sameAsBilling">A számlázási cím megegyezik a szállítási címmel</Label>
                </div>

                {!formData.sameAsBilling && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="billingFirstName">Vezetéknév*</Label>
                        <Input id="billingFirstName" name="billingFirstName" value={formData.billingFirstName} onChange={handleInputChange} required={!formData.sameAsBilling} />
                      </div>
                      <div>
                        <Label htmlFor="billingLastName">Keresztnév*</Label>
                        <Input id="billingLastName" name="billingLastName" value={formData.billingLastName} onChange={handleInputChange} required={!formData.sameAsBilling} />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="billingAddress">Cím*</Label>
                      <Input id="billingAddress" name="billingAddress" value={formData.billingAddress} onChange={handleInputChange} required={!formData.sameAsBilling} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="billingCity">Város*</Label>
                        <Input id="billingCity" name="billingCity" value={formData.billingCity} onChange={handleInputChange} required={!formData.sameAsBilling} />
                      </div>
                      <div>
                        <Label htmlFor="billingPostalCode">Irányítószám*</Label>
                        <Input id="billingPostalCode" name="billingPostalCode" value={formData.billingPostalCode} onChange={handleInputChange} required={!formData.sameAsBilling} />
                      </div>
                    </div>

                    <div className="mt-4">
                      <div>
                        <Label htmlFor="billingCountry">Ország*</Label>
                        <Select value="HU" onValueChange={(value) => handleSelectChange('billingCountry', value)} disabled>
                          <SelectTrigger>
                            <SelectValue placeholder="Válasszon országot">Magyarország</SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="HU">Magyarország</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>

        <div className="md:col-span-5">
          <Card>
            <CardHeader>
              <CardTitle>Rendelés összegzése</CardTitle>
            </CardHeader>
            <CardContent>
              {cartItems.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-base font-semibold text-gray-900">A kosara üres</h3>
                </div>
              ) : (
                <div className="space-y-4">
                {cartItems.map((item, index) => (
  <div key={`${item.product._id}-${item.size}-${item.characterName ?? 'nochar'}-${index}`} className="flex items-center py-2">
    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
      <Image
        src={`/uploads/${item.selectedImage ?? item.product.mainImage}`}
        alt={item.product.name}
        width={64}
        height={64}
        className="h-full w-full object-cover object-center"
      />
    </div>
    <div className="ml-4 flex flex-1 flex-col">
      <div className="ml-4 flex flex-1 flex-col">
  <h3 className="text-base font-medium text-gray-900">{item.product.name}</h3>
  {item.characterName && (
    <p className="text-sm text-gray-500">Karakter: {item.characterName}</p>
  )}
  <p className="mt-0 text-sm text-gray-500">Mennyiség: {item.quantity}</p>
</div>

   
    </div>
  </div>
))}


                  <div className="border-t border-gray-200 pt-4">
                    <h3 className="text-base font-semibold mb-3">Szállítás</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <input
                            id="standard-shipping"
                            name="shipping-option"
                            type="radio"
                            checked={formData.shippingType === 'standard'}
                            onChange={() => handleShippingChange('standard')}
                            className="h-4 w-4 border-gray-300"
                          />
                          <label htmlFor="standard-shipping" className="ml-3 block text-sm font-medium text-gray-700">
                            Standard szállítás
                          </label>
                        </div>
                        <p className="text-sm font-medium text-gray-900">
                          {totals.isStandardShippingFree
                            ? 'Ingyenes'
                            : `${totals.standardShippingCost.toFixed(0)
                                .replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} Ft`}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <input
                            id="express-shipping"
                            name="shipping-option"
                            type="radio"
                            checked={formData.shippingType === 'express'}
                            onChange={() => handleShippingChange('express')}
                            className="h-4 w-4 border-gray-300"
                          />
                          <label htmlFor="express-shipping" className="ml-3 block text-sm font-medium text-gray-700">
                            Express szállítás
                          </label>
                        </div>
                        <p className="text-sm font-medium text-gray-900">
                          {totals.expressShippingCost.toFixed(0)
                            .replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} Ft
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between text-sm">
                      <p>Részösszeg</p>
                      <p>{totals.subtotal.toFixed(0)
                          .replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} Ft</p>
                    </div>
                    <div className="flex justify-between text-sm mt-2">
                      <p>Szállítási díj</p>
                      <p>
                        {totals.shippingCost === 0
                          ? 'Ingyenes'
                          : `${totals.shippingCost.toFixed(0)
                              .replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} Ft`}
                      </p>
                    </div>
                    <div className="flex justify-between text-sm mt-2">
                      <p>Utánvét díja</p>
                      <p>{totals.cashOnDeliveryFee.toFixed(0)
                          .replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} Ft</p>
                    </div>
                    <div className="flex justify-between text-base font-medium mt-4">
                      <p>Összesen</p>
                      <p>{totals.total.toFixed(0)
                          .replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} Ft</p>
                    </div>

                    <div className="mt-4 w-full">
                      <Button
                        type="submit"
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="bg-[#dc2626] hover:bg-[#b91c1c] text-white w-full"
                      >
                        {isLoading ? 'Feldolgozás...' : 'Rendelés leadása'}
                      </Button>
                    </div>

                    <div className="mt-2 text-xs text-gray-600">
                      A "Rendelés leadása" gomb megnyomásával elfogadom az ÁSZF-t és tudomásul veszem a fizetési kötelezettségemet.
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                  <div className="border-t border-gray-200 pt-4">
  <div className="rounded-md bg-blue-50 p-4">
    <div className="flex items-center">
      <Info className="h-6 w-6 md:h-8 md:w-8 text-blue-700 flex-shrink-0" />
      <div className="ml-3">
        <p className="text-sm text-blue-700">
          Az utánvétes fizetés esetén a termék árát és a szállítási költséget a futárnak kell fizetnie a csomag átvételekor. Kérjük, készítsen elő elegendő készpénzt.
        </p>
      </div>
    </div>
  </div>
</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Order Details Modal */}
      {isModalOpen && orderSummary && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-xl shadow-xl p-6 max-w-3xl w-full overflow-auto max-h-[90vh]"
    >
      <div className="text-center mb-6">
        <h2 className="text-3xl font-black">Köszönjük a rendelést!</h2>
      </div>
      <p className="text-2xl font-bold my-2">Rendelés részletek</p>
      <p className="mb-2">
        <strong> Rendelés azonosító:</strong> {orderSummary.orderNumber}
      </p>

      <h3 className="text-2xl font-bold mt-6 mb-3">Termékek</h3>
   {orderSummary.cartItems.map((item, index) => (
  <div key={`${item.product._id}-${item.size}-${item.characterName ?? 'nochar'}-${index}`} className="flex items-center py-3 border-b border-gray-200">
    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
      <Image
        src={`/uploads/${item.selectedImage ?? item.product.mainImage}`}
        alt={item.product.name}
        width={64}
        height={64}
        className="h-full w-full object-cover object-center"
      />
    </div>
   <div className="ml-4 flex-1">
  <p className="font-medium">{item.product.name}</p>
  {item.characterName && (
    <p className="text-sm text-gray-500">Karakter: {item.characterName}</p>
  )}
  <p className="text-sm text-gray-500">Mennyiség: {item.quantity}</p>
  <p className="text-sm text-gray-500">
    Ár: {(item.product.salePrice || item.product.price)
      .toFixed(0)
      .replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} Ft
  </p>
</div>

  </div>
))}



      <h3 className="text-2xl font-bold mt-6 mb-3">Szállítási adatok</h3>
      <div className="mb-4">
        <p>
          <strong>Név:</strong> {orderSummary.formData.firstName} {orderSummary.formData.lastName}
        </p>
        <p>
  <strong>Cím:</strong> {orderSummary.formData.address}, {orderSummary.formData.city},{' '}
  {orderSummary.formData.postalCode}, {orderSummary.formData.country}
</p>
        <p>
          <strong>Telefonszám:</strong> {orderSummary.formData.phone}
        </p>
      </div>

      {!orderSummary.formData.sameAsBilling && (
        <>
          <h3 className="text-xl font-semibold mt-6 mb-3">Számlázási adatok</h3>
          <div className="mb-4">
            <p>
              <strong>Név:</strong> {orderSummary.formData.billingFirstName} {orderSummary.formData.billingLastName}
            </p>
            <p>
  <strong>Cím:</strong> {orderSummary.formData.billingAddress}, {orderSummary.formData.billingCity},{' '}
  {orderSummary.formData.billingPostalCode}, {orderSummary.formData.billingCountry}
</p>
          </div>
        </>
      )}

      <h3 className="text-2xl font-bold mt-6 mb-3">Rendelés összegzése</h3>
      <div className="mb-4">
        <p>
          <strong>Részösszeg:</strong> {orderSummary.totals.subtotal.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} Ft
        </p>
        <p>
          <strong>Szállítási díj:</strong> {orderSummary.totals.shippingCost === 0 ? 'Ingyenes' : orderSummary.totals.shippingCost.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' Ft'}
        </p>
        <p>
          <strong>Utánvét díja:</strong> {orderSummary.totals.cashOnDeliveryFee.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} Ft
        </p>
        <p className="mt-2 text-lg font-bold">
          <strong>Összesen:</strong> {orderSummary.totals.total.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} Ft
        </p>
      </div>

      <div className="flex justify-end mt-6">
        <Button
          onClick={() => {
            setIsModalOpen(false)
            router.push('/')
          }}
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          Vissza a főoldalra
        </Button>
      </div>
    </motion.div>
  </div>
)}
    </div>
  )
}

export default UtanvetPage