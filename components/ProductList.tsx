'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import CartModal from "@/components/CartModal"
import Sidebar from "@/components/Sidebar"
import { Header } from './Header'
import { useCart } from '@/lib/CartContext'
import { useRouter } from 'next/navigation'
import { ShoppingCart, BellIcon } from 'lucide-react'
import { Input } from "@/components/ui/input"

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

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([])
  const [cartProduct, setCartProduct] = useState<Product | null>(null)
  const [animatingProducts, setAnimatingProducts] = useState<string[]>([])
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [notifyMessages, setNotifyMessages] = useState<{ [key: string]: { type: 'success' | 'error', content: string } }>({})
  const [notifyClicked, setNotifyClicked] = useState<string | null>(null);
  const productRefs = useRef<(HTMLDivElement | null)[]>([])
  const containerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
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
          [productId]: { type: 'error', content: 'Already subscribed or error occurred.' }
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

  useEffect(() => {
    async function fetchProducts() {
      const response = await fetch('/api/products')
      if (response.ok) {
        const data = await response.json()
        setProducts(data)
      }
    }
    fetchProducts()
  }, [])

  const getProductsPerRow = useCallback(() => {
    if (!containerRef.current) return 4; // Default to 4 if container not available
    const containerWidth = containerRef.current.offsetWidth;
    if (containerWidth >= 1280) return 4; // xl breakpoint
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
        const productId = entry.target.id;
        if (entry.isIntersecting) {
          const index = productRefs.current.findIndex(ref => ref && ref.id === productId);
          startChainReaction(index);
        } else {
          // Remove the product from animatingProducts when it's out of view
          setAnimatingProducts(prev => prev.filter(id => id !== productId));
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
    function handleClickOutside(event: MouseEvent) {
      if (notifyClicked) {
        const clickedInsideProduct = productRefs.current.some(ref => 
          ref && ref.contains(event.target as Node)
        );
        if (!clickedInsideProduct) {
          setNotifyClicked(null);
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [notifyClicked]);

  return (
    <>
      <Header onCartClick={() => setIsSidebarOpen(true)} cartItems={cartItems} />
      <div className="container mx-auto p-4 pt-40 pb-24" ref={containerRef}>
        <h1 className="text-4xl font-bold mb-12">LAST SALE OF THE YEAR</h1>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-10"> {/* Update 1 */}
          {products.map((product, index) => (
            <div 
              key={product._id}
              id={product._id}
              ref={(el: HTMLDivElement | null) => { productRefs.current[index] = el }}
              className={`rounded-lg overflow-hidden bg-white relative group border-0 transition-all duration-500 ease-in-out cursor-pointer`}
              style={{
                opacity: animatingProducts.includes(product._id) ? 1 : 0,
                transform: animatingProducts.includes(product._id) ? 'translateY(0)' : 'translateY(32px)',
                transition: 'opacity 0.5s ease-out, transform 0.5s ease-out',
              }}
              onClick={() => handleProductClick(product._id)}
            >
              <div 
                className="relative aspect-square overflow-hidden"
              >
                {product.salePrice && (
                  <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full z-20">
                    SALE
                  </div>
                )}
                <div 
                  className={`absolute inset-0 transition-opacity duration-300 ease-out ${
                    product.sizes.length === 0 ? 'opacity-40 md:group-hover:opacity-0' : 'md:group-hover:opacity-0'
                  }`}
                >
                  <Image
                    src={`/uploads/${product.mainImage}`}
                    alt={product.name}
                    fill
                    className="object-cover bg-transparent"
                  />
                </div>
                {product.galleryImages.length > 0 && (
                  <div 
                    className={`absolute inset-0 transition-opacity duration-300 ease-out ${
                      product.sizes.length === 0 
                        ? 'opacity-0 md:group-hover:opacity-40' 
                        : 'opacity-0 md:group-hover:opacity-100'
                    }`}
                  >
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
                        onClick={(e) => {
                          e.stopPropagation();
                          setNotifyClicked(product._id);
                        }}
                      >
                        <BellIcon className="h-4 w-4 mr-1 animate-ring" />
                        Notify Me
                      </Button>
                    </div>
                    {(notifyClicked === product._id) && (
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
              <div className="p-4 sm:p-5 md:p-6 lg:p-7"> {/* Update 2 */}
                <h2 className="text-base sm:text-lg lg:text-xl xl:text-2xl font-semibold text-black"> {/* Update 3 */} {product.name}</h2>
                <div className="mt-2 flex items-center justify-between">
                  <div>
                    {product.sizes.length === 0 ? (
                      <span className="text-base text-black">
                        Sold Out
                      </span>
                    ) : product.salePrice ? (
                      <>
                        <span className="text-base sm:text-lg lg:text-xl font-bold text-red-600"> {/* Update 3 */}
                          €{product.salePrice.toFixed(2)}
                        </span>
                        <span className="text-sm sm:text-base lg:text-lg text-gray-500 line-through ml-2"> {/* Update 3 */}
                          €{product.price.toFixed(2)}
                        </span>
                      </>
                    ) : (
                      <span className="text-base sm:text-lg lg:text-xl font-bold text-black"> {/* Update 3 */}
                        €{product.price.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
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

