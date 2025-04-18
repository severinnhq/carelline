import React, { useRef } from 'react';
import { Star, ChevronRight, ChevronLeft } from 'lucide-react';

interface ReviewProps {
  name: string;
  date: string;
  stars: number;
  review: string;
}

const GoogleReviewCard: React.FC<ReviewProps> = ({ name, date, stars, review }) => {
  return (
    <div className="bg-black text-white rounded-lg px-6 py-4 shadow-lg flex flex-col flex-shrink-0 w-full sm:w-1/2 md:w-80 text-left snap-start">
      <div className="flex items-start">
        <div className="w-6 h-6 mr-2">
          <svg viewBox="0 0 24 24" className="w-full h-full">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
        </div>

        <div className="flex flex-col items-start">
          <div className="flex mb-1">
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  className={
                    i < stars
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-500'
                  }
                />
              ))}
          </div>
          <div className="text-xs text-gray-400">{date}</div>
        </div>
      </div>

      <div className="mt-4">
        <div className="font-bold text-md mb-1">{name}</div>
        <p className="text-sm leading-relaxed text-gray-300">{review}</p>
      </div>
    </div>
  );
};

const GoogleReviewsSection: React.FC = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const reviews: ReviewProps[] = [
    {
      name: "Egy anyuka",
      date: "2025. február 21.",
      stars: 5,
      review: "“Ez a készülék szó szerint megmentette a kisfiam életét! Egy falat étel miatt elkezdett fulladozni, és pánikba estem. Azonnal elővettem az eszközt, és pár másodperc alatt sikerült eltávolítani az akadályt. Minden szülőnek kötelezővé tenném!”"
    },
    // ... other reviews remain the same ...
  ];

  const scrollLeft = () => {
    const container = scrollContainerRef.current;
    if (container) {
      const card = container.children[0] as HTMLElement;
      const cardWidth = card.clientWidth;
      const gapValue = window.getComputedStyle(container).gap;
      const gap = parseInt(gapValue, 10) || 0;
      const scrollAmount = cardWidth + gap;

      const newScrollLeft = container.scrollLeft - scrollAmount;
      const maxAllowedScrollLeft = 0;

      container.scrollTo({
        left: Math.max(newScrollLeft, maxAllowedScrollLeft),
        behavior: 'smooth'
      });
    }
  };

  const scrollRight = () => {
    const container = scrollContainerRef.current;
    if (container) {
      const card = container.children[0] as HTMLElement;
      const cardWidth = card.clientWidth;
      const gapValue = window.getComputedStyle(container).gap;
      const gap = parseInt(gapValue, 10) || 0;
      const scrollAmount = cardWidth + gap;

      const newScrollLeft = container.scrollLeft + scrollAmount;
      const maxScroll = container.scrollWidth - container.clientWidth;

      container.scrollTo({
        left: Math.min(newScrollLeft, maxScroll),
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="max-w-screen-2xl mx-auto px-5 pb-12 relative">
      <div className="text-left mb-8">
        <div className="text-2xl sm:text-3xl lg:text-[2.5rem] font-black mb-0 lg:mb-2">
          Több mint <span className="text-red-600">2500</span>
        </div>
        <div className="text-2xl sm:text-3xl lg:text-[2.5rem] font-black mb-3">
          elégedett vásárló
        </div>
        <p className="text-gray-600 mt-5 text-lg">100+ Google értékelés</p>
      </div>

      <div className="relative">
        <div
          ref={scrollContainerRef}
          className="flex overflow-x-auto gap-4 pl-8 pr-8 md:pl-12 md:pr-12 pb-4 scrollbar-hide snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {reviews.map((review, index) => (
            <GoogleReviewCard key={index} {...review} />
          ))}
        </div>

        <div className="flex justify-end gap-2 mt-4 px-8 md:px-12">
          <button
            onClick={scrollLeft}
            className="bg-white rounded-full p-2 shadow-2xl hover:bg-gray-100 transition-all"
            aria-label="Scroll left"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={scrollRight}
            className="bg-white rounded-full p-2 shadow-2xl hover:bg-gray-100 transition-all"
            aria-label="Scroll right"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default GoogleReviewsSection;