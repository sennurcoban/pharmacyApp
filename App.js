import Home from './src/screens/Home';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FontAwesome6, Ionicons,MaterialCommunityIcons } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import PharmacyDetail from './src/screens/PharmacyDetail';
import Login from './src/screens/Login';
import SearchScreen from './src/components/SearchScreen';
import ClosesPharmacyScreen from './src/components/ClosesPharmacyScreen';
import AllPharmaciesScreen from './src/components/AllPharmaciesScreen'


const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const StackNavigator = () => {
  return (
      <Stack.Navigator initialRouteName='Login'>
      <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Nöbetçi Eczaneler" component={Home} />
        <Stack.Screen name="Details" component={PharmacyDetail} />
      </Stack.Navigator>
  );
};

const TabNavigator = () => {
  return (
    <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;

        if (route.name === 'En Yakın') {
          iconName = focused ? 'navigation-variant' : 'navigation-variant-outline';
          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        } else if (route.name === 'Arama') {
          iconName = focused ? 'search' : 'search-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        } else if (route.name === 'Liste') {
          iconName = focused ? 'list' : 'list-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        }
      },
      headerShown:false,
      tabBarStyle: {
        height:70,
        position:'absolute',
        bottom:16,
        right:16,
        left:16,
        borderRadius:10,
        backgroundColor:"#333333"
      },
      tabBarActiveTintColor: '#828282',
      tabBarInactiveTintColor: 'gray',
      tabBarItemStyle: { paddingBottom: 5 },
    })}
  >
    <Tab.Screen name="En Yakın" component={ClosesPharmacyScreen} />
    <Tab.Screen name="Arama" component={SearchScreen} />
    <Tab.Screen name="Liste" component={AllPharmaciesScreen} />
  </Tab.Navigator>
  );
};

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <TabNavigator />
      </NavigationContainer>
    </GestureHandlerRootView>

  );
}
