'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'

export default function FAQSection() {
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set())

  const faqs = [
    {
      question: "Hogy működik és milyen gyorsan képes felszabadítani a légutat?",
      answer: "Vákumot képezve, erős szívással 1 pumpálással azaz már az első szívás megtisztítja a légutat, de mindig fontos, hogy sürgősségi segítséget is kérjünk."
    },
    {
      question: "Mit tegyek ha az első szívás nem volt sikeres?",
      answer: "Szinte mindig egyből sikerül, ha mégsem, pumpáljon tovább, illetve a sürgősségi segítség elengedhetetlen."
    },
    {
      question: "Van szükség előzetes speciális képzésre?",
      answer: "Eszközeinket felhasználóbarátra terveztük. Nem szükséges különösebb képesítés, de a készülékkel való ismerkedés vészhelyzet előtt elengedhetetlen."
    },
    {
      question: "Milyen korosztályok számára alkalmasak ezek az eszközök?",
      answer: "Bármilyen korosztály számára alkalmasak az eszközök, csecsemőkre és idősekre is egyaránt."
    },
    {
      question: "Mennyi az eszköz élettartama, és igényel-e karbantartást?",
      answer: "Megfelelő tárolás esetén általában több évig tartanak. Javasoljuk, hogy havonta ellenőrizze az eszközt, hogy nincs-e rajta sérülés, és szobahőmérsékleten, védőtokban tartsa. A használat utáni alapvető tisztításon kívül nincs szükség rendszeres karbantartásra."
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
    <div id="faq-section" className="max-w-6xl mx-auto px-4 mt-[0rem] mb-[4rem] md:mt-[0rem] md:mb-[8rem]">
      <div className="text-3xl sm:text-[2.5rem] font-black mb-[1rem] md:mb-[1rem] text-center uppercase tracking-wider">FONTOS TUDNIVALÓK</div>
      <p className="text-center text-gray-600 mb-[4rem] text-lg mx-auto max-w-[600px] w-full px-4 sm:px-6 md:px-8">
      Amikor minden másodperc számít, gyors válaszokra van szükség. Íme minden, amit érdemes tudni.
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

