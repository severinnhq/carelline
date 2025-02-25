'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from 'next/link';

const PrivacyPolicy = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 relative">
      <Link href="/#footer">
        <Button 
          className="mb-6 flex items-center gap-2"
          variant="outline"
        >
          <ArrowLeft className="h-4 w-4" />
          Vissza
        </Button>
      </Link>

      <h1 className="text-3xl font-bold mb-8">Adatvédelmi Szabályzat</h1>
      
      <div className="space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-4">1. Bevezetés</h2>
          <p className="mb-4">
            Ez az Adatvédelmi Nyilatkozat ismerteti, hogyan gyűjtjük, használjuk és védjük az Ön adatait, az oldalon történő vásárlás során.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">2. Az általunk gyűjtött információk</h2>
          <p className="mb-4">A vásárlás során, csak a megrendelés feldolgozásához szükséges alapvető információkat gyűjtjük:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Név és szállítási cím a kézbesítés céljából</li>
            <li>E-mail cím a rendelés visszaigazolásához és a szállítási frissítésekhez</li>
            <li>Fizetési információk (amelyeket biztonságosan dolgozunk fel a fizetési szolgáltatónkon keresztül)</li>
            <li>Rendelési előzmények és kapcsolódó tranzakciós adatok</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">3. Amit nem gyűjtünk</h2>
          <p className="mb-4">Szeretnénk világossá tenni, hogy milyen információkat nem gyűjtünk vagy tárolunk:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Egészségügyi adatok vagy orvosi információk</li>
            <li>Cookie-adatok vagy nyomonkövetési információk</li>
            <li>Hírlevél-feliratkozások vagy marketing-preferenciák</li>
            <li>Közösségi média profilok vagy demográfiai információk</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">4. Hogyan használjuk az Ön információit</h2>
          <p className="mb-4">Az Ön adatait kizárólag a következőkre használjuk:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Megrendeléseinek feldolgozása és teljesítése</li>
            <li>Kommunikáció a vásárlásáról és a szállítási állapotról</li>
            <li>Válaszadás az ügyfélszolgálati kérdéseire</li>
            <li>Visszatérítések és visszaküldések kezelése, ha alkalmazható</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">5. Adatbiztonság</h2>
          <p className="mb-4">
            Megfelelő biztonsági intézkedéseket alkalmazunk személyes adatainak védelme érdekében. Minden fizetési feldolgozás biztonságos, PCI-megfelelő fizetési feldolgozókon keresztül történik. Nem tárolunk hitelkártya-információkat a szervereinken.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">6. Harmadik féltől származó szolgáltatások</h2>
          <p className="mb-4">
            Megbízható harmadik féltől származó szolgáltatásokat csak alapvető üzleti műveletekhez használunk:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Fizetésfeldolgozó szolgáltatások</li>
            <li>Szállítási és logisztikai szolgáltatók</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">7. Az Ön jogai</h2>
          <p className="mb-4">Önnek joga van:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Hozzáférni személyes adataihoz</li>
            <li>Kérni a pontatlan adatok helyesbítését</li>
            <li>Kérni adatainak törlését</li>
            <li>Megkapni adatainak másolatát</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">8. Kapcsolat</h2>
          <p className="mb-4">
            Ha bármilyen kérdése van adatvédelmi szabályzatunkkal vagy személyes adatainak kezelésével kapcsolatban, kérjük, vegye fel a kapcsolatot ügyfélszolgálati csapatunkkal.
          </p>
        </section>

        <footer className="mt-12 text-sm text-gray-600">
          <p>Utoljára frissítve: 2025 február</p>
          <p className="mt-2">Ez az adatvédelmi szabályzat előzetes értesítés nélkül változhat.</p>
        </footer>
      </div>
    </div>
  );
};

export default PrivacyPolicy;