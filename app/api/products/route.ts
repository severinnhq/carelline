import { NextResponse } from 'next/server'
import clientPromise from '../../../lib/mongodb'

export async function POST(request: Request) {
  try {
    const client = await clientPromise
    const db = client.db("webstore")
   const { name, description, price, salePrice, mainImage, categories, sizes, galleryImages, inventoryStatus, stockQuantity, karakter } = await request.json()


    const product = {
  name,
  description,
  price,
  salePrice,
  mainImage,
  categories: Array.isArray(categories) ? categories : [categories].filter(Boolean),
  sizes,
  galleryImages,
  inventoryStatus: inventoryStatus || 'elfogyott',
  stockQuantity: stockQuantity || 0,
  karakter, // ✅ new field
  createdAt: new Date(),
}


    const result = await db.collection("products").insertOne(product)

    return NextResponse.json({ message: 'Product added successfully', productId: result.insertedId })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ message: 'Error adding product' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db("webstore")
    const products = await db.collection("products").find({}).toArray()

    return NextResponse.json(products)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ message: 'Error fetching products' }, { status: 500 })
  }
}