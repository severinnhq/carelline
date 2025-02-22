'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'

export default function FAQSection() {
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set())

  const faqs = [
    {
      question: "What does this hoodie represent?",
      answer: "It represents leaving excuses behind, embracing ambition, and being part of a movement that refuses to settle for mediocrity."
    },
    {
      question: "Why is the motto 'Not for Everyone'?",
      answer: "Because this hoodie isn't for people who settle. It's for those ready to wake up, face hard truths, and make a change."
    },
    {
      question: "What's the purpose of REWEALED?",
      answer: "To remind you that time is running out. This hoodie represents urgency, focus, and aligning with others who are done waiting for 'someday'."
    },
    {
      question: "Why is REWEALED expensive?",
      answer: "Because it's not just a hoodie. It's a symbol of ambition, a statement of purpose, and a connection to a community that values action over excuses. Quality and meaning come at a price—it's for those who understand the difference."
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
      We know you don’t have time to waste, so here are the answers you’re looking for—clear and direct.
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

