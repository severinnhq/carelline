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
  selectedImage?: string
  characterName?: string
}

type AddToCartOptions = {
  selectedImage?: string
  characterName?: string
}

interface CartContextType {
  cartItems: CartItem[]
  addToCart: (product: Product, size: string, quantity?: number, options?: AddToCartOptions) => void
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
      try {
        setCartItems(JSON.parse(savedCartItems))
      } catch {
        // ignore parse errors
        setCartItems([])
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems))
  }, [cartItems])

 const addToCart = (
  product: Product,
  size: string,
  quantity: number = 1,
  options: AddToCartOptions = {}
) => {
  const incomingImage = options.selectedImage ?? product.mainImage
  const incomingName = options.characterName ?? ""

  setCartItems(prev => {
    // find existing item that matches product, size and chosen image
    const existingItemIndex = prev.findIndex(item => {
      const itemImage = item.selectedImage ?? item.product.mainImage
      return item.product._id === product._id && item.size === size && itemImage === incomingImage
    })

    if (existingItemIndex > -1) {
      return prev.map((item, idx) =>
        idx === existingItemIndex
          ? { ...item, quantity: item.quantity + quantity, characterName: incomingName, selectedImage: incomingImage }
          : item
      )
    } else {
      const newItem: CartItem = {
        product,
        size,
        quantity,
        selectedImage: incomingImage,
        characterName: incomingName,
      }
      return [...prev, newItem]
    }
  })
}


  const removeFromCart = (index: number) => {
    setCartItems(prev => prev.filter((_, i) => i !== index))
  }

  const updateQuantity = (index: number, newQuantity: number) => {
    setCartItems(prev => {
      const newItems = [...prev]
      if (newItems[index]) {
        newItems[index] = { ...newItems[index], quantity: newQuantity }
      }
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
