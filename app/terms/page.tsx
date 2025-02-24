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
          Back
        </Button>
      </Link>

      <h1 className="text-3xl font-bold mb-8">Terms and Conditions</h1>
      
      <div className="space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-4">1. Agreement to Terms</h2>
          <p className="mb-4">
            By accessing our website and purchasing our anti-choking devices, you agree to be bound by these Terms and Conditions. Please read them carefully before making a purchase.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">2. Product Information</h2>
          <p className="mb-4">
            Our anti-choking devices are designed to assist in emergency situations. However:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>They are not a substitute for proper medical care or training</li>
            <li>Users should familiarize themselves with the device's instructions</li>
            <li>Products should be stored as directed in the user manual</li>
            <li>Regular inspection of the device is recommended</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">3. Ordering and Payment</h2>
          <p className="mb-4">When placing an order:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>All prices are listed in the designated currency</li>
            <li>Payment is required at the time of purchase</li>
            <li>Orders are subject to availability</li>
            <li>We reserve the right to refuse any order</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">4. Shipping</h2>
          <p className="mb-4">Our shipping terms include:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Worldwide shipping availability</li>
            <li>Delivery times vary by location</li>
            <li>Shipping costs are calculated at checkout</li>
            <li>We are not responsible for customs duties or import taxes</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">5. Product Use and Liability</h2>
          <p className="mb-4">
            While our products are designed to assist in emergency situations, we cannot guarantee their effectiveness in all circumstances. By purchasing our products, you acknowledge:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>The device should be used as directed in the instructions</li>
            <li>Proper training in emergency response is recommended</li>
            <li>We are not liable for misuse or improper use of the device</li>
            <li>The device is not a substitute for professional medical care</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">6. Intellectual Property</h2>
          <p className="mb-4">
            All content on our website, including text, graphics, logos, and images, is protected by intellectual property rights. You may not:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Copy or reproduce our content without permission</li>
            <li>Use our trademarks or brand elements</li>
            <li>Modify or alter our product designs</li>
            <li>Resell our products without authorization</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">7. Prohibited Uses</h2>
          <p className="mb-4">You agree not to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Use the products for any unlawful purpose</li>
            <li>Attempt to reverse engineer the devices</li>
            <li>Make unauthorized modifications to the products</li>
            <li>Resell or distribute the products without permission</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">8. Governing Law</h2>
          <p className="mb-4">
            These terms and conditions are governed by and construed in accordance with applicable laws. Any disputes shall be subject to the exclusive jurisdiction of the courts in our jurisdiction.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">9. Changes to Terms</h2>
          <p className="mb-4">
            We reserve the right to update or modify these terms and conditions at any time without prior notice. Continued use of our website or products after such changes constitutes acceptance of the new terms.
          </p>
        </section>

        <footer className="mt-12 text-sm text-gray-600">
          <p>Last updated: February 2025</p>
          <p className="mt-2">For questions about these terms, please contact our customer service team.</p>
        </footer>
      </div>
    </div>
  );
};

export default TermsAndConditions;