'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import CartModal from "@/components/CartModal"
import Sidebar from "@/components/Sidebar"
import { loadStripe } from '@stripe/stripe-js'
import { Header } from './Header'

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

interface CartItem {
  product: Product
  size: string
  quantity: number
}

function useCart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])

  useEffect(() => {
    const savedCartItems = localStorage.getItem('cartItems')
    if (savedCartItems) {
      setCartItems(JSON.parse(savedCartItems))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems))
  }, [cartItems])

  const addToCart = useCallback((product: Product, size: string) => {
    setCartItems(prev => {
      const existingItemIndex = prev.findIndex(
        item => item.product._id === product._id && item.size === size
      );
      if (existingItemIndex > -1) {
        return prev.map((item, index) => 
          index === existingItemIndex 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prev, { product, size, quantity: 1 }];
      }
    });
  }, []);

  const removeFromCart = useCallback((index: number) => {
    setCartItems(prev => prev.filter((_, i) => i !== index));
  }, []);

  const updateQuantity = useCallback((index: number, newQuantity: number) => {
    setCartItems(prev => {
      const newItems = [...prev];
      newItems[index].quantity = newQuantity;
      return newItems;
    });
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
    localStorage.removeItem('cartItems');
  }, []);

  return { cartItems, addToCart, removeFromCart, updateQuantity, clearCart };
}

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([])
  const [cartProduct, setCartProduct] = useState<Product | null>(null)
  const { cartItems, addToCart, removeFromCart, updateQuantity, clearCart } = useCart()
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null)
  const [visibleProducts, setVisibleProducts] = useState<Set<string>>(new Set())
  const productRefs = useRef<(HTMLDivElement | null)[]>([])
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const handleAddToCart = (product: Product) => {
    setIsSidebarOpen(false)
    setCartProduct(product)
  }

  const handleCloseModal = () => {
    setCartProduct(null)
  }

  const handleConfirmAddToCart = (size: string) => {
    if (cartProduct) {
      addToCart(cartProduct, size);
      setCartProduct(null);
      setIsSidebarOpen(true);
    }
  };

  const handleRemoveCartItem = (index: number) => {
    removeFromCart(index);
    if (cartItems.length === 1) {
      setIsSidebarOpen(false);
    }
  }

  const handleUpdateQuantity = (index: number, newQuantity: number) => {
    updateQuantity(index, newQuantity);
  }

  const handleCheckout = async () => {
    const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

    try {
      console.log('Sending cart items to checkout:', JSON.stringify(cartItems, null, 2))
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cartItems),
      })

      if (response.ok) {
        const { sessionId } = await response.json()
        console.log('Received session ID:', sessionId)
        const result = await stripe?.redirectToCheckout({ sessionId })

        if (result?.error) {
          console.error('Stripe redirect error:', result.error)
        } else {
          clearCart()
        }
      } else {
        const errorData = await response.json()
        console.error('Failed to create checkout session:', errorData)
        alert(`Checkout failed: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert(`Checkout error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

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

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const productId = entry.target.id
          setVisibleProducts((prev) => new Set(prev).add(productId))
        }
      })
    }, {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    })

    productRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref)
    })

    return () => {
      productRefs.current.forEach((ref) => {
        if (ref) observer.unobserve(ref)
      })
    }
  }, [products])

  return (
    <>
      <Header cartItems={cartItems} onCartClick={() => setIsSidebarOpen(true)} />
      <div className="container mx-auto p-4 mt-16">
        <h1 className="text-2xl font-bold mb-4">Our Products</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product, index) => (
            <div 
              key={product._id}
              id={product._id}
              ref={(el: HTMLDivElement | null) => { productRefs.current[index] = el }}
              className={`rounded-lg overflow-hidden shadow-sm bg-white relative group transition-opacity duration-500 ease-in-out ${
                visibleProducts.has(product._id) ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div 
                className="relative aspect-square overflow-hidden bg-gray-100"
                onMouseEnter={() => setHoveredProduct(product._id)} 
                onMouseLeave={() => setHoveredProduct(null)}
              >
                <div className={`absolute inset-0 transition-opacity duration-300 ease-out ${
                  hoveredProduct === product._id ? 'opacity-0 pointer-events-none' : 'opacity-100'
                }`}>
                  <Image
                    src={`/uploads/${product.mainImage}`}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
                {product.galleryImages.length > 0 && (
                  <div className={`absolute inset-0 transition-opacity duration-300 ease-out ${
                    hoveredProduct === product._id ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`}>
                    <Image
                      src={`/uploads/${product.galleryImages[0]}`}
                      alt={`${product.name} - Gallery`}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="absolute bottom-4 right-4 transform translate-y-1/4 transition-all duration-300 ease-out group-hover:translate-y-0 opacity-0 group-hover:opacity-100">
                  <Button 
                    onClick={() => handleAddToCart(product)}
                    className="bg-black text-white hover:bg-gray-800 text-sm py-1 px-3"
                  >
                    <span className="font-bold">+ Add to Cart</span>
                  </Button>
                </div>
              </div>
              <div className="p-4">
                <h2 className="text-xl font-semibold text-black">{product.name}</h2>
                <div className="mt-2">
                  {product.salePrice ? (
                    <>
                      <span className="text-lg font-bold text-red-600">${product.salePrice.toFixed(2)}</span>
                      <span className="text-sm text-gray-500 line-through ml-2">${product.price.toFixed(2)}</span>
                    </>
                  ) : (
                    <span className="text-lg font-bold text-black">${product.price.toFixed(2)}</span>
                  )}
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
          isOpen={isSidebarOpen}
          cartItems={cartItems} 
          onClose={() => setIsSidebarOpen(false)} 
          onRemoveItem={handleRemoveCartItem}
          onUpdateQuantity={handleUpdateQuantity}
          onCheckout={handleCheckout}
        />
      </div>
    </>
  )
}

