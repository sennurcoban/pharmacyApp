import { Platform, StyleSheet, Image, View } from "react-native";
import React from "react";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import CustomCallout from "./CustomCallout";

const Markers = ({pharmacyData}) => {
  return pharmacyData&&(
    <Marker
      coordinate={{
        latitude: pharmacyData.pharmacy.latitude,
        longitude: pharmacyData.pharmacy.longitude,
      }}
    >
      <Image source={marker_icon} style={{ width: 35, height: 50 }} />
      {Platform.OS === "ios" ? (
                <CustomCallout
                  pharmacy={pharmacy}
                  handleOpenInMaps={()=> handleDirection(pharmacy)}
                />
              ) : null}
    </Marker>
  );
};

export default Markers;

const styles = StyleSheet.create({});
