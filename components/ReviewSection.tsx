'use client'

import React, { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Sora } from 'next/font/google'

const sora = Sora({ subsets: ['latin'] })

const ReviewSection = () => {
  const [isExpanded, setIsExpanded] = useState(false)
  const topRef = useRef<HTMLDivElement>(null)
  const higherScrollTargetRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(false)

  const handleExpandClick = () => {
    if (isExpanded) {
      setIsScrolling(true);
      setIsExpanded(false);
      const targetElement = higherScrollTargetRef.current;
      if (targetElement) {
        const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - 100; // Scroll 100px higher
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
      setTimeout(() => {
        setIsScrolling(false);
      }, 1000); // Adjust this timeout to match your scroll and animation duration
    } else {
      setIsExpanded(true);
    }
  }

  useEffect(() => {
    if (isScrolling) {
      document.body.style.pointerEvents = 'none'
    } else {
      document.body.style.pointerEvents = ''
    }
  }, [isScrolling])

  useEffect(() => {
    const adjustMargin = () => {
      const container = document.querySelector('.logo-container');
      if (container) {
        const screenWidth = window.innerWidth;
        const baseMargin = 0.25; // Reduced from 0.5 to 0.25 rem
        const minMargin = 0.1; // Reduced from 0.25 to 0.1 rem
        const marginReduction = Math.max(0, (1000 - screenWidth) / 1000);
        const newMargin = Math.max(minMargin, baseMargin - (baseMargin - minMargin) * marginReduction);
        
        const leftText = container.querySelector('.left-text');
        const rightText = container.querySelector('.right-text');
        if (leftText && rightText) {
          // Reduced spacing from clamp(5rem,16vw,8rem) to clamp(3rem,10vw,5rem)
          (leftText as HTMLElement).style.right = `calc(50% + clamp(3rem,10vw,5rem) + ${newMargin}rem)`;
          (rightText as HTMLElement).style.left = `calc(50% + clamp(3rem,10vw,5rem) + ${newMargin}rem)`;
        }
      }
    };

    window.addEventListener('resize', adjustMargin);
    adjustMargin(); // Initial adjustment

    return () => window.removeEventListener('resize', adjustMargin);
  }, []);

  return (
    <>
      <div ref={higherScrollTargetRef} className="h-[2rem] md:h-[4rem]"/>
      <div ref={topRef} className={`container mx-auto px-4 py-0 ${sora.className}`}>
        <div id="review-section" className="relative w-full">
          <div className="text-center">
            <h2 className="flex items-center justify-center relative font-normal logo-container">
              <div className="flex items-center justify-center w-full relative">
                <span 
                  className="absolute whitespace-nowrap font-light left-text" 
                  style={{ 
                    // Reduced from clamp(5rem,16vw,8rem) to clamp(3rem,10vw,5rem) here too for consistency
                    right: 'calc(50% + clamp(3rem,10vw,5rem) + 0.25rem)', 
                    fontSize: 'clamp(1.5rem, 4vw, 2rem)',
                    transition: 'right 0.3s ease-in-out'
                  }}
                >
                  The
                </span>
                <div className="relative w-[clamp(10rem,32vw,16rem)] h-[clamp(2.5rem,8vw,4rem)]">
                  <Image 
                    src="/blacklogo.png" 
                    alt="Logo" 
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
                <span 
                  className="absolute whitespace-nowrap font-light right-text" 
                  style={{ 
                    // Reduced from clamp(5rem,16vw,8rem) to clamp(3rem,10vw,5rem) here too
                    left: 'calc(50% + clamp(3rem,10vw,5rem) + 0.25rem)', 
                    fontSize: 'clamp(1.5rem, 4vw, 2rem)',
                    transition: 'left 0.3s ease-in-out'
                  }}
                >
                  effect
                </span>
              </div>
            </h2>
          </div>
          <div className="bg-white rounded-2xl p-0 mt-[3rem] md:mt-[4rem] relative overflow-hidden">
            {/* Mobile layout */}
            <div className="sm:hidden relative overflow-hidden">
              <div className={`grid grid-cols-10 gap-2 auto-rows-[minmax(80px,auto)] transition-all duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isExpanded ? 'h-[1400px]' : 'h-[400px]'}`}>
                <div className="col-span-10 row-span-2 relative overflow-hidden rounded-lg transition-transform hover:scale-[1.02] shadow-lg">
                  <Image src="/uploads/reviews/review1.png" alt="Review 10" fill className="object-cover" />
                </div>
                <div className="col-span-5 row-span-2 relative overflow-hidden rounded-lg transition-transform hover:scale-[1.02] shadow-lg">
                  <Image src="/uploads/reviews/review10.png" alt="Review 1" fill className="object-cover" />
                </div>
                <div className="col-span-5 row-span-2 relative overflow-hidden rounded-lg transition-transform hover:scale-[1.02] shadow-lg">
                  <Image src="/uploads/reviews/review2.png" alt="Review 2" fill className="object-cover" />
                </div>
                {isExpanded && (
                  <>
                    <div className="col-span-6 row-span-2 relative overflow-hidden rounded-lg transition-transform hover:scale-[1.02] shadow-lg">
                      <Image src="/uploads/reviews/review3.png" alt="Review 3" fill className="object-cover" />
                    </div>
                    <div className="col-span-4 row-span-2 relative overflow-hidden rounded-lg transition-transform hover:scale-[1.02] shadow-lg">
                      <Image src="/uploads/reviews/review11.png" alt="Review 4" fill className="object-cover" />
                    </div>
                    <div className="col-span-5 row-span-2 relative overflow-hidden rounded-lg transition-transform hover:scale-[1.02] shadow-lg">
                      <Image src="/uploads/reviews/review5.png" alt="Review 5" fill className="object-cover" />
                    </div>
                    <div className="col-span-5 row-span-2 relative overflow-hidden rounded-lg transition-transform hover:scale-[1.02] shadow-lg">
                      <Image src="/uploads/reviews/review6.png" alt="Review 6" fill className="object-cover" />
                    </div>
                    <div className="col-span-10 row-span-4 relative overflow-hidden rounded-lg transition-transform hover:scale-[1.02] shadow-lg">
                      <Image src="/uploads/reviews/review9.png" alt="Review 9" fill className="object-cover" />
                    </div>
                  </>
                )}
              </div>
              <div className={`absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white via-white to-transparent pointer-events-none transition-opacity duration-1000 ${isExpanded ? 'opacity-0' : 'opacity-100'}`} />
            </div>

            {/* Tablet layout */}
            <div className="hidden sm:block lg:hidden relative overflow-hidden">
              <div className={`grid grid-cols-12 gap-3 auto-rows-[minmax(120px,auto)] transition-all duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isExpanded ? 'h-[2200px]' : 'h-[800px]'}`}>
                <div className="col-span-12 row-span-4 relative overflow-hidden rounded-lg transition-transform hover:scale-[1.02] shadow-lg">
                  <Image src="/uploads/reviews/review1.png" alt="Review 1" fill className="object-cover" />
                </div>
                <div className="col-span-5 row-span-3 relative overflow-hidden rounded-lg transition-transform hover:scale-[1.02] shadow-lg">
                  <Image src="/uploads/reviews/review2.png" alt="Review 2" fill className="object-cover" />
                </div>
                <div className="col-span-7 row-span-3 relative overflow-hidden rounded-lg transition-transform hover:scale-[1.02] shadow-lg">
                  <Image src="/uploads/reviews/review11.png" alt="Review 3" fill className="object-cover" />
                </div>
                <div className="col-span-7 row-span-3 relative overflow-hidden rounded-lg transition-transform hover:scale-[1.02] shadow-lg">
                  <Image src="/uploads/reviews/review4.png" alt="Review 4" fill className="object-cover" />
                </div>
                <div className="col-span-5 row-span-3 relative overflow-hidden rounded-lg transition-transform hover:scale-[1.02] shadow-lg">
                  <Image src="/uploads/reviews/review5.png" alt="Review 5" fill className="object-cover" />
                </div>
                {isExpanded && (
                  <>
                    <div className="col-span-12 row-span-4 relative overflow-hidden rounded-lg transition-transform hover:scale-[1.02] shadow-lg">
                      <Image src="/uploads/reviews/review9.png" alt="Review 6" fill className="object-cover" />
                    </div>
                    <div className="col-span-6 row-span-3 relative overflow-hidden rounded-lg transition-transform hover:scale-[1.02] shadow-lg">
                      <Image src="/uploads/reviews/review7.png" alt="Review 7" fill className="object-cover" />
                    </div>
                    <div className="col-span-6 row-span-3 relative overflow-hidden rounded-lg transition-transform hover:scale-[1.02] shadow-lg">
                      <Image src="/uploads/reviews/review13.png" alt="Review 8" fill className="object-cover" />
                    </div>
                    <div className="col-span-8 row-span-3 relative overflow-hidden rounded-lg transition-transform hover:scale-[1.02] shadow-lg">
                      <Image src="/uploads/reviews/review3.png" alt="Review 9" fill className="object-cover" />
                    </div>
                    <div className="col-span-4 row-span-3 relative overflow-hidden rounded-lg transition-transform hover:scale-[1.02] shadow-lg">
                      <Image src="/uploads/reviews/review1.png" alt="Review 10" fill className="object-cover" />
                    </div>
                  </>
                )}
              </div>
              <div className={`absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white via-white to-transparent pointer-events-none transition-opacity duration-1000 ${isExpanded ? 'opacity-0' : 'opacity-100'}`} />
            </div>

            {/* Desktop layout */}
            <div className="hidden lg:block relative overflow-hidden">
              <div className={`grid grid-cols-12 gap-3 auto-rows-[minmax(100px,auto)] transition-all duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isExpanded ? 'h-[2000px]' : 'h-[600px]'}`}>
                <div className="col-span-8 row-span-4 relative overflow-hidden rounded-lg transition-transform hover:scale-[1.02] shadow-lg">
                  <Image src="/uploads/reviews/review1.png" alt="Review 1" fill className="object-cover" />
                </div>
                <div className="col-span-4 row-span-2 relative overflow-hidden rounded-lg transition-transform hover:scale-[1.02] shadow-lg">
                  <Image src="/uploads/reviews/review2.png" alt="Review 2" fill className="object-cover" />
                </div>
                <div className="col-span-4 row-span-2 relative overflow-hidden rounded-lg transition-transform hover:scale-[1.02] shadow-lg">
                  <Image src="/uploads/reviews/review3.png" alt="Review 3" fill className="object-cover" />
                </div>
                <div className="col-span-6 row-span-3 relative overflow-hidden rounded-lg transition-transform hover:scale-[1.02] shadow-lg">
                  <Image src="/uploads/reviews/review4.png" alt="Review 4" fill className="object-cover" />
                </div>
                <div className="col-span-6 row-span-3 relative overflow-hidden rounded-lg transition-transform hover:scale-[1.02] shadow-lg">
                  <Image src="/uploads/reviews/review5.png" alt="Review 5" fill className="object-cover" />
                </div>
                {isExpanded && (
                  <>
                    <div className="col-span-4 row-span-2 relative overflow-hidden rounded-lg transition-transform hover:scale-[1.02] shadow-lg">
                      <Image src="/uploads/reviews/review6.png" alt="Review 7" fill className="object-cover" />
                    </div>
                    <div className="col-span-8 row-span-4 relative overflow-hidden rounded-lg transition-transform hover:scale-[1.02] shadow-lg">
                      <Image src="/uploads/reviews/review7.png" alt="Review 6" fill className="object-cover" />
                    </div>
                    <div className="col-span-4 row-span-2 relative overflow-hidden rounded-lg transition-transform hover:scale-[1.02] shadow-lg">
                      <Image src="/uploads/reviews/review8.png" alt="Review 8" fill className="object-cover" />
                    </div>
                    <div className="col-span-6 row-span-3 relative overflow-hidden rounded-lg transition-transform hover:scale-[1.02] shadow-lg">
                      <Image src="/uploads/reviews/review9.png" alt="Review 9" fill className="object-cover" />
                    </div>
                    <div className="col-span-6 row-span-3 relative overflow-hidden rounded-lg transition-transform hover:scale-[1.02] shadow-lg">
                      <Image src="/uploads/reviews/review10.png" alt="Review 10" fill className="object-cover" />
                    </div>
                    <div className="col-span-4 row-span-2 relative overflow-hidden rounded-lg transition-transform hover:scale-[1.02] shadow-lg">
                      <Image src="/uploads/reviews/review11.png" alt="Review 1" fill className="object-cover" />
                    </div>
                    <div className="col-span-4 row-span-2 relative overflow-hidden rounded-lg transition-transform hover:scale-[1.02] shadow-lg">
                      <Image src="/uploads/reviews/review12.png" alt="Review 2" fill className="object-cover" />
                    </div>
                    <div className="col-span-4 row-span-2 relative overflow-hidden rounded-lg transition-transform hover:scale-[1.02] shadow-lg">
                      <Image src="/uploads/reviews/review13.png" alt="Review 3" fill className="object-cover" />
                    </div>
                  </>
                )}
              </div>
              <div className={`absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-white via-white to-transparent pointer-events-none transition-opacity duration-1000 ${isExpanded ? 'opacity-0' : 'opacity-100'}`} />
            </div>

            {/* Expand/Collapse button */}
            <Button
              onClick={handleExpandClick}
              className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-white text-gray-900 hover:bg-gray-100 px-6 py-2.5 rounded-full flex items-center space-x-2 z-20 shadow-xl shadow-top-md"
              aria-expanded={isExpanded}
              aria-controls="review-section"
            >
              <span className="font-medium text-sm">{isExpanded ? 'Show Less' : 'Show More'}</span>
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

export default ReviewSection