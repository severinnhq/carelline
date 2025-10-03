'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface Product {
  _id: string
  name: string
  description: string
  price: number
  salePrice?: number
  mainImage: string
  categories: string[]
  sizes: string[]   // still the same field, now used as "colors"
  galleryImages: string[]
}

interface EditProductFormProps {
  product: Product
  onCancel: () => void
}

export function EditProductForm({ product, onCancel }: EditProductFormProps) {
  const [name, setName] = useState(product.name)
  const [description, setDescription] = useState(product.description)
  const [price, setPrice] = useState(product.price.toString())
  const [salePrice, setSalePrice] = useState(product.salePrice?.toString() || '')
  const [mainImage, setMainImage] = useState(product.mainImage)
  const [categories, setCategories] = useState<string[]>(product.categories || [])
  const [newCategory, setNewCategory] = useState('')
  const [colors, setColors] = useState<string[]>(product.sizes || []) // repurpose sizes as colors
  const [newColor, setNewColor] = useState('')
  const [galleryImages, setGalleryImages] = useState<string[]>(product.galleryImages)
  const [newGalleryImage, setNewGalleryImage] = useState('')
  const router = useRouter()

  const handleAddColor = () => {
    if (newColor && !colors.includes(newColor)) {
      setColors(prev => [...prev, newColor])
      setNewColor('')
    }
  }

  const handleRemoveColor = (index: number) => {
    setColors(prev => prev.filter((_, i) => i !== index))
  }

  const handleAddGalleryImage = () => {
    if (newGalleryImage) {
      setGalleryImages(prev => [...prev, newGalleryImage])
      setNewGalleryImage('')
    }
  }

  const handleRemoveGalleryImage = (index: number) => {
    setGalleryImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleAddCategory = () => {
    if (newCategory && !categories.includes(newCategory)) {
      setCategories(prev => [...prev, newCategory])
      setNewCategory('')
    }
  }

  const handleRemoveCategory = (index: number) => {
    setCategories(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const response = await fetch(`/api/products/${product._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        name, 
        description, 
        price: parseFloat(price), 
        salePrice: salePrice ? parseFloat(salePrice) : null,
        mainImage,
        categories,
        sizes: colors, // <-- still goes into `sizes` field in DB
        galleryImages
      }),
    })
    if (response.ok) {
      router.refresh()
      onCancel()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required />
      </div>

      <div>
        <Label htmlFor="price">Price</Label>
        <Input type="number" id="price" value={price} onChange={(e) => setPrice(e.target.value)} required step="0.01" />
      </div>

      <div>
        <Label htmlFor="salePrice">Sale Price (optional)</Label>
        <Input type="number" id="salePrice" value={salePrice} onChange={(e) => setSalePrice(e.target.value)} step="0.01" />
      </div>

      <div>
        <Label>Categories</Label>
        <div className="flex gap-2 mb-2">
          <Input value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="Add category" />
          <Button type="button" onClick={handleAddCategory}>Add</Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((category, index) => (
            <div key={index} className="bg-gray-100 px-2 py-1 rounded flex items-center">
              <span>{category}</span>
              <button type="button" onClick={() => handleRemoveCategory(index)} className="ml-2 text-red-500">&times;</button>
            </div>
          ))}
        </div>
      </div>

      {/* Replaced Sizes with Colors input */}
      <div>
        <Label>Colors</Label>
        <div className="flex gap-2 mb-2">
          <Input
            value={newColor}
            onChange={(e) => setNewColor(e.target.value)}
            placeholder="Add color"
          />
          <Button type="button" onClick={handleAddColor}>Add</Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {colors.map((color, index) => (
            <div key={index} className="bg-gray-100 px-2 py-1 rounded flex items-center">
              <span>{color}</span>
              <button type="button" onClick={() => handleRemoveColor(index)} className="ml-2 text-red-500">&times;</button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="mainImage">Main Image Filename</Label>
        <Input id="mainImage" value={mainImage} onChange={(e) => setMainImage(e.target.value)} required />
      </div>

      <div>
        <Label htmlFor="galleryImage">Gallery Images</Label>
        <div className="flex gap-2">
          <Input id="galleryImage" value={newGalleryImage} onChange={(e) => setNewGalleryImage(e.target.value)} placeholder="Enter image filename" />
          <Button type="button" onClick={handleAddGalleryImage}>Add Image</Button>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {galleryImages.map((image, index) => (
            <div key={index} className="flex items-center gap-2 bg-gray-100 p-2 rounded">
              <span>{image}</span>
              <Button type="button" variant="destructive" size="sm" onClick={() => handleRemoveGalleryImage(index)}>Remove</Button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Save Changes</Button>
      </div>
    </form>
  )
}
