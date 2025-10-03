import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Product {
  _id?: string
  name: string
  description: string
  price: number
  salePrice?: number
  mainImage: string
  categories: string[]
  sizes: string[]
  galleryImages: string[]
  inventoryStatus: 'raktáron' | 'rendelésre' | 'elfogyott'
  stockQuantity: number
}

interface ProductFormProps {
  initialProduct?: Product
  onSubmit: (product: Omit<Product, '_id'>) => void
  onCancel?: () => void
}

const availableSizes = ['One Size', 'XS', 'S', 'M', 'L', 'XL', 'XXL']

export function ProductForm({ initialProduct, onSubmit, onCancel }: ProductFormProps) {
  const [product, setProduct] = useState<Omit<Product, '_id'>>({
    name: initialProduct?.name || '',
    description: initialProduct?.description || '',
    price: initialProduct?.price || 0,
    salePrice: initialProduct?.salePrice,
    mainImage: initialProduct?.mainImage || '',
    categories: initialProduct?.categories || [],
    sizes: initialProduct?.sizes || [],
    galleryImages: initialProduct?.galleryImages || [],
    inventoryStatus: initialProduct?.inventoryStatus || 'elfogyott',
    stockQuantity: initialProduct?.stockQuantity || 0,
  })
  const [newGalleryImage, setNewGalleryImage] = useState('')
  const [newCategory, setNewCategory] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setProduct(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'salePrice' || name === 'stockQuantity' ? Number(value) || 0 : value,
    }))
  }

  const handleInventoryStatusChange = (value: 'raktáron' | 'rendelésre' | 'elfogyott') => {
    setProduct(prev => ({
      ...prev,
      inventoryStatus: value
    }))
  }

  const handleSizeToggle = (size: string) => {
    setProduct(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size]
    }))
  }

  const handleGalleryImageAdd = () => {
    if (newGalleryImage && !product.galleryImages.includes(newGalleryImage)) {
      setProduct(prev => ({ ...prev, galleryImages: [...prev.galleryImages, newGalleryImage] }))
      setNewGalleryImage('')
    }
  }

  const handleGalleryImageRemove = (image: string) => {
    setProduct(prev => ({ ...prev, galleryImages: prev.galleryImages.filter(img => img !== image) }))
  }

  const handleCategoryAdd = () => {
    if (newCategory && !product.categories.includes(newCategory)) {
      setProduct(prev => ({ ...prev, categories: [...prev.categories, newCategory] }))
      setNewCategory('')
    }
  }

  const handleCategoryRemove = (category: string) => {
    setProduct(prev => ({ ...prev, categories: prev.categories.filter(cat => cat !== category) }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(product)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          value={product.name}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={product.description}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="price">Price</Label>
        <Input
          type="number"
          id="price"
          name="price"
          value={product.price}
          onChange={handleChange}
          required
          step="0.01"
        />
      </div>
      <div>
        <Label htmlFor="salePrice">Sale Price (optional)</Label>
        <Input
          type="number"
          id="salePrice"
          name="salePrice"
          value={product.salePrice || ''}
          onChange={handleChange}
          step="0.01"
        />
      </div>
      <div>
        <Label htmlFor="mainImage">Main Image</Label>
        <Input
          id="mainImage"
          name="mainImage"
          value={product.mainImage}
          onChange={handleChange}
          required
        />
      </div>
             <div>
        <Label>Colors</Label> {/* <-- changed label */}
        <div className="flex gap-2 mb-2">
          <Input
            value={newCategory} // re-use a local state for new color input
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Add a color"
          />
          <Button
            type="button"
            onClick={() => {
              if (newCategory && !product.sizes.includes(newCategory)) {
                setProduct(prev => ({
                  ...prev,
                  sizes: [...prev.sizes, newCategory]
                }))
                setNewCategory("")
              }
            }}
          >
            Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {product.sizes.map((color) => (
            <div
              key={color}
              className="bg-gray-100 px-2 py-1 rounded flex items-center"
            >
              <span>{color}</span>
              <button
                type="button"
                onClick={() =>
                  setProduct(prev => ({
                    ...prev,
                    sizes: prev.sizes.filter(c => c !== color)
                  }))
                }
                className="ml-2 text-red-500"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label>Gallery Images</Label>
        <div className="flex gap-2 mb-2">
          <Input
            value={newGalleryImage}
            onChange={(e) => setNewGalleryImage(e.target.value)}
            placeholder="Add image URL"
          />
          <Button type="button" onClick={handleGalleryImageAdd}>Add</Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {product.galleryImages.map((image) => (
            <div key={image} className="bg-gray-100 px-2 py-1 rounded flex items-center">
              <span>{image}</span>
              <button
                type="button"
                onClick={() => handleGalleryImageRemove(image)}
                className="ml-2 text-red-500"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      </div>
      
      {/* Add inventory status and stock quantity fields */}
      <div>
        <Label htmlFor="inventoryStatus">Inventory Status</Label>
        <Select 
          value={product.inventoryStatus} 
          onValueChange={(value: 'raktáron' | 'rendelésre' | 'elfogyott') => handleInventoryStatusChange(value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="raktáron">Raktáron</SelectItem>
            <SelectItem value="rendelésre">Rendelésre</SelectItem>
            <SelectItem value="elfogyott">Elfogyott</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="stockQuantity">Stock Quantity</Label>
        <Input
          type="number"
          id="stockQuantity"
          name="stockQuantity"
          value={product.stockQuantity}
          onChange={handleChange}
          required
          min="0"
          step="1"
        />
      </div>
      
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit">
          {initialProduct ? 'Update Product' : 'Add Product'}
        </Button>
      </div>
    </form>
  )
}