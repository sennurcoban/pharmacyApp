import React, { useMemo, useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Linking } from "react-native";
import * as Location from "expo-location";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Dropdown } from "react-native-element-dropdown";
import BottomSheet from "@gorhom/bottom-sheet";
import MapView, { Marker, PROVIDER_GOOGLE, Callout } from "react-native-maps";
import axios from "axios";

const Tab = createBottomTabNavigator();

const SearchScreen = () => {
  const snapPoints = useMemo(() => ["45%", "53%", "70%", "100"], []);
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedCityId, setSelectedCityId] = useState("");
  const [selectedDistrictId, setSelectedDistrictId] = useState("");
  const [pharmacyData, setPharmacyData] = useState([]);
  const [location, setLocation] = useState({});
  const [errorMsg, setErrorMsg] = useState(null);
  const [isCityFocus, setIsCityFocus] = useState(false);
  const [isDistrictFocus, setIsDistrictFocus] = useState(false);
  const [region, setRegion] = useState(null);
  const [selectedMarker, setSelectedMarker] = useState(null);

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

  useEffect(() => {
    const getLocation = async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setErrorMsg("Konum izni verilmedi");
          return;
        }

        let locationData = await Location.getCurrentPositionAsync({});
        setLocation(locationData);

        //dropdownda konumun seçili olarak gelmesi için kullandım ama çalışmadı
        const { latitude, longitude } = locationData.coords;
        const addressInfo = await Location.reverseGeocodeAsync({ latitude, longitude });
        const city = addressInfo[0].city;
        const district = addressInfo[0].district;
        // Belirlenen il ve ilçeyi seçili olarak kaydettik
        setSelectedCityId(city);
        setSelectedDistrictId(district);


      } catch (error) {
        console.error("Konum alınamadı:", error.message);
      }
    };

    getLocation();
  }, []);

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

  useEffect(() => {
    if (pharmacyData.length > 0) {
      // Marker'ların bulunduğu ilk konum olarak ilk eczanenin konumunu kullandık
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

  //İlk dropdown'dan bir şehir seçildiğinde
  const handleCitySelect = (selectedCity) => {
    if (selectedCity) {
      console.log("selectedCity: ", selectedCity.label)

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
  const handleDistrictSelect = (selectedDistrict) => {
    setSelectedDistrict(selectedDistrict.label);//bunu ekledikten sonra calisti
    console.log("selectedDistrict: ", selectedDistrict.label)

    setSelectedDistrictId(selectedDistrict.id);
    console.log("dönenn id", selectedDistrict.id);
  };

  const handleClearFilters = () => {
    setSelectedCity(null);
    setSelectedDistrict(null);
    setDistricts([]);
    setSelectedCityId(null);
    setSelectedDistrictId(null);
    setIsCityFocus(false); 
    setIsDistrictFocus(false);
  };

  const handleSearch = async () => {
    try {
      if (!selectedCityId || !selectedDistrictId) {
        console.error("Şehir veya ilçe seçimi yapılmamış.");
        return;
      }

      const cityName = selectedCity; 
      const districtName = selectedDistrict;

      const response = await axios.get(
        `https://eczaneapi.intimeinfo.net/api/Eczane/GetPharmacyInformation?CitiesName=${encodeURIComponent(cityName)}&DistrictName=${encodeURIComponent(districtName)}`
      );
      setPharmacyData(response.data.data);

      // console.log(response.data);
    } catch (error) {
      console.error("Hata:", error.message);
    }
  };

  const handleMarkerPress = (pharmacy) => {
    setSelectedMarker(pharmacy); // Seçilen Marker'ın bilgilerini saklamak için
  };

  const handleCalloutPress = () => {
    if (selectedMarker) {
      const { latitude, longitude } = selectedMarker;
  
      // Google Maps URL'i oluştur
      const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
      // Apple Maps URL'i oluştur
      const appleMapsUrl = `http://maps.apple.com/?q=${latitude},${longitude}`;
  
      // Linki aç
      Linking.openURL(googleMapsUrl).catch(() => {
        // Eğer Google Maps açılamazsa, Apple Maps'i aç
        Linking.openURL(appleMapsUrl).catch(() => {
          console.log('Harita uygulaması açılamıyor');
        });
      });
    }
  };
  
  

  return (
    <>
      <View style={styles.container}>
        <MapView showsUserLocation style={styles.map} provider={PROVIDER_GOOGLE} region={region}>
          {pharmacyData.map((pharmacy) => (
            <Marker
              key={pharmacy.id}
              coordinate={{
                latitude: pharmacy.latitude,
                longitude: pharmacy.longitude,
              }}
              title={pharmacy.pharmacyName}
              // description={`${pharmacy.address}, ${pharmacy.city}, ${pharmacy.district}`}
              onPress={() => handleMarkerPress(pharmacy)}
            >
              <Callout onPress={() => handleCalloutPress(pharmacy)}>
                <View>
                  <TouchableOpacity
                  >
                    <Text>{`${pharmacy.address}, ${pharmacy.city}, ${pharmacy.district}`}</Text>
                  </TouchableOpacity>
                </View>
              </Callout>
            </Marker>
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
          <TouchableOpacity
            onPress={handleSearch}
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
    flex: 1,
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
