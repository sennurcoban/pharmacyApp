import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import MapView, { Marker } from "react-native-maps";
// import Geolocation from '@react-native-community/geolocation';

const ClosesPharmacyScreen = () => {
  const [currentRegion, setCurrentRegion] = useState(null); // Bulunduğunuz konumun bilgisini tutmak için bir state

  // useEffect(() => {
  //   // Bulunduğunuz konumu almak için bir işlev
  //   const getCurrentLocation = () => {
  //     Geolocation.getCurrentPosition(
  //       (position) => {
  //         const { latitude, longitude } = position.coords;
  //         setCurrentRegion({
  //           latitude,
  //           longitude,
  //           latitudeDelta: 0.0922,
  //           longitudeDelta: 0.0421,
  //         }); // Konumu güncelle
  //       },
  //       (error) => console.error(error),
  //       { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
  //     );
  //   };

  //   getCurrentLocation(); // İlk render zamanında konumu al

  //   // Unmount sırasında izlemeyi durdur
  //   return () => {
  //     Geolocation.clearWatch();
  //   };
  // }, []);

  return (
    <View style={styles.container}>
      <MapView style={styles.map} >
        {/* {currentRegion && (
          <Marker
            coordinate={{
              latitude: currentRegion.latitude,
              longitude: currentRegion.longitude,
            }}
          >
            <View style={styles.marker}>
              <Text style={styles.markerText}>Siz Buradasınız</Text>
            </View>
          </Marker>
        )} */}
      </MapView>
      {/* <MapView style={styles.map} /> */}
      <View style={styles.pharmacies}>
        <TouchableOpacity style={styles.allPharmacies}>
          <Text style={{ color: "white" }}>Bütün Eczaneler</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.nightPharmacies}>
          <Text style={{ color: "red" }}>Nöbetçi Eczaneler</Text>
        </TouchableOpacity>
      </View>
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
    position: "absolute", // Harita bileşeni pozisyonu ayarlanıyor
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
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
    marginHorizontal: 15,
    marginTop: 30,
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
});
