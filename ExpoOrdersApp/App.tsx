import React, { useEffect, useState } from 'react';
import { View, Text, Platform, Alert, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Updates from 'expo-updates';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import OrdersScreen from './screens/OrdersScreen';
import OrderDetailScreen from './screens/OrderDetailScreen';

export type RootStackParamList = {
  Orders: undefined;
  OrderDetail: { orderId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      Alert.alert('Failed to get push token for push notification!');
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync({ 
      projectId: Constants.expoConfig?.extra?.eas?.projectId 
    })).data;
    console.log('Expo Push Token:', token);
  } else {
    Alert.alert('Must use physical device for Push Notifications');
  }

  return token;
}

export default function App() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>('');

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => {
      setExpoPushToken(token);
      if (token) {
        sendPushTokenToServer(token);
      }
    });

    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
      const data = notification.request.content.data;
      const productName = data.productName;
      const price = data.price;
      const otherItems = data.otherItems;

      let message = `New order: ${productName} - ${price}`;
      if (otherItems > 0) {
        message += ` + ${otherItems} other${otherItems === 1 ? '' : 's'}`;
      }

      Alert.alert('New Order', message);
    });

    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response received:', response);
      const orderId = response.notification.request.content.data.orderId;
      if (orderId) {
        // Navigate to the specific order detail
        // You might need to implement this navigation logic
        // For example:
        // navigation.navigate('OrderDetail', { orderId });
      }
    });

    checkForUpdates();

    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }, []);

  async function sendPushTokenToServer(token: string) {
    try {
      const response = await fetch('https://carelline.com/api/register-push-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });
      const result = await response.json();
      console.log('Push token registered with server:', result);
    } catch (error) {
      console.error('Error sending push token to server:', error);
    }
  }

  async function checkForUpdates() {
    try {
      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        Alert.alert(
          'Update Available',
          'A new version is available. Would you like to update now?',
          [
            { text: 'Later', style: 'cancel' },
            { 
              text: 'Update', 
              onPress: async () => {
                setIsUpdating(true);
                try {
                  await Updates.fetchUpdateAsync();
                  await Updates.reloadAsync();
                } catch (error) {
                  console.error('Error updating app:', error);
                  setIsUpdating(false);
                  Alert.alert('Update Failed', 'Please try again later.');
                }
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error checking for updates:', error);
    }
  }

  if (isUpdating) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Updating...</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#f0f0f0" />
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen 
            name="Orders" 
            component={OrdersScreen}
            options={{ title: 'Orders' }}
          />
          <Stack.Screen 
            name="OrderDetail" 
            component={OrderDetailScreen}
            options={{ title: 'Order Details' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

