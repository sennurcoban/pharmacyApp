import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Dropdown } from "react-native-element-dropdown";
import BottomSheet from "@gorhom/bottom-sheet";
import MapView from "react-native-maps";
// import BottomSheet from '@gorhom/bottom-sheet';
// import { GestureHandlerRootView } from 'react-native-gesture-handler'

const Tab = createBottomTabNavigator();

const SearchScreen = () => {
  const snapPoints = useMemo(() => ["50%", "50%", "70%", "100"]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [isCityFocus, setIsCityFocus] = useState(false);
  const [cities, setCities] = useState([]);

  // useEffect(() => {
  //   const fetchCities = async () => {
  //     try {
  //       const response = await axios.get('https://www.openstreetmap.org/export#map=17/41.07872/28.23803', {
  //         headers: {
  //           'content-type': 'application/json'
  //         }
  //       });
  //       const cityNames = response.data.result.map(item => item.name);
  //       setCities(cityNames);
  //     } catch (error) {
  //       console.error('Hata:', error.message);
  //     }
  //   };
  //   fetchCities();
  // }, []);

  // useEffect(() => {
  //   (async () => {
  //     let { status } = await Location.requestForegroundPermissionsAsync();
  //     if (status !== "granted") {
  //       setErrorMsg("Konum izni verilmedi");
  //       return;
  //     }

  //     let location = await Location.getCurrentPositionAsync({});
  //     setLocation(location);
  //   })();
  // }, []);

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
              data={cities.map((city) => ({ label: city, value: city }))} // Şehirleri Dropdown'a geçir
              search
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder={!isCityFocus ? "Şehir Seçiniz" : "..."}
              searchPlaceholder="Search..."
              value={selectedCity}
              onFocus={() => setIsCityFocus(true)}
              onBlur={() => setIsCityFocus(false)}
              onChange={(item) => {
                setSelectedCity(item.value);
                setIsCityFocus(false);
              }}
            />
            <Text style={[styles.text, { fontSize: 13 }]}>
              Filtreleri Temizle
            </Text>
          </View>
        </BottomSheet>
      {/* <BottomSheet
        index={0}
        snapPoints={['25%', '50%', '75%']}
        isVisible={isVisible}
        onClose={toggleBottomSheet}
      >
        <View style={{ height: 200, backgroundColor: 'white' }}>
          <Text>Bottom Sheet Content</Text>
        </View>
      </BottomSheet> */}
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
    position: "absolute", // Harita bileşeni pozisyonu ayarlanıyor
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
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
});
