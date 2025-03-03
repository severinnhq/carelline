import React, { createContext, useContext, useState, useEffect } from 'react'

interface Product {
  _id: string
  name: string
  price: number
  salePrice?: number
  mainImage: string
}

interface CartItem {
  product: Product
  size: string
  quantity: number
}

interface CartContextType {
  cartItems: CartItem[]
  addToCart: (product: Product, size: string, quantity: number) => void
  removeFromCart: (index: number) => void
  updateQuantity: (index: number, newQuantity: number) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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

  const addToCart = (product: Product, size: string, quantity: number = 1) => {
    setCartItems(prev => {
      const existingItemIndex = prev.findIndex(
        item => item.product._id === product._id && item.size === size
      )
      if (existingItemIndex > -1) {
        return prev.map((item, index) => 
          index === existingItemIndex 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      } else {
        return [...prev, { product, size, quantity }]
      }
    })
  }

  const removeFromCart = (index: number) => {
    setCartItems(prev => prev.filter((_, i) => i !== index))
  }

  const updateQuantity = (index: number, newQuantity: number) => {
    setCartItems(prev => {
      const newItems = [...prev]
      newItems[index].quantity = newQuantity
      return newItems
    })
  }

  const clearCart = () => {
    setCartItems([])
    localStorage.removeItem('cartItems')
  }

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart 
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}