'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from 'next/link';

const TermsAndConditions = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link href="/#footer">
        <Button 
          className="mb-6 flex items-center gap-2"
          variant="outline"
        >
          <ArrowLeft className="h-4 w-4" />
          Vissza
        </Button>
      </Link>

      <h1 className="text-3xl font-bold mb-8">Felhasználási Feltételek</h1>
      
      <div className="space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-4">1. Feltételek elfogadása</h2>
          <p className="mb-4">
            A weboldalunk használatával és termékeink megvásárlásával Ön elfogadja, hogy ezek a Felhasználási Feltételek kötelezőek Önre nézve. Kérjük, figyelmesen olvassa el vásárlás előtt.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">2. Termékinformáció</h2>
          <p className="mb-4">
            Fulladásgátló eszközeink vészhelyzetekben nyújtanak segítséget. Azonban:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Nem helyettesítik a megfelelő orvosi ellátást vagy képzést</li>
            <li>A felhasználóknak meg kell ismerkedniük az eszköz használati utasításával</li>
            <li>A termékeket a használati utasításban leírtak szerint kell tárolni</li>
            <li>Ajánlott az eszköz rendszeres ellenőrzése</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">3. Rendelés és fizetés</h2>
          <p className="mb-4">Rendelés leadásakor:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Minden ár a feltüntetett pénznemben szerepel</li>
            <li>A fizetés a vásárlás időpontjában esedékes</li>
            <li>A rendelések a készlet erejéig érvényesek</li>
            <li>Fenntartjuk a jogot bármely rendelés elutasítására</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">4. Szállítás</h2>
          <p className="mb-4">Szállítási feltételeink a következők:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Világszerte elérhető szállítás</li>
            <li>A szállítási idő régiótól függően változik</li>
            <li>A szállítási költségek a pénztárnál kerülnek kiszámításra</li>
            <li>Nem vállalunk felelősséget a vámért vagy importadókért</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">5. Termékhasználat és felelősség</h2>
          <p className="mb-4">
            Bár termékeinket vészhelyzetekben való segítségnyújtásra terveztük, nem garantálhatjuk hatékonyságukat minden körülmény között. Termékeink megvásárlásával Ön elismeri:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Az eszközt az utasításoknak megfelelően kell használni</li>
            <li>Ajánlott a vészhelyzeti reagálás megfelelő képzése</li>
            <li>Nem vállalunk felelősséget az eszköz helytelen használatáért</li>
            <li>Az eszköz nem helyettesíti a szakszerű orvosi ellátást</li>
          </ul>
          <p className="mb-4 mt-4 font">
            Felhívjuk figyelmét, hogy termékeink és szolgáltatásaink hatékonyságát nem tudjuk 100%-ban garantálni. Nem vállalunk felelősséget a nem megfelelő használatból vagy váratlan körülményekből eredő következményekért.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">6. Szellemi tulajdon</h2>
          <p className="mb-4">
            Weboldalunk minden tartalma, beleértve a szöveget, grafikát, logókat és képeket, szellemi tulajdonjogi védelem alatt áll. Ön nem:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Másolhatja vagy reprodukálhatja tartalmunkat engedély nélkül</li>
            <li>Használhatja védjegyeinket vagy márkajelzéseinket</li>
            <li>Értékesítheti tovább termékeinket engedély nélkül</li>
          </ul>
        </section>

       

        <section>
          <h2 className="text-2xl font-semibold mb-4">7. Irányadó jog</h2>
          <p className="mb-4">
            Ezeket a felhasználási feltételeket az alkalmazandó jogszabályok szerint kell értelmezni. Bármilyen jogvita kizárólag a joghatóságunkban illetékes bíróságok hatáskörébe tartozik.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">8. Feltételek módosítása</h2>
          <p className="mb-4">
            Fenntartjuk a jogot, hogy ezeket a felhasználási feltételeket bármikor frissítsük vagy módosítsuk előzetes értesítés nélkül. A weboldal vagy a termékek ilyen változtatások utáni folyamatos használata az új feltételek elfogadását jelenti.
          </p>
        </section>

        <footer className="mt-12 text-sm text-gray-600">
          <p>Utolsó frissítés: 2025. február</p>
          <p className="mt-2">Ezen feltételekkel kapcsolatos kérdéseivel forduljon ügyfélszolgálati csapatunkhoz.</p>
        </footer>
      </div>
    </div>
  );
};

export default TermsAndConditions;