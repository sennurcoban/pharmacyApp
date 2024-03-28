import { View, Text, StyleSheet } from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { UserLocationContext } from "../context/UserLocationContext";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";

const CustomMapView = ({ handleGetDirections, handleMarkerPress }) => {
  const { location, setLocation } = useContext(UserLocationContext);
  const [mapRegion, setMapRegion] = useState([]);

  useEffect(() => {
    if (location) {
      setMapRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    }
  }, []);

  return (
      <View>
        <MapView
          showsUserLocation
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          region={mapRegion}
        >
          {pharmacyData.map((pharmacy, index) => (
            <Marker
              key={pharmacy.id}
              coordinate={{
                latitude: pharmacy.latitude,
                longitude: pharmacy.longitude,
              }}
              title={pharmacy.pharmacyName}
              description={`${pharmacy.address}, ${pharmacy.city}, ${pharmacy.district}`}
              onCalloutPress={(index) => handleGetDirections(index)}
              onPress={() => {
                // console.log(
                //     "HANDLE MAKER PRESS---pharmacyName",
                //     pharmacy.pharmacyName
                // );
                // console.log("HANDLE MAKER PRESS---", pharmacy.latitude);
                handleMarkerPress(pharmacy);
              }}
              // // image={marker_icon}
            >
              <Image source={marker_icon} style={{ width: 35, height: 50 }} />
              {Platform.OS === "ios" ? (
                <CustomCallout
                  pharmacy={pharmacy}
                  handleOpenInMaps={(index) => handleGetDirections(index)}
                />
              ) : null}
            </Marker>
          ))}
        </MapView>
      </View>
    )
};

export default CustomMapView;

const styles = StyleSheet.create({
  map: {
    width: "100%",
    height: "%100",
  },
});
