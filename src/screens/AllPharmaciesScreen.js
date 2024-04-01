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
} from "react-native";
import * as Location from "expo-location";
import { useActionSheet } from "@expo/react-native-action-sheet";
import LinkHeader from "../components/LinkHeader";

const AllPharmaciesScreen = () => {
  const [pharmacies, setPharmacies] = useState([]);

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
      console.log("Kullanıcı Konum Lat:", latitude);
      console.log("Kullanıcı Konum Lon:", longitude);

      const response = await fetch(
        "https://eczaneapi.intimeinfo.net/api/Eczane/GetPharmacyInformation"
      );

      if (!response.ok) {
        throw new Error("API Error: " + response.statusText);
      }

      const responseData = await response.json();

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
    // Haversine formülü kullanarak mesafeyi hesapla
    const R = 6371; // Dünya yarıçapı kilometre cinsinden
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Mesafe kilometre cinsinden
    return distance;
  };

  const handleCallPharmacy = (phoneNumber) => {
    const url = `tel:${phoneNumber}`;
    Linking.openURL(url);
  };

  const openInAppleMaps = (latitude, longitude) => {
    const latLng = `${latitude},${longitude}`;
    url = `http://maps.apple.com/?q=${latLng}`;

    Linking.openURL(url).catch((err) =>
      console.error("Haritaları açarken hata oluştu:", err)
    );
  };

  const openInGoogleMaps = (latitude, longitude) => {
    const latLng = `${latitude},${longitude}`;
    let url = `http://maps.google.com/?q=${latLng}`;

    Linking.openURL(url).catch((err) =>
      console.error("Haritaları açarken hata oluştu:", err)
    );
  };

  const handleOpenCompanyWebsite = () => {
    const url = `https://www.intimeinfo.com.tr/`;
    Linking.openURL(url);
  };

  const handleDirection = async (selectedPharmacy) => {
    try {
      const { latitude, longitude } = selectedPharmacy;
      const options = optionArray;
      const destructiveButtonIndex = 0;
      const cancelButtonIndex = 2;

      showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex,
          destructiveButtonIndex,
        },
        (selectedIndex) => {
          const selectedOption = optionArray[selectedIndex];
          let selectedMapApp = "";

          if (selectedOption === "Apple Haritalar" && Platform.OS === "ios") {
            selectedMapApp = "apple";
          } else if (selectedOption === "Google Haritalar") {
            selectedMapApp = "google";
          }
          if (selectedMapApp === "apple") {
            openInAppleMaps(latitude, longitude);
          } else if (selectedMapApp === "google") {
            openInGoogleMaps(latitude, longitude);
          }
        }
      );
    } catch (error) {
      console.error("Hata:", error);
    }
  };

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
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          width: 90,
        }}
      >
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
      {pharmacies.length > 0 ? (
        <FlatList
          data={pharmacies}
          renderItem={renderPharmacyItem}
          keyExtractor={(item) => item.id.toString()}
        />
      ) : (
        <View style={styles.loading}>
          <Text>Eczaneler yükleniyor...</Text>
        </View>
      )}
      <LinkHeader onPress={handleOpenCompanyWebsite} />
    </View>
  );
};

export default AllPharmaciesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 15,
  },
  pharmacies: {
    marginTop: 15,
    with: 671,
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "red",
    justifyContent: "space-around",
    borderRadius: 10,
    padding: 5,
  },
  allPharmacies: {
    backgroundColor: "transparent",
    borderRadius: 10,
    padding: 5,
    width: 150,
    alignItems: "center",
  },
  nightPharmacies: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 5,
    width: 150,
    alignItems: "center",
  },
  loading:{
    alignItems:"center",
  }
});
