import React from "react";
import { View, Text, Dimensions, TouchableOpacity } from "react-native";
import { Callout, CalloutSubview } from "react-native-maps";
import { FontAwesome6, Ionicons } from "@expo/vector-icons";

const CustomCallout = ({ pharmacy,onPressDirection, onClickPhone }) => {
  const handleDirection = () => {
    onPressDirection(pharmacy);
  };
  const handlePhoneCall = () => {
    onClickPhone(pharmacy);
  };

  return (
    <Callout
    key={pharmacy.id}
    tooltip
      style={{
        backgroundColor:"#fff",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        width: Dimensions.get("window").width * 0.75,
      }}
    >
      <View
        style={{
          width: Dimensions.get("window").width * 0.70,
          flexDirection: "row",
        }}
      >
        <View
          style={{
            flexDirection: "column",
          }}
        >
          <CalloutSubview onPress={handleDirection}>
          <TouchableOpacity
            style={{
              backgroundColor: "red",
              padding: 7,
              borderRadius: 20,
              width: 40,
              height: 40,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 5,
            }}
          >
            <Ionicons name="location-sharp" size={20} color="white" />
          </TouchableOpacity>
          </CalloutSubview>
          
          <CalloutSubview onPress={handlePhoneCall}>
          <TouchableOpacity
            style={{
              backgroundColor: "#4CE5B1",
              borderRadius: 20,
              width: 40,
              height: 40,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FontAwesome6 name="phone" size={20} color="white" />
          </TouchableOpacity>
          </CalloutSubview>
        </View>
        <View
          style={{
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text numberOfLines={2} style={{ textAlign: "center", fontWeight: "bold" }}>
            {pharmacy.pharmacyName}
          </Text>
          <Text numberOfLines={4} style={{ textAlign: "center",width:220 }}>
            {pharmacy.address}, {pharmacy.city}, {pharmacy.district}
          </Text>
        </View>
      </View>
    </Callout>
  );
};

export default CustomCallout;
