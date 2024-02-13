import React from "react";
import { View, Text, Button } from "react-native";

const ModalScreen = ({ navigation }) => {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ fontSize: 24 }}>Bu bir modal ekranıdır</Text>
      <Button title="Kapat" onPress={() => navigation.goBack()} />
    </View>
  );
};

export default ModalScreen;
