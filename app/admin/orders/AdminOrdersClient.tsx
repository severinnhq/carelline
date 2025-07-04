'use client';

import { useState } from 'react';
import { parseISO, format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import AuthWrapper from '@/components/AuthWrapper';
import { OrderStatusDropdown } from '@/components/OrderStatusDropdown';
import type { Status } from '@/components/OrderStatusDropdown';

interface Address {
  city: string;
  country: string;
  line1: string;
  line2: string | null;
  postal_code: string;
  state: string;
}

interface OrderItem {
  n: string;
  s: string;
  q: number;
  p: number;
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
  _id: string;
  sessionId?: string;
  amount: number;
  currency?: string;
  status: Status;
  items?: OrderItem[];
  shippingDetails?: ShippingDetails;
  billingDetails?: BillingDetails;
  shippingType?: string;
  stripeDetails?: StripeDetails;
  createdAt?: string;
  fulfilled?: boolean;
  paymentMethod?: string;
  notes?: string;
}

export default function AdminOrdersClient({ initialOrders }: { initialOrders: Order[] }) {
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Status>('all');

  const filteredOrders = initialOrders.filter(order => {
    // text-based filtering
    const textMatch =
      (order.sessionId || '').toLowerCase().includes(filter.toLowerCase()) ||
      (order.shippingDetails?.name || '').toLowerCase().includes(filter.toLowerCase()) ||
      (order.billingDetails?.email || '').toLowerCase().includes(filter.toLowerCase());

    // status-based filtering
    const statusMatch = statusFilter === 'all' || order.status === statusFilter;

    return textMatch && statusMatch;
  });

  function formatCreatedDate(dateString?: string): string {
    if (!dateString) return 'Date not available';
    try {
      const date = parseISO(dateString);
      return format(date, "yyyy-MM-dd HH:mm:ss 'GMT+1'");
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  }

  function AddressDisplay({ address, name }: { address: Address; name: string }) {
    return (
      <>
        <p>{name}</p>
        <p>{address.line1}</p>
        {address.line2 && <p>{address.line2}</p>}
        <p>
          {address.city}, {address.state || 'N/A'} {address.postal_code}
        </p>
        <p>{address.country}</p>
      </>
    );
  }

  return (
    <AuthWrapper>
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-6">Admin: Order Management</h1>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <input
            type="text"
            placeholder="Filter by ID, name, or email"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border px-3 py-2 rounded-md flex-grow max-w-sm"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="border px-3 py-2 rounded-md"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="sent">Sent</option>
            <option value="sent back">Sent Back</option>
            <option value="success">Success</option>
            <option value="ordered">Ordered</option>
            <option value="canceled">Canceled</option>
          </select>
        </div>

        {/* Orders List */}
        <div className="space-y-6 space-x-6 grid grid-cols-2 m-6">
          {filteredOrders.length === 0 ? (
            <p>No orders match your filter.</p>
          ) : (
            filteredOrders.map((order) => (
              <Card key={order._id} className="relative">
                <div className="absolute top-4 right-4">
                  <OrderStatusDropdown
                    orderId={order._id}
                    initialStatus={order.status ?? 'pending'}
                  />
                </div>
                <CardHeader>
                  <CardTitle>Order ID: {order.sessionId || 'N/A'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    Amount: {order.amount.toFixed(2)} {order.currency?.toUpperCase()}
                  </p>
                  <p>Created: {formatCreatedDate(order.createdAt)}</p>
                  <p>Shipping: {order.shippingType || 'N/A'}</p>
                  <p>
                    Payment:{' '}
                    {order.paymentMethod === 'cash_on_delivery' ? 'COD' : 'Card'}
                  </p>
                  <p>Email: {order.billingDetails?.email || 'N/A'}</p>

                  <Separator className="my-2" />

                  {order.items?.length ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Qty</TableHead>
                          <TableHead>Price</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {order.items.map((item, idx) => (
                          <TableRow key={idx}>
                            <TableCell>{item.n}</TableCell>
                            <TableCell>{item.q}</TableCell>
                            <TableCell>
                              {item.p.toFixed(2)} {order.currency?.toUpperCase()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p>No items</p>
                  )}

                  <Separator className="my-2" />

                  {order.shippingDetails && (
                    <div>
                      <h4 className="font-semibold mb-1">Shipping Address</h4>
                      <AddressDisplay
                        address={order.shippingDetails.address}
                        name={order.shippingDetails.name}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AuthWrapper>
  );
}
