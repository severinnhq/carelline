'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from 'next/link';

const RefundPolicy = () => {
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

      <h1 className="text-3xl font-bold mb-8">Visszatérítési és Visszaküldési Szabályzat</h1>
      
      <div className="space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-4">1. Visszaküldési időszak</h2>
          <p className="mb-4">
            Minden fulladásgátló eszközünkre 14 napos visszaküldési időszakot biztosítunk. Ez az időszak a rendelés kézhezvételének napjától kezdődik, amelyet a szállítási szolgáltató kézbesítési visszaigazolása igazol.
          </p>
          <p className="mb-4 text-red-600 font-semibold">
            Felhívjuk figyelmét, hogy termékeink és szolgáltatásaink hatékonyságát nem tudjuk 100%-ban garantálni. Nem vállalunk felelősséget a nem megfelelő használatból vagy váratlan körülményekből eredő következményekért.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">2. Visszaküldési folyamat</h2>
          <p className="mb-4">A visszaküldés kezdeményezéséhez kérjük, kövesse az alábbi lépéseket:</p>
          <ol className="list-decimal pl-6 space-y-2">
            <li>Vegye fel a kapcsolatot ügyfélszolgálati csapatunkkal a kézbesítéstől számított 14 napon belül</li>
            <li>Kapjon egy visszaküldési engedélyszámot</li>
            <li>Csomagolja be biztonságosan a terméket az eredeti csomagolásába</li>
            <li>Mellékelje a visszaküldési engedélyszámot a küldeményhez</li>
            <li>Küldje el a terméket a megadott visszaküldési címre</li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">3. Visszaküldési szállítási költségek</h2>
          <p className="mb-4">
            A visszaküldés szállítási költségeit normál körülmények között a vásárlók viselik. Ha azonban hibás terméket kapott, a visszaküldési költségeket megtérítjük, miután ellenőriztük a gyári hibát.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">4. Visszatérítési jogosultság</h2>
          <p className="mb-4">Teljes visszatérítést az alábbi esetekben biztosítunk:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Gyári hibák (még akkor is, ha a terméket már használták)</li>
            <li>14 napon belül, eredeti csomagolásban, használatlanul visszaküldött termékek</li>
            <li>Tévesen kiszállított termékek</li>
            <li>Szállítás közben megsérült termékek</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">5. Visszatérítési folyamat</h2>
          <p className="mb-4">
            A visszaküldött termék kézhezvételét követően csapatunk 2 munkanapon belül megvizsgálja azt. Ellenőrzés után:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>A jóváhagyott visszatérítéseket 3-5 munkanapon belül feldolgozzuk</li>
            <li>A visszatérítés az eredeti fizetési módra történik</li>
            <li>E-mailben értesítést kap, amikor a visszatérítést feldolgoztuk</li>
            <li>A banki feldolgozási idők változhatnak (általában 5-10 munkanap)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">6. Nem visszatéríthető termékek</h2>
          <p className="mb-4">
            Nem fogadunk el visszaküldést és nem biztosítunk visszatérítést az alábbi esetekben:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>14 napos időszak után visszaküldött termékek</li>
            <li>Túlzott használat vagy sérülés jeleit mutató termékek</li>
            <li>Eredeti csomagolás vagy alkatrészek nélküli termékek</li>
            <li>Módosított vagy átalakított termékek</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">7. Sérült termékek</h2>
          <p className="mb-4">
            Ha sérült terméket kap, kérjük:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Dokumentálja a sérülést fényképekkel</li>
            <li>Vegye fel velünk a kapcsolatot a kézbesítéstől számított 24 órán belül</li>
            <li>Őrizze meg az eredeti csomagolást ellenőrzés céljából</li>
            <li>Várja meg az utasításokat, mielőtt visszaküldené a terméket</li>
          </ul>
        </section>

        <footer className="mt-12 text-sm text-gray-600">
          <p>Utolsó frissítés: 2025. február</p>
          <p className="mt-2">Ez a visszatérítési szabályzat előzetes értesítés nélkül változhat. Kérjük, bármilyen kérdéssel forduljon ügyfélszolgálati csapatunkhoz.</p>
        </footer>
      </div>
    </div>
  );
};

export default RefundPolicy;