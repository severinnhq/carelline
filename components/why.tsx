'use client';

import React, { useRef, useState, useEffect } from 'react';

const WhySection = () => {
  const circleData = [
    { id: 0, color: 'bg-black', text: '!' },
    { id: 1, color: 'bg-green-500', text: '✓' },
    { id: 2, color: 'bg-yellow-500', text: '?' },
    { id: 3, color: 'bg-red-500', text: 'X' },
  ];

  const [visibleCircles, setVisibleCircles] = useState<number[]>([]);
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const circleRefs = useRef<(HTMLDivElement | null)[]>([]);
  const textRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rightContentRef = useRef<HTMLDivElement | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const smallScreenBottomRef = useRef<HTMLDivElement>(null);
  const hasReachedBottom = useRef(false);
  const hasAnimatedRightContent = useRef(false);
  const additionalSectionRef = useRef<HTMLDivElement>(null);
  const carellineSmallScreenRef = useRef<HTMLDivElement>(null);

  const colorMap = {
    'bg-black': '#000000',
    'bg-green-500': '#22c55e',
    'bg-yellow-500': '#eab308',
    'bg-red-500': '#ef4444',
  } as const;

  const generateGradient = () => {
    return `linear-gradient(to bottom, 
    ${colorMap['bg-black']} 0%,
    ${colorMap['bg-green-500']} 33%,
    ${colorMap['bg-yellow-500']} 66%,
    ${colorMap['bg-red-500']} 100%
    )`;
  };

  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 1130);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    if (visibleCircles.includes(1) && isLargeScreen && rightContentRef.current) {
      rightContentRef.current.classList.add('animate-chainReaction');
      hasAnimatedRightContent.current = true;
    }
    
    if (visibleCircles.includes(3) && !isLargeScreen && smallScreenBottomRef.current) {
      smallScreenBottomRef.current.classList.add('animate-chainReaction');
    }
  }, [isLargeScreen, visibleCircles]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = circleRefs.current.findIndex(ref => ref === entry.target);
          
          if (entry.isIntersecting && !hasReachedBottom.current) {
            const delay = Math.min(index * 30, 90);
            setTimeout(() => {
              entry.target.classList.add('animate-chainReaction');
              
              const textElement = textRefs.current[index];
              if (textElement) {
                textElement.classList.add('animate-chainReaction');
              }
              
              if (index === 1 && rightContentRef.current && isLargeScreen) {
                rightContentRef.current.classList.add('animate-chainReaction');
                hasAnimatedRightContent.current = true;
              }
              
              if (index === 3 && !isLargeScreen && smallScreenBottomRef.current) {
                smallScreenBottomRef.current.classList.add('animate-chainReaction');
              }
              
              setVisibleCircles(prev => {
                const newVisible = [...new Set([...prev, index])].sort((a, b) => a - b);
                if (newVisible.length === circleData.length) hasReachedBottom.current = true;
                return newVisible;
              });
            }, delay);
          }
        });
      },
      { 
        threshold: 0.1,
        rootMargin: '0px 0px -10% 0px'
      }
    );

    const currentRefs = circleRefs.current;
    currentRefs.forEach((ref) => ref && observer.observe(ref));

    if (additionalSectionRef.current) {
      const additionalSectionObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('animate-fadeIn');
            }
          });
        },
        { threshold: 0.2 }
      );
      
      additionalSectionObserver.observe(additionalSectionRef.current);
      
      if (carellineSmallScreenRef.current) {
        additionalSectionObserver.observe(carellineSmallScreenRef.current);
      }
      
      return () => {
        currentRefs.forEach((ref) => ref && observer.unobserve(ref));
        additionalSectionObserver.disconnect();
      };
    }

    return () => currentRefs.forEach((ref) => ref && observer.unobserve(ref));
  }, [isLargeScreen]);

  const getLineVisibility = () => {
    if (hasReachedBottom.current) return '0%';
    const highestVisible = Math.max(...visibleCircles, 0);
    const progress = (highestVisible / (circleData.length - 1)) * 100;
    return `${100 - progress}%`;
  };

  return (
    <>
      <section ref={sectionRef} className="pt-32 px-4 min-h-screen">
        <div className="relative mx-auto w-full max-w-screen-md">
          <div
            ref={lineRef}
            className={`vertical-line absolute transition-all duration-500 transform ${
              isLargeScreen ? 'left-1/2 -translate-x-1/2' : ''
            }`}
            style={{
              width: '14px',
              height: '100%',
              background: generateGradient(),
              clipPath: `inset(0 0 ${getLineVisibility()} 0)`,
              transition: 'clip-path 0.4s cubic-bezier(0.33, 1, 0.68, 1)',
              borderRadius: '8px',
              right: isLargeScreen ? undefined : '40px',
            }}
          ></div>
          
          {isLargeScreen && (
            <div 
              ref={rightContentRef}
              className={`absolute ${hasAnimatedRightContent.current ? 'opacity-100' : 'opacity-0'} flex flex-col items-center transition-opacity duration-300`}
              style={{ 
                right: '0',
                marginRight: isLargeScreen ? '-100px' : '0',
                top: '182px',
                height: '232px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transform: hasAnimatedRightContent.current ? 'translateY(0)' : 'translateY(15px)'
              }}
            >
              <div className="text-3xl font-black text-right leading-tight mb-4 self-end">
                <div>CARELLINE</div>
                <div>BREATHGUARD</div>
              </div>
              <div className="w-56 h-40 flex items-center justify-center shrink-0 mb-4">
                <img src="/uploads/products.png" alt="CARELLINE BREATHGUARD" className="max-w-full max-h-full object-contain" />
              </div>
              <div className="text-base font-normal text-right max-w-56 self-end">
                A BreathGuard™-ok percek alatt megmenthetik a beteget.
              </div>
            </div>
          )}
          
          <div className="space-y-32">        
            {circleData.map((circle, index) => (
              <div key={circle.id} className="flex justify-end md:justify-center relative" style={{ justifyContent: isLargeScreen ? 'center' : 'flex-end' }}>
                {index === 0 && (
                  <div 
                    ref={el => { textRefs.current[index] = el; }}
                    className="absolute left-2 opacity-0"
                    style={{ 
                      width: 'calc(100% - 100px)',
                      ...(isLargeScreen ? { left: '0', marginLeft: '-80px' } : {})
                    }}
                  >
                    <div className="text-3xl max-[450px]:text-xl font-black text-left leading-tight">
                      <div>VÉSZHELYZET</div>
                      <div>MEGTÖRTÉNTE</div>
                      <div>UTÁN</div>
                    </div>
                  </div>
                )}
                
                {index === 1 && (
                  <div 
                    ref={el => { textRefs.current[index] = el; }}
                    className="absolute left-2 opacity-0 flex gap-3 max-[450px]:flex-col max-[450px]:gap-0"
                    style={{ 
                      top: '1.3rem',
                      width: 'calc(100% - 100px)',
                      ...(isLargeScreen ? { left: '0', marginLeft: '-80px' } : {}),
                      ...(!isLargeScreen && { top: '-.8rem' })
                    }}
                  >
                    <div className="text-2xl max-[450px]:text-xl font-extrabold text-left leading-tight">
                      <div>0-4</div>
                      <div>perc</div>
                    </div>
                    <div className="text-xl max-[450px]:text-base font-normal text-left leading-tight max-[450px]:mt-1">
                      <div>A beteg sikeresen</div>
                      <div>megmenthető</div>
                    </div>
                  </div>
                )}
                
                {index === 2 && (
                  <div 
                    ref={el => { textRefs.current[index] = el; }}
                    className="absolute left-2 opacity-0 flex gap-3 max-[450px]:flex-col max-[450px]:gap-0"
                    style={{ 
                      top: '.6rem', 
                      width: 'calc(100% - 100px)',
                      ...(isLargeScreen ? { left: '0', marginLeft: '-80px' } : {}),
                      ...(!isLargeScreen && { top: '-1.5rem' })
                    }}
                  >
                    <div className="text-2xl max-[450px]:text-xl font-extrabold text-left leading-tight">
                      <div>4-6</div>
                      <div>perc</div>
                    </div>
                    <div className="text-xl max-[450px]:text-base font-normal text-left leading-tight max-[450px]:mt-1">
                      <div>Az oxigénhiány</div>
                      <div>agykárosodást</div>
                      <div>okozhat</div>
                    </div>
                  </div>
                )}
                
                {index === 3 && (
                  <div 
                    ref={el => { textRefs.current[index] = el; }}
                    className="absolute left-2 opacity-0 flex gap-3 max-[450px]:flex-col max-[450px]:gap-0"
                    style={{ 
                      top: '.6rem', 
                      width: 'calc(100% - 100px)',
                      ...(isLargeScreen ? { left: '0', marginLeft: '-80px' } : {}),
                      ...(!isLargeScreen && { top: '-1.5rem' })
                    }}
                  >
                    <div className="text-2xl max-[450px]:text-xl font-bold text-left leading-tight">
                      <div>&gt;10</div>
                      <div>perc</div>
                    </div>
                    <div className="text-xl max-[450px]:text-base font-normal text-left leading-tight max-[450px]:mt-1">
                      <div>Az oxigénhiány miatt</div>
                      <div>a beteg valószínűleg</div>
                      <div>meghal</div>
                    </div>
                  </div>
                )}
                
                <div
                  ref={el => { circleRefs.current[index] = el; }}
                  className={`w-24 h-24 max-[450px]:w-20 max-[450px]:h-20 flex items-center justify-center rounded-full ${circle.color} text-white 
                  text-4xl max-[450px]:text-3xl font-bold opacity-0 translate-y-8 transition-all duration-200 ease-out cursor-pointer
                  hover:scale-125 hover:shadow-2xl hover:z-10 relative`}
                  style={{
                    transform: `translateY(2rem) ${isLargeScreen ? '' : 'translateX(-50%)'}`,
                  }}
                >
                  {circle.text}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section 
        ref={additionalSectionRef}
        className="px-4 my-24 opacity-0"
      >
        <div className="max-w-screen-md mx-auto">
          {isLargeScreen ? (
            <div className="flex gap-6" style={{ marginLeft: '-80px' }}>
              <div>
                <div className="text-3xl font-black mb-4">
                  ORSZÁGOS MENTŐSZOLGÁLAT
                </div>
                <p className="text-base max-w-xs">
                  Magyarországon jelenleg 15 perc a célidő, hogy a mentők elérjenek egy esemény helyszínére.
                </p>
              </div>
              <div className="w-1/3 flex items-start">
                <div className="w-full h-32 flex items-center justify-center shrink-0 mb-4">
                  <img src="/uploads/mento.png" alt="Országos Mentőszolgálat" className="max-w-full max-h-full object-contain" />
                </div>
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-3xl max-[450px]:text-2xl font-extrabold mb-4">
                ORSZÁGOS MENTŐSZOLGÁLAT
              </h2>
              <div className="additional-flex flex gap-6 items-start">
                <div className="w-1/2">
                  <p className="text-base max-[450px]:text-sm max-w-md">
                    Magyarországon jelenleg 15 perc a célidő, hogy a mentők elérjenek egy esemény helyszínére.
                  </p>
                </div>
                <div className="w-1/2 flex items-start">
                  <div className="w-full h-32 flex items-start justify-center overflow-hidden">
                    <img src="/uploads/mento.png" alt="Országos Mentőszolgálat" className="max-w-full max-h-full object-contain" />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
      
      {!isLargeScreen && (
        <section 
          ref={carellineSmallScreenRef}
          className="px-4 my-24 opacity-0"
        >
          <div className="max-w-screen-md mx-auto">
            <h2 className="text-3xl max-[450px]:text-2xl font-extrabold mb-4">
              CARELLINE BREATHGUARD
            </h2>
            <div className="carelline-flex flex gap-6 items-start">
              <div className="w-1/2">
                <p className="text-base max-[450px]:text-sm max-w-md">
                  A BreathGuard™-ok percek alatt megmenthetik a beteget.
                </p>
              </div>
              <div className="w-1/2 flex items-start">
                <div className="w-full h-32 flex items-start justify-center overflow-hidden">
                  <img src="/uploads/products.png" alt="CARELLINE BREATHGUARD" className="max-w-full max-h-full object-contain" />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <style jsx>{`
        @keyframes chainReaction {
          0% {
            opacity: 0;
            transform: translateY(15px) scale(0.97);
          }
          80% {
            transform: translateY(-2px) scale(1.02);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .animate-chainReaction {
          animation: chainReaction 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        
        @keyframes fadeIn {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.7s ease-out forwards;
        }

        @media (max-width: 450px) {
          .vertical-line {
            width: 10px !important;
            border-radius: 4px !important;
            right: 35px !important;
          }

          .additional-flex > div,
          .carelline-flex > div {
            width: 100% !important;
          }
        }

        @media (max-width: 400px) {
          .additional-flex,
          .carelline-flex {
            flex-direction: column;
          }
        }
      `}</style>
    </>
  );
};

export default WhySection;