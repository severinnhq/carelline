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
          Back
        </Button>
      </Link>

      <h1 className="text-3xl font-bold mb-8">Refund & Return Policy</h1>
      
      {/* Rest of the component remains the same */}
      <div className="space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-4">1. Return Period</h2>
          <p className="mb-4">
            We offer a 14-day return window for all our anti-choking devices. This period begins from the date you receive your order, as confirmed by our shipping carrier's delivery confirmation.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">2. Return Process</h2>
          <p className="mb-4">To initiate a return, please follow these steps:</p>
          <ol className="list-decimal pl-6 space-y-2">
            <li>Contact our customer service team within 14 days of delivery</li>
            <li>Receive a return authorization number</li>
            <li>Package the item securely in its original packaging</li>
            <li>Include the return authorization number with your shipment</li>
            <li>Ship the item to our designated return address</li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">3. Return Shipping Costs</h2>
          <p className="mb-4">
            Customers are responsible for return shipping costs under normal circumstances. However, if you received a defective item, we will reimburse your return shipping costs once we verify the factory defect.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">4. Refund Eligibility</h2>
          <p className="mb-4">Full refunds are provided in the following cases:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Factory defects (even if the product has been used)</li>
            <li>Items returned unused in original packaging within 14 days</li>
            <li>Incorrect items shipped</li>
            <li>Items damaged during transit</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">5. Refund Process</h2>
          <p className="mb-4">
            Once we receive your returned item, our team will inspect it within 2 business days. After verification:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Approved refunds will be processed within 3-5 business days</li>
            <li>Refunds will be issued to the original payment method</li>
            <li>You will receive an email confirmation when your refund is processed</li>
            <li>Bank processing times may vary (typically 5-10 business days)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">6. Non-Refundable Items</h2>
          <p className="mb-4">
            We cannot accept returns or provide refunds for:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Items returned after the 14-day window</li>
            <li>Products with signs of excessive use or damage</li>
            <li>Items missing original packaging or components</li>
            <li>Products that have been modified or altered</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">7. Damaged Items</h2>
          <p className="mb-4">
            If you receive a damaged item, please:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Document the damage with photos</li>
            <li>Contact us within 24 hours of delivery</li>
            <li>Keep all original packaging for inspection</li>
            <li>Wait for instructions before returning the item</li>
          </ul>
        </section>

        <footer className="mt-12 text-sm text-gray-600">
          <p>Last updated: February 2025</p>
          <p className="mt-2">This refund policy is subject to change without notice. Please contact our customer service team with any questions.</p>
        </footer>
      </div>
    </div>
  );
};

export default RefundPolicy;