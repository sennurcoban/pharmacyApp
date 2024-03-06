import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons,MaterialCommunityIcons } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import SearchScreen from './src/screens/SearchScreen';
import ClosesPharmacyScreen from './src/screens/ClosesPharmacyScreen';
import AllPharmaciesScreen from './src/screens/AllPharmaciesScreen'


const Tab = createBottomTabNavigator();

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
      // paddingBottom:0,
      headerShown:false,
      tabBarStyle: {
        height:70,
        position:'absolute',
        bottom:30,
        paddingBottom:0,
        right:16,
        left:16,
        borderRadius:10,
        backgroundColor:"#333333"
      },
      tabBarActiveTintColor: '#828282',
      tabBarInactiveTintColor: 'gray',
      tabBarItemStyle: { paddingBottom: 15 },
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
