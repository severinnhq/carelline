import { NextResponse } from 'next/server'
import clientPromise from '../../../lib/mongodb'

export async function POST(request: Request) {
  try {
    const client = await clientPromise
    const db = client.db("webstore")
    const { name, description, price, image } = await request.json()

    const product = {
      name,
      description,
      price,
      image,
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

