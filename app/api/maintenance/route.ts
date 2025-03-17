// app/api/maintenance/route.ts
import { NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI
const client = new MongoClient(uri as string)

export async function POST(req: Request) {
  try {
    const data = await req.json()
    const email = data.email

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 }
      )
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: "Invalid email format" },
        { status: 400 }
      )
    }

    await client.connect()
    const database = client.db('webstore')
    const collection = database.collection('maintenance_emails')

    const result = await collection.insertOne({
      email,
      createdAt: new Date()
    })

    return NextResponse.json({ success: true, id: result.insertedId })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to save email' },
      { status: 500 }
    )
  } finally {
    await client.close()
  }
}