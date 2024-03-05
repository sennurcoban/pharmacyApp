import { FontAwesome6, Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Platform,
} from "react-native";
import ActionSheet from "react-native-actionsheet";

const AllPharmaciesScreen = ({ item }) => {
  const [pharmacies, setPharmacies] = useState([]);
  const actionSheetRef = useRef(null);
  const optionArray = Platform.select({
    ios: ["Apple Haritalar", "Google Haritalar", "İptal"],
    android: ["Google Haritalar", "İptal"],
  });

  useEffect(() => {
    fetchPharmacies();
  }, []);

  const showActionSheet = () => {
    actionSheetRef.current?.show();
  };

  const fetchPharmacies = async () => {
    try {
      const response = await fetch(
        "https://eczaneapi.intimeinfo.net/api/Eczane/GetPharmacyInformation"
      );
      const data = await response.json();

      // console.log(data)
      if (data.isSuccess) {
        setPharmacies(data.data);
      } else {
        console.error("API Error:", data.errorMessage);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
    }
  };

  const handleOpenInMaps = (latitude, longitude) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    Linking.openURL(url);
  };

  const handleCallPharmacy = (phoneNumber) => {
    const url = `tel:${phoneNumber}`;
    Linking.openURL(url);
  };

  const openInAppleMaps = (latitude, longitude) => {
    const latLng = `${latitude},${longitude}`;
    let url = "";
    // iOS için
    if (Platform.OS === "ios") {
      url = `http://maps.apple.com/?ll=${latLng}`;
    }
    // Android için
    else if (Platform.OS === "android") {
      url = `http://maps.google.com/?q=${latLng}`;
    }

    // URL'yi aç
    Linking.openURL(url).catch((err) =>
      console.error("Haritaları açarken hata oluştu:", err)
    );
  };

  const renderPharmacyItem = ({ item }) => (
    <View
      style={{
        paddingVertical: 30,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <View style={{ flexDirection: "column", width: 200 }}>
        <Text style={{ fontWeight: "bold" }}>{item.pharmacyName}</Text>
        <Text>{item.address}</Text>
      </View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          width: 90,
        }}
      >
        <TouchableOpacity
          // onPress={() => handleOpenInMaps(item.latitude, item.longitude)}
          onPress={showActionSheet}
          style={{
            backgroundColor: "red",
            padding: 7,
            borderRadius: 20,
            width: 40,
            height: 40,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="location-sharp" size={24} color="white" />
        </TouchableOpacity>
        <ActionSheet
          ref={actionSheetRef}
          title="Harita Seçiniz"
          options={optionArray}
          cancelButtonIndex={optionArray.length - 1}
          onPress={(index) => {
            const selectedOption = optionArray[index];
            if (selectedOption === "Apple Haritalar" && Platform.OS === "ios") {
              openInAppleMaps(item.latitude, item.longitude)
              // Apple Haritalar'a yönlendirme yap
              // Örnek URL: 'http://maps.apple.com/?q=latitude,longitude'
            } else if (selectedOption === "Google Haritalar") {
              handleOpenInMaps(item.latitude, item.longitude)
              // Google Haritalar'a yönlendirme yap
              // Örnek URL: 'https://www.google.com/maps/search/?api=1&query=latitude,longitude'
            } else if (selectedOption === "İptal") {
              // İşlemi iptal et
            } else {
              // Geçersiz seçenek
              Alert.alert("Hata", "Geçersiz seçenek");
            }
          }}
        />
        <TouchableOpacity
          onPress={() => handleCallPharmacy(item.phone)}
          style={{
            backgroundColor: "#4CE5B1",
            padding: 7,
            borderRadius: 20,
            width: 40,
            height: 40,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <FontAwesome6 name="phone" size={18} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.pharmacies}>
        <TouchableOpacity style={styles.allPharmacies}>
          <Text style={{ color: "white" }}>Bütün Eczaneler</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.nightPharmacies}>
          <Text style={{ color: "red" }}>Nöbetçi Eczaneler</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={pharmacies}
        renderItem={renderPharmacyItem}
        keyExtractor={(item) => item.id.toString()}
        scrollEventThrottle={16}
      />
    </View>
  );
};

export default AllPharmaciesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 15,
    marginTop: 30,
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
