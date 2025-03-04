// app/admin/reviews/page.tsx
import { MongoClient } from 'mongodb'

async function getReviews() {
  const uri = process.env.MONGODB_URI
  const client = new MongoClient(uri as string)
  try {
    await client.connect()
    const database = client.db('webstore')
    const collection = database.collection('reviews')
    // Fetch reviews sorted by creation date (newest first)
    const reviews = await collection.find({}).sort({ createdAt: -1 }).toArray()
    return reviews
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return []
  } finally {
    await client.close()
  }
}

export default async function ReviewsAdminPage() {
  const reviews = await getReviews()

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Admin - Reviews</h1>
      {reviews.length === 0 ? (
        <p>No reviews found.</p>
      ) : (
        <table className="min-w-full bg-white border">
          <thead>
            <tr>
              <th className="px-4 py-2 border">Reviewer Name</th>
              <th className="px-4 py-2 border">E-mail</th>
              <th className="px-4 py-2 border">Review Text</th>
              <th className="px-4 py-2 border">Images</th>
              <th className="px-4 py-2 border">Submitted At</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((review) => (
              <tr key={review._id.toString()} className="border-t">
                <td className="px-4 py-2 border">{review.name}</td>
                <td className="px-4 py-2 border">{review.email}</td>
                <td className="px-4 py-2 border">{review.message}</td>
                <td className="px-4 py-2 border">
                  {review.images && review.images.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {review.images.map((img: string, index: number) => (
                        <img
                          key={index}
                          src={img}
                          alt={`Review image ${index + 1}`}
                          className="w-16 h-16 object-cover rounded"
                        />
                      ))}
                    </div>
                  ) : (
                    'No images'
                  )}
                </td>
                <td className="px-4 py-2 border">
                  {new Date(review.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
