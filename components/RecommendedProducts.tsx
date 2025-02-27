'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import CartModal from "@/components/CartModal"
import Sidebar from "@/components/Sidebar"
import { useCart } from '@/lib/CartContext'
import { useRouter, useParams } from 'next/navigation'
import { ShoppingCart, BellIcon } from 'lucide-react'
import { Skeleton } from "@/components/ui/skeleton"
import { Sora } from 'next/font/google'

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
}

interface NotifyMessage {
  type: 'success' | 'error'
  content: string
}

export default function RecommendedProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [cartProduct, setCartProduct] = useState<Product | null>(null)
  const [animatingProducts, setAnimatingProducts] = useState<string[]>([])
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [activeEmailInput, setActiveEmailInput] = useState<string | null>(null)
  const [notifyMessages, setNotifyMessages] = useState<{ [key: string]: NotifyMessage }>({})
  const productRefs = useRef<(HTMLDivElement | null)[]>([])
  const containerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { id: currentProductId } = useParams()
  const { cartItems, addToCart, removeFromCart, updateQuantity } = useCart()

  const handleAddToCart = (product: Product) => {
    setCartProduct(product)
  }

  const handleCloseModal = () => {
    setCartProduct(null)
  }

  const handleConfirmAddToCart = (size: string) => {
    if (cartProduct) {
      addToCart(cartProduct, size, 1);
      setCartProduct(null);
      setIsSidebarOpen(true);
    }
  };

  const handleRemoveCartItem = (index: number) => {
    removeFromCart(index);
  }

  const handleUpdateQuantity = (index: number, newQuantity: number) => {
    updateQuantity(index, newQuantity);
  }

  const handleProductClick = (productId: string) => {
    router.push(`/product/${productId}`)
  }

  const handleNotifyClick = (e: React.MouseEvent, productId: string) => {
    e.stopPropagation()
    setActiveEmailInput(prevId => prevId === productId ? null : productId)
  }

  const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>, productId: string, productName: string) => {
    e.preventDefault()
    const emailInput = e.currentTarget.elements.namedItem('email') as HTMLInputElement
    const email = emailInput.value
    try {
      const response = await fetch('/api/notify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, productId, productName }),
      })
      if (response.ok) {
        setNotifyMessages(prev => ({
          ...prev,
          [productId]: { type: 'success', content: 'Értesítve lesz, amint elérhető.' }
        }))
        emailInput.value = '' // Clear the input
      } else {
        setNotifyMessages(prev => ({
          ...prev,
          [productId]: { type: 'error', content: 'Már feliratkozott.' }
        }))
      }
    } catch (error) {
      console.error('Error saving email:', error)
      setNotifyMessages(prev => ({
        ...prev,
        [productId]: { type: 'error', content: 'An error occurred. Please try again.' }
      }))
    }
  }

  useEffect(() => {
    async function fetchProducts() {
      setIsLoading(true)
      try {
        const response = await fetch('/api/products')
        if (response.ok) {
          const data = await response.json()
          // Filter out the current product
          const filteredProducts = data.filter((product: Product) => product._id !== currentProductId)
          // Shuffle the array
          const shuffled = filteredProducts.sort(() => 0.5 - Math.random())
          // Take the first 3 items
          setProducts(shuffled.slice(0, 3))
        }
      } catch (error) {
        console.error('Error fetching recommended products:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchProducts()
  }, [currentProductId])

  const getProductsPerRow = useCallback(() => {
    if (!containerRef.current) return 3; // Default to 3 if container not available
    const containerWidth = containerRef.current.offsetWidth;
    if (containerWidth >= 1024) return 3; // lg breakpoint
    if (containerWidth >= 768) return 2; // md breakpoint
    return 1; // sm breakpoint
  }, []);

  const startChainReaction = useCallback((startIndex: number) => {
    const productsPerRow = getProductsPerRow();
    const animationDelay = 100; // ms between each product animation
    const rowStartIndex = Math.floor(startIndex / productsPerRow) * productsPerRow;

    for (let i = 0; i < productsPerRow; i++) {
      const index = rowStartIndex + i;
      if (index < products.length) {
        const productId = products[index]._id;
        setTimeout(() => {
          setAnimatingProducts(prev => [...prev, productId]);
        }, i * animationDelay);
      }
    }
  }, [products, getProductsPerRow]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const productId = entry.target.id;
          const index = productRefs.current.findIndex(ref => ref && ref.id === productId);
          startChainReaction(index);
        } else {
          setAnimatingProducts(prev => prev.filter(id => id !== entry.target.id));
        }
      });
    }, {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    });

    const currentProductRefs = productRefs.current;

    currentProductRefs.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      currentProductRefs.forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, [products, startChainReaction]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeEmailInput) {
        const productElements = productRefs.current
        const clickedInsideProduct = productElements.some(el => el && el.contains(event.target as Node))
        if (!clickedInsideProduct) {
          setActiveEmailInput(null)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [activeEmailInput])

  const renderProductCard = (product: Product, index: number) => (
    <div 
      key={product._id}
      id={product._id}
      ref={(el: HTMLDivElement | null) => { productRefs.current[index] = el }}
      className={`rounded-lg overflow-hidden bg-white relative group border-0 transition-all duration-500 ease-in-out cursor-pointer ${sora.className}`}
      style={{
        opacity: animatingProducts.includes(product._id) ? 1 : 0,
        transform: animatingProducts.includes(product._id) ? 'translateY(0)' : 'translateY(32px)',
        transition: 'opacity 0.5s ease-out, transform 0.5s ease-out',
      }}
      onClick={() => handleProductClick(product._id)}
    >
      <div className="relative aspect-square overflow-hidden">
        {product.salePrice && (
        <div className="absolute top-2 left-2 bg-[#be2323] text-white text-xs font-bold px-3 py-1.5 rounded-lg z-20">
        -{Math.round(((product.price - product.salePrice) / product.price) * 100)}%
      </div>
        )}
        <div className={`absolute inset-0 transition-opacity duration-300 ease-out md:group-hover:opacity-0 ${product.sizes.length === 0 ? 'opacity-50' : ''}`}>
          <Image
            src={`/uploads/${product.mainImage}`}
            alt={product.name}
            fill
            className="object-cover bg-transparent"
          />
        </div>
        {product.galleryImages.length > 0 && (
          <div className={`absolute inset-0 transition-opacity duration-300 ease-out opacity-0 md:group-hover:opacity-100 ${product.sizes.length === 0 ? 'md:group-hover:opacity-50' : ''}`}>
            <Image
              src={`/uploads/${product.galleryImages[0]}`}
              alt={`${product.name} - Gallery`}
              fill
              className="object-cover bg-transparent"
            />
          </div>
        )}
        {product.sizes.length === 0 && (
          <>
            <div className="absolute top-2 right-2 z-10 flex items-center space-x-1">
              <Button
                variant="secondary"
                size="sm"
                className="bg-white text-black hover:bg-gray-100 shadow-[0_0_10px_rgba(0,0,0,0.3)] group"
                onClick={(e) => handleNotifyClick(e, product._id)}
              >
                <BellIcon className="h-4 w-4 mr-1 animate-ring" />
                Értesítést kérek
              </Button>
            </div>
            {activeEmailInput === product._id && (
              <div 
                className="absolute top-12 right-2 z-20 bg-white rounded-lg p-3 shadow-[0_0_10px_rgba(0,0,0,0.3)] w-64"
                onClick={(e) => e.stopPropagation()}
              >
                <form 
                  onSubmit={(e) => handleEmailSubmit(e, product._id, product.name)} 
                  className="flex flex-col space-y-2" 
                >
                  <p className="text-sm font-semibold">{product.name}</p>
                  <div className="flex items-center space-x-2">
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
                  </div>
                  {notifyMessages[product._id] && (
                    <div 
                      className={`mt-2 p-2 rounded-md text-sm font-medium flex justify-between items-center ${
                        notifyMessages[product._id].type === 'success' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      <span>{notifyMessages[product._id].content}</span>
                      <button
                        onClick={() => {
                          setNotifyMessages(prev => {
                            const newMessages = {...prev}
                            delete newMessages[product._id]
                            return newMessages
                          })
                        }}
                        className="ml-2 text-gray-500 hover:text-gray-700"
                        aria-label="Close message"
                      >
                        &times;
                      </button>
                    </div>
                  )}
                </form>
              </div>
            )}
          </>
        )}
        {product.sizes.length > 0 && (
          <>
            <div className="absolute bottom-4 right-4 transform translate-y-1/4 transition-all duration-300 ease-out md:group-hover:translate-y-0 opacity-0 md:group-hover:opacity-100 hidden md:block">
              <Button 
                onClick={(e) => {
                  e.stopPropagation()
                  handleAddToCart(product)
                }}
                className="bg-black text-white hover:bg-gray-800 text-sm py-2 px-4 w-full"
              >
                <span className="font-bold">+ Kosárba</span>
              </Button>
            </div>
            <div className="absolute bottom-4 right-4 md:hidden">
              <Button
                onClick={(e) => {
                  e.stopPropagation()
                  handleAddToCart(product)
                }}
                className="bg-white text-black hover:bg-gray-100 p-2 rounded-full w-10 h-10 flex items-center justify-center"
              >
                <ShoppingCart size={20} />
              </Button>
            </div>
          </>
        )}
      </div>
      <div className="p-4">
        <h2 className="text-xl font-semibold text-black">{product.name}</h2>
       
        <div className="mt-2 flex items-center justify-between">
  <div>
    {product.sizes.length === 0 ? (
      <span className="text-lg text-black">
        Elfogyott
      </span>
    ) : product.salePrice ? (
      <>
        <span className="text-lg font-bold text-[#be2323]">
          {Math.round(product.salePrice).toLocaleString('hu-HU')} Ft
        </span>
        <span className="text-sm text-gray-500 line-through ml-2">
          {Math.round(product.price).toLocaleString('hu-HU')} Ft
        </span>
      </>
    ) : (
      <span className="text-lg font-bold text-black">
        {Math.round(product.price).toLocaleString('hu-HU')} Ft
      </span>
    )}
  </div>
</div>
      </div>
    </div>
  )

  const renderSkeletonCard = () => (
    <div className="rounded-lg overflow-hidden bg-white relative group border-0 transition-all duration-500 ease-in-out">
      <div className="relative aspect-square overflow-hidden">
        <Skeleton className="absolute inset-0" />
      </div>
      <div className="p-4">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/4" />
      </div>
    </div>
  )

  return (
    <>
      <div className={`container mx-auto p-4 py-24 ${sora.className}`} ref={containerRef}>
        <h2 className="text-4xl font-bold mb-12">Ezeket is ajánljuk</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading
            ? Array(3).fill(null).map((_, index) => <div key={index}>{renderSkeletonCard()}</div>)
            : products.map((product, index) => renderProductCard(product, index))}
        </div>
        {cartProduct && (
          <CartModal 
            product={cartProduct} 
            onClose={handleCloseModal} 
            onAddToCart={handleConfirmAddToCart} 
          />
        )}
        <Sidebar 
          cartItems={cartItems} 
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onRemoveItem={handleRemoveCartItem}
          onUpdateQuantity={handleUpdateQuantity}
        />
      </div>
      <style jsx global>{`
        @keyframes ring {
          0%, 100% {
            transform: rotate(0deg);
          }
          20%, 60% {
            transform: rotate(-15deg);
          }
          40%, 80% {
            transform: rotate(15deg);
          }
        }

        .animate-ring {
          animation: ring 2s ease-in-out infinite;
        }

        @keyframes chainReaction {
          0% {
            opacity: 0;
            transform: translateY(32px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-chainReaction {
          animation: chainReaction 0.5s ease-out forwards;
        }
      `}</style>
    </>
  )
}