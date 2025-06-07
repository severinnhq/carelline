// app/api/update-order-status/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { MongoClient, ObjectId } from 'mongodb'

const mongoUri = process.env.MONGODB_URI!

export async function POST(req: NextRequest) {
  const headers = new Headers({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  })
  if (req.method === 'OPTIONS') return new NextResponse(null, { headers })

  const { orderId, status } = await req.json()
  if (!orderId || typeof status !== 'string') {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400, headers })
  }

  const client = new MongoClient(mongoUri)
  try {
    await client.connect()
    const db = client.db('webstore')
    const orders = db.collection('orders')
    const result = await orders.updateOne(
      { _id: new ObjectId(orderId) },
      { $set: { status } }
    )
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404, headers })
    }
    return NextResponse.json({ success: true }, { headers })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500, headers })
  } finally {
    await client.close()
  }
}
