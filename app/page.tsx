'use client';

import React, { useEffect, useState } from 'react';
import HeroSection from '../components/heroSection';
import FeatureSection from '../components/FeatureSection';
import BlackFridayCountdown from '../components/BlackFridayCountdown';
import ReviewSection from '@/components/ReviewSection';
import FAQSection from '@/components/faq';
import { useCountdown } from '@/lib/CountdownContext';
import { Header } from '@/components//Header';
import Sidebar from '@/components/Sidebar';
import CartModal from '@/components/CartModal';
import { useCart } from '@/lib/CartContext';

const SHOW_COUNTDOWN = false;

export default function Home() {
  const { setIsCountdownActive } = useCountdown();
  const { cartItems, addToCart, removeFromCart, updateQuantity } = useCart();
  const [cartProduct, setCartProduct] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    setIsCountdownActive(SHOW_COUNTDOWN);
  }, [setIsCountdownActive]);

  // When the countdown is active, render it exclusively.
  if (SHOW_COUNTDOWN) {
    return <BlackFridayCountdown />;
  }

  // Dummy handler for adding to cart—update as needed based on your product selection logic.
  const handleAddToCart = (product: any) => {
    setCartProduct(product);
  };

  // Once the user confirms (e.g., selecting a size) in the CartModal, add the product.
  const handleConfirmAddToCart = (size: string) => {
    if (cartProduct) {
      addToCart(cartProduct, size, 1);
      setCartProduct(null);
      setIsSidebarOpen(true);
    }
  };

  return (
    <main className="flex flex-col min-h-screen">
      {/* Header remains at the top */}
      <Header onCartClick={() => setIsSidebarOpen(true)} cartItems={cartItems} />

      <section id="hero">
        <HeroSection />
      </section>

      {/* New Feature Section with image and collapsible items */}
      <section id="features">
        <FeatureSection />
      </section>

      <section id="review">
        <ReviewSection />
      </section>

      <section id="faq">
        <FAQSection />
      </section>

  

      {/* Cart Modal for product selection */}
      {cartProduct && (
        <CartModal
          product={cartProduct}
          onClose={() => setCartProduct(null)}
          onAddToCart={handleConfirmAddToCart}
        />
      )}

      {/* Sidebar displays the cart items */}
      <Sidebar
        cartItems={cartItems}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onRemoveItem={removeFromCart}
        onUpdateQuantity={updateQuantity}
      />
    </main>
  );
}