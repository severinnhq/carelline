'use client'

import React, { useState, useEffect } from 'react'
import { X, ShoppingBag } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useCheckout } from '@/lib/useCheckout'
import ReservationTimer from '@/components/ReservationTimer'

interface CartItem {
  product: {
    _id: string;
    name: string;
    mainImage: string;
    price: number;
    salePrice?: number;
  };
  size: string;
  quantity: number;
}

interface SidebarProps {
  cartItems: CartItem[];
  isOpen: boolean;
  onClose: () => void;
  onRemoveItem: (index: number) => void;
  onUpdateQuantity: (index: number, newQuantity: number) => void;
}

interface ShippingProgressBarProps {
  currentAmount: number;
  freeShippingThreshold: number;
}

const ShippingProgressBar: React.FC<ShippingProgressBarProps> = ({ currentAmount, freeShippingThreshold }) => {
  const progress = Math.min((currentAmount / freeShippingThreshold) * 100, 100);
  const remainingAmount = Math.max(freeShippingThreshold - currentAmount, 0);

  return (
    <div className="mt-4 mb-6">
      <div className="mb-2">
        {remainingAmount > 0 ? (
          <p className="text-sm text-gray-900">
            Add <span className="font-semibold">€{remainingAmount.toFixed(2)}</span> for free shipping
          </p>
        ) : (
          <p className="text-sm text-gray-900 font-semibold">
            You've qualified for free shipping!
          </p>
        )}
      </div>
      <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
        <div
          className="bg-black h-full rounded-full transition-all duration-300 ease-in-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ cartItems, isOpen, onClose, onRemoveItem, onUpdateQuantity }) => {
  const [isLoading, setIsLoading] = useState(false)
  const { handleCheckout } = useCheckout();

  useEffect(() => {
    if (cartItems.length > 0) {
      const storedStartTime = localStorage.getItem('cartTimerStartTime');
      if (!storedStartTime) {
        localStorage.setItem('cartTimerStartTime', Date.now().toString());
      }
    } else {
      localStorage.removeItem('cartTimerStartTime');
    }
  }, [cartItems.length]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const processCheckout = async () => {
    setIsLoading(true);
    await handleCheckout();
    setIsLoading(false);
  };

  const cartTotal = cartItems.reduce((total, item) => total + (item.product.salePrice || item.product.price) * item.quantity, 0);

  const calculateRemainingTime = () => {
    if (cartItems.length === 0) return 0;
    const startTime = localStorage.getItem('cartTimerStartTime');
    if (!startTime) return 0;
    
    const elapsedTime = Math.floor((Date.now() - parseInt(startTime, 10)) / 1000);
    return Math.max(0, 180 - elapsedTime); // 3 minutes in seconds
  };

  return (
    <div 
      className={`fixed inset-0 z-[110] ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
      aria-hidden={!isOpen}
    >
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className={`absolute inset-0 bg-black bg-opacity-50 transition-opacity ${isOpen ? 'opacity-100 cursor-close' : 'opacity-0'}`} 
          onClick={onClose}
          aria-label="Close sidebar"
        />
        <motion.div
          initial={{ x: 'calc(100% + 1rem)' }}
          animate={{ x: isOpen ? '0%' : 'calc(100% + 1rem)' }}
          transition={{ type: 'tween', ease: 'easeOut', duration: 0.3 }}
          className="fixed inset-y-0 md:inset-y-4 right-0 md:right-4 w-full md:w-auto md:max-w-[26rem] flex p-4 md:p-0"
        >
          <div className="relative w-full md:w-[400px] flex">
            <div className="absolute inset-0 bg-white shadow-xl rounded-lg" />
            <div className="relative flex-1 flex flex-col h-full p-4 md:p-4 bg-white rounded-lg md:rounded-lg overflow-hidden">
              <div className="flex-shrink-0 py-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <h2 className="text-lg font-medium text-gray-900">Cart</h2>
                    <div className="ml-2 bg-black rounded-full w-6 h-6 flex items-center justify-center">
                      <span className="text-xs text-white">{cartItems.length}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="p-2 text-gray-400 hover:text-gray-500 rounded-full hover:bg-gray-100 transition-colors"
                    onClick={onClose}
                    aria-label="Close panel"
                  >
                    <X size={24} aria-hidden="true" />
                  </button>
                </div>
              </div>
              {cartItems.length > 0 && (
                <>
                  <ShippingProgressBar
                    currentAmount={cartTotal}
                    freeShippingThreshold={100}
                  />
                  {calculateRemainingTime() > 0 && (
                    <div className="mb-6 p-3 bg-blue-50 rounded-md">
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-blue-800">We've reserved your items for:</p>
                        <ReservationTimer initialTime={calculateRemainingTime()} />
                      </div>
                    </div>
                  )}
                </>
              )}

              <div className="flex-1 overflow-y-auto">
                <div className="mt-8">
                  {cartItems.length === 0 ? (
                    <div className="text-center py-12">
                      <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" aria-hidden="true" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">Your cart is empty</h3>
                      <p className="mt-1 text-sm text-gray-500">Start adding some items to your cart!</p>
                      <div className="mt-6">
                        <Button onClick={onClose} variant="outline" className="w-full">
                          Continue Shopping
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flow-root">
                      <ul role="list" className="-my-6 divide-y divide-gray-200">
                        {cartItems.map((item, index) => (
                          <li key={`${item.product._id}-${item.size}`} className="py-6 flex">
                            <Link
                              href={`/product/${item.product._id}`}
                              className="flex-shrink-0 w-24 h-24 border border-gray-200 rounded-md overflow-hidden"
                              onClick={(e) => {
                                e.stopPropagation()
                                onClose()
                              }}
                            >
                              <Image
                                src={`/uploads/${item.product.mainImage}`}
                                alt={item.product.name}
                                width={96}
                                height={96}
                                className="w-full h-full object-center object-cover"
                              />
                            </Link>

                            <div className="ml-4 flex-1 flex flex-col">
                              <div>
                                <div className="flex justify-between text-base font-medium text-gray-900">
                                  <h3>
                                    <Link
                                      href={`/product/${item.product._id}`}
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        onClose()
                                      }}
                                      className="hover:underline"
                                    >
                                      {item.product.name}
                                    </Link>
                                  </h3>
                                  <p className="ml-4">
                                    €{((item.product.salePrice || item.product.price) * item.quantity).toFixed(2)}
                                  </p>
                                </div>
                                <p className="mt-1 text-sm text-gray-500">Size: {item.size}</p>
                              </div>
                              <div className="flex-1 flex items-end justify-between text-sm">
                                <div className="flex items-center">
                                  <input
                                    type="number"
                                    min="1"
                                    value={item.quantity}
                                    onChange={(e) => onUpdateQuantity(index, Math.max(1, parseInt(e.target.value) || 1))}
                                    onClick={(e) => e.currentTarget.select()}
                                    className="w-16 p-1 text-center border rounded [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    aria-label={`Quantity for ${item.product.name}`}
                                  />
                                </div>
                                <div className="flex">
                                  <button
                                    onClick={() => onRemoveItem(index)}
                                    className="text-sm font-medium text-black hover:text-gray-700 relative group"
                                    aria-label={`Remove ${item.product.name} from cart`}
                                  >
                                    Remove
                                    <span className="absolute bottom-0 left-0 w-full h-[1px] bg-black transform origin-left transition-transform duration-300 ease-out group-hover:scale-x-0"></span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {cartItems.length > 0 && (
                <div className="flex-shrink-0 border-t border-gray-200 pt-6">
                  <div className="flex justify-between text-base font-medium text-gray-900">
                    <p>Subtotal</p>
                    <p>
                      €{cartTotal.toFixed(2)}
                    </p>
                  </div>
                  <p className="mt-0.5 text-sm text-gray-500">
                    {cartTotal >= 100
                      ? "Free shipping included."
                      : "Shipping calculated at checkout."}
                    {" Taxes calculated at checkout."}
                  </p>
                  <div className="mt-6 space-y-4">
                    <Button onClick={processCheckout} disabled={isLoading} className="w-full bg-black text-white hover:bg-gray-800">
                      {isLoading ? 'Processing...' : 'Checkout'}
                    </Button>
                    <Button onClick={onClose} variant="outline" className="w-full border-black text-black hover:bg-gray-100">
                      Continue Shopping
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Sidebar

