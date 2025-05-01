import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Alert, StatusBar } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import { format } from 'date-fns';

type OrderDetailRouteProp = RouteProp<RootStackParamList, 'OrderDetail'>;

interface OrderDetail {
  _id: string;
  sessionId: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  items: Array<{
    n: string;
    s: string;
    q: number;
    p: number;
  }>;
  shippingDetails: {
    name: string;
    email: string;
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
    email: string;
    address: {
      line1: string;
      line2: string | null;
      city: string;
      state: string;
      postal_code: string;
      country: string;
    };
  };
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
  shippingCost?: number;
}

interface OrderDetailScreenProps {
  route: OrderDetailRouteProp;
}

const getRiskColor = (riskScore: number | null): string => {
  if (riskScore === null) return '#666';
  if (riskScore <= 4) return '#4caf50'; // 0-4: Green
  if (riskScore <= 64) return '#d4af37'; // 5-64: Mustard yellow
  if (riskScore <= 74) return '#f57c00'; // 65-74: Darker orange
  return '#f44336'; // 75 or above: Red
};

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

export default function OrderDetailScreen({ route }: OrderDetailScreenProps) {
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { orderId } = route.params;

  useEffect(() => {
    fetchOrderDetail();
  }, []);

  const fetchOrderDetail = async () => {
    try {
      console.log('Fetching order detail for ID:', orderId);
  
      // Change this to Carelline's API
      const challengeResponse = await fetch('https://carelline.com/api/orders');
      const challengeData = await challengeResponse.json();
      const challenge = challengeData.challenge;
      const response = simpleHash(challenge + 'rewealed_secret'); // Ensure this matches Carelline's secret
  
      // Then use Carelline's API to fetch the order detail
      const orderResponse = await fetch(`https://carelline.com/api/orders?id=${orderId}&challenge=${challenge}&response=${response}`);
  
      if (!orderResponse.ok) {
        throw new Error(`HTTP error! status: ${orderResponse.status}`);
      }
  
      const data = await orderResponse.json();
      console.log('Fetched order data:', data);
  
      if (Array.isArray(data) && data.length > 0) {
        setOrder(data[0]);
      } else {
        throw new Error('Order not found in the response');
      }
    } catch (error) {
      console.error('Error fetching order detail:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      Alert.alert('Error', `Failed to fetch order details. ${error instanceof Error ? error.message : 'An unknown error occurred'}`);
    } finally {
      setLoading(false);
    }
  };
  

  const formatCreatedDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return format(date, "MMMM d, yyyy 'at' HH:mm:ss");
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  const calculateTotalItems = (items: OrderDetail['items']): number => {
    return items.reduce((total, item) => total + item.q, 0);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#999999" />
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Order not found</Text>
      </View>
    );
  }

  const subtotal = order.items.reduce((sum, item) => sum + item.p * item.q, 0);
  const isStandardShippingFree = subtotal >= 100;
  const shippingCost = order.shippingType?.toLowerCase().includes('express') ? 10 : (isStandardShippingFree ? 0 : 5);
  const total = subtotal + shippingCost;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.orderTime}>{formatCreatedDate(order.createdAt)}</Text>
        <View style={styles.header}>
          <Text style={styles.title}>Order Items</Text>
          <View style={styles.itemsCount}>
            <Text style={styles.itemsCountText}>{calculateTotalItems(order.items)} items</Text>
          </View>
        </View>
        {order.items.map((item, index) => (
          <View key={index} style={styles.item}>
            <View style={styles.itemDetails}>
              <Text style={styles.itemName}>{item.n} - {item.s}</Text>
              <Text style={styles.itemQuantity}>Quantity: {item.q}</Text>
            </View>
            <View style={styles.itemPriceContainer}>
              <Text style={styles.itemPrice}>
                €{(item.p * item.q).toFixed(2)} EUR
              </Text>
              {item.q > 1 && (
                <Text style={styles.itemUnitPrice}>
                  (€{item.p.toFixed(2)} each)
                </Text>
              )}
            </View>
          </View>
        ))}
        <View style={styles.subtotalSeparator} />
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabelSmall}>Subtotal:</Text>
          <Text style={styles.totalAmountSmall}>
            €{subtotal.toFixed(2)} EUR
          </Text>
        </View>
        <View style={styles.totalContainer}>
          <Text style={styles.shippingLabelSmall}>Shipping:</Text>
          <Text style={styles.shippingAmountSmall}>
            {shippingCost === 0 ? 'Free' : `€${shippingCost.toFixed(2)} EUR`}
          </Text>
        </View>
        <View style={[styles.totalContainer, styles.grandTotal]}>
          <Text style={styles.grandTotalLabel}>Total:</Text>
          <Text style={styles.grandTotalAmount}>
            €{total.toFixed(2)} EUR
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Shipping Details</Text>
        <Text style={styles.text}>{order.shippingDetails.name}</Text>
        <Text style={styles.text}>{order.shippingDetails.address.line1}</Text>
        {order.shippingDetails.address.line2 && <Text style={styles.text}>{order.shippingDetails.address.line2}</Text>}
        <Text style={styles.text}>{order.shippingDetails.address.city}, {order.shippingDetails.address.state} {order.shippingDetails.address.postal_code}</Text>
        <Text style={styles.text}>{order.shippingDetails.address.country}</Text>
      </View>

      {order.billingDetails && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Billing Details</Text>
          <Text style={styles.text}>{order.billingDetails.name}</Text>
          <Text style={styles.text}>{order.billingDetails.email}</Text>
          <Text style={styles.text}>{order.billingDetails.address.line1}</Text>
          {order.billingDetails.address.line2 && <Text style={styles.text}>{order.billingDetails.address.line2}</Text>}
          <Text style={styles.text}>{order.billingDetails.address.city}, {order.billingDetails.address.state} {order.billingDetails.address.postal_code}</Text>
          <Text style={styles.text}>{order.billingDetails.address.country}</Text>
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Order Information</Text>
        <View style={styles.infoGroup}>
          <Text style={styles.infoLabel}>Order ID:</Text>
          <Text style={styles.infoValue}>{order._id}</Text>
        </View>
        <View style={styles.infoGroup}>
          <Text style={styles.infoLabel}>Session ID:</Text>
          <Text style={styles.infoValue}>{order.sessionId}</Text>
        </View>
      </View>

      {order.stripeDetails && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Payment Details</Text>
          <View style={styles.infoGroup}>
            <Text style={styles.infoLabel}>Payment ID:</Text>
            <Text style={styles.infoValue}>{order.stripeDetails.paymentId}</Text>
          </View>
          <View style={styles.infoGroup}>
            <Text style={styles.infoLabel}>Customer ID:</Text>
            <Text style={styles.infoValue}>{order.stripeDetails.customerId || 'Guest User'}</Text>
          </View>
          <View style={styles.infoGroup}>
            <Text style={styles.infoLabel}>Payment Method ID:</Text>
            <Text style={styles.infoValue}>{order.stripeDetails.paymentMethodId || 'N/A'}</Text>
          </View>
          <View style={styles.infoGroup}>
            <Text style={styles.infoLabel}>Payment Method Fingerprint:</Text>
            <Text style={styles.infoValue}>{order.stripeDetails.paymentMethodFingerprint || 'N/A'}</Text>
          </View>
          <View style={styles.infoGroup}>
            <Text style={styles.infoLabel}>Risk Score:</Text>
            <View style={[styles.riskScoreCircle, { backgroundColor: getRiskColor(order.stripeDetails.riskScore) }]}>
              <Text style={styles.riskScoreText}>
                {order.stripeDetails.riskScore !== null ? order.stripeDetails.riskScore : 'N/A'}
              </Text>
            </View>
          </View>
          <View style={styles.infoGroup}>
            <Text style={styles.infoLabel}>Risk Level:</Text>
            <Text style={[styles.infoValue, { color: getRiskColor(order.stripeDetails.riskScore) }]}>
              {order.stripeDetails.riskLevel || 'N/A'}
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 16,
    paddingTop: (StatusBar.currentHeight || 0) + 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700', // Bold
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  badgeSuccess: {
    backgroundColor: '#4caf50',
  },
  badgeSecondary: {
    backgroundColor: '#2196f3',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600', // Semi-bold
  },
  content: {
    marginBottom: 16,
  },
  text: {
    fontSize: 14,
    fontWeight: '400', // Regular
    marginBottom: 8,
  },
  itemsSummary: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    backgroundColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  itemsSummaryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#444',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600', // Semi-bold
    marginBottom: 12,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500', // Medium
  },
  itemQuantity: {
    fontSize: 12,
    fontWeight: '400',
    color: '#555',
  },
  itemPriceContainer: {
    alignItems: 'flex-end',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '400', // Semi-bold
  },
  itemUnitPrice: {
    fontSize: 12,
    color: '#555',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600', // Semi-bold
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 16,
    alignSelf: 'flex-end',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    fontWeight: '500', // Medium
    color: 'red',
    textAlign: 'center',
  },
  shippingInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  shippingCost: {
    fontSize: 14,
    fontWeight: '600',
  },
  grandTotal: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#000',
  },
  grandTotalLabel: {
    fontSize: 20,
    fontWeight: '700',
  },
  grandTotalAmount: {
    fontSize: 20,
    fontWeight: '700',
  },
  infoGroup: {
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#444',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '400',
    color: '#555',
  },
  separator: {
    height: 1,
    backgroundColor: '#bbb',
    marginVertical: 10,
    width: '100%',
  },
  totalLabelSmall: {
    fontSize: 16,
    fontWeight: '600',
  },
  totalAmountSmall: {
    fontSize: 16,
    fontWeight: '600',
  },
  shippingLabelSmall: {
    fontSize: 14,
    fontWeight: '400',
  },
  shippingAmountSmall: {
    fontSize: 14,
    fontWeight: '400',
  },
  riskScoreCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  riskScoreText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
  },
  orderTime: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
  },
  itemsCount: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  itemsCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000000',
  },
  subtotalSeparator: {
    height: 0.5,
    backgroundColor: '#ddd',
    marginVertical: 10,
    width: '95%',
    alignSelf: 'center',
  },
});

