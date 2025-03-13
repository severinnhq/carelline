'use client'

import { useState, useEffect } from 'react'
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

interface GeoLocation {
  city: string;
  country: string;
  countryCode: string;
}

const RecentPurchasePopup = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [purchaseInfo, setPurchaseInfo] = useState<PurchaseInfo>({
    product: null,
    name: '',
    city: '',
    timeAgo: ''
  })
  const [visitorLocation, setVisitorLocation] = useState<GeoLocation | null>(null)

  // Expanded list of Hungarian names with first initial of last name + first name format
  const hungarianNames = [
    'N. Zsófia', 'K. Péter', 'T. Eszter', 'Sz. Máté', 
    'H. Anna', 'K. Dániel', 'V. Bence', 'M. Kata',
    'N. Gábor', 'F. Viktória', 'B. Ádám', 'P. Nóra',
    'T. János', 'K. István', 'N. László', 'Sz. Zoltán',
    'V. Lajos', 'P. Gyula', 'B. Ferenc', 'M. József',
    'K. Erzsébet', 'N. Katalin', 'S. Ilona', 'H. Mária',
    'F. Éva', 'B. Margit', 'G. Judit', 'V. Ágnes',
    'R. Magdolna', 'Cs. Irén', 'K. Klára', 'N. Piroska',
    'T. Tamás', 'B. Attila', 'K. Csaba', 'H. Tibor',
    'V. Gergely', 'Sz. Balázs', 'N. Krisztián', 'F. Zsolt',
    'M. Roland', 'B. Norbert', 'K. Sándor', 'H. Dávid',
    'P. Levente', 'V. Márton', 'K. Mihály', 'T. Róbert'
  ]
  
  // Expanded list of Hungarian cities
  const hungarianCities = [
    'Budapest', 'Debrecen', 'Szeged', 'Miskolc', 'Pécs', 
    'Győr', 'Nyíregyháza', 'Kecskemét', 'Székesfehérvár', 'Szombathely',
    'Sopron', 'Veszprém', 'Zalaegerszeg', 'Eger', 'Nagykanizsa',
    'Dunaújváros', 'Hódmezővásárhely', 'Szolnok', 'Baja', 'Esztergom',
    'Gödöllő', 'Pápa', 'Gyöngyös', 'Kiskunfélegyháza', 'Mosonmagyaróvár',
    'Ajka', 'Békéscsaba', 'Cegléd', 'Kaposvár', 'Ózd',
    'Salgótarján', 'Siófok', 'Szekszárd', 'Vác', 'Várpalota',
    'Hatvan', 'Kazincbarcika', 'Keszthely', 'Tatabánya', 'Szentendre',
    'Gyula', 'Hajdúböszörmény', 'Jászberény', 'Kiskunhalas', 'Mátészalka'
  ]
  
  const timeFrames = [
    '2 perce', '3 perce', '5 perce', '7 perce', 
    '10 perce', '15 perce', 'Most', '1 perce'
  ]

  // Generate a unique session ID for this browser session
  const generateSessionId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  };

  // Fetch visitor's location based on IP
  const fetchVisitorLocation = async () => {
    try {
      // Using a free geolocation API (replace with your preferred service)
      const response = await fetch('https://ipapi.co/json/');
      if (response.ok) {
        const data = await response.json();
        setVisitorLocation({
          city: data.city,
          country: data.country_name,
          countryCode: data.country_code
        });
        
        // Store the visitor's location in session storage
        sessionStorage.setItem('visitorLocation', JSON.stringify({
          city: data.city,
          country: data.country_name,
          countryCode: data.country_code
        }));
        
        return data.city;
      }
    } catch (error) {
      console.error('Error fetching visitor location:', error);
      return null;
    }
  };

  useEffect(() => {
    // Fetch visitor's location as soon as component mounts
    const storedLocation = sessionStorage.getItem('visitorLocation');
    if (storedLocation) {
      setVisitorLocation(JSON.parse(storedLocation));
    } else {
      fetchVisitorLocation();
    }
    
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
            
            // For the second popup (when popupsShown is 1), use the visitor's city if available
            let cityToUse = '';
            
            if (popupsShown === 1 && visitorLocation && visitorLocation.city) {
              // For the second popup, use the visitor's actual city
              cityToUse = visitorLocation.city;
            } else {
              // For other popups, use a random Hungarian city
              const usedCities = JSON.parse(sessionStorage.getItem('usedCities') || '[]')
              const availableCities = hungarianCities.filter(city => !usedCities.includes(city))
              
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
            const randomTime = timeFrames[Math.floor(Math.random() * timeFrames.length)]
            
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
            
            // Hide popup after 12 seconds
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
            }, 12000)
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
  }, [])

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