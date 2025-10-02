export async function POST(request: Request) {
  try {
    const client = await clientPromise
    const db = client.db("webstore")
    const { 
      name, 
      description, 
      price, 
      salePrice, 
      mainImage, 
      categories, 
      sizes, 
      galleryImages, 
      inventoryStatus, 
      stockQuantity,
      characters // 👈 add this
    } = await request.json()

    const product = {
      name,
      description,
      price,
      salePrice,
      mainImage,
      categories: Array.isArray(categories) ? categories : [categories].filter(Boolean),
      sizes,
      galleryImages,
      inventoryStatus: inventoryStatus ?? 'elfogyott',
      stockQuantity: stockQuantity ?? 0,
      characters: Array.isArray(characters) ? characters : [], // 👈 add this
      createdAt: new Date(),
    }

    const result = await db.collection("products").insertOne(product)

    return NextResponse.json({ message: 'Product added successfully', productId: result.insertedId })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ message: 'Error adding product' }, { status: 500 })
  }
}
