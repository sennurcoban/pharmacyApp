// bottomnavbar butona dönüştürüldüğü için bu sayfa hiçbir yerde kullanılmadı

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Platform,
  Image,
  Dimensions,
} from "react-native";
import * as Location from "expo-location";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Dropdown } from "react-native-element-dropdown";
import BottomSheet from "@gorhom/bottom-sheet";
import MapView, { Marker, PROVIDER_GOOGLE, Circle } from "react-native-maps";
import axios from "axios";
import CustomCallout from "../components/CustomCallout";
import marker_icon from "../../assets/ic_Pin_big.png";

const { width, height } = Dimensions.get("window");
// Eczaneleri kart şekline dnüştürürsem eğer
const CARD_HEIGHT = height / 4;
const CARD_WIDTH = CARD_HEIGHT -50;

const Tab = createBottomTabNavigator();

const SearchScreen = () => {
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedCityId, setSelectedCityId] = useState("");
  const [selectedDistrictId, setSelectedDistrictId] = useState("");
  const [pharmacyData, setPharmacyData] = useState([]);
  const [location, setLocation] = useState("");
  const [errorMsg, setErrorMsg] = useState(null);
  const [isCityFocus, setIsCityFocus] = useState(false);
  const [isDistrictFocus, setIsDistrictFocus] = useState(false);
  const [region, setRegion] = useState(null);
  const [selectedMarker, setSelectedMarker] = useState(null);

  useEffect(() => {
    // Şehirleri getir
    const fetchCities = async () => {
      try {
        const response = await axios.get(
          "https://eczaneapi.intimeinfo.net/api/Eczane/GetCities"
        );
        const cityData = response.data.data.map((city) => ({
          id: city.id,
          label: city.ad,
        }));
        setCities(cityData);
      } catch (error) {
        console.error("Hata:", error.message);
      }
    };
    fetchCities();
  }, []);

  // Konumu getir
  useEffect(() => {
    const getLocation = async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setErrorMsg("Konum izni verilmedi");
          return;
        }

        let lastLocation = await Location.getLastKnownPositionAsync();
        if (lastLocation) {
          setLocation(lastLocation);
          // return;
        } else {
          let location = await Location.getCurrentPositionAsync();
          return setLocation(location);
        }

        //dropdownda konumun seçili olarak gelmesi için kullandım ama çalışmadı
        const { latitude, longitude } = lastLocation.coords;
        const addressInfo = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });
        const city = addressInfo[0].city;
        const district = addressInfo[0].district;
        // Belirlenen il ve ilçeyi seçili olarak kaydettik
        // console.log("Seçilen Şehir: ", selectedCity);
        setSelectedCityId(city);
        setSelectedDistrictId(district);
      } catch (error) {
        console.error("Konum alınamadı:", error.message);
      }
    };

    getLocation();
  }, []);

  // Konum değiştiğinde harita bölgesini güncelle
  useEffect(() => {
    if (location.coords) {
      const { latitude, longitude } = location.coords;
      const initialRegion = {
        latitude,
        longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
      setRegion(initialRegion);
    }
  }, [location]);

  // Eczaneler verisi değiştiğinde harita bölgesini güncelle
  useEffect(() => {
    if (pharmacyData.length > 0) {
      const initialLocation = pharmacyData[0];
      const newRegion = {
        latitude: initialLocation.latitude,
        longitude: initialLocation.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
      setRegion(newRegion);
    }
  }, [pharmacyData]);

  // Şehir seçildiğinde ilçeleri getir
  const handleCitySelect = async (selectedCity) => {
    if (selectedCity) {
      setSelectedCityId(selectedCity.id);
      fetchDistricts(selectedCity.id);
    }
  };

  // İlçe seçildiğinde
  const handleDistrictSelect = (selectedDistrict) => {
    setSelectedDistrict(selectedDistrict.label);
    setSelectedDistrictId(selectedDistrict.id);
  };

  // Filtreleri temizle
  const handleClearFilters = () => {
    setDistricts([]);
    setSelectedCityId("");
    setSelectedDistrictId("");
    setPharmacyData([]);
  };

  // Ara
  const handleSearch = async () => {
    try {
      if (!selectedCityId) {
        alert("Şehir seçimi yapılmamış.");
        return;
      }

      if (!selectedDistrictId) {
        alert("İlçe seçimi yapılmamış.");
        return;
      }

      const cityName = selectedCity;
      const districtName = selectedDistrict;

      const response = await axios.get(
        `https://eczaneapi.intimeinfo.net/api/Eczane/GetPharmacyInformation?CitiesName=${encodeURIComponent(
          cityName
        )}&DistrictName=${encodeURIComponent(districtName)}`
      );

      const responseData = response.data.data;

      if (responseData.length === 0) {
        alert("Seçilen bilgilere ait sonuç bulunamamıştır.");
        // console.log("Seçilen bilgilere ait sonuç bulunamamıştır.");
      } else {
        setPharmacyData(responseData);
      }
    } catch (error) {
      console.error("Hata:", error.message);
      setPharmacyData([]);
    }
  };

  // İlçe değiştiğinde ilçelere göre eczaneleri getir
  const fetchDistricts = async (cityId) => {
    try {
      const response = await axios.get(
        `https://eczaneapi.intimeinfo.net/api/Eczane/GetDistrinct?CitiesId=${cityId}`
      );
      const districtData = response.data.data.map((district) => ({
        id: district.id,
        label: district.ad,
      }));
      setDistricts(districtData);
    } catch (error) {
      console.error("Hata:", error.message);
    }
  };

  // Marker'a tıklama işlemi
  const handleMarkerPress = (pharmacy) => {
    setSelectedMarker(pharmacy);
  };

  // Marker'ın açıklama kısmına tıklama işlemi
  const handleOpenInMaps = (latitude, longitude) => {
    const latLng = `${latitude},${longitude}`;
    let url = "";

    // iOS için
    if (Platform.OS === "ios") {
      url = `http://maps.apple.com/?q=${latLng}`;
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

  return (
    <>
      <View style={styles.container}>
        <MapView
          showsUserLocation
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          region={region}
        >
          {pharmacyData &&
            pharmacyData.map((pharmacy) => (
              <Marker
                key={pharmacy.id}
                coordinate={{
                  latitude: pharmacy.latitude,
                  longitude: pharmacy.longitude,
                }}
                title={pharmacy.pharmacyName}
                description={`${pharmacy.address}, ${pharmacy.city}, ${pharmacy.district}`}
                onCalloutPress={() =>
                  handleOpenInMaps(pharmacy.latitude, pharmacy.longitude)
                }
                image={marker_icon}
              >
                {/* <Circle
                  center={{
                    latitude: pharmacy.latitude,
                    longitude: pharmacy.longitude,
                  }}
                  radius={60000}
                  strokeColor="#cc0000"
                  fillColor="#cc0"
                /> */}
                {Platform.OS === "ios" ? (
                  <CustomCallout
                    pharmacy={pharmacy}
                    handleOpenInMaps={() =>
                      handleOpenInMaps(pharmacy.latitude, pharmacy.longitude)
                    }
                  />
                ) : null}
              </Marker>
            ))}
        </MapView>
      </View>
      <BottomSheet snapPoints={["45%", "53%", "70%", "100"]}>
        <View>
          <Dropdown
            style={[styles.dropdown, isCityFocus && { borderColor: "blue" }]}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            inputSearchStyle={styles.inputSearchStyle}
            iconStyle={styles.iconStyle}
            data={cities}
            search
            maxHeight={300}
            labelField="label"
            valueField="id"
            placeholder={!isCityFocus ? "Şehir" : "..."}
            searchPlaceholder="Ara..."
            value={selectedCityId}
            onFocus={() => setIsCityFocus(true)}
            onBlur={() => setIsCityFocus(false)}
            onChange={(selectedCity) => handleCitySelect(selectedCity)}
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
            valueField="id"
            placeholder={!isDistrictFocus ? "İlçe " : "..."}
            searchPlaceholder="Ara..."
            value={selectedDistrictId}
            onFocus={() => setIsDistrictFocus(true)}
            onBlur={() => setIsDistrictFocus(false)}
            onChange={(selectedDistrict) =>
              handleDistrictSelect(selectedDistrict)
            }
          />
          <TouchableOpacity onPress={handleClearFilters}>
            <Text style={[styles.text, { fontSize: 14, fontWeight: "300" }]}>
              Filtreleri Temizle
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSearch} style={styles.button}>
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

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  placeholderStyle: {
    fontWeight: "200",
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
  button: {
    backgroundColor: "#EE091B",
    padding: 15,
    margin: 10,
    borderRadius: 10,
  },
});

export default SearchScreen;
