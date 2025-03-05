'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertCircle, Check, ShoppingBag, ArrowLeft, Info } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/lib/CartContext'

export interface CartItem {
  product: {
    _id: string;
    name: string;
    mainImage: string;
    price: number;
    salePrice?: number;
  };
  size: string;
  quantity: number;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  county: string;
  notes: string;
  sameAsBilling: boolean;
  billingFirstName: string;
  billingLastName: string;
  billingAddress: string;
  billingCity: string;
  billingPostalCode: string;
  billingCountry: string;
  billingCounty: string;
  shippingType: 'standard' | 'express';
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

const UtanvetPage = () => {
  const { cartItems, clearCart } = useCart()
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (cartItems.length === 0 && !success) {
      router.push('/')
    }
  }, [cartItems, router, success])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

  const calculateTotal = () => {
    const subtotal = cartItems.reduce(
      (total, item) => total + (item.product.salePrice || item.product.price) * item.quantity,
      0
    )
    
    const freeShippingThreshold = 30000
    const isStandardShippingFree = subtotal >= freeShippingThreshold
    const standardShippingCost = isStandardShippingFree ? 0 : 1490
    const expressShippingCost = 2990
    
    const shippingCost = formData.shippingType === 'standard' 
      ? standardShippingCost 
      : expressShippingCost
    
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

  const validateForm = () => {
    const requiredFields = [
      'firstName', 'lastName', 'email', 'phone', 'address', 'city', 'postalCode'
    ]
    
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
        'billingFirstName', 'billingLastName', 'billingAddress', 'billingCity', 'billingPostalCode'
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
      const { total, cashOnDeliveryFee, isStandardShippingFree } = calculateTotal()
      
      const billingDetails = formData.sameAsBilling
        ? {
            name: `${formData.firstName} ${formData.lastName}`,
            address: {
              line1: formData.address,
              city: formData.city,
              postal_code: formData.postalCode,
              country: formData.country,
              state: formData.county
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
              state: formData.billingCounty
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
          state: formData.county
        },
        phone: formData.phone
      }
      
      const compactCartItems = cartItems.map(item => ({
        n: item.product.name,
        s: item.size,
        q: item.quantity,
        p: item.product.salePrice || item.product.price
      }))
      
      const shippingTypeName = formData.shippingType === 'standard'
        ? (isStandardShippingFree ? 'Free Standard Shipping' : 'Standard Shipping')
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
          amount: total,
          currency: 'huf',
          notes: formData.notes,
          shippingType: shippingTypeName,
          cashOnDeliveryFee,
          email: formData.email
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Sikertelen rendelés, kérjük próbálja újra.')
      }
      
      clearCart()
      setSuccess(true)
      setFormData(initialFormData)
      
    } catch (err) {
      console.error('Order submission failed:', err)
      setError(err instanceof Error ? err.message : 'Sikertelen rendelés, kérjük próbálja újra.')
    } finally {
      setIsLoading(false)
    }
  }

  const SuccessModal = () => (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full shadow-xl text-white">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-green-100/20 rounded-full mx-auto flex items-center justify-center">
            <Check className="h-8 w-8 text-green-400" />
          </div>
          <h2 className="text-2xl font-bold">Köszönjük a rendelését!</h2>
          <p className="text-gray-200">
            A rendelését sikeresen rögzítettük. Hamarosan e-mailben értesítjük a szállítás részleteiről.
          </p>
          <p className="text-sm text-gray-300">
            Az utánvétes fizetést a futárnál kell teljesítenie a csomag átvételekor.
          </p>
          <div className="flex gap-4 mt-6">
            <Button
              onClick={() => setSuccess(false)}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white"
            >
              Rendelés részletei
            </Button>
            <Button 
              asChild
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              <Link href="/">Főoldal</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )

  const { subtotal, standardShippingCost, expressShippingCost, isStandardShippingFree, shippingCost, cashOnDeliveryFee, total } = calculateTotal()

  return (
    <div className="max-w-7xl mx-auto pt-[4rem] pb-[8rem] px-4 relative">
      {success && <SuccessModal />}

      <Link href="/#products" className="inline-flex items-center text-sm font-medium mb-6 hover:underline">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Vissza a vásárláshoz
      </Link>
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-7">
          <h1 className="text-2xl font-bold mb-6">Készpénzes fizetés</h1>
          
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-medium mb-4">Szállítási adatok</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Keresztnév*</Label>
                    <Input 
                      id="firstName" 
                      name="firstName" 
                      value={formData.firstName} 
                      onChange={handleInputChange} 
                      required 
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Vezetéknév*</Label>
                    <Input 
                      id="lastName" 
                      name="lastName" 
                      value={formData.lastName} 
                      onChange={handleInputChange} 
                      required 
                    />
                  </div>
                </div>
                
                <div className="mt-4">
                  <Label htmlFor="email">Email cím*</Label>
                  <Input 
                    id="email" 
                    name="email" 
                    type="email" 
                    value={formData.email} 
                    onChange={handleInputChange} 
                    required 
                  />
                </div>
                
                <div className="mt-4">
                  <Label htmlFor="phone">Telefonszám*</Label>
                  <Input 
                    id="phone" 
                    name="phone" 
                    value={formData.phone} 
                    onChange={handleInputChange} 
                    required 
                  />
                </div>
                
                <div className="mt-4">
                  <Label htmlFor="address">Cím*</Label>
                  <Input 
                    id="address" 
                    name="address" 
                    value={formData.address} 
                    onChange={handleInputChange} 
                    required 
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label htmlFor="city">Város*</Label>
                    <Input 
                      id="city" 
                      name="city" 
                      value={formData.city} 
                      onChange={handleInputChange} 
                      required 
                    />
                  </div>
                  <div>
                    <Label htmlFor="postalCode">Irányítószám*</Label>
                    <Input 
                      id="postalCode" 
                      name="postalCode" 
                      value={formData.postalCode} 
                      onChange={handleInputChange} 
                      required 
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label htmlFor="country">Ország*</Label>
                    <Select 
                      value="HU" 
                      onValueChange={(value) => handleSelectChange('country', value)}
                      disabled
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Válasszon országot">Magyarország</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="HU">Magyarország</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="county">Megye</Label>
                    <Input 
                      id="county" 
                      name="county" 
                      value={formData.county} 
                      onChange={handleInputChange} 
                    />
                  </div>
                </div>
                
                <div className="mt-4">
                  <Label htmlFor="notes">Megjegyzés a rendeléshez</Label>
                  <Input 
                    id="notes" 
                    name="notes" 
                    value={formData.notes} 
                    onChange={handleInputChange} 
                  />
                </div>
              </div>
              
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
                        <Label htmlFor="billingFirstName">Keresztnév*</Label>
                        <Input 
                          id="billingFirstName" 
                          name="billingFirstName" 
                          value={formData.billingFirstName} 
                          onChange={handleInputChange} 
                          required={!formData.sameAsBilling} 
                        />
                      </div>
                      <div>
                        <Label htmlFor="billingLastName">Vezetéknév*</Label>
                        <Input 
                          id="billingLastName" 
                          name="billingLastName" 
                          value={formData.billingLastName} 
                          onChange={handleInputChange} 
                          required={!formData.sameAsBilling} 
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="billingAddress">Cím*</Label>
                      <Input 
                        id="billingAddress" 
                        name="billingAddress" 
                        value={formData.billingAddress} 
                        onChange={handleInputChange} 
                        required={!formData.sameAsBilling} 
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="billingCity">Város*</Label>
                        <Input 
                          id="billingCity" 
                          name="billingCity" 
                          value={formData.billingCity} 
                          onChange={handleInputChange} 
                          required={!formData.sameAsBilling} 
                        />
                      </div>
                      <div>
                        <Label htmlFor="billingPostalCode">Irányítószám*</Label>
                        <Input 
                          id="billingPostalCode" 
                          name="billingPostalCode" 
                          value={formData.billingPostalCode} 
                          onChange={handleInputChange} 
                          required={!formData.sameAsBilling} 
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="billingCountry">Ország*</Label>
                        <Select 
                          value="HU" 
                          onValueChange={(value) => handleSelectChange('billingCountry', value)}
                          disabled
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Válasszon országot">Magyarország</SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="HU">Magyarország</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="billingCounty">Megye</Label>
                        <Input 
                          id="billingCounty" 
                          name="billingCounty" 
                          value={formData.billingCounty} 
                          onChange={handleInputChange} 
                        />
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
                    <div key={`${item.product._id}-${item.size}-${index}`} className="flex items-center py-2">
                      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                        <Image
                          src={`/uploads/${item.product.mainImage}`}
                          alt={item.product.name}
                          width={64}
                          height={64}
                          className="h-full w-full object-cover object-center"
                        />
                      </div>
                      <div className="ml-4 flex flex-1 flex-col">
                        <div>
                          <div className="flex justify-between text-base font-medium text-gray-900">
                            <h3>{item.product.name}</h3>
                            <p className="ml-4">
                              {((item.product.salePrice || item.product.price) * item.quantity)
                                .toFixed(0)
                                .replace(/\B(?=(\d{3})+(?!\d))/g, " ")} Ft
                            </p>
                          </div>
                          <p className="mt-0 text-sm text-gray-500">Carelline</p>
                        </div>
                        <div className="flex flex-1 items-end justify-between text-sm">
                          <p className="text-gray-500">Mennyiség: {item.quantity}</p>
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
                            {isStandardShippingFree && (
                              <span className="text-green-600 ml-2">(Ingyenes)</span>
                            )}
                          </label>
                        </div>
                        <p className="text-sm font-medium text-gray-900">
                          {isStandardShippingFree ? "Ingyenes" : `${standardShippingCost.toFixed(0)
                            .replace(/\B(?=(\d{3})+(?!\d))/g, " ")} Ft`}
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
                          {expressShippingCost.toFixed(0)
                            .replace(/\B(?=(\d{3})+(?!\d))/g, " ")} Ft
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between text-sm">
                      <p>Részösszeg</p>
                      <p>{subtotal.toFixed(0)
                        .replace(/\B(?=(\d{3})+(?!\d))/g, " ")} Ft</p>
                    </div>
                    <div className="flex justify-between text-sm mt-2">
                      <p>Szállítási díj</p>
                      <p>
                        {shippingCost === 0 
                          ? "Ingyenes" 
                          : `${shippingCost.toFixed(0)
                            .replace(/\B(?=(\d{3})+(?!\d))/g, " ")} Ft`}
                      </p>
                    </div>
                    <div className="flex justify-between text-sm mt-2">
                      <p>Utánvét díja</p>
                      <p>{cashOnDeliveryFee.toFixed(0)
                        .replace(/\B(?=(\d{3})+(?!\d))/g, " ")} Ft</p>
                    </div>
                    <div className="flex justify-between text-base font-medium mt-4">
                      <p>Összesen</p>
                      <p>{total.toFixed(0)
                        .replace(/\B(?=(\d{3})+(?!\d))/g, " ")} Ft</p>
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
                      A "Rendelés Leadása" gomb megnyomásával elfogadom az ÁSZF-t és tudomásul veszem a fizetési kötelezettségemet.
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4">
                    <div className="rounded-md bg-blue-50 p-4">
                      <div className="flex items-center">
                        <Info className="h-10 w-10 text-blue-700" />
                        <div className="ml-3">
                          <div className="text-sm text-blue-700">
                            <p>
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
    </div>
  )
}

export default UtanvetPage
