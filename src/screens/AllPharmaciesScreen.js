import { FontAwesome6, Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Platform,
  TextInput,
} from "react-native";
import * as Location from "expo-location";
import { useActionSheet } from "@expo/react-native-action-sheet";
import API from "../api/Enpoints";

const AllPharmaciesScreen = () => {
  const [pharmacies, setPharmacies] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [errorMsg, setErrorMsg] = useState(null);

  const optionArray = Platform.select({
    ios: ["Apple Haritalar", "Google Haritalar", "İptal"],
    android: ["Google Haritalar", "İptal"],
  });

  const { showActionSheetWithOptions } = useActionSheet();

  useEffect(() => {
    fetchCloserPharmacies();
  }, []);

  const fetchCloserPharmacies = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Konum izni verilmedi");
        return;
      }

      let lastLocation = await Location.getLastKnownPositionAsync();
      let location;
      if (lastLocation) {
        location = lastLocation;
      } else {
        location = await Location.getCurrentPositionAsync();
      }

      const { latitude, longitude } = location.coords;

      // Reverse Geocode Logic
      let city = "İstanbul";
      try {
        const reverseGeocode = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (reverseGeocode && reverseGeocode.length > 0) {
          city = reverseGeocode[0].region || reverseGeocode[0].city || reverseGeocode[0].subregion || "İstanbul";
        }
      } catch (err) {
        console.warn("Reverse geocode failed", err);
      }

      // Use Cache-Enabled API
      const response = await API.getPharmacies(latitude, longitude, city, null);
      const responseData = response.data;

      if (responseData.isSuccess) {
        const pharmaciesWithDistance = responseData.data.map((pharmacy) => ({
          ...pharmacy,
          distance: calculateDistance(
            latitude,
            longitude,
            pharmacy.latitude,
            pharmacy.longitude
          ),
        }));

        pharmaciesWithDistance.sort((a, b) => a.distance - b.distance);
        setPharmacies(pharmaciesWithDistance);
      } else {
        console.error("API Error:", responseData.errorMessage);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleCallPharmacy = (phoneNumber) => {
    if (phoneNumber) {
      Linking.openURL(`tel:${phoneNumber}`);
    } else {
      console.warn("Telefon numarası bulunamadı");
    }
  };

  const openInAppleMaps = (latitude, longitude) => {
    const latLng = `${latitude},${longitude}`;
    Linking.openURL(`http://maps.apple.com/?q=${latLng}`).catch(err => console.error("Map Error", err));
  };

  const openInGoogleMaps = (latitude, longitude) => {
    const latLng = `${latitude},${longitude}`;
    Linking.openURL(`http://maps.google.com/?q=${latLng}`).catch(err => console.error("Map Error", err));
  };

  const handleDirection = async (selectedPharmacy) => {
    const { latitude, longitude } = selectedPharmacy;
    const destructiveButtonIndex = 0;
    const cancelButtonIndex = 2;

    showActionSheetWithOptions(
      {
        options: optionArray,
        cancelButtonIndex,
        destructiveButtonIndex,
      },
      (selectedIndex) => {
        const selectedOption = optionArray[selectedIndex];
        if (selectedOption === "Apple Haritalar") openInAppleMaps(latitude, longitude);
        else if (selectedOption === "Google Haritalar") openInGoogleMaps(latitude, longitude);
      }
    );
  };

  const filteredPharmacies = pharmacies.filter((pharmacy) => {
    const query = searchQuery.toLowerCase();
    const name = pharmacy.pharmacyName ? pharmacy.pharmacyName.toLowerCase() : "";
    const address = pharmacy.address ? pharmacy.address.toLowerCase() : "";
    return name.includes(query) || address.includes(query);
  });

  const renderPharmacyItem = ({ item }) => (
    <View
      style={{
        paddingVertical: 30,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <View style={{ flexDirection: "column", width: 200 }}>
        <Text style={{ fontWeight: "bold" }}>{item.pharmacyName}</Text>
        <Text>{item.address}</Text>
        <Text>{item.distance.toFixed(2)} km</Text>
      </View>
      <View style={{ flexDirection: "row", justifyContent: "space-around", width: 90 }}>
        <TouchableOpacity
          onPress={() => handleDirection(item)}
          style={{
            backgroundColor: "red",
            padding: 7,
            borderRadius: 20,
            width: 40,
            height: 40,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="location-sharp" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleCallPharmacy(item.phone)}
          style={{
            backgroundColor: "#4CE5B1",
            padding: 7,
            borderRadius: 20,
            width: 40,
            height: 40,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <FontAwesome6 name="phone" size={18} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={{ marginVertical: 10, padding: 10, backgroundColor: '#f0f0f0', borderRadius: 8 }}>
        <TextInput
          placeholder="Eczane adı veya adres ara..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={{ height: 40 }}
        />
      </View>

      {pharmacies.length > 0 ? (
        <FlatList
          data={filteredPharmacies}
          renderItem={renderPharmacyItem}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20 }}>Sonuç bulunamadı.</Text>}
        />
      ) : (
        <View style={styles.loading}>
          {errorMsg ? <Text style={{ color: 'red' }}>{errorMsg}</Text> : <Text>Eczaneler yükleniyor...</Text>}
        </View>
      )}
    </View>
  );
};

export default AllPharmaciesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 15,
  },
  loading: {
    alignItems: "center",
    marginTop: 50
  }
});
