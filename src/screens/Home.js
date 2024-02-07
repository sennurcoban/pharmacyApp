import { Pressable, StyleSheet, Text, View } from "react-native";
import React from "react";
import PharmacyListItem from "../components/PharmacyListItem";

const Home = ({ navigation }) => {
  const handlePress = (id) => {
    navigation.navigate("Details", { pharmacyId: id });
  };
  return <PharmacyListItem onPress={handlePress} />;
};

export default Home;

const styles = StyleSheet.create({});
