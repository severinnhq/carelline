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
          Back
        </Button>
      </Link>

      <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
      
      <div className="space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
          <p className="mb-4">
            This Privacy Policy outlines how we collect, use, and protect your information when you use our website and purchase our anti-choking devices. We are committed to ensuring your privacy and maintaining the security of any personal information you provide to us.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
          <p className="mb-4">When you make a purchase, we collect only essential information necessary to process your order:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Name and shipping address for delivery purposes</li>
            <li>Email address for order confirmation and shipping updates</li>
            <li>Payment information (processed securely through our payment provider)</li>
            <li>Order history and related transaction details</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">3. What We Don't Collect</h2>
          <p className="mb-4">We want to be clear about what information we do not collect or store:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Health-related data or medical information</li>
            <li>Cookie data or tracking information</li>
            <li>Newsletter subscriptions or marketing preferences</li>
            <li>Social media profiles or demographic information</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">4. How We Use Your Information</h2>
          <p className="mb-4">Your information is used solely for:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Processing and fulfilling your orders</li>
            <li>Communicating about your purchase and shipping status</li>
            <li>Responding to your customer service inquiries</li>
            <li>Managing returns and refunds when applicable</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">5. Data Security</h2>
          <p className="mb-4">
            We implement appropriate security measures to protect your personal information. All payment processing is handled through secure, PCI-compliant payment processors. We do not store credit card information on our servers.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">6. Third-Party Services</h2>
          <p className="mb-4">
            We use trusted third-party services only for essential business operations:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Payment processing services</li>
            <li>Shipping and logistics providers</li>
            <li>Customer service platforms</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">7. Your Rights</h2>
          <p className="mb-4">You have the right to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Access your personal information</li>
            <li>Request correction of any inaccurate information</li>
            <li>Request deletion of your information</li>
            <li>Receive a copy of your data</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">8. Contact Us</h2>
          <p className="mb-4">
            If you have any questions about our Privacy Policy or how we handle your personal information, please contact our customer service team.
          </p>
        </section>

        <footer className="mt-12 text-sm text-gray-600">
          <p>Last updated: February 2025</p>
          <p className="mt-2">This privacy policy is subject to change without notice.</p>
        </footer>
      </div>
    </div>
  );
};

export default PrivacyPolicy;