'use client';

import React, { useEffect, useState } from 'react';
import HeroSection from '../components/heroSection';
import FeatureSection from '../components/FeatureSection';
import BlackFridayCountdown from '../components/BlackFridayCountdown';
import ReviewSection from '@/components/ReviewSection';
import FAQSection from '@/components/faq';
import WhySection from '../components/why';
import Maintenance from '../components/maintenance';
import { useCountdown } from '@/lib/CountdownContext';
import { Header } from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import CartModal from '@/components/CartModal';
import ProductList from '../components/ProductList';
import { useCart } from '@/lib/CartContext';

// Updated Product interface with required properties
interface ProductOption {
  size: string;
  image: string;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  mainImage: string;
  sizes: string[];  
  options?: ProductOption[]; // ✅ allow size → image mapping
}


const SHOW_COUNTDOWN = false;

// Set this to true when you want to show maintenance mode
const IS_MAINTENANCE_MODE = false;

export default function Home() {
  const { setIsCountdownActive } = useCountdown();
  const { cartItems, addToCart, removeFromCart, updateQuantity } = useCart();
  const [cartProduct, setCartProduct] = useState<Product | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMaintenanceMode] = useState(IS_MAINTENANCE_MODE);

  useEffect(() => {
    setIsCountdownActive(SHOW_COUNTDOWN);
  }, [setIsCountdownActive]);

  // When the countdown is active, render it exclusively.
  if (SHOW_COUNTDOWN) {
    return <BlackFridayCountdown />;
  }

  // Once the user confirms (e.g., selecting a size) in the CartModal, add the product.
 const handleConfirmAddToCart = (size: string) => {
  if (cartProduct) {
    const selectedOption = cartProduct.options?.find(opt => opt.size === size);
    const image = selectedOption?.image || cartProduct.mainImage;

    addToCart(cartProduct, size, 1, image);  // ✅ now 4 args
    setCartProduct(null);
    setIsSidebarOpen(true);
  }
};

  return (
    <main className="flex flex-col min-h-screen">
      {/* Maintenance Mode Overlay */}
      <Maintenance 
        isMaintenanceMode={isMaintenanceMode} 
        adminControls={false}
      />

      {/* Regular Site Content */}
      {!isMaintenanceMode && (
        <>
          <Header onCartClick={() => setIsSidebarOpen(true)} cartItems={cartItems} />

          <section id="hero">
            <HeroSection />
          </section>

          {/* New "Why" Section */}
          <section id="why">
            <WhySection />
          </section>

          <section id="products">
            <ProductList />
          </section>

          <section id="review">
            <ReviewSection />
          </section>

          <section id="features">
            <FeatureSection />
          </section>

          <section id="faq">
            <FAQSection />
          </section>

          {cartProduct && (
            <CartModal
              product={cartProduct}
              onClose={() => setCartProduct(null)}
              onAddToCart={handleConfirmAddToCart}
            />
          )}

          <Sidebar
            cartItems={cartItems}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            onRemoveItem={removeFromCart}
            onUpdateQuantity={updateQuantity}
          />
        </>
      )}
    </main>
  );
}