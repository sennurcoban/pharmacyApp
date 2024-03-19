import React from 'react'
import { View, Text, Dimensions } from "react-native";
import { Callout } from 'react-native-maps';


const CustomCallout = ({ handleOpenInMaps, pharmacy}) => {
  
  return (
    <Callout onPress={handleOpenInMaps}>
      <View
        style={{
          width: Dimensions.get("window").width / 2,
          paddingVertical: 10,
          paddingHorizontal: 5,
        }}
      >
        <Text numberOfLines={2} style={{ textAlign: "center", }}>
        {pharmacy.address},s {pharmacy.city}, {pharmacy.district}
        </Text>
      </View>
    </Callout>

  )
}

export default CustomCallout;