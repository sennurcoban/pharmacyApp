import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
} from "react-native";
import { FontAwesome6, Ionicons } from "@expo/vector-icons";

const CustomMarkerCallout = ({ pharmacy, onPressDirection, onClickPhone }) => {
  const handleDirection = () => {
    onPressDirection(pharmacy);
  };
  const handlePhoneCall = () => {
    onClickPhone(pharmacy);
  };
  return (
    <TouchableWithoutFeedback>
    <View key={pharmacy.id} style={styles.container}>
      <View
        style={{
          width: Dimensions.get("window").width * 0.7,
          flexDirection: "row",
        }}
      >
        <View
          style={{
            flexDirection: "column",
            margin: 5,
          }}
        >
          <TouchableOpacity
            onPress={handleDirection}
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

          <TouchableOpacity
            onClickPhone={handlePhoneCall}
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
        </View>
        <View
          style={{
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={styles.title}>{pharmacy.pharmacyName}</Text>
          <Text>{`${pharmacy.address}, ${pharmacy.city}, ${pharmacy.district}`}</Text>
        </View>
      </View>
    </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    borderRadius: 10,
    width: Dimensions.get("window").width * 0.75,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  button: {
    marginTop: 5,
    backgroundColor: "blue",
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
  },
});

export default CustomMarkerCallout;
