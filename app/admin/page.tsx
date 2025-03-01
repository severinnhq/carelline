'use client'

import { useState, useEffect } from 'react'
import { ProductForm } from '@/components/ProductForm'
import { Button } from "@/components/ui/button"
import { AdminPasswordPrompt } from '@/components/AdminPasswordPrompt'

interface Product {
  _id: string
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

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      fetchProducts()
    }
  }, [isAuthenticated])

  const fetchProducts = async () => {
    const response = await fetch('/api/products')
    if (response.ok) {
      const data: Product[] = await response.json()
      setProducts(data.map((product) => ({
        ...product,
        price: Number(product.price) || 0,
        salePrice: product.salePrice ? Number(product.salePrice) || 0 : undefined,
        categories: Array.isArray(product.categories) ? product.categories : [product.categories].filter(Boolean)
      })))
    }
  }

  const handleAddProduct = async (product: Omit<Product, '_id'>) => {
    const response = await fetch('/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(product),
    })
    if (response.ok) {
      fetchProducts()
    }
  }

  const handleUpdateProduct = async (product: Omit<Product, '_id'>) => {
    if (!editingProduct) return

    const response = await fetch(`/api/products/${editingProduct._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(product),
    })
    if (response.ok) {
      setEditingProduct(null)
      fetchProducts()
    }
  }

  const handleEditClick = (product: Product) => {
    setEditingProduct(product)
  }

  const handleCancelEdit = () => {
    setEditingProduct(null)
  }

  if (!isAuthenticated) {
    return <AdminPasswordPrompt onCorrectPassword={() => setIsAuthenticated(true)} />
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Add New Product</h2>
        <ProductForm onSubmit={handleAddProduct} />
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Product List</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <div key={product._id} className="border rounded p-4">
              {editingProduct && editingProduct._id === product._id ? (
                <ProductForm
                  initialProduct={editingProduct}
                  onSubmit={handleUpdateProduct}
                  onCancel={handleCancelEdit}
                />
              ) : (
                <>
                  <h3 className="text-xl font-semibold">{product.name}</h3>
                  <p className="text-gray-600">{product.description}</p>
                  <p className="mt-2">Price: ${product.price.toFixed(2)}</p>
{product.salePrice && (
  <p className="text-red-600">Sale Price: ${product.salePrice.toFixed(2)}</p>
)}
<p>Categories: {product.categories.join(', ')}</p>
<p>Sizes: {product.sizes.join(', ')}</p>
{/* Add this: */}
<p className="mt-1">
  Status: <span className={`font-medium ${
    product.inventoryStatus === 'raktáron' ? 'text-green-600' : 
    product.inventoryStatus === 'rendelésre' ? 'text-amber-600' : 'text-red-600'
  }`}>
    {product.inventoryStatus}
    {product.inventoryStatus === 'raktáron' && ` (${product.stockQuantity} db)`}
  </span>
</p>
                  <Button onClick={() => handleEditClick(product)} className="mt-2">
                    Edit Product
                  </Button>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}