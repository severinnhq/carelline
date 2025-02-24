'use client';

import React, { useState } from 'react';
import Image from 'next/image';

const FeatureSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const features = [
    {
      title: 'Step 1',
      description:
        'This is the description for step 1. It explains the first feature in detail.',
      image: '/uploads/step1.png',
    },
    {
      title: 'Step 2',
      description:
        'Here is the description for step 2. It provides more insights about the second feature.',
      image: '/uploads/step2.png',
    },
    {
      title: 'Step 3',
      description:
        'Discover step 3 with this description that outlines its benefits and details.',
      image: '/uploads/step3.png',
    },
  ];

  return (
    <div id="feature-section" className="pt-48 pb-48"> {/* Modified padding to be asymmetric */}
      <section className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center">
          {/* Left side: Image area with a slight scale-down effect */}
          <div className="md:w-1/2 w-full mb-6 md:mb-0 transform transition-transform duration-500 ease-in-out scale-95">
            <Image
              src={features[activeIndex].image}
              alt={features[activeIndex].title}
              width={500}
              height={500}
              className="object-cover rounded-lg"
            />
          </div>
          {/* Right side: Collapsible items without borders, only dividers */}
          <div className="md:w-1/2 w-full">
            {features.map((feature, index) => (
              <div key={index} className="mb-4">
                <button
                  onClick={() => setActiveIndex(index)}
                  className="w-full text-left p-4 focus:outline-none"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-semibold">{feature.title}</h3>
                    <span
                      className={`text-2xl transition-transform duration-300 ${
                        activeIndex === index ? 'rotate-45' : 'rotate-0'
                      }`}
                    >
                      +
                    </span>
                  </div>
                </button>
                {/* Animated collapsible content */}
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    activeIndex === index
                      ? 'max-h-40 opacity-100 mt-2'
                      : 'max-h-0 opacity-0'
                  }`}
                >
                  <p className="text-gray-600">{feature.description}</p>
                </div>
                {/* Divider between items */}
                {index < features.length - 1 && (
                  <div className="my-2 border-t border-gray-300"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default FeatureSection;