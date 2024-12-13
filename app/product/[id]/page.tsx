'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCart } from '@/lib/CartContext'
import { WhiteHeader } from '@/components/WhiteHeader';
import Sidebar from '@/components/Sidebar'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { ChevronDown } from 'lucide-react'
import { ShippingFeatures } from '@/components/ShippingFeatures'
import { FloatingProductBox } from '@/components/FloatingProductBox'
import RecommendedProducts from '@/components/RecommendedProducts';
import { BellIcon } from 'lucide-react'

interface Product {
  _id: string
  name: string
  description: string
  price: number
  salePrice?: number
  mainImage: string
  category: string
  sizes: string[]
  galleryImages: string[]
}

export default function ProductPage() {
  const [product, setProduct] = useState<Product | null>(null)
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [quantity, setQuantity] = useState(1)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string>('')
  const { id } = useParams()
  const { cartItems, addToCart, removeFromCart, updateQuantity } = useCart()
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false)
  const [isPaymentShippingOpen, setIsPaymentShippingOpen] = useState(false)
  const [showFloatingBox, setShowFloatingBox] = useState(false);
  const productRef = useRef<HTMLDivElement>(null);
  const [activeEmailInput, setActiveEmailInput] = useState<boolean>(false)
  const [notifyMessage, setNotifyMessage] = useState<{ type: 'success' | 'error', content: string } | null>(null)

  useEffect(() => {
    async function fetchProduct() {
      const response = await fetch(`/api/products/${id}`)
      if (response.ok) {
        const data = await response.json()
        setProduct(data)
        setSelectedImage(data.mainImage)
        // Set the default selected size
        if (data.sizes.includes('One Size')) {
          setSelectedSize('One Size')
        } else if (data.sizes.length > 0) {
          setSelectedSize(data.sizes[0])
        }
      }
    }
    if (id) {
      fetchProduct()
    }
  }, [id])

  useEffect(() => {
    const handleScroll = () => {
      if (productRef.current) {
        const rect = productRef.current.getBoundingClientRect();
        const isMobile = window.innerWidth < 768;
        setShowFloatingBox(isMobile ? rect.top < -600 : rect.top < -100);
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  const handleAddToCart = () => {
    if (product && selectedSize) {
      addToCart(product, selectedSize, quantity)
      setIsSidebarOpen(true)
    }
  }

  const handleSizeSelect = (size: string) => {
    setSelectedSize(size)
  }

  const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const emailInput = e.currentTarget.elements.namedItem('email') as HTMLInputElement
    const email = emailInput.value
    try {
      const response = await fetch('/api/notify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, productId: product?._id ?? '', productName: product?.name ?? 'Unknown Product' }),
      })
      if (response.ok) {
        setNotifyMessage({ type: 'success', content: 'You\'ll be notified when in stock.' })
        emailInput.value = '' // Clear the input
      } else {
        setNotifyMessage({ type: 'error', content: 'Already subscribed or error occurred.' })
      }
    } catch (error) {
      console.error('Error saving email:', error)
      setNotifyMessage({ type: 'error', content: 'An error occurred. Please try again.' })
    }
  }

  if (!product) {
    return <div>Loading...</div>
  }

  const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
  const isProductAvailable = product.sizes.length > 0

  return (
    <>
      <WhiteHeader onCartClick={() => setIsSidebarOpen(true)} cartItems={cartItems} />
      <div className="container mx-auto px-4 py-24" ref={productRef}>
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-3/5">
            <div className="mb-6">
              <Image
                src={`/uploads/${selectedImage}`}
                alt={product.name}
                width={800}
                height={800}
                quality={90}
                className="w-full h-auto object-cover rounded-lg max-w-2xl mx-auto"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto">
              <Image
                src={`/uploads/${product.mainImage}`}
                alt={product.name}
                width={160}
                height={160}
                quality={80}
                className={`w-20 h-20 object-cover rounded-md cursor-pointer ${
                  selectedImage === product.mainImage ? 'border-2 border-blue-500' : ''
                }`}
                onClick={() => setSelectedImage(product.mainImage)}
              />
              {product.galleryImages.map((image, index) => (
                <Image
                  key={index}
                  src={`/uploads/${image}`}
                  alt={`${product.name} - Gallery ${index + 1}`}
                  width={160}
                  height={160}
                  quality={80}
                  className={`w-20 h-20 object-cover rounded-md cursor-pointer ${
                    selectedImage === image ? 'border-2 border-blue-500' : ''
                  }`}
                  onClick={() => setSelectedImage(image)}
                />
              ))}
            </div>
          </div>
          <div className="lg:w-2/5">
            <h1 className="text-5xl font-bold mb-2">{product.name}</h1>
            <div className="mb-4">
              {product.salePrice ? (
                <div>
                  <span className="text-2xl font-bold text-red-600 mr-2">€{product.salePrice.toFixed(2)}</span>
                  <span className="text-lg text-gray-500 line-through">€{product.price.toFixed(2)}</span>
                </div>
              ) : (
                <span className="text-2xl font-bold">€{product.price.toFixed(2)}</span>
              )}
            </div>
            <hr className="border-t border-gray-300 my-4 w-1/2" />
            {isProductAvailable ? (
              <>
                <div className="mb-4">
                  <h2 className="text-lg font-semibold mb-2">Select Size:</h2>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.includes('One Size') ? (
                      <Button
                        variant="outline"
                        className="border-2 border-black text-black"
                      >
                        One Size
                      </Button>
                    ) : (
                      availableSizes.map((size) => (
                        <Button
                          key={size}
                          variant={selectedSize === size ? 'outline' : 'ghost'}
                          onClick={() => handleSizeSelect(size)}
                          className={`border ${
                            selectedSize === size
                              ? 'border-black border-2 text-black'
                              : 'border-gray-300 text-gray-700'
                          } ${
                            !product.sizes.includes(size) && 'opacity-50 cursor-not-allowed'
                          }`}
                          disabled={!product.sizes.includes(size)}
                        >
                          {size}
                        </Button>
                      ))
                    )}
                  </div>
                </div>
                <div className="mb-4">
                  <h2 className="text-lg font-semibold mb-2">Quantity:</h2>
                  <div className="flex items-center">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="h-10 w-10 text-lg"
                    >
                      -
                    </Button>
                    <span className="mx-4 text-xl font-semibold">{quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(quantity + 1)}
                      className="h-10 w-10 text-lg"
                    >
                      +
                    </Button>
                  </div>
                </div>
                <div className="mb-4">
                  <Button
                    onClick={handleAddToCart}
                    className="w-full py-6 text-xl font-bold bg-black text-white hover:bg-gray-800"
                  >
                    Add to Cart
                  </Button>
                </div>
              </>
            ) : (
              <div className="mb-4">
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-white text-black hover:bg-gray-100 shadow-[0_0_10px_rgba(0,0,0,0.3)] group"
                  onClick={() => setActiveEmailInput(true)}
                >
                  <BellIcon className="h-4 w-4 mr-1 animate-ring" />
                  Notify Me
                </Button>
                {activeEmailInput && (
                  <div className="mt-4">
                    <form onSubmit={handleEmailSubmit} className="flex flex-col space-y-2">
                      <Input
                        type="email"
                        name="email"
                        placeholder="Enter your email"
                        className="text-sm flex-grow"
                        required
                      />
                      <Button type="submit" size="sm" className="whitespace-nowrap bg-black text-white hover:bg-gray-800">
                        Notify
                      </Button>
                    </form>
                    {notifyMessage && (
                      <div 
                        className={`mt-2 p-2 rounded-md text-sm font-medium ${
                          notifyMessage.type === 'success' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {notifyMessage.content}
                      </div>
                    )}
                  </div>
                )}
                <p className="text-red-500 font-semibold mt-4">This product is currently sold out.</p>
              </div>
            )}
            <div className="mt-6 space-y-4">
              <Collapsible
                open={isDescriptionOpen}
                onOpenChange={setIsDescriptionOpen}
                className="border-t border-b"
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex w-full justify-between py-6 transition-all duration-300 ease-in-out"
                  >
                    <span>Description</span>
                    <motion.div
                      initial={false}
                      animate={{ rotate: isDescriptionOpen ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </motion.div>
                  </Button>
                </CollapsibleTrigger>
                <AnimatePresence initial={false}>
                  {isDescriptionOpen && (
                    <CollapsibleContent forceMount asChild>
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                      >
                        <div className="py-4 overflow-hidden">
                          <motion.p
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -10, opacity: 0 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            className="text-gray-600"
                          >
                            {product.description}
                          </motion.p>
                        </div>
                      </motion.div>
                    </CollapsibleContent>
                  )}
                </AnimatePresence>
              </Collapsible>
              
              <Collapsible
                open={isPaymentShippingOpen}
                onOpenChange={setIsPaymentShippingOpen}
                className="border-t border-b"
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex w-full justify-between py-6 transition-all duration-300 ease-in-out"
                  >
                    <span>Payment & Shipping</span>
                    <motion.div
                      initial={false}
                      animate={{ rotate: isPaymentShippingOpen ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </motion.div>
                  </Button>
                </CollapsibleTrigger>
                <AnimatePresence initial={false}>
                  {isPaymentShippingOpen && (
                    <CollapsibleContent forceMount asChild>
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                      >
                        <div className="py-4 overflow-hidden">
                          <motion.div
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -10, opacity: 0 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            className="text-gray-600 space-y-4"
                          >
                            <h3 className="font-semibold">Payment Options:</h3>
                            <p>We accept all major credit cards (Visa, MasterCard, American Express, Discover) through our secure payment processor, Stripe. Apple Pay and Google Pay are also available on supported devices for a seamless checkout experience.</p>
                            
                            <h3 className="font-semibold mt-4">Shipping Information:</h3>
                            <p>We take great care in packing your items to ensure they arrive safely. Our standard shipping typically takes 5-7 business days to reach you.</p>
                          </motion.div>
                        </div>
                      </motion.div>
                    </CollapsibleContent>
                  )}
                </AnimatePresence>
              </Collapsible>
            </div>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {showFloatingBox && product && isProductAvailable && (
          <FloatingProductBox
            product={product}
            selectedSize={selectedSize}
            quantity={quantity}
            onAddToCart={handleAddToCart}
          />
        )}
      </AnimatePresence>
      <Sidebar
        isOpen={isSidebarOpen}
        cartItems={cartItems}
        onClose={() => setIsSidebarOpen(false)}
        onRemoveItem={removeFromCart}
        onUpdateQuantity={updateQuantity}
      />
      <ShippingFeatures />
      <RecommendedProducts />
    </>
  )
}