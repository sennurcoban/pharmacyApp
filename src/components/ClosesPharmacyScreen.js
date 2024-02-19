import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from 'expo-location';

const ClosesPharmacyScreen = () => {
  const [currentRegion, setCurrentRegion] = useState(null);

  useEffect(() => {
    const getCurrentLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.error('Permission to access location was denied');
          return;
        }
        
        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;
        
        setCurrentRegion({
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      } catch (error) {
        console.error(error);
      }
    };

    getCurrentLocation();
  }, []);

  return (
    <View style={styles.container}>
      {currentRegion && (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: currentRegion.latitude,
            longitude: currentRegion.longitude,
            latitudeDelta: currentRegion.latitudeDelta,
            longitudeDelta: currentRegion.longitudeDelta,
          }}
        >
          <Marker
            coordinate={{
              latitude: currentRegion.latitude,
              longitude: currentRegion.longitude,
            }}
            title="Siz Buradasınız"
          />
        </MapView>
      )}
    </View>
  );
};

export default ClosesPharmacyScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
});
