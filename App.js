import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import SearchScreen from "./src/screens/SearchScreen";
import ClosesPharmacyScreen from "./src/screens/ClosesPharmacyScreen";
import AllPharmaciesScreen from "./src/screens/AllPharmaciesScreen";
import PharmacyCard from "./src/components/PharmacyCard";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="En Yakın" component={ClosesPharmacyScreen} />
          <Stack.Screen name="Arama" component={SearchScreen} />
          <Stack.Screen name="Liste" component={AllPharmaciesScreen} />
          <Stack.Screen name="Eczane Detay" component={PharmacyCard} />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
