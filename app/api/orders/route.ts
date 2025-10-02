import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';
import { Expo } from 'expo-server-sdk';

const mongoUri = process.env.MONGODB_URI!;
const expo = new Expo();

interface OrderItem {
  n: string; // Name
  s: string; // SKU
  q: number; // Quantity
  p: number; // Price
  characterName?: string; // optional character name
}

interface Address {
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

interface ShippingDetails {
  name: string;
  address: Address;
  phone: string;
}

interface BillingDetails {
  name: string;
  address: Address;
  email: string;
}

interface StripeDetails {
  paymentId: string;
  customerId: string | null;
  paymentMethodId: string | null;
  paymentMethodFingerprint: string | null;
  riskScore: number | null;
  riskLevel: string | null;
}

interface Order {
  _id: ObjectId;
  sessionId: string;
  amount: number;
  currency: string;
  status: string;
  items?: OrderItem[];
  shippingDetails?: ShippingDetails;
  billingDetails?: BillingDetails;
  createdAt: Date;
  shippingType?: string;
  stripeDetails?: StripeDetails;
  fulfilled?: boolean;
  paymentMethod?: string;
  notes?: string;
}

// --- Utility functions ---
function generateChallenge(): string {
  return Math.random().toString(36).substring(2, 15);
}

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

function verifyResponse(challenge: string, response: string): boolean {
  const expectedResponse = simpleHash(challenge + 'carelline_secret');
  return response === expectedResponse;
}

// --- GET Orders ---
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const challenge = searchParams.get('challenge');
  const response = searchParams.get('response');
  const acceptHeader = request.headers.get('accept');

  // Serve HTML page if browser
  if (acceptHeader?.includes('text/html')) {
    return new NextResponse(`
      <!DOCTYPE html>
      <html lang="en">
      <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>404 - Page Not Found</title></head>
      <body style="display:flex;justify-content:center;align-items:center;height:100vh">
      <a href="/" style="padding:1rem 2rem;background:black;color:white;font-weight:bold;text-decoration:none;border-radius:0.5rem;">Continue Shopping</a>
      </body></html>
    `, { headers: { 'Content-Type': 'text/html' }, status: 404 });
  }

  // Challenge-response for API
  if (!challenge && !response) {
    return NextResponse.json({ challenge: generateChallenge() });
  }

  if (!challenge || !response || !verifyResponse(challenge, response)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const id = searchParams.get('id');
  const client = new MongoClient(mongoUri);

  try {
    await client.connect();
    const db = client.db('webstore');
    const ordersCollection = db.collection<Order>('orders');

    let orders: Order[];

    if (id) {
      const order = await ordersCollection.findOne({ _id: new ObjectId(id) });
      orders = order ? [order] : [];
    } else {
      orders = await ordersCollection.find().sort({ createdAt: -1 }).toArray();
    }

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  } finally {
    await client.close();
  }
}

// --- POST Order ---
export async function POST(request: Request) {
  const client = new MongoClient(mongoUri);

  try {
    await client.connect();
    const db = client.db('webstore');
    const ordersCollection = db.collection<Order>('orders');
    const pushTokensCollection = db.collection('push_tokens');

    const newOrder = await request.json();

    // Ensure createdAt exists
    newOrder.createdAt = new Date();

    // Save order
    const result = await ordersCollection.insertOne(newOrder);

    // Push notifications
    const pushTokens = await pushTokensCollection.find({}).toArray();
    let notificationBody = '';
    if (newOrder.items?.length) {
      const firstItem = newOrder.items[0];
      notificationBody = `${firstItem.n}${firstItem.characterName ? ` (${firstItem.characterName})` : ''} - €${firstItem.p.toFixed(2)}`;
      if (newOrder.items.length > 1) {
        notificationBody += ` + ${newOrder.items.length - 1} others`;
      }
    }

    for (const { token } of pushTokens) {
      if (!Expo.isExpoPushToken(token)) continue;
      const message = {
        to: token,
        sound: 'default',
        title: 'CARELLINE',
        body: notificationBody,
        data: {
          orderId: result.insertedId.toString(),
          phoneNumber: newOrder.shippingDetails?.phone ?? 'No phone number'
        },
      };
      try {
        await expo.sendPushNotificationsAsync([message]);
      } catch (err) {
        console.error('Error sending push notification:', err);
      }
    }

    return NextResponse.json({ success: true, orderId: result.insertedId }, { status: 201 });
  } catch (error) {
    console.error('Failed to create order:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  } finally {
    await client.close();
  }
}

// --- PUT: register push token ---
export async function PUT(request: Request) {
  const client = new MongoClient(mongoUri);

  try {
    await client.connect();
    const db = client.db('webstore');
    const pushTokensCollection = db.collection('push_tokens');

    const { token } = await request.json();
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 400 });
    }

    await pushTokensCollection.updateOne(
      { token },
      { $set: { token, updatedAt: new Date() } },
      { upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to register push token:', error);
    return NextResponse.json({ error: 'Failed to register push token' }, { status: 500 });
  } finally {
    await client.close();
  }
}
