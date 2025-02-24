'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'

export default function FAQSection() {
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set())

  const faqs = [
    {
      question: "How quickly can an anti-choking device remove an airway obstruction?",
      answer: "Our anti-choking devices are designed to create strong, safe suction that can help remove airway blockages within seconds of proper application. However, these devices should be used as part of a comprehensive response that includes calling emergency services."
    },
    {
      question: "Can anyone use these anti-choking devices, or do you need special training?",
      answer: "While our devices are designed to be user-friendly, we strongly recommend watching our included instructional video and practicing with the training materials provided. No special certification is required, but familiarity with the device before an emergency is essential."
    },
    {
      question: "What age groups are these devices suitable for?",
      answer: "Our anti-choking devices are designed for use on both children (over 12 months) and adults. Each device comes with clear instructions for age-appropriate usage and proper mask sizing to ensure a safe seal."
    },
    {
      question: "What's the shelf life of the device, and does it require any maintenance?",
      answer: "Our anti-choking devices have a 2-year warranty and typically last several years when properly stored. We recommend checking the device monthly for any damage and keeping it in its protective case at room temperature. No regular maintenance is required beyond basic cleaning after use."
    }
  ]

  const toggleItem = (index: number) => {
    setExpandedItems((prevItems) => {
      const newItems = new Set(prevItems)
      if (newItems.has(index)) {
        newItems.delete(index)
      } else {
        newItems.add(index)
      }
      return newItems
    })
  }

  return (
    <div id="faq-section" className="max-w-6xl mx-auto px-4 mt-[4rem] mb-[4rem] md:mt-[8rem] md:mb-[8rem]">
      <h1 className="text-4xl sm:text-5xl font-bold mb-[1rem] md:mb-[1rem] text-center uppercase tracking-wider">STRAIGHT TO THE POINT</h1>
      <p className="text-center text-gray-600 mb-[4rem] text-lg mx-auto max-w-[600px] w-full px-4 sm:px-6 md:px-8">
      When seconds matter, you need answers fast. Here's everything you should know
      </p>

      <div className="space-y-6">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="bg-white rounded-lg overflow-hidden border border-gray-200"
          >
            <button
              onClick={() => toggleItem(index)}
              className="w-full px-4 sm:px-10 py-3 flex justify-between items-center text-left"
            >
              <span className="font-medium text-sm sm:text-base">{faq.question}</span>
              <Plus
                className={`h-5 w-5 sm:h-6 sm:w-6 transition-transform duration-200 ${
                  expandedItems.has(index) ? 'rotate-45' : ''
                }`}
              />
            </button>
            <div
              className={`px-4 sm:px-10 transition-all duration-300 ease-in-out ${
                expandedItems.has(index)
                  ? 'max-h-80 opacity-100 py-3'
                  : 'max-h-0 opacity-0 py-0'
              }`}
            >
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">{faq.answer}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

