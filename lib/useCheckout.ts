import { loadStripe } from '@stripe/stripe-js';
import { useCart } from '@/lib/CartContext';
import { useState } from 'react';

export function useCheckout() {
  const { cartItems, clearCart } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleCheckout = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!cartItems || cartItems.length === 0) {
        console.error('No items in cart');
        setError('Your cart is empty');
        throw new Error('Your cart is empty');
      }
      
      // Check minimum order amount (175 HUF is minimum for Stripe)
      const MIN_AMOUNT_HUF = 175;
      const cartTotal = cartItems.reduce((sum, item) => {
        const price = item.product.salePrice || item.product.price;
        return sum + (price * item.quantity);
      }, 0);
      
      if (cartTotal < MIN_AMOUNT_HUF) {
        console.error(`Cart total ${cartTotal} HUF is below minimum order amount of ${MIN_AMOUNT_HUF} HUF`);
        setError(`Minimum order amount is ${MIN_AMOUNT_HUF} HUF. Please add more items to your cart.`);
        throw new Error(`Minimum order amount is ${MIN_AMOUNT_HUF} HUF. Please add more items to your cart.`);
      }
      
      // Make sure Stripe is loaded properly
      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
      if (!stripe) {
        setError('Failed to initialize Stripe');
        throw new Error('Failed to initialize Stripe');
      }
      
      // Log what we're sending to help with debugging
      console.log('Sending cart items to checkout:', JSON.stringify(cartItems));
      
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cartItems),
      });
      
      // Get the full response text for debugging
      const responseText = await response.text();
      
      if (response.ok) {
        try {
          // Parse the response text as JSON
          const data = JSON.parse(responseText);
          const { sessionId } = data;
          
          if (!sessionId) {
            console.error('No session ID returned:', data);
            setError('Invalid checkout session response');
            throw new Error('Invalid checkout session response');
          }
          
          console.log('Redirecting to checkout with session ID:', sessionId);
          const result = await stripe.redirectToCheckout({ sessionId });
          
          if (result?.error) {
            console.error('Stripe redirect error:', result.error);
            setError(result.error.message || 'Error redirecting to checkout');
            throw new Error(result.error.message || 'Error redirecting to checkout');
          } else {
            clearCart();
          }
        } catch (error) {
          console.error('Failed to parse response:', responseText, error);
          setError('Invalid response from server');
          throw new Error('Invalid response from server');
        }
      } else {
        console.error(`Failed to create checkout session: Status ${response.status}, Response:`, responseText);
        try {
          const errorData = JSON.parse(responseText);
          setError(errorData.error || 'Failed to create checkout session');
          throw new Error(errorData.error || 'Failed to create checkout session');
        } catch (_) {
          setError(`Server error (${response.status}): ${responseText}`);
          throw new Error(`Server error (${response.status}): ${responseText}`);
        }
      }
    } catch (error) {
      console.error('Checkout error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  return { handleCheckout, isLoading, error };
}