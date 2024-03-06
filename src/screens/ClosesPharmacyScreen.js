import React, { useEffect, useState } from "react";
import { StyleSheet, View, Platform, Linking } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});

const ClosesPharmacyScreen = () => {
  const [currentRegion, setCurrentRegion] = useState(null);
  const [pharmacies, setPharmacies] = useState([]);

  useEffect(() => {
    fetchPharmacies();
  }, []);

  const fetchPharmacies = async () => {
    try {
      const response = await fetch(
        "https://eczaneapi.intimeinfo.net/api/Eczane/GetPharmacyInformation"
      );

      const data = await response.json();

      // console.log(data)
      if (data.isSuccess) {
        setPharmacies(data.data);
      } else {
        console.error("API Error:", data.errorMessage);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
    }
  };

  useEffect(() => {
    const getCurrentLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          console.error("Permission to access location was denied");
          return;
        }

        let lastLocation = await Location.getLastKnownPositionAsync();
        const { latitude, longitude } = lastLocation.coords;

        if (lastLocation) {
          setCurrentRegion({
            latitude,
            longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          });
          return;
        } else {
          let location = await Location.getCurrentPositionAsync();
          return location;
        }
      } catch (error) {
        console.error(error);
      }
    };

    getCurrentLocation();
  }, []);

  // Marker'ın açıklama kısmına tıklama işlemi
  const handleOpenInMaps = (latitude, longitude) => {
    const latLng = `${latitude},${longitude}`;
    let url = "";

    // iOS için
    if (Platform.OS === "ios") {
      url = `http://maps.apple.com/?q=${latLng}`;
    }
    // Android için
    else if (Platform.OS === "android") {
      url = `http://maps.google.com/?q=${latLng}`;
    }

    // URL'yi aç
    Linking.openURL(url).catch((err) =>
      console.error("Haritaları açarken hata oluştu:", err)
    );
  };

  return (
    <View style={styles.container}>
      {currentRegion && (
        <MapView
          showsUserLocation
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={{
            latitude: currentRegion.latitude,
            longitude: currentRegion.longitude,
            latitudeDelta: currentRegion.latitudeDelta,
            longitudeDelta: currentRegion.longitudeDelta,
          }}
        >
          {pharmacies.map((pharmacy) => (
            <Marker
              key={pharmacy.id}
              coordinate={{
                latitude: pharmacy.latitude,
                longitude: pharmacy.longitude,
              }}
              title={pharmacy.pharmacyName}
              description={`${pharmacy.address}, ${pharmacy.city}, ${pharmacy.district}`}
              onPress={() =>
                handleOpenInMaps(pharmacy.latitude, pharmacy.longitude)
              }
            />
          ))}
        </MapView>
      )}
    </View>
  );
};

export default ClosesPharmacyScreen;
