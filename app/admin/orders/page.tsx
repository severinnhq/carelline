export const dynamic = 'force-dynamic'
import AdminOrdersClient from './AdminOrdersClient';
export const metadata = {
  title: 'Admin: Order Management',
};

import { MongoClient } from 'mongodb';

const mongoUri = process.env.MONGODB_URI!;

async function getOrders() {
  const client = new MongoClient(mongoUri);
  try {
    await client.connect();
    const db = client.db('webstore');
    const ordersCollection = db.collection('orders');
    const orders = await ordersCollection.find().sort({ createdAt: -1 }).toArray();
    return JSON.parse(JSON.stringify(orders)); // make serializable
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    return [];
  } finally {
    await client.close();
  }
}

export default async function AdminOrdersPage() {
  const orders = await getOrders();

  return (
    <main className='bg-black'>
      <AdminOrdersClient initialOrders={orders} />
    </main>
  );
}
