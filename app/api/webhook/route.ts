import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { MongoClient, ObjectId } from 'mongodb';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY!);
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

interface OrderItem {
  n: string;
  s: string;
  q: number;
  p: number;
  image: string;
}

interface Order {
  _id?: ObjectId;
  sessionId: string;
  customerId: string | Stripe.Customer | Stripe.DeletedCustomer | null;
  amount: number;
  currency: string;
  status: Stripe.Checkout.Session.PaymentStatus;
  items: OrderItem[];
  shippingDetails: Stripe.Checkout.Session.ShippingDetails | null;
  billingDetails: Stripe.Charge.BillingDetails | null;
  shippingType: string;
  subtotal: number;
  shippingCost: number;
  total: number;
  createdAt: Date;
  email: string;
  phoneNumber: string | null;
  paymentMethod?: string;
  notes?: string;
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

async function sendOrderConfirmation(email: string, order: Order) {
  console.log('[Email] Attempting to send confirmation to:', email);
  
  if (!process.env.RESEND_API_KEY) {
    console.error('[Email] Missing Resend API key');
    return false;
  }

  try {
    // For prices already in HUF (like product prices)
    const formatPrice = (amount: number) =>
      amount.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

    // For amounts stored in fillér (Stripe totals), divide by 100.
    const formatTotal = (amount: number) =>
      (amount / 100).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

    // Prepare shipping details if available
    const shipping = order.shippingDetails;
    const shippingHtml = shipping && shipping.address ? `
      <div class="section shipping-details">
        <h2>Szállítási adatok</h2>
        <p><strong>Név:</strong> ${shipping.name || 'Nincs adat'}</p>
        <p><strong>Cím:</strong> 
          ${shipping.address.line1 || ''} 
          ${shipping.address.line2 ? ', ' + shipping.address.line2 : ''}<br>
          ${shipping.address.postal_code || ''} ${shipping.address.city || ''}<br>
          ${shipping.address.state ? shipping.address.state + ', ' : ''}${shipping.address.country || ''}
        </p>
        ${shipping.phone ? `<p><strong>Telefonszám:</strong> ${shipping.phone}</p>` : ''}
      </div>
    ` : '';

    const emailHtml = `<!DOCTYPE html>
      <html>
      <head>
        <style>
          /* Add or adjust your email CSS styles here */
          body { font-family: Arial, sans-serif; }
          .header { background: #f5f5f5; padding: 20px; text-align: center; }
          .section { padding: 20px; }
          .product-item { margin-bottom: 10px; }
          .totals-table { width: 100%; max-width: 400px; margin: 0 auto; }
          .totals-table td { padding: 5px; }
          .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Köszönjük a rendelését! 🎉</h1>
          <p>Rendelési szám: <strong>${order.sessionId}</strong></p>
          <p>Dátum: ${new Date(order.createdAt).toLocaleDateString('hu-HU')}</p>
        </div>

        <div class="section products">
          <h2>Termékek</h2>
       ${order.items.map(item => 
  `<div class="product-item">
    <img src="https://carelline.com/uploads/${item.image}" 
         alt="${item.n}" 
         style="width:80px;height:auto;margin-bottom:10px;border-radius:8px;" />
    <strong>${item.n}</strong><br>
    Méret: ${item.s} | Mennyiség: ${item.q}<br>
    Ár: ${formatPrice(item.p * item.q)} Ft
  </div>`
).join('')}


        </div>

        ${shippingHtml}

        <div class="section totals">
          <table class="totals-table">
            <tr>
              <td>Részösszeg:</td>
              <td align="right">${formatTotal(order.subtotal)} Ft</td>
            </tr>
            <tr>
              <td>Szállítás:</td>
              <td align="right">${formatTotal(order.shippingCost)} Ft</td>
            </tr>
            <tr style="font-weight: bold;">
              <td>Összesen:</td>
              <td align="right">${formatTotal(order.total)} Ft</td>
            </tr>
          </table>
        </div>
        
        <div class="footer">
          <p>🛍️ Köszönjük, hogy nálunk vásárolt!</p>
          <p>Ha kérdése van, írjon a support@carelline.com címre.</p>
            <p style="font-size: 12px; color: #555;">Ez az e-mail mobil eszközökre optimalizált, nem asztali gépre.</p>
        </div>
      </body>
      </html>`;

    const { data, error } = await resend.emails.send({
      from: 'support@carelline.com',
      to: email,
      subject: `Köszönjük a rendelését! - #${order.sessionId}`,
      html: emailHtml
    });

    if (error) {
      console.error('[Email] Resend error:', error);
      return false;
    }

    console.log('[Email] Confirmation sent:', data?.id);
    return true;
  } catch (error) {
    console.error('[Email] Unexpected error:', error);
    return false;
  }
}


async function saveStripeOrder(session: Stripe.Checkout.Session): Promise<Order> {
  console.log('[Database] Saving order:', session.id);
  
  const client = await connectToDatabase();
  const db = client.db('webstore');
  const ordersCollection = db.collection<Order>('orders');

  // Calculate order amounts
  const subtotal = session.amount_subtotal ? session.amount_subtotal : 0;
  const shippingCost = session.shipping_cost?.amount_total || 0;
  const total = session.amount_total || 0;

  const order: Omit<Order, '_id'> = {
    sessionId: session.id,
    customerId: session.customer,
    amount: total,
    currency: session.currency?.toUpperCase() || 'HUF',
    status: session.payment_status,
    items: JSON.parse(session.metadata?.cartItemsSummary || '[]'),
    shippingDetails: session.shipping_details,
    billingDetails: session.customer_details,
    shippingType: session.shipping_cost?.shipping_rate?.toString() || 'unknown',
    subtotal,
    shippingCost,
    total,
    email: session.customer_details?.email || '',
    phoneNumber: session.customer_details?.phone || null,
    paymentMethod: 'card',
    notes: session.metadata?.notes,
    createdAt: new Date()
  };

  try {
    const result = await ordersCollection.insertOne(order);
    console.log('[Database] Order saved with ID:', result.insertedId);
    return { ...order, _id: result.insertedId };
  } catch (err) {
    console.error('[Database] Save error:', err);
    throw err;
  }
}

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature')!;
  const rawBody = await req.text();

  try {
    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    console.log('[Webhook] Received event:', event.type);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log('[Webhook] Processing completed session:', session.id);

      // Validate critical data
      if (!session.customer_details?.email) {
        throw new Error('Missing customer email in session');
      }

      // Save order to database
      const order = await saveStripeOrder(session);

      // Send confirmation email
      const emailSent = await sendOrderConfirmation(
        session.customer_details.email,
        order
      );

      if (!emailSent) {
        console.warn('[Webhook] Email failed to send for order:', session.id);
      }

      console.log('[Webhook] Successfully processed order:', session.id);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('[Webhook] Error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 400 }
    );
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};