'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link';

import { useParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCart } from '@/lib/CartContext'
import { WhiteHeader } from '@/components/WhiteHeader'
import Sidebar from '@/components/Sidebar'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus, Truck, RefreshCcw, BellIcon, ShieldCheck, Eye, Star } from 'lucide-react'
import { FloatingProductBox } from '@/components/FloatingProductBox'
import RecommendedProducts from '@/components/RecommendedProducts'
import { Sora } from 'next/font/google'
import { Skeleton } from "@/components/ui/skeleton"
import MatrixButton from '@/components/MatrixButton'
import GoogleReviewsSection from '@/components/GoogleReviewsSection'
import { ProductPagePopup } from '@/components/ProductPagePopup'

const sora = Sora({ subsets: ['latin'] })

// We keep the Product interface for the main product,
// and assume that upsell products come with an additional "categories" property.
interface Product {
  _id: string
  name: string
  description: string
  price: number
  salePrice?: number
  mainImage: string
  // For your main product, it's a string; upsell products will have a categories array.
  category?: string
  categories?: string[]
  sizes: string[]
  galleryImages: string[]
  inventoryStatus: 'raktáron' | 'rendelésre' | 'elfogyott'
  stockQuantity: number
}

export default function ProductPage() {
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
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const shippingContainerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  // NEW: Upsell products state
  const [upsellProducts, setUpsellProducts] = useState<Product[]>([]);

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

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (shippingContainerRef.current) {
        setContainerWidth(shippingContainerRef.current.offsetWidth);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    async function fetchProduct() {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/products/${id}`)
        if (response.ok) {
          const data = await response.json()
          setProduct(data)
          setSelectedImage(data.mainImage)
          if (data.sizes.includes('One Size')) {
            setSelectedSize('One Size')
          } else if (data.sizes.length > 0) {
            setSelectedSize(data.sizes[0])
          }
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setTimeout(() => {
          setIsLoading(false);
        }, 800);
      }
    }
    if (id) {
      fetchProduct()
    }
  }, [id])

  // NEW: Fetch all products and then filter for upsell products.
  useEffect(() => {
    async function fetchAllProducts() {
      try {
        const response = await fetch('/api/products')
        if (response.ok) {
          const data: Product[] = await response.json()
          const upsell = data
            .map((p) => ({
              ...p,
              // Ensure categories is an array even if returned as a string.
              categories: Array.isArray(p.categories)
                ? p.categories
                : p.category ? [p.category] : []
            }))
            .filter(p => p.categories.includes('upsell'))
          setUpsellProducts(upsell)
        }
      } catch (error) {
        console.error("Error fetching upsell products:", error);
      }
    }
    fetchAllProducts();
  }, []);

  useEffect(() => {
    const getViewersCount = () => {
      const now = new Date().getTime();
      const storedData = localStorage.getItem(`product_viewers_${id}`);
  
      if (storedData) {
        const { count, timestamp } = JSON.parse(storedData);
        if (now - timestamp < 60000) {
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
        if (now - timestamp >= 60000) {
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
        headers: { 'Content-Type': 'application/json' },
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

  const desktopShippingFeatures = (
    <div className="hidden 2xl:grid 2xl:grid-cols-3 2xl:gap-4 pt-6 mt-4 w-[85%] max-lg:w-full">
      <div className="flex flex-col items-center text-center">
        <Truck className="h-10 w-10 text-black mb-2" />        
        <h3 className="text-sm font-bold mb-1">Ingyenes szállítás</h3>  
        <p className="text-xs text-gray-600 max-w-[150px] mx-auto">30 000 Ft feletti rendeléseknél</p>
      </div>
      <div className="flex flex-col items-center text-center">
        <RefreshCcw className="h-10 w-10 text-black mb-2" />
        <h3 className="text-sm font-bold mb-1">Termékvisszaküldés</h3>
        <p className="text-xs text-gray-600 max-w-[150px] mx-auto">Az áru átvételét követő 14 naptári napon belül</p>
      </div>      
      <div className="flex flex-col items-center text-center">
        <ShieldCheck className="h-10 w-10 text-black mb-2" />
        <h3 className="text-sm font-bold mb-1">Biztonságos fizetés</h3>
        <p className="text-xs text-gray-600 max-w-[150px] mx-auto">100%-ban titkosítva, adatok tárolása nélkül</p>
      </div>
    </div>
  );

  const mobileShippingFeatures = (
    <div className="2xl:hidden overflow-hidden pt-6 mt-4 w-full" ref={shippingContainerRef}>
      <motion.div
        drag={isMobile ? "x" : false}
        dragElastic={0.2}
        dragConstraints={{ left: -((shippingFeatures.length - 1) * containerWidth), right: 0 }}
        dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
        onDragEnd={(event, info) => {
          if (info.offset.x < 0) {
            setCurrentFeatureIndex(prev => Math.min(prev + 1, shippingFeatures.length - 1));
          } else if (info.offset.x > 0) {
            setCurrentFeatureIndex(prev => Math.max(prev - 1, 0));
          }
        }}
        animate={{ x: -currentFeatureIndex * containerWidth }}
        transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 30 }}
        className="flex"
      >
        {shippingFeatures.map((feature, index) => (
          <div key={index} className="flex-shrink-0 w-full flex flex-col items-center justify-center text-center">
            {feature.icon}
            <h3 className="text-base font-bold mb-1">{feature.title}</h3>
            <p className="text-sm text-gray-600 max-w-[150px] mx-auto">{feature.description}</p>
          </div>
        ))}
      </motion.div>
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
      <div className="inline-block bg-white border border-gray-200 rounded-md py-1 px-3 shadow-md">
        <span className={`font-medium text-sm ${statusColor}`}>{statusText}</span>
      </div>
    );
  };

  const faqs = [
    {
      question: "Leírás",
      answer: product?.description || ''
    },
    {
      question: "Fizetés & Szállítás",
      answer: (
        <div className="space-y-3">
          <div>
            <h5 className="font-medium text-black mb-1 text-sm">Fizetési lehetőségek:</h5>
            <p className="text-sm">Minden nagyobb hitelkártyát elfogadunk biztonságos fizetési rendszerünkön keresztül.</p>
          </div>
          <div>
            <h5 className="font-medium text-black mb-1 text-sm">Szállítási információk:</h5>
            <p className="text-sm">A normál szállítás általában 6-10 munkanapot vesz igénybe. Az expressz viszont csak 3-5nap.</p>
          </div>
        </div>
      )
    }
  ]

  const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
  const isProductAvailable = (product?.sizes?.length ?? 0) > 0 && product?.inventoryStatus !== 'elfogyott'
  const displayedViewers = currentViewers > 0 ? currentViewers - 1 : 0;
  const viewerSuffix = [3, 6, 8].includes(displayedViewers)
    ? '-an nézik önön kívül'
    : '-en nézik önön kívül';

  const StarRating = () => (
    <div className="flex">
      {[...Array(5)].map((_, i) => (
        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
      ))}
    </div>
  );

  // Determine which upsell products to show:
  // If the current product is an upsell, filter it out from the list and then take the first three.
  const upsellProductsToShow =
    product && product.categories && product.categories.includes('upsell')
      ? upsellProducts.filter(p => p._id !== product._id).slice(0, 3)
      : upsellProducts.slice(0, 3);

  if (isLoading || !product) {
    return (
      <div className={`${sora.className} min-h-screen flex flex-col bg-white`}>
        <Skeleton className="h-16 w-full bg-gray-200" />
      </div>
    )
  }

  return (
    <div className={sora.className}>
      <WhiteHeader onCartClick={() => setIsSidebarOpen(true)} cartItems={cartItems} />
      {product && <ProductPagePopup product={product} />}
      <div className="max-w-screen-2xl mx-auto px-4 md:px-6 pt-24 pb-24" ref={productRef}>
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-3/5 flex-shrink-0">
            <div className="mb-6 pt-6 lg:pt-6">
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
          
          <div className="lg:w-2/5 w-full max-w-full overflow-x-hidden mt-12 lg:mt-24">
            <div className="px-0 lg:px-4 w-full">
              <div className="text-sm font-medium text-gray-500 mb-0">Carelline</div>
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
                      <div className="mt-0 mb-4 w-[85%] max-lg:w-full">
                        <div className="flex flex-col xl:flex-row items-start justify-between">
                          <div className="order-2 xl:order-1 flex items-center text-xs text-[#222] mt-2 xl:mt-0">
                            <Eye className="h-4 w-4 mr-1 text-[#222] animate-pulse" />
                            <span>{currentViewers} ember nézi jelenleg</span>
                          </div>
                          <div className="order-1 xl:order-2 flex items-center">
                            <StarRating />
                            <span className="ml-1 text-xs text-[#222]">(4,8)</span>
                          </div>
                        </div>
                      </div>
                    
                      <div className="flex flex-col xl:flex-row items-start justify-between w-[85%] max-lg:w-full">
                        <div className="order-1 xl:order-2 mt-4 xl:mt-0">
                          <div className="mb-2 flex flex-col">
                            <span className="font-medium text-base">Elérhetőség:</span>
                          </div>
                          <StyledAvailabilityStatus
                            status={product.inventoryStatus}
                            quantity={product.stockQuantity}
                          />
                        </div>
                        
                        <div className="order-2 xl:order-1 flex-1 mt-4 xl:mt-0">
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

                      {/* NEW: Upsell Products Section */}
                      {upsellProductsToShow.length > 0 && (
                        <div className="mt-6">
                          <p className="font-medium text-base mb-2">Szerezze be mellé:</p>
                          <div className="flex flex-col space-y-3">
                            {upsellProductsToShow.map((upsell) => (
                              <div key={upsell._id} className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  className="form-checkbox h-5 w-5 text-blue-600"
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      const defaultSize =
                                        upsell.sizes && upsell.sizes.length > 0 ? upsell.sizes[0] : "One Size";
                                      addToCart(upsell, defaultSize, 1);
                                    } else {
                                      // Optionally, remove the upsell product from the cart if unchecked.
                                    }
                                  }}
                                />
                                <Link href={`/product/${upsell._id}`} className="flex items-center space-x-2">
                                  <Image
                                    src={`/uploads/${upsell.mainImage}`}
                                    alt={upsell.name}
                                    width={50}
                                    height={50}
                                    className="rounded"
                                  />
                                  <div>
                                    <div className="text-sm font-medium hover:underline">{upsell.name}</div>
                                    <div className="text-xs text-gray-600">
                                      {Math.round(upsell.price).toLocaleString('hu-HU')} Ft
                                    </div>
                                  </div>
                                </Link>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    </div>
                  </div>
                  
                  {/* Button section */}
                  <div className="w-[85%] max-lg:w-full flex gap-3">
                    <MatrixButton
                      phrases={[
                        "Kosárba teszem",
                        "Rendelje meg mielőtt elfogy",
                        `${displayedViewers} ${viewerSuffix}`,
                        `Siessen! Már csak ${product.stockQuantity} darab van`,
                      ]}
                      onClick={handleAddToCart}
                      className="flex-1 block py-7 bg-[#dc2626] text-white flex items-center justify-center text-xs sm:text-base"
                    />
                    <Button
                      variant="outline"
                      className="h-auto w-18 border-2 border-gray-300 flex items-center justify-center shadow-[0_2px_6px_rgba(0,0,0,0.1)] hover:shadow-[0_4px_10px_rgba(0,0,0,0.2)] transition-all duration-200 hover:border-gray-400"
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({
                            title: product.name,
                            url: window.location.href
                          }).catch(err => console.error('Error sharing:', err));
                        }
                      }}
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="28" 
                        height="28" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      >
                        <circle cx="18" cy="5" r="3"></circle>
                        <circle cx="6" cy="12" r="3"></circle>
                        <circle cx="18" cy="19" r="3"></circle>
                        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                      </svg>
                    </Button>
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
                        <div className={`mt-2 p-2 rounded-md text-sm font-medium ${notifyMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
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
                    <div className={`px-4 transition-all duration-300 ease-in-out overflow-hidden ${expandedItems.has(index) ? 'max-h-[500px] opacity-100 py-3' : 'max-h-0 opacity-0 py-0'}`}>
                      <div className="text-gray-600 text-sm leading-relaxed">
                        {faq.answer}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
  
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
