// app/api/reviews/route.ts
import { NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'
import { promises as fs } from 'fs'
import path from 'path'

const uri = process.env.MONGODB_URI
const client = new MongoClient(uri as string)

export async function POST(req: Request) {
  try {
    const formData = await req.formData()

    const name = formData.get("name")?.toString() || ""
    const email = formData.get("email")?.toString() || ""
    const message = formData.get("message")?.toString() || ""

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Ensure the upload directory exists
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'reviews')
    await fs.mkdir(uploadDir, { recursive: true })

    // Process the uploaded images and save them to disk.
    // We construct a public URL for each saved file.
    const images: string[] = []
    const files = formData.getAll("images")
    for (const file of files) {
      if (file instanceof File) {
        // Read the file data into a buffer
        const fileBuffer = Buffer.from(await file.arrayBuffer())
        // Create a unique file name (you might want to add more robust unique naming in production)
        const fileName = `${Date.now()}-${file.name}`
        const filePath = path.join(uploadDir, fileName)
        await fs.writeFile(filePath, fileBuffer)
        // Public URL (assuming your Next.js app serves files from /public)
        const publicUrl = `/uploads/reviews/${fileName}`
        images.push(publicUrl)
      }
    }

    await client.connect()
    const database = client.db('webstore')
    const collection = database.collection('reviews')

    const result = await collection.insertOne({
      name,
      email,
      message,
      images,
      createdAt: new Date()
    })

    return NextResponse.json({ success: true, id: result.insertedId })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to submit review' },
      { status: 500 }
    )
  } finally {
    await client.close()
  }
}
