// app/api/notify/route.ts
import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function POST(request: Request) {
  // 1) Parse incoming JSON
  const { email, productId, productName } = await request.json()

  try {
    // 2) Get the shared MongoClient and select your database/collection
    const client = await clientPromise
    const db = client.db('webstore')
    const notifyCollection = db.collection('notify')

    // 3) Duplication check
    const existing = await notifyCollection.findOne({ email, productId })
    if (existing) {
      return NextResponse.json(
        { message: 'Már feliratkozott. Értesítve lesz.' },
        { status: 400 }
      )
    }

    // 4) Insert the new subscription
    const result = await notifyCollection.insertOne({
      email,
      productId,
      productName,
      createdAt: new Date(),
    })

    // 5) Return success
    return NextResponse.json(
      { message: 'Email saved successfully', id: result.insertedId },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error saving email:', error)
    return NextResponse.json(
      { message: 'Error saving email' },
      { status: 500 }
    )
  }
}
