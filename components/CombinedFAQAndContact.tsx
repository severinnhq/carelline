'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { Plus } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { motion, AnimatePresence } from 'framer-motion'
import SuccessModal from './SuccessModal'
import { Sora } from 'next/font/google'

const sora = Sora({ subsets: ['latin'] })

interface FAQItem {
  question: string
  answer: string
}

const faqData: FAQItem[] = [
  {
    question: "What is v0?",
    answer: "v0 is an AI-powered development tool that helps you build and deploy web applications quickly and efficiently."
  },
  {
    question: "How does v0 work?",
    answer: "v0 uses advanced AI algorithms to understand your requirements and generate code, designs, and other assets based on your input. It can create entire web applications or assist with specific components and features."
  },
  {
    question: "Is v0 suitable for beginners?",
    answer: "Yes, v0 is designed to be user-friendly and accessible to developers of all skill levels, including beginners. It provides guidance and explanations along with the generated code."
  },
  {
    question: "Can I customize the code generated by v0?",
    answer: "The code generated by v0 is fully customizable. You can modify, extend, or refactor it to suit your specific needs and preferences."
  },
  {
    question: "What technologies does v0 support?",
    answer: "v0 supports a wide range of modern web technologies, including but not limited to React, Next.js, Tailwind CSS, and various other popular frameworks and libraries."
  }
]

const CombinedFAQAndContact: React.FC = () => {
  const [openItems, setOpenItems] = useState<number[]>([])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)

  const toggleItem = (index: number) => {
    setOpenItems(prevOpenItems =>
      prevOpenItems.includes(index)
        ? prevOpenItems.filter(item => item !== index)
        : [...prevOpenItems, index]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/submit-contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, message }),
      })

      if (response.ok) {
        setName('')
        setEmail('')
        setMessage('')
        setIsSuccessModalOpen(true)
      } else {
        throw new Error('Failed to send message')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to send message. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className={`bg-white py-24 ${sora.className}`}>
      <div className="container mx-auto px-4 max-w-[1140px]">
        <div className="flex flex-col items-center mb-16">
          <div className="w-full max-w-[300px] aspect-square relative overflow-hidden mb-8">
            <Image
              src="/uploads/contact.png"
              alt="Contact Image"
              layout="fill"
              objectFit="cover"
              className="rounded-[30%_70%_70%_30%_/_30%_30%_70%_70%]"
              draggable="false"
            />
          </div>
          <h2 className="text-3xl font-semibold text-center">FAQ & Contact</h2>
        </div>
        <div className="flex flex-col lg:flex-row gap-12">
          {/* FAQ Section */}
          <div className="w-full lg:w-1/2">
            <h3 className="text-2xl font-semibold mb-6">Frequently Asked Questions</h3>
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-4">
              {faqData.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                  <Button
                    variant="ghost"
                    className="w-full flex justify-between items-center p-4 text-left"
                    onClick={() => toggleItem(index)}
                  >
                    <span className="font-medium">{item.question}</span>
                    <motion.div
                      initial={false}
                      animate={{ rotate: openItems.includes(index) ? 45 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Plus className="h-5 w-5 flex-shrink-0" />
                    </motion.div>
                  </Button>
                  <AnimatePresence initial={false}>
                    {openItems.includes(index) && (
                      <motion.div
                        key={`content-${index}`}
                        initial="collapsed"
                        animate="open"
                        exit="collapsed"
                        variants={{
                          open: { opacity: 1, height: "auto" },
                          collapsed: { opacity: 0, height: 0 }
                        }}
                        transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
                      >
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="px-4 pb-4">
                            <p className="text-gray-600">{item.answer}</p>
                          </div>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Section */}
          <div className="w-full lg:w-1/2">
            <h3 className="text-2xl font-semibold mb-6">Contact Us</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  className="w-full"
                  rows={4}
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-gray-900 text-white hover:bg-gray-800"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </Button>
            </form>
          </div>
        </div>
      </div>
      <SuccessModal 
        isOpen={isSuccessModalOpen} 
        onClose={() => setIsSuccessModalOpen(false)} 
      />
    </section>
  )
}

export default CombinedFAQAndContact

