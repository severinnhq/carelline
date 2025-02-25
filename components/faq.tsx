'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'

export default function FAQSection() {
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set())

  const faqs = [
    {
      question: "Milyen gyorsan képes a fulladásgátló eszköz eltávolítani a légúti elzáródást?",
      answer: "Fulladásgátló eszközeinket úgy tervezték, hogy erős, biztonságos szívást hozzanak létre, amely a megfelelő alkalmazást követően másodperceken belül segíthet a légúti elzáródások eltávolításában. Ezeket az eszközöket azonban egy átfogó válaszlépés részeként kell használni, amely magában foglalja a sürgősségi szolgálat hívását is."
    },
    {
      question: "Bárki használhatja ezeket a fojtásgátló eszközöket, vagy speciális képzésre van szükség?",
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
    <div id="faq-section" className="max-w-6xl mx-auto px-4 mt-[4rem] mb-[4rem] md:mt-[8rem] md:mb-[8rem]">
      <h1 className="text-4xl sm:text-5xl font-bold mb-[1rem] md:mb-[1rem] text-center uppercase tracking-wider">FONTOS TUDNIVALÓK</h1>
      <p className="text-center text-gray-600 mb-[4rem] text-lg mx-auto max-w-[600px] w-full px-4 sm:px-6 md:px-8">
      Amikor minden másodperc számít, gyors válaszokra van szükséged. Íme minden, amit érdemes tudni.
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

