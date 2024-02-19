import React, { useMemo, useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import * as Location from "expo-location";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Dropdown } from "react-native-element-dropdown";
import BottomSheet from "@gorhom/bottom-sheet";
import MapView, { Marker } from "react-native-maps";
import axios from "axios";

const Tab = createBottomTabNavigator();

const SearchScreen = () => {
  const snapPoints = useMemo(() => ["60%", "53%", "70%", "100"]);
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [isCityFocus, setIsCityFocus] = useState(false);
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [selectedCityId, setSelectedCityId] = useState(null);
  const [location, setLocation] = useState({});
  const [errorMsg, setErrorMsg] = useState(null);
  const [isDistrictFocus, setIsDistrictFocus] = useState(false);
  const [response, setResponse] = useState(null);

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
        setCities(cityData);
      } catch (error) {
        console.error("Hata:", error.message);
      }
    };
    fetchCities();
  }, []);

  //İlk dropdown'dan bir şehir seçildiğinde çalışacak olan fonksiyon
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

  // İkinci dropdown'da bir ilçe seçildiğinde çalışacak olan fonksiyon
  const handleDistrictSelect = (districtId) => {
    setSelectedDistrict(districtId);
    console.log("dönenn id", districtId);
  };

  // arama butonunda seçim yapıldıktan sonra çalışacak kod
  // const handleSearchButton = async (selectedCity, selectedDistrict) => {
  //   if (selectedCity && selectedDistrict) {
  //     console.log("Seçilen şehir:", selectedCity.city);
  //     console.log("Seçilen ilçe:", selectedDistrict.district);

  //     try {
  //       const response = await axios.get(
  //         `https://eczaneapi.intimeinfo.net/api/Eczane/GetPharmacyInformation?CitiesName=${selectedCity}&DistrictName=${selectedDistrict}`
  //       );

  //       console.log("Arama Sonucu:", response.data);
  //     } catch (error) {
  //       console.error("Hata:", error.message);
  //     }
  //   } else {
  //     console.error("Şehir ve ilçe seçilmedi!");
  //   }
  // };

  // const fetchSearchButton = async (selectedCity, selectedDistrict) => {
  //   try {
  //     const response = await axios.get(
  //       `https://eczaneapi.intimeinfo.net/api/Eczane/GetPharmacyInformation?CitiesName=${selectedCity}&DistrictName=${selectedDistrict}`
  //     );
  //     const districtData = response.data.data.map((district) => ({
  //       id: district.id,
  //       label: district.ad,
  //     }));
  //     setDistricts(districtData);
  //   } catch (error) {
  //     console.error("Hata:", error.message);
  //   }
  // };

  //null istek atma denemesi
  const searchButton = async () => {
    try {
      const response = await axios.get(
        `https://eczaneapi.intimeinfo.net/api/Eczane/GetPharmacyInformation`
      );
      setResponse(response);
      // const districtData = response.data.data.map((district) => ({
      //   id: district.id,
      //   label: district.ad,
      // }));
      // setDistricts(districtData);
    } catch (error) {
      console.error("Hata:", error.message);
    }
  };

  const handleClearFilters = () => {
    setSelectedCity(null);
    setSelectedDistrict(null);
    setDistricts([]);
    setSelectedCityId(null);
    setIsCityFocus(false); // Şehir dropdown'unun odaklanma durumunu sıfırla
    setIsDistrictFocus(false); // İlçe dropdown'unun odaklanma durumunu sıfırla
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          console.error("Permission to access location was denied");
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;
        const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`;
        const response = await axios.get(url);
        const city = response.data.address.province;
        const district = response.data.address.town;
        console.log(response.data.lat);
        console.log(response.data.lon);
        console.log(city);
        console.log(district);

        // Şehir ve ilçe bilgilerini güncelle
        setCities([city]); // sadece seçilen şehri güncelle
        setSelectedDistrict(district);

        // Şehir ve ilçe bilgilerini kullanarak ilgili ilçeleri al
        // fetchDistricts(selectedCityId);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, [selectedCity, selectedDistrict]);

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

  return (
    <>
      <View style={styles.container}>
        <MapView style={{ flex: 1 }}>
          {response &&
            response.data &&
            response.data.data.map((pharmacy) => (
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
          <Text style={styles.text}>Filtrele</Text>
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
            value={selectedCity && selectedCity.label}
            onFocus={() => setIsCityFocus(true)}
            onBlur={() => setIsCityFocus(false)}
            onChange={(selectedCity) => handleCitySelect(selectedCity)}
          />
          {/* <Dropdown
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
            // onChange={(selectedDistrict) =>
            //   handleDistrictSelect(selectedDistrict)
            // }
          /> */}
          <TouchableOpacity onPress={handleClearFilters}>
            <Text style={[styles.text, { fontSize: 14, fontWeight: "300" }]}>
              Filtreleri Temizle
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={searchButton} style={styles.button}>
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

