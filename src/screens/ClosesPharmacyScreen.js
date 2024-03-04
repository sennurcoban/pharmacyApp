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
  const [pharmacies, setPharmacies] = useState([]);

  useEffect(() => {
    const getCurrentLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.error('Permission to access location was denied');
          return;
        }
        
        const location = await Location.getCurrentPositionAsync({});
        console.log("location", location)
        const { latitude, longitude } = location.coords;
        
        setCurrentRegion({
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });

        // Fetch pharmacies data based on user location
        const response = await fetch(`https://eczaneapi.intimeinfo.net/api/Eczane/GetPharmacyInformation?CitiesName=${latitude}&DistrictName=${longitude}`);
        const data = await response.json();
        setPharmacies(data.data);
      } catch (error) {
        console.error(error);
      }
    };

    getCurrentLocation();
  }, []);

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
       {pharmacies.map(pharmacy => (
         <Marker
           key={pharmacy.id}
           coordinate={{
             latitude: pharmacy.latitude,
             longitude: pharmacy.longitude,
           }}
           title={pharmacy.pharmacyName}
           description={`${pharmacy.address}, ${pharmacy.city}, ${pharmacy.district}`}
         />
       ))}
     </MapView>
     
      )}
    </View>
  );
};

export default ClosesPharmacyScreen;
