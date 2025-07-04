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
  items?: Array<{ n: string; s: string; q: number; p: number }>;
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
    phone: string;
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
    email: string;
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
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

function verifyResponse(challenge: string, response: string): boolean {
  const expectedResponse = simpleHash(challenge + 'carelline_secret');
  return response === expectedResponse;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const challenge = searchParams.get('challenge');
  const response = searchParams.get('response');
  const acceptHeader = request.headers.get('accept');

  // If the request is from a browser (HTML), serve the HTML page
  if (acceptHeader && acceptHeader.includes('text/html')) {
    return new NextResponse(
      `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>404 - Page Not Found</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          .bg-404::before {
            content: '404';
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 20vw;
            font-weight: bold;
            opacity: 0.1;
            z-index: -1;
          }
        </style>
      </head>
      <body class="bg-white flex items-center justify-center min-h-screen bg-404">
        <a href="/" class="text-2xl bg-black hover:bg-gray-800 text-white font-bold py-3 px-6 rounded transition duration-300 ease-in-out z-10">
          Continue Shopping
        </a>
      </body>
      </html>
      `,
      {
        headers: { 'Content-Type': 'text/html' },
        status: 404,
      }
    );
  }

  // Handle the challenge-response for API requests
  if (!challenge && !response) {
    const newChallenge = generateChallenge();
    return NextResponse.json({ challenge: newChallenge }, { status: 200 });
  }

  if (!challenge || !response || !verifyResponse(challenge, response)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
      const fetchedOrders = await ordersCollection
        .find()
        .sort({ createdAt: -1 })
        .toArray();

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
          (!order.paymentMethod || typeof order.paymentMethod === 'string') &&
          (!order.notes || typeof order.notes === 'string') &&
          // ensure nested fields exist
          !!order.shippingDetails &&
          typeof order.shippingDetails.phone === 'string' &&
          !!order.billingDetails &&
          typeof order.billingDetails.email === 'string'
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
