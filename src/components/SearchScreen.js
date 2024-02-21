import React, { useMemo, useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import * as Location from "expo-location";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Dropdown } from "react-native-element-dropdown";
import BottomSheet from "@gorhom/bottom-sheet";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import axios from "axios";

const Tab = createBottomTabNavigator();

const SearchScreen = ({navigation}) => {

  useEffect(() => {
    navigation.getParent()?.setOptions({
      tabBarStyle: {
        display: "none"
      }
    });
    return () => navigation.getParent()?.setOptions({
      tabBarStyle: undefined
    });
  }, [navigation]);

  const snapPoints = useMemo(() => ["45%", "53%", "70%", "100"]);
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [isCityFocus, setIsCityFocus] = useState(false);
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [selectedCityId, setSelectedCityId] = useState(null);
  const [location, setLocation] = useState({});
  const [errorMsg, setErrorMsg] = useState(null);
  const [isDistrictFocus, setIsDistrictFocus] = useState(false);
  const [getPharmacies, setGetPharmacies] = useState({});
  const [markers, setMarkers] = useState([]);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await axios.get(
          "https://eczaneapi.intimeinfo.net/api/Eczane/GetCities"
        );
        const cityData = response.data.data.map((city) => ({
          id: city.id,
          label: city.ad,
        }));
        setSelectedCity(cityData);
      } catch (error) {
        console.error("Hata:", error.message);
      }
    };
    fetchCities();
  }, []);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Konum izni verilmedi");
        return;
      }

      let locationData = await Location.getCurrentPositionAsync({});
      setLocation(locationData);
    })();
  }, []);

  //İlk dropdown'dan bir şehir seçildiğinde
  const handleCitySelect = (selectedCity) => {
    if (selectedCity) {
      setSelectedCityId(selectedCity.id);
      console.log("Seçilen şehrin ID'si:", selectedCity.id);
      // İkinci dropdown için ilgili şehrin ilçelerini almak için axios isteği
      fetchDistricts(selectedCity.id);
    }
  };

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

  // İkinci dropdown'da bir ilçe seçildiğinde
  const handleDistrictSelect = (districtId) => {
    setSelectedDistrict(districtId);
    console.log("dönenn id", districtId);
  };

  // const handleClearFilters = () => {
  //   setSelectedCity(null);
  //   setSelectedDistrict(null);
  //   setDistricts([]);
  //   setSelectedCityId(null);
  //   setIsCityFocus(false); // Şehir dropdown'unun odaklanma durumunu sıfırla
  //   setIsDistrictFocus(false); // İlçe dropdown'unun odaklanma durumunu sıfırla
  // };

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const { status } = await Location.requestForegroundPermissionsAsync();
  //       if (status !== "granted") {
  //         console.error("Permission to access location was denied");
  //         return;
  //       }

  //       const location = await Location.getCurrentPositionAsync({});
  //       const { latitude, longitude } = location.coords;
  //       const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`;
  //       const response = await axios.get(url);
  //       const city = response.data.address.province;
  //       const district = response.data.address.town;

  //       // Şehir ve ilçe bilgilerini güncelle
  //       setCities([{ label: city, value: city }]); // sadece seçilen şehri güncelle
  //       setDistricts([{ label: district, value: district }]); // sadece seçilen ilçeyi güncelle
  //       // setCities([city]); // sadece seçilen şehri güncelle
  //       fetchPharmacies(city, district);
  //       // setDistricts(district);
  //     } catch (error) {
  //       console.error(error);
  //     }
  //   };
  //   fetchData();
  // }, []);

  const fetchPharmacies = async (selectedCity, selectedDistrict) => {
    console.log("seçilen şehir", selectedCity);
    console.log("seçilen ilçe", selectedDistrict);

    try {
      if (!selectedCity || !selectedDistrict) {
        // Boş olup olmadığını kontrol ederken doğru ifadeyi kullanın
        console.error("Şehir veya ilçe seçilmedi.");
        return;
      }

      const response = await axios.get(
        `https://eczaneapi.intimeinfo.net/api/Eczane/GetPharmacyInformation?CitiesName=${encodeURIComponent(
          selectedCity
        )}&DistrictName=${encodeURIComponent(selectedDistrict)}`
      );
      const pharmacyData = response.data;

      if (pharmacyData && pharmacyData.data) {
        const pharmacies = pharmacyData.data.map((pharmacy) => ({
          id: pharmacy.id,
          latitude: pharmacy.latitude,
          longitude: pharmacy.longitude,
          pharmacyName: pharmacy.pharmacyName,
          address: pharmacy.address,
          city: pharmacy.city,
          district: pharmacy.district,
        }));
        setSelectedCity(pharmacies);
        // setGetPharmacies(pharmacies);
        setMarkers(pharmacies); // Markers state'ini güncelle, haritada marker'ları göstermek için
      } else {
        console.error("Hata: Veri alınamadı veya geçersiz.");
      }
    } catch (error) {
      console.error("Hata:", error.message);
    }
  };

  useEffect(() => {
    if (selectedCity && selectedDistrict) {
      fetchPharmacies(selectedCity, selectedDistrict);
    }
  }, [selectedCity, selectedDistrict]);

  return (
    <>
      <View style={styles.container}>
        <MapView style={styles.map} provider={PROVIDER_GOOGLE}>
          {markers.map((pharmacy) => (
            <Marker
              key={pharmacy.id}
              coordinate={{
                latitude: pharmacy.latitude,
                longitude: pharmacy.longitude,
              }}
              title={pharmacy.pharmacyName}
              description={`${pharmacy.address}, ${pharmacy.city}, ${pharmacy.district}`}
            />
          ))}
        </MapView>

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
            value={selectedDistrict}
            onFocus={() => setIsDistrictFocus(true)}
            onBlur={() => setIsDistrictFocus(false)}
            onChange={(selectedDistrict) =>
              handleDistrictSelect(selectedDistrict)
            }
          />
          {/* <TouchableOpacity onPress={handleClearFilters}>
            <Text style={[styles.text, { fontSize: 14, fontWeight: "300" }]}>
              Filtreleri Temizle
            </Text>
          </TouchableOpacity> */}
          <TouchableOpacity
            onPress={() => fetchPharmacies(selectedCity, selectedDistrict)}
            style={styles.button}
          >
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
    ...StyleSheet.absoluteFillObject,
    flex:1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
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
