import React from 'react'
import { View, Text, Dimensions } from "react-native";
import { Callout } from 'react-native-maps';


const CustomCallout = ({ handleOpenInMaps, pharmacy}) => {
  
  return (
    <Callout onPress={handleOpenInMaps}>
      <View
        style={{
          width: Dimensions.get("window").width / 2,
          paddingVertical: 5,
          paddingHorizontal: 5,
          flexDirection:"column"
        }}
      >
        <Text numberOfLines={2} style={{ textAlign: "center", fontWeight:"bold" }}>
        {pharmacy.pharmacyName}
        </Text>
        <Text numberOfLines={2} style={{ textAlign: "center", }}>
        {pharmacy.address}, {pharmacy.city}, {pharmacy.district}
        </Text>
      </View>
    </Callout>

  )
}

export default CustomCallout;