'use client'

import { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

// Define the Product interface to match your existing product structure
interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  mainImage: string;
  categories: string[];
  sizes: string[];
  galleryImages: string[];
}

interface PurchaseInfo {
  product: Product | null;
  name: string;
  city: string;
  timeAgo: string;
}

const RecentPurchasePopup = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [purchaseInfo, setPurchaseInfo] = useState<PurchaseInfo>({
    product: null,
    name: '',
    city: '',
    timeAgo: ''
  })

  // Memoize arrays so they remain stable across renders.
  const hungarianNames = useMemo(() => [
    'N. Zsófia', 'K. Eszter', 'T. Anna', 'Sz. Viktória', 
    'H. Nóra', 'K. Dóra', 'V. Virág', 'M. Kata',
    'N. Emese', 'F. Veronika', 'B. Lilla', 'P. Tímea',
    'T. Adrienn', 'K. Orsolya', 'N. Katalin', 'Sz. Zsanett',
    'V. Boglárka', 'P. Diána', 'B. Erika', 'M. Anikó',
    'K. Edina', 'N. Beáta', 'S. Henrietta', 'H. Mária',
    'F. Éva', 'B. Margit', 'G. Judit', 'V. Ágnes',
    'R. Magdolna', 'Cs. Irén', 'K. Klára', 'N. Piroska',
    'T. Nikolett', 'B. Szilvia', 'K. Bianka', 'H. Petra',
    'V. Flóra', 'Sz. Gabriella', 'N. Réka', 'F. Zsuzsanna'
  ], []);

  const hungarianCities = useMemo(() => [
    'Budapestről', 'Debrecenből', 'Szegedről', 'Miskolcról', 'Pécsről', 
    'Győrből', 'Nyíregyházáról', 'Kecskemétről', 'Székesfehérvárról', 'Szombathelyről',
    'Sopronból', 'Veszprémből', 'Zalaegerszegről', 'Egerről', 'Nagykanizsáról',
    'Dunaújvárosból', 'Hódmezővásárhelyről', 'Szolnokról', 'Bajáról', 'Esztergomból',
    'Gödöllőről', 'Pápáról', 'Gyöngyösről', 'Kiskunfélegyházáról', 'Mosonmagyaróvárról',
    'Ajkáról', 'Békéscsabáról', 'Ceglédről', 'Kaposvárról', 'Ózdról',
    'Salgótarjánból', 'Siófokról', 'Szekszárdról', 'Váczról', 'Várpalotáról',
    'Hatvanból', 'Kazincbarcikáról', 'Keszthelyről', 'Tatabányáról', 'Szentendréről',
    'Gyuláról', 'Hajdúböszörményből', 'Jászberényből', 'Kiskunhalasról', 'Mátészalkáról'
  ], []);

  // Generate a unique session ID for this browser session
  const generateSessionId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  };

  useEffect(() => {
    // Use localStorage to check if the user has EVER visited the site
    const hasVisitedBefore = localStorage.getItem('hasVisitedSite');
    
    // Create a sessionId for this browser session only IF it doesn't already exist
    if (!sessionStorage.getItem('browserSessionId')) {
      sessionStorage.setItem('browserSessionId', generateSessionId());
      
      // Only if this is a truly new browser session, we'll start the popup sequence
      // First time visitors OR returning visitors after closing browser/tab
      if (!hasVisitedBefore) {
        localStorage.setItem('hasVisitedSite', 'true');
        initializePopupSequence();
      }
    }
    
    // Initialize the popup sequence for first-time visitors
    function initializePopupSequence() {
      // Reset the popup counters for this browser session
      sessionStorage.setItem('popupsShown', '0');
      sessionStorage.setItem('usedNames', JSON.stringify([]));
      sessionStorage.setItem('usedCities', JSON.stringify([]));
      sessionStorage.setItem('usedProducts', JSON.stringify([]));
      
      // Start the popup sequence
      setTimeout(() => {
        scheduleNextPopup();
      }, 5000); // First popup after 5 seconds
    }
    
    // Function to schedule the next popup
    function scheduleNextPopup() {
      const popupsShown = parseInt(sessionStorage.getItem('popupsShown') || '0');
      
      // Only continue if we haven't shown 5 popups yet
      if (popupsShown >= 5) {
        return;
      }
      
      fetchRandomProduct();
    }
    
    // Fetch a random product and show popup
    const fetchRandomProduct = async () => {
      try {
        // Get the current count of popups shown
        const popupsShown = parseInt(sessionStorage.getItem('popupsShown') || '0');
        
        // If we've already shown 5 popups, don't show any more
        if (popupsShown >= 5) {
          return;
        }
        
        const response = await fetch('/api/products')
        if (response.ok) {
          const products: Product[] = await response.json()
          
          // Get used products from session storage
          const usedProducts = JSON.parse(sessionStorage.getItem('usedProducts') || '[]');
          
          // Filter for products in 'all' category that have sizes available
          // and exclude previously shown products
          const availableProducts = products.filter(
            (product: Product) => 
              product.categories?.includes('all') && 
              product.sizes?.length > 0 &&
              !usedProducts.includes(product._id)
          )
          
          if (availableProducts.length > 0) {
            // Pick a random product
            const randomProduct = availableProducts[Math.floor(Math.random() * availableProducts.length)]
            
            // Add product to used products
            usedProducts.push(randomProduct._id);
            sessionStorage.setItem('usedProducts', JSON.stringify(usedProducts));
            
            // Get used names from session storage
            const usedNames = JSON.parse(sessionStorage.getItem('usedNames') || '[]')
            
            // Get a random Hungarian city
            const usedCities = JSON.parse(sessionStorage.getItem('usedCities') || '[]')
            const availableCities = hungarianCities.filter(city => !usedCities.includes(city))
            
            let cityToUse = '';
            if (availableCities.length === 0) {
              console.warn('Not enough unique cities left')
              sessionStorage.setItem('usedCities', JSON.stringify([]))
              const resetAvailableCities = hungarianCities;
              cityToUse = resetAvailableCities[Math.floor(Math.random() * resetAvailableCities.length)];
            } else {
              cityToUse = availableCities[Math.floor(Math.random() * availableCities.length)];
              // Add selected city to used list
              usedCities.push(cityToUse);
              sessionStorage.setItem('usedCities', JSON.stringify(usedCities));
            }
            
            // Filter out already used names
            const availableNames = hungarianNames.filter(name => !usedNames.includes(name))
            
            // Check if we have enough unique names left
            if (availableNames.length === 0) {
              console.warn('Not enough unique names left')
              // If we run out of unique names, reset the used arrays
              sessionStorage.setItem('usedNames', JSON.stringify([]))
              return fetchRandomProduct(); // Retry with reset arrays
            }
            
            // Generate random Hungarian customer info
            const randomName = availableNames[Math.floor(Math.random() * availableNames.length)]
            let randomTime: string;
            if (popupsShown === 0) {
              // For the first popup: random time between 6 perce and 15 perce
              const randomMinutes = Math.floor(Math.random() * (15 - 6 + 1)) + 6;
              randomTime = `${randomMinutes} perce`;
            } else {
              // For subsequent popups: 50% chance "Most", or 50% chance one of "1 perce", "2 perce", "3 perce"
              if (Math.random() < 0.5) {
                randomTime = "Most";
              } else {
                const times = ["1 perce", "2 perce", "3 perce"];
                randomTime = times[Math.floor(Math.random() * times.length)];
              }
            }
            
            // Add selected name to used list
            usedNames.push(randomName)
            sessionStorage.setItem('usedNames', JSON.stringify(usedNames))
            
            setPurchaseInfo({
              product: randomProduct,
              name: randomName,
              city: cityToUse,
              timeAgo: randomTime
            })
            
            // Show the popup
            setIsVisible(true)
            
            // Update the count of popups shown
            const newCount = popupsShown + 1
            sessionStorage.setItem('popupsShown', newCount.toString())
            
            // Hide popup after 5 seconds
            setTimeout(() => {
              setIsVisible(false)
              
              // Schedule the next popup if we haven't shown 5 yet
              if (newCount < 5) {
                let nextPopupDelay;
                
                if (newCount === 1) {
                  // First popup shown, second coming up - fixed 20 second delay
                  nextPopupDelay = 20000;
                } else {
                  // Third, fourth, and fifth popups - random delay between 30-60 seconds
                  nextPopupDelay = Math.floor(Math.random() * (60000 - 30000 + 1)) + 30000;
                }
                
                setTimeout(fetchRandomProduct, nextPopupDelay);
              }
            }, 5000) // Popup is visible for 5 seconds
          } else if (availableProducts.length === 0 && products.length > 0) {
            // If we run out of unique products but have products available,
            // reset the used products array and try again
            sessionStorage.setItem('usedProducts', JSON.stringify([]))
            fetchRandomProduct();
          }
        }
      } catch (error) {
        console.error('Error fetching random product:', error)
      }
    }
  }, [hungarianNames, hungarianCities]) 

  if (!purchaseInfo.product) return null

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -300, opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="fixed bottom-4 left-4 z-50 max-w-xs bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100"
        >
          <Link href={`/product/${purchaseInfo.product._id}`}>
            <div className="flex p-3 cursor-pointer hover:bg-gray-100/30 transition-colors">
              <div className="relative w-20 h-20 rounded overflow-hidden flex-shrink-0">
                <Image
                  src={`/uploads/${purchaseInfo.product.mainImage}`}
                  alt="Recent purchase"
                  fill
                  className="object-cover"
                />
              </div>
              
              <div className="ml-3 flex-1 flex flex-col justify-center">
                <p className="text-sm text-gray-800">
                  <span className="font-bold">{purchaseInfo.name}</span> épp most rendelt <span className="font-bold">{purchaseInfo.city}</span>
                </p>
                <p className="text-sm text-gray-500 mt-1">{purchaseInfo.timeAgo}</p>
              </div>
            </div>
          </Link>
          
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setIsVisible(false);
            }}
            className="absolute top-1 right-1 text-gray-400 hover:text-gray-600 z-10"
            aria-label="Close notification"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default RecentPurchasePopup