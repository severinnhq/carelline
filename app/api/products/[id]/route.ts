import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import clientPromise from '../../../../lib/mongodb'

export async function GET(request: NextRequest) {
  const id = request.nextUrl.pathname.split('/').pop()
  if (!id) {
    return NextResponse.json({ message: 'Product ID is required' }, { status: 400 })
  }

  try {
    const client = await clientPromise
    const db = client.db("webstore")
    const product = await db.collection("products").findOne({ _id: new ObjectId(id) })

    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ message: 'Error fetching product' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const id = request.nextUrl.pathname.split('/').pop()
  if (!id) {
    return NextResponse.json({ message: 'Product ID is required' }, { status: 400 })
  }

  try {
    const client = await clientPromise
    const db = client.db("webstore")
    const body = await request.json()

    const { name, description, price, salePrice, mainImage, categories, sizes, galleryImages, inventoryStatus, stockQuantity } = body

    const result = await db.collection("products").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
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
          updatedAt: new Date(),
        },
      }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Product updated successfully' })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ message: 'Error updating product' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.pathname.split('/').pop()
  if (!id) {
    return NextResponse.json({ message: 'Product ID is required' }, { status: 400 })
  }

  try {
    const client = await clientPromise
    const db = client.db("webstore")
    const result = await db.collection("products").deleteOne({ _id: new ObjectId(id) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Product deleted successfully' })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ message: 'Error deleting product' }, { status: 500 })
  }
}