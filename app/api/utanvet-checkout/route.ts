import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface OrderItem {
  n: string;
  s: string;
  q: number;
  p: number;
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
  subtotal: number;
  shippingCost: number;
  total: number;
  notes?: string;
  createdAt: Date;
}

const mongoUri = process.env.MONGODB_URI!;
let cachedClient: MongoClient | null = null;

async function connectToDatabase() {
  if (cachedClient) return cachedClient;
  const client = new MongoClient(mongoUri);
  await client.connect();
  cachedClient = client;
  return client;
}

function generateOrderNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `UTN-${year}${month}${day}-${random}`;
}

async function sendConfirmationEmail(email: string, order: Order) {
  console.log('[Email] Attempting to send confirmation email to:', email);
  
  if (!process.env.RESEND_API_KEY) {
    console.error('[Email] Missing Resend API key');
    return false;
  }

  try {
    const formattedDate = new Date(order.createdAt).toLocaleDateString('hu-HU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const formatCurrency = (amount: number) => 
      amount.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

    const emailPayload = {
      from: 'support@carelline.com',
      to: email,
      subject: `Köszönjük a rendelését! - #${order.orderNumber}`,
      html: `<!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; border-bottom: 2px solid #eee; padding-bottom: 20px; }
            .section { margin: 25px 0; }
            .product-item { margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #eee; }
            .totals-table { width: 100%; margin-top: 20px; }
            .totals-table td { padding: 8px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 0.9em; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Köszönjük a rendelését! 🎉</h1>
            <p>Rendelési szám: <strong>${order.orderNumber}</strong></p>
            <p>Dátum: ${formattedDate}</p>
          </div>

          <div class="section">
            <h2>Termékek</h2>
            ${order.items.map(item => 
              `<div class="product-item">
                <strong>${item.n}</strong><br>
                Méret: ${item.s} | Mennyiség: ${item.q}<br>
                Ár: ${formatCurrency(item.p * item.q)} Ft
              </div>`
            ).join('')}
          </div>

          <div class="section">
            <h2>Szállítási adatok</h2>
            <p>
              ${order.shippingDetails.name}<br>
              ${order.shippingDetails.address.line1}<br>
              ${order.shippingDetails.address.city}, ${order.shippingDetails.address.postal_code}
            </p>
          </div>

          <table class="totals-table">
            <tr>
              <td>Részösszeg:</td>
              <td align="right">${formatCurrency(order.subtotal)} Ft</td>
            </tr>
            <tr>
              <td>Szállítás:</td>
              <td align="right">${formatCurrency(order.shippingCost)} Ft</td>
            </tr>
            <tr>
              <td>Utánvét díja:</td>
              <td align="right">${formatCurrency(order.cashOnDeliveryFee)} Ft</td>
            </tr>
            <tr style="font-weight: bold;">
              <td>Összesen:</td>
              <td align="right">${formatCurrency(order.total)} Ft</td>
            </tr>
          </table>

          ${order.notes ? 
            `<div class="section">
              <h2>Megjegyzés</h2>
              <p>${order.notes}</p>
            </div>` : ''}

          <div class="footer">
            <p>🛍️ Köszönjük, hogy nálunk vásárolt!</p>
            <p>Ha kérdése van, írjon a support@carelline.com címre.</p>
              <p style="font-size: 12px; color: #555;">Ez az e-mail mobil eszközökre optimalizált, nem asztali gépre.</p>
          </div>
        </body>
        </html>`
    };

    const { data, error } = await resend.emails.send(emailPayload);

    if (error) {
      console.error('[Email] Resend API Error:', error);
      return false;
    }

    console.log('[Email] Email sent successfully. Resend response:', data);
    return true;
  } catch (error) {
    console.error('[Email] Unexpected error:', error);
    return false;
  }
}

async function saveOrder(data: RequestBody): Promise<Order> {
  const client = await connectToDatabase();
  const db = client.db('webstore');
  const ordersCollection = db.collection<Order>('orders');

  const subtotal = data.items.reduce((sum, item) => sum + (item.p * item.q), 0);
  let shippingCost = 0;
  
  if (data.shippingType.includes('Standard')) {
    const freeShippingThreshold = 30000;
    shippingCost = subtotal >= freeShippingThreshold ? 0 : 1990;
  } else {
    shippingCost = 3990;
  }
  
  const total = subtotal + shippingCost + data.cashOnDeliveryFee;

  if (total !== data.amount) {
    throw new Error('A kalkulált összeg nem egyezik a megadott összeggel.');
  }

  const orderNumber = generateOrderNumber();
  
  const order: Omit<Order, '_id'> = {
    orderNumber,
    customerId: null,
    amount: data.amount,
    currency: data.currency,
    status: 'pending',
    paymentMethod: 'cash_on_delivery',
    items: data.items,
    shippingDetails: data.shippingDetails,
    billingDetails: data.billingDetails,
    shippingType: data.shippingType,
    cashOnDeliveryFee: data.cashOnDeliveryFee,
    subtotal,
    shippingCost,
    total,
    notes: data.notes,
    createdAt: new Date()
  };

  const result = await ordersCollection.insertOne(order);
  return { ...order, _id: result.insertedId };
}

export async function POST(req: NextRequest) {
  try {
    console.log('[Order] Starting order processing');
    const body: RequestBody = await req.json();
    
    console.log('[Order] Received order data:', {
      ...body,
      items: body.items.slice(0, 2)
    });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      throw new Error('Invalid email format');
    }

    const order = await saveOrder(body);
    console.log('[Order] Order saved with ID:', order._id);

    const emailSent = await sendConfirmationEmail(body.email, order);
    
    return NextResponse.json({ 
      success: true, 
      orderId: order._id?.toString(),
      orderNumber: order.orderNumber,
      emailSent
    });
  } catch (err) {
    console.error('[Order] Processing error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' }, 
      { status: 500 }
    );
  }
}