import React, { useMemo, useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import * as Location from "expo-location";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Dropdown } from "react-native-element-dropdown";
import BottomSheet from "@gorhom/bottom-sheet";
import MapView from "react-native-maps";
import axios from "axios";
// import { GestureHandlerRootView } from 'react-native-gesture-handler'

const Tab = createBottomTabNavigator();

const SearchScreen = () => {
  const snapPoints = useMemo(() => ["50%", "53%", "70%", "100"]);
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [isCityFocus, setIsCityFocus] = useState(false);
  const [cities, setCities] = useState([]);
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isDistrictFocus, setIsDistrictFocus] = useState(false);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await axios.get(
          "https://eczaneapi.intimeinfo.net/api/Eczane/GetCities",
          {
            headers: {
              authorization: "apikey ",
              "content-type": "application/json",
            },
          }
        );
        const cityNames = response.data.data.map((item) => item.ad);
        setCities(cityNames);
      } catch (error) {
        console.error("Hata:", error.message);
      }
    };
    fetchCities();
  }, []);

  // İlk dropdown'dan bir şehir seçildiğinde çalışacak olan fonksiyon
const handleCitySelect = (cityId) => {
  // Seçilen şehrin ID'si ile ilgili ilçelerin bulunduğu veriyi alın
  const selectedCity = cities.find(city => city.id === cityId);
  if (selectedCity) {
    // İlçeleri güncelleyin
    setDistricts(selectedCity.districts);
  }
};

// İkinci dropdown'da bir ilçe seçildiğinde çalışacak olan fonksiyon
const handleDistrictSelect = (districtId) => {
  // Seçilen ilçenin ID'si ile ilgili işlemleri yapabilirsiniz
  console.log("dönenn id",districtId);
};

  const renderLabel = () => {
    if (value || isFocus) {
      return <View style={[styles.label, isFocus && { color: "blue" }]}></View>;
    }
    return null;
  };

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Konum izni verilmedi");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
  }, []);

  // useEffect(() => {
  //   fetchCities();
  // }, []);

  // const fetchCities = async () => {
  //   try {
  //     const response = await axios.get(
  //       "https://eczaneapi.intimeinfo.net/api/Eczane/GetCities"
  //     );
  //     // const cityData = response.data.data.map((item) => item.ad);
  //     // const data = await response.json();
  //     console.log(response.data);
  //     if (response.data?.isSuccess) {
  //       setCities(response.data?.data.ad);
  //     } else {
  //       console.error("API Error:", response.data);
  //     }
  //   } catch (error) {
  //     console.error("Fetch Error:", error);
  //   }
  // };

  // useEffect(() => {
  //   const fetchDistricts = async () => {
  //     try {
  //       const response = await axios.get(
  //         "https://eczaneapi.intimeinfo.net/api/Eczane/GetCities",
  //         {
  //           params: {
  //             id: selectedDistrict,
  //           },
  //         }
  //       );
  //       const cityData = response.data.data.map((item) => item.ad);
  //       console.log("RESPONSE", cityData);
  //       setCities(cityData);
  //     } catch (error) {
  //       console.error("Error fetching data: ", error);
  //     }
  //   };

  //   if (selectedDistrict) {
  //     fetchDistricts();
  //   }
  // }, [selectedDistrict]);

  return (
    <>
      <View style={styles.container}>
        <MapView style={styles.map}>
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
      <BottomSheet snapPoints={snapPoints}>
        <View>
          <Text style={styles.text}>Filtrele</Text>
          <Dropdown
            style={[styles.dropdown, isCityFocus && { borderColor: "blue" }]}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            inputSearchStyle={styles.inputSearchStyle}
            iconStyle={styles.iconStyle}
            data={cities.map((city) => ({ label: city, value: city }))}
            search
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder={!isCityFocus ? "Şehir Seçiniz" : "..."}
            searchPlaceholder="Search..."
            value={selectedCity}
            onFocus={() => setIsCityFocus(true)}
            onBlur={() => setIsCityFocus(false)}
            onChange={(selectedCity) => handleCitySelect(selectedCity.id)}
          />
          <Dropdown
            style={[
              styles.dropdown,
              isDistrictFocus && { borderColor: "blue" },
            ]}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            inputSearchStyle={styles.inputSearchStyle}
            iconStyle={styles.iconStyle}
            data={districts}
            search
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder={!isDistrictFocus ? "İlçe Seçiniz" : "..."}
            searchPlaceholder="Search..."
            value={selectedDistrict}
            onFocus={() => setIsDistrictFocus(true)}
            onBlur={() => setIsDistrictFocus(false)}
            onChange={(selectedDistrict) => handleDistrictSelect(selectedDistrict.id)}
          />
          <TouchableOpacity>
            <Text style={[styles.text, { fontSize: 14, fontWeight: "300" }]}>
              Filtreleri Temizle
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button}>
            <Text
              style={[
                styles.text,
                {
                  fontSize: 14,
                  fontWeight: "700",
                  alignSelf: "center",
                  color: "#FFFFFF",
                },
              ]}
            >
              Ara
            </Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>
    </>
  );
};

export default SearchScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  placeholderStyle: {
    fontWeight: "200",
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
  dropdown: {
    height: 50,
    borderColor: "gray",
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
    margin: 10,
  },
  text: {
    fontSize: 20,
    paddingHorizontal: 10,
    fontWeight: "400",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  closeModalButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "red",
    borderRadius: 5,
  },
  button: {
    backgroundColor: "#EE091B",
    padding: 15,
    margin: 10,
    borderRadius: 10,
  },
});
