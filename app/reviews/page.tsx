'use client';

import React, { useState, useRef } from 'react';

import { Header } from '@/components/Header';
import Sidebar from '@/components/Sidebar';

import { useCart } from '@/lib/CartContext';
import { CloudUpload, Trash2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface ReviewFormProps {
  onSubmit?: (review: ReviewSubmission) => void;
}

interface ReviewSubmission {
  name: string;
  email: string;
  message: string;
  images: File[];
}

const ReviewForm: React.FC<ReviewFormProps> = ({ onSubmit }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      setImages(prevImages => [...prevImages, ...newFiles].slice(0, 5));
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
    if (event.dataTransfer.files) {
      const newFiles = Array.from(event.dataTransfer.files);
      setImages(prevImages => [...prevImages, ...newFiles].slice(0, 5));
    }
  };

  const removeImage = (index: number) => {
    setImages(prevImages => prevImages.filter((_, i) => i !== index));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!name || !email || !message) {
      alert('Kérjük, töltse ki az összes mezőt!');
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('message', message);
    images.forEach(image => {
      formData.append('images', image);
    });

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        setShowSuccessModal(true);
        setName('');
        setEmail('');
        setMessage('');
        setImages([]);
        if (onSubmit) {
          onSubmit({ name, email, message, images });
        }
      } else {
        const errorData = await response.json();
        alert(`Hiba történt: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Hiba:', error);
      alert('Nem sikerült elküldeni az értékelést.');
    }
  };

  const openFileInput = () => {
    fileInputRef.current?.click();
  };

  const SuccessModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-8 max-w-md w-full shadow-xl">
        <div className="text-center space-y-4">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
          <h2 className="text-2xl font-bold">Köszönjük értékelését!</h2>
          <p className="text-gray-600">
            Az értékelését sikeresen fogadtuk. Köszönjük, hogy időt szánt ránk!
          </p>
          <Button
        onClick={() => setShowSuccessModal(false)}
        className="w-full bg-red-600 hover:bg-red-700 mt-4 text-white"
      >
        Bezárás
      </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-lg mx-auto py-10 my-48 px-6 bg-white rounded-lg shadow-md relative">
      <h1 className="text-xl font-bold text-start uppercase tracking-wider mb-4">
        Értékelés beküldése
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block mb-2">
            Név
          </label>
          <Input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Az Ön neve"
            required
          />
        </div>
        <div>
          <label htmlFor="email" className="block mb-2">
            E-mail cím
          </label>
          <Input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Az Ön e-mail címe"
            required
          />
        </div>
        <div>
          <label htmlFor="message" className="block mb-2">
            Üzenet
          </label>
          <Textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Az Ön értékelése"
            required
            rows={4}
          />
        </div>
        
        <div 
          className={`border-2 border-dashed p-4 rounded-lg text-center transition-colors duration-300 ${
            dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            multiple 
            accept="image/*" 
            className="hidden"
          />
          <div className="flex flex-col items-center">
            <CloudUpload className="w-12 h-12 text-gray-400 mb-2" />
            <p className="text-gray-600 mb-2">
              Húzza ide a képeket vagy {' '}
              <span 
                onClick={openFileInput} 
                className="text-blue-600 cursor-pointer hover:underline"
              >
                tallózzon
              </span>
            </p>
            <p className="text-xs text-gray-500">Maximum 5 kép, egyenként max 5MB</p>
          </div>
        </div>

        {images.length > 0 && (
          <div className="grid grid-cols-5 gap-2 mt-4">
            {images.map((image, index) => (
              <div key={index} className="relative">
                <img 
                  src={URL.createObjectURL(image)} 
                  alt={`Uploaded ${index}`} 
                  className="w-full h-20 object-cover rounded"
                />
                <button 
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 m-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <Button type="submit" className="w-full mt-4 bg-[#dc2626] text-white py-2">
          Értékelés beküldése
        </Button>
      </form>

      {showSuccessModal && <SuccessModal />}
    </div>
  );
};

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { cartItems, removeFromCart, updateQuantity } = useCart();

  return (
    <main className="flex flex-col min-h-screen">
      <Header 
        onCartClick={() => setIsSidebarOpen(true)} 
        cartItems={cartItems} 
      />
      <section id="review">
        <ReviewForm />
      </section>
      
      <Sidebar
        cartItems={cartItems}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onRemoveItem={removeFromCart}
        onUpdateQuantity={updateQuantity}
      />
    </main>
  );
}