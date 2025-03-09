'use client'

import React, { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Sora } from 'next/font/google'
import Link from 'next/link'

const sora = Sora({ subsets: ['latin'] })

// A reusable component for a review image with customizable overlay text.
type ReviewImageProps = {
  src: string
  alt: string
  reviewText: string
  reviewerName: string
  className?: string
}

const ReviewImage: React.FC<ReviewImageProps> = ({ src, alt, reviewText, reviewerName, className = '' }) => (
  <div className={`group relative overflow-hidden rounded-lg shadow-lg ${className}`}>
    <Image src={src} alt={alt} fill className="object-cover" />
    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition duration-300 flex items-center justify-center">
      <div className="text-white text-center p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <p className="mb-2 text-sm md:text-base">{reviewText}</p>
        <p className="font-bold mb-2">{reviewerName}</p>
        
        {/* Google logo and stars */}
        <div className="flex items-center justify-center gap-2">
          <img 
            src="https://www.google.com/favicon.ico" 
            alt="Google logo" 
            className="w-4 h-4"
          />
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className="w-4 h-4 text-yellow-400"
                viewBox="0 0 20 20"
                fill="currentColor" // Add this attribute
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
)

const ReviewSection = () => {
  const [isExpanded, setIsExpanded] = useState(false)
  const topRef = useRef<HTMLDivElement>(null)
  const higherScrollTargetRef = useRef<HTMLDivElement>(null)
  const [isScrolling, setIsScrolling] = useState(false)

  const handleExpandClick = () => {
    if (isExpanded) {
      setIsScrolling(true)
      setIsExpanded(false)
      const targetElement = higherScrollTargetRef.current
      if (targetElement) {
        const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - 100 // Scroll 100px higher
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        })
      }
      setTimeout(() => {
        setIsScrolling(false)
      }, 1000) // Adjust this timeout to match your scroll and animation duration
    } else {
      setIsExpanded(true)
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
      const container = document.querySelector('.logo-container')
      if (container) {
        const screenWidth = window.innerWidth
        const baseMargin = 0.25 // Reduced from 0.5 to 0.25 rem
        const minMargin = 0.1 // Reduced from 0.25 to 0.1 rem
        const marginReduction = Math.max(0, (1000 - screenWidth) / 1000)
        const newMargin = Math.max(minMargin, baseMargin - (baseMargin - minMargin) * marginReduction)

        const leftText = container.querySelector('.left-text')
        const rightText = container.querySelector('.right-text')
        if (leftText && rightText) {
          // Fixed the syntax error here
          ;(leftText as HTMLElement).style.right = `calc(50% + clamp(3rem,10vw,5rem) + ${newMargin}rem)`
          ;(rightText as HTMLElement).style.left = `calc(50% + clamp(3rem,10vw,5rem) + ${newMargin}rem)`
        }
      }
    }

    window.addEventListener('resize', adjustMargin)
    adjustMargin() // Initial adjustment

    return () => window.removeEventListener('resize', adjustMargin)
  }, [])

  // Array of review data
  const reviews = [
    { 
      src: "/uploads/reviews/review1.png", 
      name: "Ignácz Ádám", 
      text: ",,Ez a készülék életet mentett a családomban. Szó szerint. Minden szülőnek ajánlom!''"
    },
    { 
      src: "/uploads/reviews/review2.png", 
      name: "Mohácsi Eszter", 
      text: ",,Nagyon gyors és hatékony! Sosem gondoltam volna, hogy egyszer szükség lesz rá, de hála az égnek kéznél volt!''"
    },
    { 
      src: "/uploads/reviews/review3.png", 
      name: "Tóth László", 
      text: ",,Egy étteremben lettem rosszul, és egy ilyen eszköz mentette meg az életemet. Nem is tudom, mi lett volna nélküle.''"
    },
    { 
      src: "/uploads/reviews/review4.png", 
      name: "Krinszki-Nagy Anna", 
      text: ",,Könnyű kezelni.* lekopogom* még csak teszteltem, remélem nem is lesz szükség rá éles helyzetben.''"
    },
    { 
      src: "/uploads/reviews/review5.png", 
      name: "Kanozsai Erzsébet", 
      text: ",,A legjobb döntés, amit valaha hoztam. Minden otthonban ott kellene lennie!''"
    },
    { 
      src: "/uploads/reviews/review6.png", 
      name: "Horváth Noémi", 
      text: ",,Először szkeptikus voltam, de amikor a kisfiam elkezdett fuldokolni, ez a készülék megmentette őt. Köszönöm!''"
    },
    { 
      src: "/uploads/reviews/review7.png", 
      name: "Balogh Dániel", 
      text: ",,Érdemes beruházni rá. Gyors, hatékony és életet menthet!''"
    },
    { 
      src: "/uploads/reviews/review8.png", 
      name: "Farkas Zsófia", 
      text: ",,A nagypapámnál kellett használnunk, és sikerült! Minden család számára kötelező kellene legyen.''"
    },
    { 
      src: "/uploads/reviews/review9.png", 
      name: "Ambrusné Anita", 
      text: ",,Minden étteremben és otthonban ott kellene lennie! Nem lehet eléggé hangsúlyozni a fontosságát.''"
    },
    { 
      src: "/uploads/reviews/review10.png", 
      name: "Sándor Boglárka", 
      text: ",,Minden szülő rémálma a fulladás. Ez az eszköz biztonságot nyújt.''"
    },
    { 
      src: "/uploads/reviews/review11.png", 
      name: "Bodzán Margó", 
      text: ",,Gyorsan és egyszerűen használható. Életeket menthet.''"
    },
    { 
      src: "/uploads/reviews/review12.png", 
      name: "Pappné Sipos Lilla", 
      text: ",,Amikor vészhelyzet volt, csak ez tudott segíteni. Hálás vagyok érte!''"
    },
    { 
      src: "/uploads/reviews/review13.png", 
      name: "ifj. Bodnár Mihály", 
      text: ",,Nem szabad az ördögöt a falra festeni, távolálljék tőlem, de ha én vagy bárki a családban veszélybe kerül, megfizethetetlen segítséget nyújtana.''"
    }
  ]

  return (
    <>
     <div ref={higherScrollTargetRef} className="h-[2rem] md:h-[4rem]" />
      <div ref={topRef} className={`container mx-auto px-4 py-0 ${sora.className}`}>
        <div id="review-section" className="relative w-full">
        <div className="relative flex flex-col lg:flex-row items-start lg:items-center gap-4 lg:justify-between">
  <div className="text-3xl sm:text-[2.5rem] font-black text-start uppercase tracking-wider mb-0 lg:mb-0">
    MÁSOKON SEGíTETT
  </div>
  <Link href="/reviews" className="view-all-link group flex items-center transition-all duration-300 ease-in-out">
              <span className="view-all-text relative mr-1">Saját véleményem</span>
              <div className="view-all-circle flex items-center justify-center rounded-full bg-[#e5e5e5] w-6 h-6 transition-all duration-300 ease-in-out group-hover:bg-[#dc2626]">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-all duration-300 ease-in-out group-hover:text-white">
                  <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </Link>
          </div>
          <div className="bg-white rounded-2xl p-0 mt-[4rem] md:mt-[4rem] relative overflow-hidden">
            {/* Mobile layout */}
            <div className="sm:hidden relative overflow-hidden">
              <div className={`grid grid-cols-10 gap-2 auto-rows-[minmax(80px,auto)] transition-all duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isExpanded ? 'h-[1400px]' : 'h-[400px]'}`}>
                <ReviewImage
                  src={reviews[0].src}
                  alt={`Review by ${reviews[0].name}`}
                  reviewText={reviews[0].text}
                  reviewerName={reviews[0].name}
                  className="col-span-10 row-span-2"
                />
                <ReviewImage
                  src={reviews[9].src}
                  alt={`Review by ${reviews[9].name}`}
                  reviewText={reviews[9].text}
                  reviewerName={reviews[9].name}
                  className="col-span-5 row-span-2"
                />
                <ReviewImage
                  src={reviews[1].src}
                  alt={`Review by ${reviews[1].name}`}
                  reviewText={reviews[1].text}
                  reviewerName={reviews[1].name}
                  className="col-span-5 row-span-2"
                />
                {isExpanded && (
                  <>
                    <ReviewImage
                      src={reviews[2].src}
                      alt={`Review by ${reviews[2].name}`}
                      reviewText={reviews[2].text}
                      reviewerName={reviews[2].name}
                      className="col-span-6 row-span-2"
                    />
                    <ReviewImage
                      src={reviews[10].src}
                      alt={`Review by ${reviews[10].name}`}
                      reviewText={reviews[10].text}
                      reviewerName={reviews[10].name}
                      className="col-span-4 row-span-2"
                    />
                    <ReviewImage
                      src={reviews[4].src}
                      alt={`Review by ${reviews[4].name}`}
                      reviewText={reviews[4].text}
                      reviewerName={reviews[4].name}
                      className="col-span-5 row-span-2"
                    />
                    <ReviewImage
                      src={reviews[5].src}
                      alt={`Review by ${reviews[5].name}`}
                      reviewText={reviews[5].text}
                      reviewerName={reviews[5].name}
                      className="col-span-5 row-span-2"
                    />
                    <ReviewImage
                      src={reviews[8].src}
                      alt={`Review by ${reviews[8].name}`}
                      reviewText={reviews[8].text}
                      reviewerName={reviews[8].name}
                      className="col-span-10 row-span-4"
                    />
                  </>
                )}
              </div>
              <div className={`absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white via-white to-transparent pointer-events-none transition-opacity duration-1000 ${isExpanded ? 'opacity-0' : 'opacity-100'}`} />
            </div>

            {/* Tablet layout */}
            <div className="hidden sm:block lg:hidden relative overflow-hidden">
              <div className={`grid grid-cols-12 gap-3 auto-rows-[minmax(120px,auto)] transition-all duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isExpanded ? 'h-[2200px]' : 'h-[800px]'}`}>
                <ReviewImage
                  src={reviews[0].src}
                  alt={`Review by ${reviews[0].name}`}
                  reviewText={reviews[0].text}
                  reviewerName={reviews[0].name}
                  className="col-span-12 row-span-4"
                />
                <ReviewImage
                  src={reviews[1].src}
                  alt={`Review by ${reviews[1].name}`}
                  reviewText={reviews[1].text}
                  reviewerName={reviews[1].name}
                  className="col-span-5 row-span-3"
                />
                <ReviewImage
                  src={reviews[10].src}
                  alt={`Review by ${reviews[10].name}`}
                  reviewText={reviews[10].text}
                  reviewerName={reviews[10].name}
                  className="col-span-7 row-span-3"
                />
                <ReviewImage
                  src={reviews[3].src}
                  alt={`Review by ${reviews[3].name}`}
                  reviewText={reviews[3].text}
                  reviewerName={reviews[3].name}
                  className="col-span-7 row-span-3"
                />
                <ReviewImage
                  src={reviews[4].src}
                  alt={`Review by ${reviews[4].name}`}
                  reviewText={reviews[4].text}
                  reviewerName={reviews[4].name}
                  className="col-span-5 row-span-3"
                />
                {isExpanded && (
                  <>
                    <ReviewImage
                      src={reviews[8].src}
                      alt={`Review by ${reviews[8].name}`}
                      reviewText={reviews[8].text}
                      reviewerName={reviews[8].name}
                      className="col-span-12 row-span-4"
                    />
                    <ReviewImage
                      src={reviews[6].src}
                      alt={`Review by ${reviews[6].name}`}
                      reviewText={reviews[6].text}
                      reviewerName={reviews[6].name}
                      className="col-span-6 row-span-3"
                    />
                    <ReviewImage
                      src={reviews[12].src}
                      alt={`Review by ${reviews[12].name}`}
                      reviewText={reviews[12].text}
                      reviewerName={reviews[12].name}
                      className="col-span-6 row-span-3"
                    />
                    <ReviewImage
                      src={reviews[2].src}
                      alt={`Review by ${reviews[2].name}`}
                      reviewText={reviews[2].text}
                      reviewerName={reviews[2].name}
                      className="col-span-8 row-span-3"
                    />
                    <ReviewImage
                      src={reviews[0].src}
                      alt={`Review by ${reviews[0].name}`}
                      reviewText={reviews[0].text}
                      reviewerName={reviews[0].name}
                      className="col-span-4 row-span-3"
                    />
                  </>
                )}
              </div>
              <div className={`absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white via-white to-transparent pointer-events-none transition-opacity duration-1000 ${isExpanded ? 'opacity-0' : 'opacity-100'}`} />
            </div>

            {/* Desktop layout */}
            <div className="hidden lg:block relative overflow-hidden">
              <div className={`grid grid-cols-12 gap-3 auto-rows-[minmax(100px,auto)] transition-all duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isExpanded ? 'h-[2000px]' : 'h-[600px]'}`}>
                <ReviewImage
                  src={reviews[0].src}
                  alt={`Review by ${reviews[0].name}`}
                  reviewText={reviews[0].text}
                  reviewerName={reviews[0].name}
                  className="col-span-8 row-span-4"
                />
                <ReviewImage
                  src={reviews[1].src}
                  alt={`Review by ${reviews[1].name}`}
                  reviewText={reviews[1].text}
                  reviewerName={reviews[1].name}
                  className="col-span-4 row-span-2"
                />
                <ReviewImage
                  src={reviews[2].src}
                  alt={`Review by ${reviews[2].name}`}
                  reviewText={reviews[2].text}
                  reviewerName={reviews[2].name}
                  className="col-span-4 row-span-2"
                />
                <ReviewImage
                  src={reviews[3].src}
                  alt={`Review by ${reviews[3].name}`}
                  reviewText={reviews[3].text}
                  reviewerName={reviews[3].name}
                  className="col-span-6 row-span-3"
                />
                <ReviewImage
                  src={reviews[4].src}
                  alt={`Review by ${reviews[4].name}`}
                  reviewText={reviews[4].text}
                  reviewerName={reviews[4].name}
                  className="col-span-6 row-span-3"
                />
                {isExpanded && (
                  <>
                    <ReviewImage
                      src={reviews[5].src}
                      alt={`Review by ${reviews[5].name}`}
                      reviewText={reviews[5].text}
                      reviewerName={reviews[5].name}
                      className="col-span-4 row-span-2"
                    />
                    <ReviewImage
                      src={reviews[6].src}
                      alt={`Review by ${reviews[6].name}`}
                      reviewText={reviews[6].text}
                      reviewerName={reviews[6].name}
                      className="col-span-8 row-span-4"
                    />
                    <ReviewImage
                      src={reviews[7].src}
                      alt={`Review by ${reviews[7].name}`}
                      reviewText={reviews[7].text}
                      reviewerName={reviews[7].name}
                      className="col-span-4 row-span-2"
                    />
                    <ReviewImage
                      src={reviews[8].src}
                      alt={`Review by ${reviews[8].name}`}
                      reviewText={reviews[8].text}
                      reviewerName={reviews[8].name}
                      className="col-span-6 row-span-3"
                    />
                    <ReviewImage
                      src={reviews[9].src}
                      alt={`Review by ${reviews[9].name}`}
                      reviewText={reviews[9].text}
                      reviewerName={reviews[9].name}
                      className="col-span-6 row-span-3"
                    />
                    <ReviewImage
                      src={reviews[10].src}
                      alt={`Review by ${reviews[10].name}`}
                      reviewText={reviews[10].text}
                      reviewerName={reviews[10].name}
                      className="col-span-4 row-span-2"
                    />
                    <ReviewImage
                      src={reviews[11].src}
                      alt={`Review by ${reviews[11].name}`}
                      reviewText={reviews[11].text}
                      reviewerName={reviews[11].name}
                      className="col-span-4 row-span-2"
                    />
                    <ReviewImage
                      src={reviews[12].src}
                      alt={`Review by ${reviews[12].name}`}
                      reviewText={reviews[12].text}
                      reviewerName={reviews[12].name}
                      className="col-span-4 row-span-2"
                    />
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
              <span className="font-medium text-sm">{isExpanded ? 'Kevesebb' : 'Több'}</span>
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

export default ReviewSection