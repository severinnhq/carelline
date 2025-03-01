'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCart } from '@/lib/CartContext'
import { WhiteHeader } from '@/components/WhiteHeader'
import Sidebar from '@/components/Sidebar'
import { AnimatePresence } from 'framer-motion'
import { Plus, Truck, RefreshCcw, BellIcon, ShoppingCart, Store, ShieldCheck, Eye } from 'lucide-react'
import { FloatingProductBox } from '@/components/FloatingProductBox'
import RecommendedProducts from '@/components/RecommendedProducts'
import { Sora } from 'next/font/google'
import { Skeleton } from "@/components/ui/skeleton"

const sora = Sora({ subsets: ['latin'] })

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
  inventoryStatus: 'raktáron' | 'rendelésre' | 'elfogyott'
  stockQuantity: number
}

export default function ProductPage() {
  const [product, setProduct] = useState<Product | null>(null)
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [quantity, setQuantity] = useState(1)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string>('')
  const { id } = useParams()
  const { cartItems, addToCart, removeFromCart, updateQuantity } = useCart()
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set())
  const [showFloatingBox, setShowFloatingBox] = useState(false)
  const productRef = useRef<HTMLDivElement>(null)
  const [activeEmailInput, setActiveEmailInput] = useState<boolean>(false)
  const [notifyMessage, setNotifyMessage] = useState<{ type: 'success' | 'error', content: string } | null>(null)
  const [currentViewers, setCurrentViewers] = useState<number>(0)

  useEffect(() => {
    async function fetchProduct() {
      const response = await fetch(`/api/products/${id}`)
      if (response.ok) {
        const data = await response.json()
        setProduct(data)
        setSelectedImage(data.mainImage)
        // Set the default selected size.
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
    // Get random viewers count from localStorage or generate new one
    const getViewersCount = () => {
      const now = new Date().getTime();
      const storedData = localStorage.getItem(`product_viewers_${id}`);
      
      if (storedData) {
        const { count, timestamp } = JSON.parse(storedData);
        // Check if 5 minutes (300000ms) have passed
        if (now - timestamp < 300000) {
          return count;
        }
      }
      
      // Generate new random count between 1 and 10 (never more)
      const newCount = Math.floor(Math.random() * 10) + 1;
      localStorage.setItem(`product_viewers_${id}`, JSON.stringify({
        count: newCount,
        timestamp: now
      }));
      
      return newCount;
    };
    
    setCurrentViewers(getViewersCount());
    
    // Set up a timer to check for expiration (every minute)
    const interval = setInterval(() => {
      const storedData = localStorage.getItem(`product_viewers_${id}`);
      if (storedData) {
        const { timestamp } = JSON.parse(storedData);
        const now = new Date().getTime();
        if (now - timestamp >= 300000) {
          setCurrentViewers(getViewersCount());
        }
      }
    }, 60000);
    
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    const handleScroll = () => {
      if (productRef.current) {
        const rect = productRef.current.getBoundingClientRect()
        const isMobile = window.innerWidth < 768
        setShowFloatingBox(isMobile ? rect.top < -600 : rect.top < -100)
      }
    }

    window.addEventListener('scroll', handleScroll)
    window.addEventListener('resize', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [])

  const handleAddToCart = () => {
    if (product && selectedSize) {
      addToCart(product, selectedSize, quantity)
      setIsSidebarOpen(true)
    }
  }

  const handleSizeSelect = (size: string) => {
    setSelectedSize(size)
  }

  const handleQuantityChange = (newQuantity: number) => {
    if (product && newQuantity >= 1) {
      // Ensure quantity doesn't exceed available stock
      const maxQuantity = product.stockQuantity || 1;
      setQuantity(Math.min(newQuantity, maxQuantity));
    }
  }

  const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const emailInput = e.currentTarget.elements.namedItem('email') as HTMLInputElement
    const email = emailInput.value
    try {
      const response = await fetch('/api/notify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, productId: product?._id ?? '', productName: product?.name ?? 'Unknown Product' })
      })
      if (response.ok) {
        setNotifyMessage({ type: 'success', content: 'Értesítve lesz, amint elérhető.' })
        emailInput.value = ''
      } else {
        setNotifyMessage({ type: 'error', content: 'Már feliratkozott.' })
      }
    } catch (error) {
      console.error('Error saving email:', error)
      setNotifyMessage({ type: 'error', content: 'An error occurred. Please try again.' })
    }
  }

  const toggleItem = (index: number) => {
    setExpandedItems((prevItems) => {
      const newItems = new Set(prevItems)
      if (newItems.has(index)) {
        newItems.delete(index)
      } else {
        newItems.add(index)
      }
      return newItems
    })
  }
  if (!product) {
    return (
      <div className={`${sora.className} min-h-screen flex flex-col`}>
        <Skeleton className="h-16 w-full" />
        <div className="flex-grow container mx-auto px-4 py-24">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-3/5">
              <Skeleton className="w-full aspect-square mb-6" />
              <div className="flex gap-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="w-20 h-20" />
                ))}
              </div>
            </div>
            <div className="lg:w-2/5 space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="space-y-2">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
  const isProductAvailable = product.sizes.length > 0 && product.inventoryStatus !== 'elfogyott'

  const shippingFeaturesContent = (
    <div className="border-t border-gray-200 pt-6 mt-4">
      <div className="grid grid-cols-3 gap-4">
      <div className="flex flex-col items-center text-center">
          <ShieldCheck className="h-7 w-7 text-black mb-2" />
          <h3 className="text-sm font-bold mb-1">Biztonságos fizetés</h3>
          <p className="text-xs text-gray-600">Kártyás fizetés vagy utánvét</p>
        </div>
        <div className="flex flex-col items-center text-center">
          <Truck className="h-7 w-7 text-black mb-2" />
          
          <h3 className="text-sm font-bold mb-1">Ingyenes szállítás</h3>
          <p className="text-xs text-gray-600">30 000 Ft felett ingyenes kiszállítás</p>
        </div>
        
        <div className="flex flex-col items-center text-center">
          <RefreshCcw className="h-7 w-7 text-black mb-2" />
          <h3 className="text-sm font-bold mb-1">14 nap visszaküldés</h3>
          <p className="text-xs text-gray-600">A csomag átvételétől számítva</p>
        </div>
        
        
      </div>
    </div>
  )

  const faqs = [
    {
      question: "Leírás",
      answer: product.description
    },
    {
      question: "Fizetés & Szállítás",
      answer: (
        <div className="space-y-3">
          <div>
            <h5 className="font-medium text-black mb-1 text-sm">Fizetési lehetőségek:</h5>
            <p className="text-sm">
              Minden nagyobb hitelkártyát elfogadunk biztonságos fizetési rendszerünkön keresztül.
            </p>
          </div>
          
          <div>
            <h5 className="font-medium text-black mb-1 text-sm">Szállítási információk:</h5>
            <p className="text-sm">
              A normál szállítás általában 6-10 munkanapot vesz igénybe. Az expressz viszont csak 3-5nap.
            </p>
          </div>
        </div>
      )
    }
  ]

  // Modified availability display component - always green when available
  const StyledAvailabilityStatus = ({ status, quantity }: { status: string, quantity?: number }) => {
    let statusText = '';
    let statusColor = '';
    
    if (status === 'raktáron' || status === 'rendelésre') {
      if (quantity && quantity <= 30) {
        statusText = `Raktáron - Csak ${quantity} db elérhető`;
      } else {
        statusText = `Raktáron - ${quantity} db elérhető`;
      }
      statusColor = 'text-[#15c470]'; // Always green for available products
    } else {
      statusText = 'Elfogyott';
      statusColor = 'text-[#dc2626]';
    }
    
    return (
      <div className="inline-block bg-white border border-gray-200 rounded-md py-1 px-3 shadow-lg">
        <span className={`font-medium text-sm ${statusColor}`}>
          {statusText}
        </span>
      </div>
    );
  };

  return (
    <div className={sora.className}>
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
                className={`w-20 h-20 object-cover rounded-md cursor-pointer ${selectedImage === product.mainImage ? 'border-2 border-blue-500' : ''}`}
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
                  className={`w-20 h-20 object-cover rounded-md cursor-pointer ${selectedImage === image ? 'border-2 border-blue-500' : ''}`}
                  onClick={() => setSelectedImage(image)}
                />
              ))}
            </div>
          </div>
          <div className="lg:w-2/5 pt-6">
            {/* Fixed Carelline text */}
            <div className="text-sm font-medium text-gray-500 mb-2">
              Carelline
            </div>
            
            <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
            <div className="mb-0">
              <div className="flex flex-col w-11/12">
                <div className="flex items-center justify-between">
                  {product.salePrice ? (
                    <div>
                      <span className="text-xl font-bold text-[#dc2626] mr-2">
                        {Math.round(product.salePrice).toLocaleString('hu-HU')} Ft
                      </span>
                      <span className="text-base text-gray-500 font-medium line-through">
                        {Math.round(product.price).toLocaleString('hu-HU')} Ft
                      </span>
                    </div>
                  ) : (
                    <span className="text-xl font-bold">{Math.round(product.price).toLocaleString('hu-HU')} Ft</span>
                  )}
                </div>
                
                <hr className="border-t border-gray-300 my-3 w-full" />
              </div>
            </div>
            
            {isProductAvailable ? (
              <>
                <div className="mb-3">
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.includes('One Size') ? (
                      <></>
                    ) : (
                      availableSizes.map((size) => (
                        <Button
                          key={size}
                          variant={selectedSize === size ? 'outline' : 'ghost'}
                          onClick={() => handleSizeSelect(size)}
                          className={`border text-sm py-1 ${selectedSize === size ? 'border-black border-2 text-black' : 'border-gray-300 text-gray-700'} ${!product.sizes.includes(size) && 'opacity-50 cursor-not-allowed'}`}
                          disabled={!product.sizes.includes(size)}
                        >
                          {size}
                        </Button>
                      ))
                    )}
                  </div>
                </div>
                <div className="mb-6">
  
                <div className="flex flex-col">
  {/* Viewers count with reduced space and adjusted margins */}
  <div className="mt-0 mb-4 flex items-center font-bold text-gray-500 text-sm">
    <Eye className="h-4 w-4 mr-1 text-gray-500 " />
    <span>{currentViewers} ember nézi jelenleg</span>
  </div>

  <div className="flex flex-col xl:flex-row items-start">
  {/* Availability section - now first in mobile view */}
  <div className="mb-4 xl:mb-0 xl:order-2">
    <div className="mb-2">
      <span className="font-medium text-base">Elérhetőség:</span>
    </div>
    <StyledAvailabilityStatus
      status={product.inventoryStatus}
      quantity={product.stockQuantity}
    />
  </div>
  
  {/* Quantity section */}
  <div className="mr-0 xl:mr-20 xl:order-1">
    <div className="mb-2">
      <span className="font-medium text-base">Mennyiség:</span>
    </div>
    <div className="flex items-center">
      <Button
        variant="outline"
        size="icon"
        onClick={() => handleQuantityChange(quantity - 1)}
        className="h-8 w-8 text-sm"
      >
        -
      </Button>
      <span className="mx-3 text-base font-medium">{quantity}</span>
      <Button
        variant="outline"
        size="icon"
        onClick={() => handleQuantityChange(quantity + 1)}
        className={`h-8 w-8 text-sm ${
          quantity >= product.stockQuantity ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        disabled={quantity >= product.stockQuantity}
      >
        +
      </Button>
    </div>
    {quantity >= product.stockQuantity && (
      <p className="text-xs text-[#dc2626] mt-1">Jelenleg nincs több raktáron</p>
    )}
  </div>
</div>
</div>
</div>
                <div className="mb-3 mt-8">
                  <Button
                    onClick={handleAddToCart}
                    className="w-11/12 block py-4 text-base font-bold bg-[#dc2626] text-white flex items-center justify-center"
                  >
                    Kosárba
                  </Button>
                </div>
              </>
            ) : (
              <div className="mb-3">
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
                  <div className="mt-3">
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
                        className={`mt-2 p-2 rounded-md text-sm font-medium ${notifyMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                      >
                        {notifyMessage.content}
                      </div>
                    )}
                  </div>
                )}
                <p className="text-[#dc2626] font-semibold mt-3 text-sm">A termék jelenleg nem elérhető.</p>
              </div>
            )}
            <div className="mt-4 space-y-2 w-11/12">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-white rounded-lg overflow-hidden border border-gray-200">
                  <button
                    onClick={() => toggleItem(index)}
                    className="w-full px-6 py-2 flex justify-between items-center text-left"
                  >
                    <span className="font-medium text-base">{faq.question}</span>
                    <Plus className={`h-4 w-4 transition-transform duration-200 ${expandedItems.has(index) ? 'rotate-45' : ''}`} />
                  </button>
                  <div
                    className={`px-6 transition-all duration-300 ease-in-out overflow-hidden ${
                      expandedItems.has(index)
                        ? 'max-h-[500px] opacity-100 py-3'
                        : 'max-h-0 opacity-0 py-0'
                    }`}
                  >
                    <div className="text-gray-600 text-sm leading-relaxed">
                      {typeof faq.answer === 'string' ? faq.answer : faq.answer}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Shipping features moved here, just below the collapsible sections */}
            {shippingFeaturesContent}
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
      <RecommendedProducts />
    </div>
  )
}