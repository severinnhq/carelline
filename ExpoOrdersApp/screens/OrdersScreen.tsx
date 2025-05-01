import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, RefreshControl, Image, ScrollView, Dimensions, NativeSyntheticEvent, NativeScrollEvent, StatusBar, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, OrdersScreenProps } from '../types/navigation';
import { format } from 'date-fns';
import * as Haptics from 'expo-haptics';
import { OrderFulfillmentCheckbox } from '../components/OrderFulfillmentCheckbox';

type OrdersScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Orders'>;

interface Order {
  _id: string;
  sessionId: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  shippingType?: string;
  fulfilled?: boolean;
  items: Array<{
    n: string;
    s: string;
    q: number;
    p: number;
  }>;
  shippingDetails: {
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
  shippingCost?: number;
}

interface CarComparison {
  name: string;
  image: any;
  price: number;
}

const API_URL = 'https://carelline.com/api/orders';
const CORVETTE_PRICE_EUR = 120000;
const MASERATI_PRICE_EUR = 118421;
const LAMBORGHINI_PRICE_EUR = 200000;

const carComparisons: CarComparison[] = [
  { name: 'Maserati GranTurismo', image: require('../assets/maserati.png'), price: MASERATI_PRICE_EUR },
  { name: 'Corvette ZR1', image: require('../assets/corvette.png'), price: CORVETTE_PRICE_EUR },
  { name: 'Lamborghini', image: require('../assets/lambo.png'), price: LAMBORGHINI_PRICE_EUR },
];

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

export default function OrdersScreen({ navigation }: OrdersScreenProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalAmountEUR, setTotalAmountEUR] = useState(0);
  const [currentCarIndex, setCurrentCarIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const challengeResponse = await fetch(`${API_URL}?`);
      const challengeData = await challengeResponse.json();
      const challenge = challengeData.challenge;
      const response = simpleHash(challenge + 'carelline_secret');
      const ordersResponse = await fetch(`${API_URL}?challenge=${challenge}&response=${response}`);

      if (!ordersResponse.ok) {
        throw new Error(`HTTP error! status: ${ordersResponse.status}`);
      }
      
      const data = await ordersResponse.json();
      setOrders(data);
      
      const total = data.reduce((sum: number, order: Order) => {
        return sum + (order.amount * 0.85);
      }, 0);
      setTotalAmountEUR(total);
      
      setError(null);
    } catch (error) {
      console.error('Error fetching orders:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setError(`Failed to fetch orders. ${errorMessage}`);
      Alert.alert('Error', `Failed to fetch orders. ${errorMessage}`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const onRefresh = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRefreshing(true);
    fetchOrders();
  };

  const formatCreatedDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return format(date, "MMM d, yyyy 'at' HH:mm:ss");
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  const updateOrderFulfillment = async (orderId: string, fulfilled: boolean) => {
    try {
      const response = await fetch('https://carelline.com/api/update-order-fulfillment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId, fulfilled }),
      });

      if (!response.ok) {
        throw new Error('Failed to update order fulfillment');
      }

      setOrders(prevOrders =>
        prevOrders.map(order =>
          order._id === orderId ? { ...order, fulfilled } : order
        )
      );
    } catch (error) {
      console.error('Error updating order fulfillment:', error);
      Alert.alert('Error', 'Failed to update order fulfillment');
    }
  };

  const renderOrderItem = ({ item }: { item: Order }) => {
    const subtotal = item.items.reduce((sum, product) => sum + product.p * product.q, 0);
    const isStandardShippingFree = subtotal >= 100;
    const shippingCost = item.shippingType?.toLowerCase().includes('express') ? 10 : (isStandardShippingFree ? 0 : 5);
    const isExpressShipping = item.shippingType?.toLowerCase().includes('express');
    const total = subtotal + shippingCost;

    return (
      <TouchableOpacity
        style={[styles.orderItem, isExpressShipping && styles.expressShipping]}
        onPress={() => {
          console.log('Navigating to OrderDetail with ID:', item._id);
          navigation.navigate('OrderDetail', { orderId: item._id });
        }}
      >
        <View style={styles.orderHeader}>
          <View style={styles.orderHeaderLeft}>
            <View style={styles.itemsBadge}>
              <Text style={styles.itemsBadgeText}>
                {item.items.reduce((total, product) => total + product.q, 0)} items
              </Text>
            </View>
            <Text style={styles.orderDate}>{formatCreatedDate(item.createdAt)}</Text>
          </View>
          <OrderFulfillmentCheckbox
            orderId={item._id}
            initialFulfilled={item.fulfilled || false}
            onToggle={updateOrderFulfillment}
          />
        </View>
        <View style={styles.orderContent}>
          {item.items.map((product, index) => (
            <View key={index} style={styles.productItem}>
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{product.n} - {product.s}</Text>
                <Text style={styles.productQuantity}>Qty: {product.q}</Text>
              </View>
              <View style={styles.productPricing}>
                <Text style={styles.productPrice}>€{(product.p * product.q).toFixed(2)}</Text>
                {product.q > 1 && (
                  <Text style={styles.productUnitPrice}>(€{product.p.toFixed(2)} each)</Text>
                )}
              </View>
            </View>
          ))}
        </View>
        <View style={styles.separatorAboveShipping} />
        <View style={styles.shippingInfo}>
          <Text style={styles.shippingType}>
            {item.shippingType || 'Standard'}:
          </Text>
          <Text style={styles.shippingCost}>
            {shippingCost === 0 ? 'Free' : `€${shippingCost.toFixed(2)}`}
          </Text>
        </View>
        <View style={styles.separatorBelowShipping} />
        <View style={styles.totalContainer}>
          <Text style={styles.totalAmount}>
            Total: €{total.toFixed(2)}
          </Text>
        </View>
        <View style={styles.shippingDetails}>
          <Text style={styles.sectionTitle}>Shipping Details</Text>
          <Text style={styles.text}>{item.shippingDetails.name}</Text>
          <Text style={styles.text}>{item.shippingDetails.address.line1}</Text>
          {item.shippingDetails.address.line2 && <Text style={styles.text}>{item.shippingDetails.address.line2}</Text>}
          <Text style={styles.text}>{item.shippingDetails.address.city}, {item.shippingDetails.address.state} {item.shippingDetails.address.postal_code}</Text>
          <Text style={styles.text}>{item.shippingDetails.address.country}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderComparison = (car: CarComparison, index: number) => {
    const progressPercentage = (totalAmountEUR / car.price) * 100;

    return (
      <View key={index} style={styles.comparisonContainer}>
        <Image 
          source={car.image}
          style={[styles.carImage, car.name === 'Lamborghini' && styles.lamboImage]}
          resizeMode="contain"
        />
        <View style={styles.progressContainer}>
          <Text style={styles.totalText}>Total: €{totalAmountEUR.toFixed(2)} EUR</Text>
          <Text style={styles.progressText}>
            {progressPercentage.toFixed(2)}% of {car.name}
          </Text>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${Math.min(progressPercentage, 100)}%` }]} />
          </View>
          <Text style={styles.progressRatioText}>
            €{totalAmountEUR.toFixed(2)} / €{car.price.toFixed(2)}
          </Text>
        </View>
      </View>
    );
  };

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffset = event.nativeEvent.contentOffset;
    const index = Math.round(contentOffset.x / SCREEN_WIDTH);
    setCurrentCarIndex(index);
  }, [SCREEN_WIDTH]);

  const scrollToIndex = (index: number) => {
    scrollViewRef.current?.scrollTo({ x: index * SCREEN_WIDTH, animated: true });
  };

  if (loading && !refreshing) {
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
        <TouchableOpacity style={styles.retryButton} onPress={fetchOrders}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.comparisonWrapper}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          decelerationRate="fast"
          snapToInterval={SCREEN_WIDTH}
          snapToAlignment="center"
        >
          {carComparisons.map((car, index) => renderComparison(car, index))}
        </ScrollView>
        <View style={styles.paginationContainer}>
          {carComparisons.map((_, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.paginationDot, index === currentCarIndex && styles.paginationDotActive]}
              onPress={() => scrollToIndex(index)}
            />
          ))}
        </View>
      </View>
      {orders.length > 0 ? (
        <FlatList
          data={orders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.orderList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      ) : (
        <Text style={styles.noOrders}>No orders found.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingTop: StatusBar.currentHeight,
  },
  comparisonContainer: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    width: SCREEN_WIDTH,
    paddingVertical: 10,
    paddingBottom: 30,
  },
  carImage: {
    width: '100%',
    height: 120,
    marginBottom: 8,
  },
  lamboImage: {
    width:'140%',
    height: 120,
    marginLeft: 0,
    marginBottom: 8,
  },
  progressContainer: {
    width: '100%',
    paddingHorizontal: 20,
  },
  totalText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
    textAlign: 'center',
  },
  progressText: {
    fontSize: 13,
    marginBottom: 2,
    textAlign: 'center',
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: '#ecebef',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 4,
    width: '80%',
    alignSelf: 'center',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#000', 
    borderRadius: 6,
  },
  progressRatioText: {
    fontSize: 11,
    textAlign: 'center',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#ffffff',
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#050120',
  },
  orderItem: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 8,
    marginTop: 30,
    marginBottom: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  expressShipping: {
    backgroundColor: '#E6F7FF', 
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  orderHeaderLeft: {
    flexDirection: 'column',
  },
  itemsBadge: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 8,
    alignSelf: 'flex-start',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  itemsBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000000',
  },
  orderContent: {
    paddingTop: 12,
  },
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  productInfo: {
    flex: 1,
  },
  productPricing: {
    alignItems: 'flex-end',
  },
  productName: {
    fontSize: 14,
  },
  productQuantity: {
    fontSize: 12,
    color: '#555',
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '600',
  },
  productUnitPrice: {
    fontSize: 12,
    color: '#555',
  },
  shippingDetails: {
    marginTop: 10,
  },
  shippingAddressTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
  },
  shippingAddressText: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  shippingInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  shippingType: {
    fontSize: 14,
    fontWeight: '500',
  },
  shippingCost: {
    fontSize: 14,
    fontWeight: '700',
  },
  itemsSummary: {
    backgroundColor: '#ffffff', 
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  itemsSummaryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000000',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '700',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  retryButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#007AFF',
    borderRadius: 5,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  noOrders: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
  comparisonWrapper: {
    position: 'relative',
    backgroundColor: '#ffffff',
  },
  orderList: {
    paddingHorizontal: 10,
    paddingTop: 5, 
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  text: {
    fontSize: 14,
    marginBottom: 5,
  },
  separatorAboveShipping: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 15,
    width: '95%',
    alignSelf: 'center', 
  },
  separatorBelowShipping: {
    height: 1, 
    backgroundColor: '#000',
    marginVertical: 15,
    width: '100%', 
    alignSelf: 'center', 
  },
  totalContainer: {
    alignItems: 'flex-end',
    marginBottom: 15,
  },
  orderDate: {
    fontSize: 14,
    fontWeight: '400',
    color: '#555',
  },
});

