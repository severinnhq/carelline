'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import CartModal from "@/components/CartModal"
import Sidebar from "@/components/Sidebar"
import { Header } from './Header'
import { useCart } from '@/lib/CartContext'
import { useRouter } from 'next/navigation'
import {BellIcon } from 'lucide-react'
import { Input } from "@/components/ui/input"
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
  categories: string[]
  sizes: string[]
  galleryImages: string[]
  inventoryStatus: 'raktáron' | 'rendelésre' | 'elfogyott'
  stockQuantity: number
}

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [cartProduct, setCartProduct] = useState<Product | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [notifyMessages, setNotifyMessages] = useState<{ [key: string]: { type: 'success' | 'error', content: string } }>({})
  const [notifyClicked, setNotifyClicked] = useState<string | null>(null)
  const productRefs = useRef<(HTMLDivElement | null)[]>([])
  const notifyFormRefs = useRef<(HTMLFormElement | null)[]>([])
  const containerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { cartItems, addToCart, removeFromCart, updateQuantity } = useCart()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    const currentProductRefs = productRefs.current // Add this line
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = productRefs.current.findIndex(ref => ref === entry.target)
            const delay = index * 45
            setTimeout(() => {
              entry.target.classList.add('animate-chainReaction')
            }, delay)
          } else {
            entry.target.classList.remove('animate-chainReaction')
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px 0% 0px' }
    )
    currentProductRefs.forEach(ref => ref && observer.observe(ref)) // Change this line
  
    return () => {
      currentProductRefs.forEach(ref => ref && observer.unobserve(ref)) // Change this line
    }
  }, [products])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifyClicked) {
        const insideAnyForm = productRefs.current.some((ref, idx) =>
          ref && ref.contains(event.target as Node) &&
          notifyFormRefs.current[idx]?.contains(event.target as Node)
        )
        if (!insideAnyForm) setNotifyClicked(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [notifyClicked])

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 500)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    const saved = sessionStorage.getItem('productListScrollPosition')
    if (saved) {
      window.scrollTo(0, parseInt(saved))
      sessionStorage.removeItem('productListScrollPosition')
    }
  }, [])

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products')
      if (res.ok) {
        const data: Product[] = await res.json()
        const featured = data
          .map(p => ({
            ...p,
            price: Number(p.price) || 0,
            salePrice: p.salePrice ? Number(p.salePrice) || 0 : undefined,
            categories: Array.isArray(p.categories) ? p.categories : [p.categories].filter(Boolean)
          }))
          .filter(p => p.categories.includes('featured'))
        setProducts(featured)
      } else {
        console.error('Failed to fetch products')
      }
    } catch (err) {
      console.error('Error fetching products:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const formatPriceToHUF = (price: number) =>
    Math.round(price).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")


  const handleCloseModal = () => setCartProduct(null)
  const handleConfirmAddToCart = (size: string) => {
    if (!cartProduct) return
    addToCart(cartProduct, size, 1)
    setCartProduct(null)
    setIsSidebarOpen(true)
  }
  const handleRemoveCartItem = (i: number) => removeFromCart(i)
  const handleUpdateQuantity = (i: number, q: number) => updateQuantity(i, q)
  const handleProductClick = (id: string) => {
    sessionStorage.setItem('productListScrollPosition', window.scrollY.toString())
    router.push(`/product/${id}`)
  }

  const handleEmailSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
    productId: string,
    productName: string
  ) => {
    e.preventDefault()
    
    // Get the form and email input before any async operations
    const form = e.currentTarget;
    const emailInput = form.elements.namedItem('email') as HTMLInputElement;
    const email = emailInput?.value || '';
    
    if (!email) return;
    
    try {
      const res = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, productId, productName })
      })
      
      let responseData;
      try {
        responseData = await res.json();
      } catch {
        responseData = {};
      }
      
      if (res.ok) {
        // Clear the input field first, before any state updates
        if (emailInput) emailInput.value = '';
        
        setNotifyMessages(prev => ({
          ...prev,
          [productId]: { type: 'success', content: 'Értesítve lesz, amint elérhető.' }
        }));
      } else {
        // Use the error message from the API if available
        const errorMessage = responseData?.message || 'Már feliratkozott.';
        setNotifyMessages(prev => ({
          ...prev,
          [productId]: { type: 'error', content: errorMessage }
        }));
      }
    } catch (error) {
      console.error('Error submitting notification:', error);
      setNotifyMessages(prev => ({
        ...prev,
        [productId]: { type: 'error', content: 'Hiba történt. Kérjük, próbálja újra.' }
      }));
    }
  }

  const renderProductCard = (product: Product, index: number) => (
    <div
      key={product._id}
      ref={el => { productRefs.current[index] = el }}
      className={`rounded-lg overflow-hidden bg-white relative group border-0 transition-all duration-500 ease-in-out cursor-pointer opacity-0 translate-y-8 ${sora.className}`}
      onClick={() => handleProductClick(product._id)}
    >
    <div className="relative aspect-square overflow-hidden">
  {/* Sale % badge */}
  {product.salePrice && (
    <div className="absolute top-2 right-2 bg-[#dc2626] text-white text-xs font-bold px-3 py-1.5 rounded-lg z-20">
      -{Math.round(((product.price - product.salePrice) / product.price) * 100)}%
    </div>
  )}

        {/* Image swap */}
        <div className={`absolute inset-0 transition-opacity duration-300 ease-out ${
          product.sizes.length === 0 ? 'opacity-40 md:group-hover:opacity-0' : 'md:group-hover:opacity-0'
        }`}>
          <Image
            src={`/uploads/${product.mainImage}`}
            alt={product.name}
            fill
            className="object-cover bg-transparent"
          />
        </div>
        {product.galleryImages.length > 0 && (
          <div className={`absolute inset-0 transition-opacity duration-300 ease-out ${
            product.sizes.length === 0
              ? 'opacity-0 md:group-hover:opacity-40'
              : 'opacity-0 md:group-hover:opacity-100'
          }`}>
            <Image
              src={`/uploads/${product.galleryImages[0]}`}
              alt={`${product.name} - Gallery`}
              fill
              className="object-cover bg-transparent"
            />
          </div>
        )}

        {/* Bell & Notify Form */}
        {product.inventoryStatus === 'elfogyott' && (
          <>
            <div className="absolute top-2 right-2 z-20 flex items-center space-x-1">
              <Button
                variant="secondary"
                size="sm"
                className="bg-white text-black hover:bg-gray-100 shadow-md group text-xs sm:text-sm"
                onClick={e => {
                  e.stopPropagation()
                  setNotifyClicked(notifyClicked === product._id ? null : product._id)
                }}
              >
                <BellIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 animate-ring" />
                Értesítést kérek!
              </Button>
            </div>
            {notifyClicked === product._id && (
              <div
                className="absolute top-12 right-2 z-30 bg-white rounded-lg p-2 sm:p-3 shadow-md
                           w-56 sm:w-64 max-w-[calc(100%-1rem)] overflow-hidden"
                onClick={e => e.stopPropagation()}
              >
                <form
                  ref={el => { if (el) notifyFormRefs.current[index] = el }}
                  onSubmit={e => handleEmailSubmit(e, product._id, product.name)}
                  className="flex flex-col space-y-2"
                >
                  <p className="text-xs sm:text-sm font-semibold">{product.name}</p>
                  <div className={`flex ${isMobile ? 'flex-col space-y-2' : 'items-center space-x-2'}`}>
                    <Input
                      type="email"
                      name="email"
                      placeholder="Email címed"
                      className="text-xs sm:text-sm flex-grow"
                      required
                    />
                    <Button
                      type="submit"
                      size="sm"
                      className={`whitespace-nowrap bg-black text-white hover:bg-gray-800
                                  text-xs sm:text-sm py-1 px-2 sm:py-2 sm:px-3 ${isMobile ? 'w-full' : ''}`}
                    >
                      Értesíten!
                    </Button>
                  </div>
                  {notifyMessages[product._id] && (
                    <div
                      className={`mt-2 p-1 sm:p-2 rounded-md text-xs sm:text-sm font-medium flex
                                 justify-between items-center ${
                                   notifyMessages[product._id].type === 'success'
                                     ? 'bg-green-100 text-green-800'
                                     : 'bg-red-100 text-red-800'
                                 }`}
                    >
                      <span>{notifyMessages[product._id].content}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setNotifyMessages(prev => {
                            const m = { ...prev }
                            delete m[product._id]
                            return m
                          })
                        }}
                        className="ml-2 text-gray-500 hover:text-gray-700"
                        aria-label="Close"
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
      </div>

      <div className="p-3 sm:p-4 md:p-5 lg:p-6">
        <h2 className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold text-black">
          {product.name}
        </h2>
        <div className="mt-2 flex items-center justify-between">
          <div>
          {product.inventoryStatus === 'elfogyott' ? (
            <div className="flex items-center">
  <span
    className="relative text-base sm:text-lg lg:text-xl font-semibold text-black line-through"
  >
    {formatPriceToHUF(product.price)} Ft
  </span>
  <span
    className="relative bg-black text-white font-bold text-xs sm:text-sm lg:text-base ml-2 px-3 py-1 rounded"
    style={{ transform: 'translateY(-2px)' }}  // add this line
  >
    Elfogyott
  </span>
</div>

) : product.salePrice ? (
              <div className="flex flex-col sm:flex-row sm:items-center">
                <span className="text-base sm:text-lg lg:text-xl font-semibold text-[#dc2626]">
                  {formatPriceToHUF(product.salePrice)} Ft
                </span>
                <span className="text-sm sm:text-base lg:text-lg text-gray-500 line-through sm:ml-2">
                  {formatPriceToHUF(product.price)} Ft
                </span>
              </div>
            ) : (
              <span className="text-base sm:text-lg lg:text-xl font-semibold text-black">
                {formatPriceToHUF(product.price)} Ft
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  const renderSkeletonCard = () => (
    <div className={`rounded-lg overflow-hidden bg-white relative group border-0 transition-all duration-500 ease-in-out cursor-pointer ${sora.className}`}>
      <div className="relative aspect-square overflow-hidden">
        <Skeleton className="absolute inset-0 bg-gray-200 animate-pulse" />
      </div>
      <div className="p-3 sm:p-4 md:p-5 lg:p-6">
        <Skeleton className="h-6 w-3/4 mb-2 bg-gray-200 animate-pulse" />
        <Skeleton className="h-4 w-1/4 bg-gray-200 animate-pulse" />
      </div>
    </div>
  )

  return (
    <>
      <Header onCartClick={() => setIsSidebarOpen(true)} cartItems={cartItems} />
      <div className={`container mx-auto p-4 py-0 mt-[4rem] mb-[4rem] md:mt-[8rem] md:mb-[4rem] ${sora.className}`} ref={containerRef}>
      <div className="relative flex flex-col lg:flex-row items-start lg:items-center gap-4 lg:justify-between mb-6">
          <div className="text-3xl sm:text-[2.5rem] font-black uppercase tracking-wider">
           Jobb Biztosra Menni
          </div>
          <Link href="/products" className="view-all-link group flex items-center transition-all duration-300 ease-in-out">
            <span className="view-all-text relative mr-1">Összes termék</span>
            <div className="view-all-circle flex items-center justify-center rounded-full bg-[#e5e5e5] w-6 h-6 transition-all duration-300 ease-in-out group-hover:bg-[#dc2626]">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-all duration-300 ease-in-out group-hover:text-white">
                <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </Link>
        </div>
        {isLoading && (
          <div className="text-center mb-6">
            <p className="text-lg text-gray-600">Loading products...</p>
          </div>
        )}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {isLoading
            ? Array(8).fill(null).map((_, idx) => <div key={idx}>{renderSkeletonCard()}</div>)
            : products.map((p, idx) => renderProductCard(p, idx))}
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
          0%, 100% { transform: rotate(0deg); }
          20%, 60% { transform: rotate(-15deg); }
          40%, 80% { transform: rotate(15deg); }
        }
        .animate-ring {
          animation: ring 2s ease-in-out infinite;
        }

        @keyframes chainReaction {
          0% { opacity: 0; transform: translateY(15px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-chainReaction {
          animation: chainReaction 0.2s ease-out forwards;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .view-all-text {
          position: relative;
        }
        .view-all-text::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 0;
          height: 1px;
          background-color: black;
          transition: width 0.3s ease-in-out;
        }
        .view-all-link:hover .view-all-text::after {
          width: 100%;
        }
        .view-all-link:hover svg path {
          stroke: white;
        }

        @media (max-width: 500px) {
          .email-input {
            width: 100%;
            padding: 3px 6px;
            font-size: 12px;
            height: 32px;
          }
          .email-input + button {
            width: 100% !important;
            padding: 3px 8px !important;
            height: 32px !important;
            font-size: 12px !important;
          }
          .notify-form p {
            font-size: 11px !important;
          }
        }

        @media (max-width: 400px) {
          .product-price .text-base {
            font-size: 14px !important;
          }
          .product-price .text-sm {
            font-size: 12px !important;
          }
          .product-price .ml-2 {
            margin-left: 0.25rem !important;
          }
          .product-price .text-base:not(.text-[#dc2626]) {
            font-size: 14px !important;
          }
        }
      `}</style>
    </>
  )
}