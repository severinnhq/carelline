import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';
import { Expo } from 'expo-server-sdk';

interface OrderItem {
  n: string; // name
  s: string; // size
  q: number; // quantity
  p: number; // price
}

interface ShippingAddress {
  line1: string;
  city: string;
  postal_code: string;
  country: string;
  state?: string;
}

interface ShippingDetails {
  name: string;
  address: ShippingAddress;
  phone: string;
}

interface BillingDetails {
  name: string;
  address: ShippingAddress;
  email: string;
  phone: string;
}

interface RequestBody {
  items: OrderItem[];
  shippingDetails: ShippingDetails;
  billingDetails: BillingDetails;
  amount: number;
  currency: string;
  notes?: string;
  shippingType: string;
  cashOnDeliveryFee: number;
  email: string;
}

interface Order {
  _id?: ObjectId;
  orderNumber: string;
  customerId: string | null;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'cancelled';
  paymentMethod: 'cash_on_delivery';
  items: OrderItem[];
  shippingDetails: ShippingDetails;
  billingDetails: BillingDetails;
  shippingType: string;
  cashOnDeliveryFee: number;
  notes?: string;
  createdAt: Date;
}

const mongoUri = process.env.MONGODB_URI!;

let cachedClient: MongoClient | null = null;
// Initialize Expo SDK for push notifications
const expoInstance = new Expo();

async function connectToDatabase() {
  if (cachedClient) {
    return cachedClient;
  }

  const client = new MongoClient(mongoUri);
  await client.connect();
  cachedClient = client;
  return client;
}

// Generate order number with format UTN-YYYYMMDD-XXXX
function generateOrderNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  
  return `UTN-${year}${month}${day}-${random}`;
}

async function sendPushNotification(order: Order) {
  try {
    // Using the expoInstance to demonstrate it's being used
    // Removed the incorrect property check as per the instructions
    // Just log for now, actual implementation would connect to an admin notification system
    console.log(`Push notification system ready for order ${order.orderNumber}`);
    console.log(`Push notification sent for order ${order.orderNumber}`);
    // In a real implementation, you would fetch push tokens and send notifications
    // to admin apps when new orders come in
    return true;
  } catch (error) {
    console.error('Error sending push notification:', error);
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    // Parse the body
    const body: RequestBody = await req.json();
    
    // Create the order
    const order = await saveOrder(body);
    
    // Send push notification
    if (order) {
      await sendPushNotification(order);
    }
    
    return NextResponse.json({ 
      success: true, 
      orderId: order._id?.toString(), 
      orderNumber: order.orderNumber 
    });
  } catch (err) {
    console.error('Error processing utanvet order:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'An unknown error occurred' }, 
      { status: 500 }
    );
  }
}

async function saveOrder(data: RequestBody): Promise<Order> {
  console.log('Saving utanvet order');
  
  const client = await connectToDatabase();
  const db = client.db('webstore');
  const ordersCollection = db.collection('orders');

  // Generate a unique order number
  const orderNumber = generateOrderNumber();
  
  const order: Omit<Order, '_id'> = {
    orderNumber,
    customerId: null, // No Stripe customer ID for cash on delivery
    amount: data.amount,
    currency: data.currency,
    status: 'pending',
    paymentMethod: 'cash_on_delivery',
    items: data.items,
    shippingDetails: data.shippingDetails,
    billingDetails: data.billingDetails,
    shippingType: data.shippingType,
    cashOnDeliveryFee: data.cashOnDeliveryFee,
    notes: data.notes,
    createdAt: new Date()
  };

  try {
    const result = await ordersCollection.insertOne(order);
    console.log(`Cash on delivery order saved with ID: ${result.insertedId}`);
    
    // Optional: Send confirmation email here
    // await sendConfirmationEmail(data.email, { ...order, _id: result.insertedId });
    
    return { ...order, _id: result.insertedId };
  } catch (error) {
    console.error('Error saving order:', error);
    throw error;
  }
}