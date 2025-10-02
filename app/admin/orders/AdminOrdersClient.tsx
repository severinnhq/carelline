'use client';

import { useState } from 'react';
import { parseISO, format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import AuthWrapper from '@/components/AuthWrapper';
import { OrderStatusDropdown } from '@/components/OrderStatusDropdown';
import type { Status } from '@/components/OrderStatusDropdown';

type StatusFilter = 'all' | Status;

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
  characterName?: string;
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
  phone: string;
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
  orderNumber: string;
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
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const filteredOrders = initialOrders.filter(order => {
    if ((order.status as string) === 'paid') return false;

    const textMatch =
      (order.orderNumber || '').toLowerCase().includes(filter.toLowerCase()) ||
      (order.shippingDetails?.name || '').toLowerCase().includes(filter.toLowerCase()) ||
      (order.billingDetails?.email || '').toLowerCase().includes(filter.toLowerCase());

    const statusMatch = statusFilter === 'all' || order.status === statusFilter;

    return textMatch && statusMatch;
  });

  function formatCreatedDate(dateString?: string): string {
    if (!dateString) return 'Date not available';
    try {
      const date = parseISO(dateString);
      return format(date, "yyyy-MM-dd HH:mm:ss 'GMT+1'");
    } catch {
      return 'Invalid date';
    }
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

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value as StatusFilter);
  };

  const statusBgClass: Record<Status, string> = {
    success: 'bg-green-300',
    pending: 'bg-yellow-300',
    sent: 'bg-blue-300',
    'sent back': 'bg-red-400',
    canceled: 'bg-pink-300',
    ordered: 'bg-gray-300',
  };

  return (
    <AuthWrapper>
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-6 text-white">Admin: Order Management</h1>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mx-6 mb-6 justify-between">
          <input
            type="text"
            placeholder="Filter by ID, name, or email"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border-2 border-white bg-black text-white px-3 py-2 rounded-md flex-grow max-w-sm"
          />
          <select
            value={statusFilter}
            onChange={handleStatusChange}
            className="border-2 border-white bg-black text-white px-3 py-2 rounded-md shadow-md cursor-pointer"
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
        <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6 m-6">
          {filteredOrders.length === 0 ? (
            <p>No orders match your filter.</p>
          ) : (
            filteredOrders.map((order) => (
              <Card key={order._id} className={`relative ${statusBgClass[order.status] ?? 'bg-white'} border-0 h-min rounded-xl`}>
                <div className="absolute top-4 right-4">
                  <OrderStatusDropdown orderId={order._id} initialStatus={order.status ?? 'pending'} />
                </div>

                <CardHeader>
                  <CardTitle>
                    ID:{' '}
                    <span
                      className="font-thin italic cursor-pointer active:font-medium"
                      onClick={() => navigator.clipboard.writeText(order.orderNumber!)}
                    >
                      {order.orderNumber || 'N/A'}
                    </span>
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <p className="text-sm"><strong>Created:</strong> {formatCreatedDate(order.createdAt)}</p>
                  <p className="text-sm">
                    <strong>Payment:</strong> {order.paymentMethod === 'cash_on_delivery' ? 'Utánvét' : 'Card'}
                  </p>

                  <Separator className="my-2" />

                  {/* Items Table */}
                  {order.items?.length ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className='text-black font-semibold'>Name</TableHead>
                          <TableHead className='text-black font-semibold'>Qty</TableHead>
                          <TableHead className='text-black font-semibold'>Price</TableHead>
                        </TableRow>
                      </TableHeader>

                      <TableBody>
                        {order.items.map((item, idx) => (
                          <TableRow key={idx}>
                            <TableCell className='bg-black text-white'>
                              <strong>{item.n}</strong>
                              {item.characterName && (
                                <p className='text-sm text-gray-400'>Karakter: {item.characterName}</p>
                              )}
                            </TableCell>
                            <TableCell className='bg-black text-white'><strong>{item.q}</strong></TableCell>
                            <TableCell className='bg-black text-white'><strong>{item.p.toFixed(0)} {order.currency?.toUpperCase()}</strong></TableCell>
                          </TableRow>
                        ))}

                        {/* Shipping / Fees */}
                        {order.shippingType && (
                          <TableRow>
                            <TableCell><span className='text-xs italic'>{order.shippingType}</span></TableCell>
                            <TableCell><span className='text-xs italic'>-</span></TableCell>
                            <TableCell className='text-xs italic'>
                              {order.shippingType === 'Standard Shipping' ? '1990 HUF' :
                               order.shippingType === 'Free Standard Shipping' ? '0 HUF' :
                               order.shippingType === 'Express Shipping' ? '3 990 HUF' : ''}
                            </TableCell>
                          </TableRow>
                        )}

                        {order.paymentMethod === 'cash_on_delivery' && (
                          <TableRow>
                            <TableCell><span className='text-xs italic'>Cash on Delivery</span></TableCell>
                            <TableCell><span className='text-xs italic'>-</span></TableCell>
                            <TableCell><span className='text-xs italic'>590 HUF</span></TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  ) : (
                    <p>No items</p>
                  )}

                  <Separator className="my-2" />

                  {/* Order Totals */}
                  <p className='text-lg font-bold flex justify-between mb-4'>
                    <u>Utánvét:</u>
                    <i
                      className='cursor-pointer active:font-medium'
                      onClick={() => navigator.clipboard.writeText(order.amount.toFixed(0))}
                    >
                      {order.amount.toFixed(0)} {order.currency?.toUpperCase()}
                    </i>
                  </p>

                  {/* Customer Info */}
                  <div className='flex justify-between'><strong>Név:</strong> <i className='font-medium text-md cursor-pointer active:font-bold' onClick={() => navigator.clipboard.writeText(order.shippingDetails!.name)}>{order.shippingDetails?.name || 'N/A'}</i></div>
                  <div className='flex justify-between'><strong>Email:</strong> <i className='cursor-pointer active:font-semibold' onClick={() => navigator.clipboard.writeText(order.billingDetails!.email)}>{order.billingDetails?.email || 'N/A'}</i></div>
                  <div className='flex justify-between'><strong>Phone:</strong> <i className='cursor-pointer active:font-semibold' onClick={() => navigator.clipboard.writeText(order.shippingDetails!.phone)}>{order.shippingDetails?.phone || 'N/A'}</i></div>

                  <Separator className="my-2" />

                  {/* Shipping / Billing */}
                  {order.shippingDetails && (
                    <div className="grid grid-cols-2">
                      <div>
                        <h4 className="font-semibold mb-1">Shipping Address</h4>
                        <p className='cursor-pointer active:font-semibold'>{order.shippingDetails.address.postal_code}</p>
                        <p className='cursor-pointer active:font-semibold'>{order.shippingDetails.address.city}</p>
                        <p className='cursor-pointer active:font-semibold'>{order.shippingDetails.address.line1}</p>
                      </div>

                      {order.billingDetails && !areAddressesSame(order.shippingDetails, order.billingDetails) && (
                        <div>
                          <h4 className="font-semibold mb-1">Billing Address</h4>
                          <p className='cursor-pointer active:font-semibold'>{order.billingDetails.address.postal_code} | {order.billingDetails.address.city}</p>
                          <p className='cursor-pointer active:font-semibold'>{order.billingDetails.address.line1}</p>
                          <p className='cursor-pointer active:font-semibold'>{order.billingDetails.name}</p>
                          <p className='cursor-pointer active:font-semibold'>{order.billingDetails.phone}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Notes */}
                  {order.notes && (
                    <div className="bg-gray-100 rounded-lg p-4 mt-4">
                      <h4 className="font-semibold text-sm">Notes:</h4>
                      <p className='cursor-pointer active:font-semibold'>{order.notes}</p>
                    </div>
                  )}

                  {/* Foxpost Button */}
                  {order.status === 'pending' && (
                    <button
                      onClick={() => window.open(`https://foxpost.hu/csomag-feladas?recipientName=${order.shippingDetails!.name}&recipientEmail=${order.billingDetails!.email}&recipientPhone=${order.shippingDetails!.phone}&destination=HD|recipient_zipcode%3D${order.shippingDetails!.address.postal_code}|recipient_city%3D${order.shippingDetails!.address.city}|recipient_address%3D${order.shippingDetails!.address.line1}`, "_blank")}
                      className='bg-red-700 p-3 text-center mt-6 font-bold text-lg text-white w-full rounded-full shadow-black shadow-md active:shadow-inner hover:bg-red-600'
                    >
                      Go to Foxpost
                    </button>
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
