'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCart } from '@/lib/CartContext'
import { WhiteHeader } from '@/components/WhiteHeader'
import Sidebar from '@/components/Sidebar'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus, Truck, RefreshCcw, BellIcon, ShieldCheck, Eye } from 'lucide-react'
import { FloatingProductBox } from '@/components/FloatingProductBox'
import RecommendedProducts from '@/components/RecommendedProducts'
import { Sora } from 'next/font/google'
import { Skeleton } from "@/components/ui/skeleton"
import MatrixButton from '@/components/MatrixButton';
import GoogleReviewsSection from '@/components/GoogleReviewsSection';

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
  // State declarations
  const [currentFeatureIndex, setCurrentFeatureIndex] = useState(0);
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

  // For mobile shipping slider container width
  const shippingContainerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  // Define shipping features for both desktop and mobile
  const shippingFeatures = [

    
    {
      icon: <ShieldCheck className="h-10 w-10 text-black mb-3" />,
      title: "Biztonságos fizetés",
      description: "Kártyás fizetés vagy utánvét",
    },
    {
      icon: <Truck className="h-10 w-10 text-black mb-3" />,
      title: "Ingyenes szállítás",
      description: "30 000 Ft felett ingyenes kiszállítás",
    },
    {
      icon: <RefreshCcw className="h-10 w-10 text-black mb-3" />,
      title: "14 nap visszaküldés",
      description: "A csomag átvételétől számítva",
    },
  ];

  // Fetch the product
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

  // Update viewers count
  useEffect(() => {
    const getViewersCount = () => {
      const now = new Date().getTime();
      const storedData = localStorage.getItem(`product_viewers_${id}`);
  
      if (storedData) {
        const { count, timestamp } = JSON.parse(storedData);
        if (now - timestamp < 300000) {
          return count;
        }
      }
  
      const newCount = Math.floor(Math.random() * 9) + 3;
      localStorage.setItem(
        `product_viewers_${id}`,
        JSON.stringify({
          count: newCount,
          timestamp: now
        })
      );
  
      return newCount;
    };
  
    setCurrentViewers(getViewersCount());
  
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
  
  const displayedViewers = currentViewers > 0 ? currentViewers - 1 : 0;
  const viewerSuffix = [3, 6, 8].includes(displayedViewers)
    ? '-an nézik önön kívül'
    : '-en nézik önön kívül';

  // Show floating box based on scroll position
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

  // Update container width for mobile slider on mount and on resize
  useEffect(() => {
    if (shippingContainerRef.current) {
      setContainerWidth(shippingContainerRef.current.offsetWidth);
    }
    const handleResize = () => {
      if (shippingContainerRef.current) {
        setContainerWidth(shippingContainerRef.current.offsetWidth);
      }
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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

  const handleQuantityChange = (newQuantity: number) => {
    if (product && newQuantity >= 1) {
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

  // Desktop view for shipping features
  const desktopShippingFeatures = (
    
    <div className="hidden sm:grid sm:grid-cols-3 sm:gap-4 pt-6 mt-4  ">
        <div className="flex flex-col items-center text-center">
        <Truck className="h-10 w-10 text-black mb-2" />        
        <h3 className="text-sm font-bold mb-1">Ingyenes szállítás</h3>  
        <p className="text-xs text-gray-600 max-w-[150px] mx-auto">
          30 000 Ft feletti rendeléseknél
        </p>
      </div> 
      <div className="flex flex-col items-center text-center">
        <RefreshCcw className="h-10 w-10 text-black mb-2" />
        <h3 className="text-sm font-bold mb-1">Termékvisszaküldés</h3>
        <p className="text-xs text-gray-600 max-w-[150px] mx-auto">
          Az áru átvételét követő 14 naptári napon belül
        </p>
      </div>      
      <div className="flex flex-col items-center text-center">
        <ShieldCheck className="h-10 w-10 text-black mb-2" />
        <h3 className="text-sm font-bold mb-1">Biztonságos fizetés</h3>
        <p className="text-xs text-gray-600 max-w-[150px] mx-auto">
          100%-ban titkosítva, adatok tárolása nélkül
        </p>
      </div>
         
     
    </div>
  );

  // Mobile view for shipping features using a draggable slider
  const mobileShippingFeatures = (
    <div
      className="sm:hidden overflow-hidden border-t border-gray-200 pt-6 mt-4 w-full"
      ref={shippingContainerRef}
    >
      <motion.div
        drag="x"
        dragElastic={0.2}
        dragConstraints={{ left: -((shippingFeatures.length - 1) * containerWidth), right: 0 }}
        animate={{ x: -currentFeatureIndex * containerWidth }}
        transition={{ duration: 0.15 }}
        onDragEnd={(event, info) => {
          const threshold = 50;
          if (info.offset.x < -threshold && currentFeatureIndex < shippingFeatures.length - 1) {
            setCurrentFeatureIndex(currentFeatureIndex + 1);
          } else if (info.offset.x > threshold && currentFeatureIndex > 0) {
            setCurrentFeatureIndex(currentFeatureIndex - 1);
          }
        }}
        className="flex"
      >
        {shippingFeatures.map((feature, index) => (
          <div
            key={index}
            className="flex-shrink-0 w-full flex flex-col items-center justify-center text-center"
          >
            {feature.icon}
            <h3 className="text-base font-bold mb-1">{feature.title}</h3>
            <p className="text-sm text-gray-600 max-w-[150px] mx-auto">{feature.description}</p>
          </div>
        ))}
      </motion.div>
      {/* Navigation dots */}
      <div className="flex justify-center mt-4 space-x-2">
        {shippingFeatures.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentFeatureIndex(index)}
            className={`h-2 w-2 rounded-full ${index === currentFeatureIndex ? 'bg-black' : 'bg-gray-300'}`}
            aria-label={`View feature ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );

  // Availability status component
  const StyledAvailabilityStatus = ({ status, quantity }: { status: string, quantity?: number }) => {
    let statusText = '';
    let statusColor = '';
    
    if (status === 'raktáron' || status === 'rendelésre') {
      statusText = quantity && quantity <= 30 
        ? `Raktáron - Csak ${quantity} db elérhető`
        : `Raktáron - ${quantity} db elérhető`;
      statusColor = 'text-[#007c01]';
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

  // FAQ sections
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

  return (
    <div className={sora.className}>
      <WhiteHeader onCartClick={() => setIsSidebarOpen(true)} cartItems={cartItems} />
      <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-24" ref={productRef}>
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left column - Images */}
          <div className="lg:w-3/5 flex-shrink-0">
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
          
          {/* Right column - Product info */}
          <div className="lg:w-2/5 w-full max-w-full overflow-x-hidden">
            <div className="px-0 lg:px-4 w-full">
              <div className="text-sm font-medium text-gray-500 mb-0">
                Carelline
              </div>
              <h1 className="text-4xl font-black mb-2">{product.name}</h1>
              <div className="mb-0">
                <div className="flex flex-col w-full">
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    {product.salePrice ? (
                      <>
                        <div className="flex flex-wrap items-center mb-1 sm:mb-0">
                          <span className="text-xl font-bold text-[#dc2626] mr-2">
                            {Math.round(product.salePrice).toLocaleString('hu-HU')} Ft
                          </span>
                          <div className="bg-[#dc2626] font-bold text-white text-xs px-1.5 py-0.5 rounded whitespace-nowrap sm:order-last sm:ml-3">
                            AKCIÓ {Math.round(product.price - product.salePrice).toLocaleString('hu-HU')} Ft
                          </div>
                          <span className="text-base text-gray-500 font-medium line-through w-full sm:w-auto mt-1 sm:mt-0 sm:mr-0">
                            {Math.round(product.price).toLocaleString('hu-HU')} Ft
                          </span>
                        </div>
                      </>
                    ) : (
                      <span className="text-xl font-bold">{Math.round(product.price).toLocaleString('hu-HU')} Ft</span>
                    )}
                  </div>
                  <hr className="border-t border-gray-300 my-3 w-[85%] max-lg:w-full " />
                </div>
              </div>
              
              {isProductAvailable ? (
                <>
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-2">
                      {product.sizes.includes('One Size') ? null : (
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
                      <div className="mt-0 mb-4 flex items-center font-bold text-gray-500 text-sm">
                        <Eye className="h-4 w-4 mr-1 text-gray-500" />
                        <span>{currentViewers} ember nézi jelenleg</span>
                      </div>
                      <div className="flex flex-col xl:flex-row items-start">
                        <div className="mb-4 xl:mb-0 xl:order-2">
                          <div className="mb-2">
                            <span className="font-medium text-base">Elérhetőség:</span>
                          </div>
                          <StyledAvailabilityStatus
                            status={product.inventoryStatus}
                            quantity={product.stockQuantity}
                          />
                        </div>
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
                              className={`h-8 w-8 text-sm ${quantity >= product.stockQuantity ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                  <div className="w-[85%] max-lg:w-full">
                    <MatrixButton
                      phrases={[
                        "Kosárba teszem",
                        "Rendelje meg mielőtt elfogy",
                        `${displayedViewers} ${viewerSuffix}`,
                        `Siessen! Már csak ${product.stockQuantity} darab van`,
                      ]}
                      onClick={handleAddToCart}
                      className="w-full block py-4 bg-[#dc2626] text-white flex items-center justify-center text-xs sm:text-base"
                    />
                  </div>
                </>
              ) : (
                <div className="mb-3 w-full">
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
              <div className="mt-4 space-y-2 w-full">
                {faqs.map((faq, index) => (
                  <div key={index} className="bg-white rounded-lg overflow-hidden border border-gray-200 w-[85%] max-lg:w-full ">
                    <button
                      onClick={() => toggleItem(index)}
                      className="w-full px-4 py-2 flex justify-between items-center text-left"
                    >
                      <span className="font-medium text-base">{faq.question}</span>
                      <Plus className={`h-4 w-4 transition-transform duration-200 ${expandedItems.has(index) ? 'rotate-45' : ''}`} />
                    </button>
                    <div
                      className={`px-4 transition-all duration-300 ease-in-out overflow-hidden ${
                        expandedItems.has(index)
                          ? 'max-h-[500px] opacity-100 py-3'
                          : 'max-h-0 opacity-0 py-0'
                      }`}
                    >
                      <div className="text-gray-600 text-sm leading-relaxed">
                        {faq.answer}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
  
              
              {/* Shipping features: Desktop and Mobile */}
              {desktopShippingFeatures}
              {mobileShippingFeatures}
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
          <GoogleReviewsSection />
      <RecommendedProducts />
    </div>
  )
}