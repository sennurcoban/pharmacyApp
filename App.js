import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";

import SearchScreen from "./src/screens/SearchScreen";
import ClosesPharmacyScreen from "./src/screens/ClosesPharmacyScreen";
import AllPharmaciesScreen from "./src/screens/AllPharmaciesScreen";
import PharmacyCard from "./src/components/PharmacyCard";


const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
      <ActionSheetProvider>
      <NavigationContainer>
        <Stack.Navigator >
          <Stack.Screen options={{ headerShown:false }} name="Harita" component={ClosesPharmacyScreen} />
          <Stack.Screen name="Arama" component={SearchScreen} />
          <Stack.Screen
          headerShown
          name="Tüm Nöbetçi Eczaneler" component={AllPharmaciesScreen} />
          <Stack.Screen name="Eczane Detay" component={PharmacyCard} />
        </Stack.Navigator>
      </NavigationContainer>
      </ActionSheetProvider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
