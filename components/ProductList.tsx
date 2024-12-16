'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import CartModal from "@/components/CartModal"
import Sidebar from "@/components/Sidebar"
import { Header } from './Header'
import { useCart } from '@/lib/CartContext'
import { useRouter } from 'next/navigation'
import { ShoppingCart, BellIcon } from 'lucide-react'
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
}

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [cartProduct, setCartProduct] = useState<Product | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [notifyMessages, setNotifyMessages] = useState<{ [key: string]: { type: 'success' | 'error', content: string } }>({})
  const [notifyClicked, setNotifyClicked] = useState<string | null>(null);
  const productRefs = useRef<(HTMLDivElement | null)[]>([])
  const notifyFormRefs = useRef<(HTMLFormElement | null)[]>([])
  const containerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { cartItems, addToCart, removeFromCart, updateQuantity } = useCart()
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = productRefs.current.findIndex(ref => ref === entry.target);
            const delay = index * 45;
            setTimeout(() => {
              entry.target.classList.add('animate-chainReaction')
            }, delay)
          } else {
            entry.target.classList.remove('animate-chainReaction')
          }
        })
      },
      { 
        threshold: 0.1,
        rootMargin: '0px 0px 0% 0px'
      }
    )

    const currentRefs = productRefs.current;

    currentRefs.forEach((ref) => {
      if (ref) observer.observe(ref)
    })

    return () => {
      currentRefs.forEach((ref) => {
        if (ref) observer.unobserve(ref)
      })
    }
  }, [products])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifyClicked) {
        const clickedProduct = productRefs.current.find((ref, index) => 
          ref && ref.contains(event.target as Node) && notifyFormRefs.current[index]?.contains(event.target as Node)
        );
        
        if (!clickedProduct) {
          setNotifyClicked(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [notifyClicked]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 500);
    };

    // Check initially
    checkMobile();

    // Add event listener
    window.addEventListener('resize', checkMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // Restore scroll position on component mount
    const savedScrollPosition = sessionStorage.getItem('productListScrollPosition');
    if (savedScrollPosition) {
      window.scrollTo(0, parseInt(savedScrollPosition));
      sessionStorage.removeItem('productListScrollPosition');
    }
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products')
      if (response.ok) {
        const data: Product[] = await response.json()
        const featuredProducts = data
          .map((product) => ({
            ...product,
            price: Number(product.price) || 0,
            salePrice: product.salePrice ? Number(product.salePrice) || 0 : undefined,
            categories: Array.isArray(product.categories) ? product.categories : [product.categories].filter(Boolean)
          }))
          .filter(product => product.categories.includes('featured'))
        setProducts(featuredProducts)
      } else {
        console.error('Failed to fetch products')
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setIsLoading(false)
    }
  }

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
    // Save current scroll position
    sessionStorage.setItem('productListScrollPosition', window.scrollY.toString());
    router.push(`/product/${productId}`);
  }

  const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>, productId: string, productName: string) => {
    e.preventDefault();
    const emailInput = e.currentTarget.elements.namedItem('email') as HTMLInputElement
    const email = emailInput.value;
    try {
      const response = await fetch('/api/notify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, productId, productName }),
      });
      if (response.ok) {
        setNotifyMessages(prev => ({
          ...prev,
          [productId]: { type: 'success', content: 'You\'ll be notified when in stock.' }
        }))
        emailInput.value = '' // Clear the input
      } else {
        setNotifyMessages(prev => ({
          ...prev,
          [productId]: { type: 'error', content: 'Already subscribed.' }
        }))
      }
    } catch (error) {
      console.error('Error saving email:', error);
      setNotifyMessages(prev => ({
        ...prev,
        [productId]: { type: 'error', content: 'An error occurred. Please try again.' }
      }))
    }
  };

  const renderProductCard = (product: Product, index: number) => (
    <div 
      key={product._id}
      id={product._id}
      ref={(el: HTMLDivElement | null) => { productRefs.current[index] = el }}
      className={`rounded-lg overflow-hidden bg-white relative group border-0 transition-all duration-500 ease-in-out cursor-pointer opacity-0 translate-y-8 ${sora.className}`}
      onClick={() => handleProductClick(product._id)}
    >
      <div className="relative aspect-square overflow-hidden">
        {product.salePrice && (
          <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg z-20">
            SALE
          </div>
        )}
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
        {product.sizes.length === 0 && (
          <>
            <div className="absolute top-2 right-2 z-20 flex items-center space-x-1">
              <Button
                variant="secondary"
                size="sm"
                className="bg-white text-black hover:bg-gray-100 shadow-[0_0_10px_rgba(0,0,0,0.3)] group text-xs sm:text-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setNotifyClicked(notifyClicked === product._id ? null : product._id);
                }}
              >
                <BellIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 animate-ring" />
                Notify Me
              </Button>
            </div>
            {(notifyClicked === product._id) && (
              <div 
                className="absolute top-12 right-2 z-30 bg-white rounded-lg p-2 sm:p-3 shadow-[0_0_10px_rgba(0,0,0,0.3)] w-56 sm:w-64 max-w-[calc(100%-1rem)] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <form 
                  ref={(el: HTMLFormElement | null) => {
                    if (el) notifyFormRefs.current[index] = el;
                  }}
                  onSubmit={(e) => handleEmailSubmit(e, product._id, product.name)} 
                  className="flex flex-col space-y-2 notify-form"
                >
                  <p className="text-xs sm:text-sm font-semibold">{product.name}</p>
                  <div className={`flex ${isMobile ? 'flex-col space-y-2' : 'items-center space-x-2'}`}>
                    <Input
                      type="email"
                      name="email"
                      placeholder={isMobile ? "Email" : "Enter your email"}
                      className="text-xs sm:text-sm flex-grow email-input"
                      required
                    />
                    <Button type="submit" size="sm" className={`whitespace-nowrap bg-black text-white hover:bg-gray-800 text-xs sm:text-sm py-1 px-2 sm:py-2 sm:px-3 ${isMobile ? 'w-full' : ''}`}>
                      Notify
                    </Button>
                  </div>
                  {notifyMessages[product._id] && (
                    <div 
                      className={`mt-2 p-1 sm:p-2 rounded-md text-xs sm:text-sm font-medium flex justify-between items-center ${
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
                className="bg-black text-white hover:bg-gray-800 text-sm sm:text-base lg:text-lg py-2 px-3 sm:py-2 sm:px-4 lg:py-3 lg:px-5"
              >
                <span className="font-bold">+ Add to Cart</span>
              </Button>
            </div>
            <div className="absolute bottom-4 right-4 md:hidden">
              <Button
                onClick={(e) => {
                  e.stopPropagation()
                  handleAddToCart(product)
                }}
                className="bg-white text-black hover:bg-gray-100 p-3 rounded-full"
              >
                <ShoppingCart size={24} className="sm:w-6 sm:h-6 lg:w-7 lg:h-7" />
              </Button>
            </div>
          </>
        )}
      </div>
      <div className="p-3 sm:p-4 md:p-5 lg:p-6">
        <h2 className="text-base sm:text-lg lg:text-xl xl:text-2xl font-semibold text-black">{product.name}</h2>
        <div className="mt-2 flex items-center justify-between">
          <div>
            {product.sizes.length === 0 ? (
              <span className="text-sm sm:text-base lg:text-lg text-black">
                Sold Out
              </span>
            ) : product.salePrice ? (
              <>
                <span className="text-base sm:text-lg lg:text-xl font-bold text-red-600">
                  €{product.salePrice.toFixed(2)}
                </span>
                <span className="text-sm sm:text-base lg:text-lg text-gray-500 line-through ml-2">
                  €{product.price.toFixed(2)}
                </span>
              </>
            ) : (
              <span className="text-base sm:text-lg lg:text-xl font-semibold text-black">
                €{product.price.toFixed(2)}
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
        <Skeleton className="absolute inset-0" />
      </div>
      <div className="p-3 sm:p-4 md:p-5 lg:p-6">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/4" />
      </div>
    </div>
  )

  return (
    <>
      <Header onCartClick={() => setIsSidebarOpen(true)} cartItems={cartItems} />
      <div className={`container mx-auto p-4 py-0 mt-[4rem] mb-[2rem] md:mt-[8rem] md:mb-[4rem] ${sora.className}`} ref={containerRef}>
        <h1 className="text-4xl sm:text-5xl font-bold mb-[2rem] md:mb-[4rem] text-center uppercase tracking-wider">LAST SALE OF THE YEAR</h1>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {isLoading
            ? Array(8).fill(null).map((_, index) => <div key={index}>{renderSkeletonCard()}</div>)
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
            transform: translateY(15px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-chainReaction {
          animation: chainReaction 0.2s ease-out forwards;
        }

        @media (max-width: 500px) {
          .email-input {
            width: 100%;
            padding: 3px 6px;
            font-size: 12px;
            height: 32px;
            
            &::placeholder {
              content: "Email";
              font-size: 12px;
            }
          }

          .email-input + button {
            width: 100%;
            padding: 3px 8px !important;
            height: 32px !important;
            font-size: 12px !important;
          }

          .notify-form p {
            font-size: 11px !important;
          }
        }
      `}</style>
    </>
  )
}

