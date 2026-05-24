import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text } from 'react-native';

import ProductsScreen from '../screens/ProductsScreen';
import OrdersScreen from '../screens/OrdersScreen';
import ProfileScreen from '../screens/ProfileScreen';
import CreateOrderScreen from '../screens/CreateOrderScreen';
import { ROUTES } from '../utils';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const TabIcon = ({ name, focused }: { name: string; focused: boolean }) => (
  <Text style={{
    fontSize: 20,
    color: focused ? '#ffb347' : '#666',
    fontWeight: focused ? 'bold' : 'normal',
  }}>
    {name}
  </Text>
);

const TabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused }) => {
        let iconName: string;
        switch (route.name) {
          case ROUTES.PRODUCTS: iconName = '�️'; break;
          case ROUTES.ORDERS: iconName = '📦'; break;
          case ROUTES.PROFILE: iconName = '👤'; break;
          default: iconName = '•';
        }
        return <TabIcon name={iconName} focused={focused} />;
      },
      tabBarActiveTintColor: '#ffb347',
      tabBarInactiveTintColor: '#666',
      tabBarStyle: {
        backgroundColor: '#1E1E1E',
        borderTopColor: '#333',
        borderTopWidth: 1,
        height: 60,
        paddingBottom: 8,
        paddingTop: 4,
      },
      tabBarLabelStyle: {
        fontSize: 11,
        fontWeight: '600',
      },
      headerShown: false,
    })}
  >
    <Tab.Screen
      name={ROUTES.PRODUCTS}
      component={ProductsScreen}
      options={{ title: 'Products' }}
    />
    <Tab.Screen
      name={ROUTES.ORDERS}
      component={OrdersScreen}
      options={{ title: 'Orders' }}
    />
    <Tab.Screen
      name={ROUTES.PROFILE}
      component={ProfileScreen}
      options={{ title: 'Profile' }}
    />
  </Tab.Navigator>
);

const MainNavigation = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: '#1E1E1E', elevation: 0, shadowOpacity: 0 },
      headerTintColor: '#FFFFFF',
      headerTitleStyle: { fontWeight: 'bold' },
      cardStyle: { backgroundColor: '#121212' },
    }}
  >
    <Stack.Screen
      name={ROUTES.MAIN_TABS}
      component={TabNavigator}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name={ROUTES.CREATE_ORDER}
      component={CreateOrderScreen}
      options={{ title: 'Place Order' }}
    />
  </Stack.Navigator>
);

export default MainNavigation;