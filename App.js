import Home from './src/screens/Home';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PharmacyDetail from './src/screens/PharmacyDetail';
import Login from './src/screens/Login';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName='Login'>
      <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Nöbetçi Eczaneler" component={Home} />
        <Stack.Screen name="Details" component={PharmacyDetail} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
