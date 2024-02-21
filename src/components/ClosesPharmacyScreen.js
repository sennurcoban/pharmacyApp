import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from 'expo-location';

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    flex:1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
 });

const ClosesPharmacyScreen = () => {
  const [currentRegion, setCurrentRegion] = useState(null);

  useEffect(() => {
    const getCurrentLocation = async () => {
      try {
        const { status } = await Location.getLastKnownPositionAsync();
        if (status !== 'granted') {
          console.error('Permission to access location was denied');
          return;
        }
        
        const location = await Location.getLastKnownPositionAsync({});
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
          <Marker
            coordinate={{
              latitude: currentRegion.latitude,
              longitude: currentRegion.longitude,
            }}
            title={currentRegion.pharmacyName}
              description={`${currentRegion.address}, ${currentRegion.city}, ${currentRegion.district}`}
          />
        </MapView>
      )}
    </View>
  );
};

export default ClosesPharmacyScreen;
