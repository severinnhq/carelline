export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { Metadata } from 'next';
import { parseISO, format } from 'date-fns';
import { MongoClient, ObjectId } from 'mongodb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import AuthWrapper from '@/components/AuthWrapper';
import { OrderStatusDropdown } from '@/components/OrderStatusDropdown';
import type { Status } from '@/components/OrderStatusDropdown'

export const metadata: Metadata = {
  title: 'Admin: Order Management',
};

const mongoUri = process.env.MONGODB_URI!;

interface OrderItem {
  id: string;
  n: string;
  s: string;
  q: number;
  p: number;
}

interface Address {
  city: string;
  country: string;
  line1: string;
  line2: string | null;
  postal_code: string;
  state: string;
}

interface ShippingDetails {
  address: Address;
  name: string;
  phone: string;
}

interface BillingDetails {
  address: Address;
  name: string;
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
  currency?: string;
  status: Status 
  items?: OrderItem[];
  shippingDetails?: ShippingDetails;
  billingDetails?: BillingDetails;
  shippingType?: string;
  stripeDetails?: StripeDetails;
  createdAt?: Date | string;
  fulfilled?: boolean;
  paymentMethod?: string;
  notes?: string;
}

async function getOrders(): Promise<Order[]> {
  const client = new MongoClient(mongoUri);
  try {
    await client.connect();
    const db = client.db('webstore');
    const ordersCollection = db.collection('orders');

    const orders = await ordersCollection
      .find()
      .sort({ createdAt: -1 })
      .toArray();

    return orders as Order[];
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    return [];
  } finally {
    await client.close();
  }
}

function formatCreatedDate(dateString?: string | Date): string {
  if (!dateString) return 'Date not available';
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    const utcDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
    const gmt1Time = new Date(utcDate.getTime() + 60 * 60 * 1000);
    return format(gmt1Time, "yyyy-MM-dd HH:mm:ss 'GMT+1'");
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
}

function formatPhoneNumber(shippingDetails?: ShippingDetails): string {
  return shippingDetails?.phone ?? 'No phone number provided';
}

function formatEmail(billingDetails?: BillingDetails): string {
  return billingDetails?.email ?? 'No email provided';
}

function areAddressesSame(shipping?: ShippingDetails, billing?: BillingDetails): boolean {
  if (!shipping || !billing) return false;
  const s = shipping.address;
  const b = billing.address;
  return (
    s.line1 === b.line1 &&
    s.line2 === b.line2 &&
    s.city === b.city &&
    s.state === b.state &&
    s.postal_code === b.postal_code &&
    s.country === b.country
  );
}

function AddressDisplay({ address, name }: { address: Address; name: string }) {
  return (
    <>
      <p>{name}</p>
      <p>{address.line1}</p>
      {address.line2 && <p>{address.line2}</p>}
      <p>
        {address.city},{' '}
        {address.state || <span className="text-gray-500 italic">Megye not set</span>}{' '}
        {address.postal_code}
      </p>
      <p>{address.country}</p>
    </>
  );
}

export default async function AdminOrders() {
  const orders = await getOrders();
  if (orders.length === 0) {
    return (
      <AuthWrapper>
        <div className="container mx-auto py-10">
          <h1 className="text-3xl font-bold mb-6">Admin: Order Management</h1>
          <p>No orders found or there was an error fetching orders.</p>
        </div>
      </AuthWrapper>
    );
  }

  return (
    <AuthWrapper>
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-6">Admin: Order Management</h1>
        <div className="space-y-6">
          {orders.map((order) => (
            <Card key={order._id.toString()} className="relative">
              {/* status dropdown top -right */}
              <div className="absolute top-4 right-4">
              <OrderStatusDropdown
  orderId={order._id.toString()}
  initialStatus={order.status ?? 'pending'}
/>
              </div>

              <CardHeader>
                <CardTitle>Order ID: {order.sessionId}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="flex justify-between items-center">
                    <div className="flex-grow">
                      <h3 className="font-semibold mb-2">Order Details</h3>
                      <p>Amount: {order.amount.toFixed(2)} {order.currency?.toUpperCase()}</p>
                      <p>Created: {formatCreatedDate(order.createdAt)}</p>
                      <p>Shipping: {order.shippingType}</p>
                      <p>Payment: {order.paymentMethod === 'cash_on_delivery' ? 'COD' : 'Card'}</p>
                      <p>Megye: {order.shippingDetails?.address.state || 'Not set'}</p>
                      <p>Phone: <span className="font-medium">{formatPhoneNumber(order.shippingDetails)}</span></p>
                      <p>Email: <span className="font-medium">{formatEmail(order.billingDetails)}</span></p>
                      <p>Total Items: <span className="font-medium">{order.items?.reduce((sum, item) => sum + item.q, 0) || 0}</span></p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Items</h3>
                    {order.items?.length ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Size</TableHead>
                            <TableHead>Qty</TableHead>
                            <TableHead>Price</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {order.items.map((item, i) => (
                            <TableRow key={i}>
                              <TableCell>{item.n}</TableCell>
                              <TableCell>{item.s}</TableCell>
                              <TableCell>{item.q}</TableCell>
                              <TableCell>{item.p.toFixed(2)} {order.currency?.toUpperCase()}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : <p>No items</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {order.shippingDetails && (
                      <div>
                        <h3 className="font-semibold mb-2">Shipping Details</h3>
                        <AddressDisplay address={order.shippingDetails.address} name={order.shippingDetails.name} />
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold mb-2">Billing Details</h3>
                      {order.billingDetails ? (
                        areAddressesSame(order.shippingDetails, order.billingDetails) ? (
                          <p>Same as shipping</p>
                        ) : (
                          <AddressDisplay address={order.billingDetails.address} name={order.billingDetails.name} />
                        )
                      ) : <p>No billing</p>}

                      {order.notes && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-md">
                          <h4 className="font-medium text-sm mb-1">Notes</h4>
                          <p className="text-sm">{order.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {order.stripeDetails && (
                    <div>
                      <h3 className="font-semibold mb-2">Stripe Details</h3>
                      <p>Payment ID: {order.stripeDetails.paymentId}</p>
                      <p>Customer: {order.stripeDetails.customerId || 'Guest'}</p>
                      <p>Method ID: {order.stripeDetails.paymentMethodId || 'N/A'}</p>
                      <p>Fingerprint: {order.stripeDetails.paymentMethodFingerprint || 'N/A'}</p>
                      <p>Risk Score: {order.stripeDetails.riskScore ?? 'N/A'}</p>
                      <p>Risk Level: {order.stripeDetails.riskLevel || 'N/A'}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AuthWrapper>
  );
}