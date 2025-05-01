import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';
import { Expo } from 'expo-server-sdk';

const mongoUri = process.env.MONGODB_URI!;
const expo = new Expo();

interface Order {
  _id: ObjectId;
  sessionId: string;
  amount: number;
  currency: string;
  status: string;
  items?: Array<{
    n: string;
    s: string;
    q: number;
    p: number;
  }>;
  shippingDetails?: {
    name: string;
    address: {
      line1: string;
      line2: string | null;
      city: string;
      state: string;
      postal_code: string;
      country: string;
    };
  };
  billingDetails?: {
    name: string;
    address: {
      line1: string;
      line2: string | null;
      city: string;
      state: string;
      postal_code: string;
      country: string;
    };
  };
  createdAt: Date;
  shippingType?: string;
  stripeDetails?: {
    paymentId: string;
    customerId: string | null;
    paymentMethodId: string | null;
    paymentMethodFingerprint: string | null;
    riskScore: number | null;
    riskLevel: string | null;
  };
  fulfilled?: boolean;
  phoneNumber?: string; // Added phone number field
  paymentMethod?: string;
  notes?: string;
}

function generateChallenge(): string {
  return Math.random().toString(36).substring(2, 15);
}

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16);
}

function verifyResponse(challenge: string, response: string): boolean {
  const expectedResponse = simpleHash(challenge + 'rewealed_secret');
  return response === expectedResponse;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const challenge = searchParams.get('challenge');
  const response = searchParams.get('response');
  const acceptHeader = request.headers.get('accept');

  console.log('Request params:', { challenge, response });

  if (!challenge && !response) {
    // Initial request - generate challenge
    const newChallenge = generateChallenge();
    console.log('Generated challenge:', newChallenge);
    return NextResponse.json({ challenge: newChallenge });
  }

  if (!challenge || !response) {
    console.log('Missing challenge or response');
    return NextResponse.json({ error: 'Missing challenge or response' }, { status: 400 });
  }

  const isValid = verifyResponse(challenge, response);
  console.log('Verification result:', { isValid, challenge, response });

  if (!isValid) {
    return NextResponse.json({ error: 'Invalid response' }, { status: 401 });
  }

  const id = searchParams.get('id');

  const client = new MongoClient(mongoUri);

  try {
    await client.connect();
    const db = client.db('webstore');
    const ordersCollection = db.collection('orders');

    let orders: Order[];

    if (id) {
      const order = await ordersCollection.findOne({ _id: new ObjectId(id) });
      orders = order ? [order as Order] : [];
    } else {
      const fetchedOrders = await ordersCollection.find().sort({ createdAt: -1 }).toArray();
      
      orders = fetchedOrders.filter((order): order is Order => {
        return (
          typeof order.sessionId === 'string' &&
          typeof order.amount === 'number' &&
          typeof order.currency === 'string' &&
          typeof order.status === 'string' &&
          order.createdAt instanceof Date &&
          (!order.items || Array.isArray(order.items)) &&
          (!order.shippingDetails || typeof order.shippingDetails === 'object') &&
          (!order.billingDetails || typeof order.billingDetails === 'object') &&
          (!order.shippingType || typeof order.shippingType === 'string') &&
          (!order.stripeDetails || typeof order.stripeDetails === 'object') &&
          (typeof order.fulfilled === 'undefined' || typeof order.fulfilled === 'boolean') &&
          (!order.phoneNumber || typeof order.phoneNumber === 'string') &&
          (!order.paymentMethod || typeof order.paymentMethod === 'string') &&
          (!order.notes || typeof order.notes === 'string')
        );
      });
    }

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  } finally {
    await client.close();
  }
}

export async function POST(request: Request) {
  const client = new MongoClient(mongoUri);

  try {
    await client.connect();
    const db = client.db('webstore');
    const ordersCollection = db.collection('orders');
    const pushTokensCollection = db.collection('push_tokens');

    const newOrder = await request.json();
    const result = await ordersCollection.insertOne(newOrder);

    // Fetch all registered push tokens
    const pushTokens = await pushTokensCollection.find({}).toArray();

    // Prepare notification body
    let notificationBody = '';
    if (newOrder.items && newOrder.items.length > 0) {
      const firstItem = newOrder.items[0];
      notificationBody = `${firstItem.n} - €${firstItem.p.toFixed(2)}`;
      
      if (newOrder.items.length > 1) {
        notificationBody += ` + ${newOrder.items.length - 1} others`;
      }
    }

    // Send push notifications
    for (const { token } of pushTokens) {
      if (!Expo.isExpoPushToken(token)) {
        console.error(`Push token ${token} is not a valid Expo push token`);
        continue;
      }

      const message = {
        to: token,
        sound: 'default',
        title: 'CARELLINE',
        body: notificationBody,
        data: { 
          orderId: result.insertedId.toString(),
          phoneNumber: newOrder.phoneNumber || 'No phone number' // Include phone in notification data
        },
      };

      try {
        await expo.sendPushNotificationsAsync([message]);
      } catch (error) {
        console.error('Error sending push notification:', error);
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

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Failed to register push token:', error);
    return NextResponse.json({ error: 'Failed to register push token' }, { status: 500 });
  } finally {
    await client.close();
  }
}