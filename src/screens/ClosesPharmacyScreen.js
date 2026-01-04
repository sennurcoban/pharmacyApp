import React, { useEffect, useState, useRef, useMemo } from "react";
import {
  StyleSheet,
  View,
  Platform,
  Linking,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  Alert,
} from "react-native";
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome,
} from "@expo/vector-icons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { Dropdown } from "react-native-element-dropdown";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import marker_icon from "../../assets/ic_Pin.png";
import marker_blue_icon from "../../assets/marker.png";
import axios from "axios";
import { useActionSheet } from "@expo/react-native-action-sheet";
import CustomCallout from "../components/CustomCallout";
import PharmacyCard from "../components/PharmacyCard";
import API from "../api/Enpoints";

const { width, height } = Dimensions.get("window");
const CARD_HEIGHT = 200;
const CARD_WIDTH = width * 0.8;
const SPACING_FOR_CARD_INSET = width * 0.1 - 10;

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
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
  tabbar: {
    flexDirection: "row",
    justifyContent: "space-around", // Changed from space-between to space-around for better spacing
    alignItems: "center",
    height: 70,
    position: "absolute",
    bottom: Platform.OS === "ios" ? 40 : 30,
    paddingBottom: 0,
    right: 16,
    left: 16,
    borderRadius: 10,
    backgroundColor: "#333333",
  },
  tabbarButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  tabbarContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  tabbarText: {
    color: "#828282",
    fontSize: 12,
    marginTop: 2,
    textAlign: "center",
  },
  icon: {
    alignSelf: "center",
    marginBottom: 2,
  },
  scrollView: {
    position: "absolute",
    bottom: 110,
    left: 0,
    right: 0,
    paddingVertical: 10,
  },
  headerContainer: {
    position: "absolute",
    zIndex: 10,
    width: "100%",
    top: 60,
    left: 0,
  },
  locationButton: {
    position: "absolute",
    bottom: 280, // Positioned above the cards (Adjusted for card height + margins)
    right: 20,
    backgroundColor: "white",
    borderRadius: 30, // Half of width/height makes it circular
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 999, // Ensure it's clickable and on top
  },
});

const ClosesPharmacyScreen = ({ navigation }) => {
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedCityId, setSelectedCityId] = useState("");
  const [selectedDistrictId, setSelectedDistrictId] = useState("");
  const [pharmacyData, setPharmacyData] = useState([]);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isCityFocus, setIsCityFocus] = useState(false);
  const [isDistrictFocus, setIsDistrictFocus] = useState(false);
  const [region, setRegion] = useState(null);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [selectedMarkerIndex, setSelectedMarkerIndex] = useState(null);
  const snapPoints = useMemo(() => ["50%", "60%", "70%", "100"], []);

  const bottomSheetModalRef = useRef(null);
  const optionArray = Platform.select({
    ios: ["Apple Haritalar", "Google Haritalar", "İptal"],
    android: ["Google Haritalar", "İptal"],
  });

  let mapIndex = 0;
  let mapAnimation = new Animated.Value(0);

  const handlePresentModalPress = () => {
    bottomSheetModalRef.current?.present();
  };

  const { showActionSheetWithOptions } = useActionSheet();

  useEffect(() => {
    const fetchDataAfterPermission = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        fetchPharmacies();
      }
    };

    fetchDataAfterPermission();
  }, []);

  //İstanbulu seçili olarak getiren fonksiyon
  //
  // useEffect(() => {
  //   if (cities.length > 0) {
  //     const istanbulCity = cities.find(city => city.label === "İstanbul");
  //     if (istanbulCity) {
  //       setSelectedCityId(istanbulCity.id);
  //     }
  //   }
  // }, [cities]);

  const handleScroll = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / (CARD_WIDTH + 20));
    setSelectedMarkerIndex(index);
  };

  // haritayı güncelleme
  useEffect(() => {
    if (selectedMarkerIndex !== null && pharmacyData[selectedMarkerIndex]) {
      const { latitude, longitude } = pharmacyData[selectedMarkerIndex];
      _map.current.animateToRegion(
        {
          latitude,
          longitude,
          latitudeDelta: 0.0122,
          longitudeDelta: 0.0121,
        },
        350
      );
    }
  }, [selectedMarkerIndex, pharmacyData]);

  useEffect(() => {
    let regionTimeout;
    mapAnimation.addListener(({ value }) => {
      let index = Math.floor(value / CARD_WIDTH + 0.3);
      if (index >= pharmacyData.length) {
        index = pharmacyData.length - 1;
      }
      if (index <= 0) {
        index = 0;
      }

      clearTimeout(regionTimeout);

      regionTimeout = setTimeout(() => {
        if (mapIndex !== index) {
          mapIndex = index;
          const { coordinate } = pharmacyData[index];
          _map.current.animateToRegion(
            {
              ...coordinate,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            },
            350
          );
        }
      }, 10);
    });
  }, []);

  const interpolations = pharmacyData.map((marker, index) => {
    const inputRange = [
      (index - 1) * CARD_WIDTH,
      index * CARD_WIDTH,
      (index + 1) * CARD_WIDTH,
    ];

    const scale = mapAnimation.interpolate({
      inputRange,
      outputRange: [0.6, 0.75, 0.6],
      extrapolate: "clamp",
    });

    return { scale };
  });

  const _map = React.useRef(null);
  const _scrollView = React.useRef(null);

  useEffect(() => {
    selectedMarker && scrollToIndex(selectedMarker);
  }, [selectedMarker]);

  const scrollToIndex = (index) => {
    _scrollView.current?.scrollToIndex({ animated: true, index });
  };

  useEffect(() => {
    // Şehirleri getir
    const fetchCities = async () => {
      try {
        const response = await API.getCities();
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

  // Eczaneler verisi değiştiğinde harita bölgesini güncelle
  useEffect(() => {
    if (pharmacyData.length > 0) {
      const initialLocation = pharmacyData[0];
      const newRegion = {
        latitude: initialLocation.latitude,
        longitude: initialLocation.longitude,
        latitudeDelta: 0.0122,
        longitudeDelta: 0.0121,
      };
      setRegion(newRegion);
    }
  }, [pharmacyData]);

  // Şehir seçildiğinde ilçeleri getir
  const handleCitySelect = async (selectedCity) => {
    if (selectedCity) {
      // console.log("Seçilen Şehir:", selectedCity);
      setSelectedCityId(selectedCity.id);
      setSelectedCity(selectedCity.label);

      // Şehir değişince ilçeyi sıfırla
      setSelectedDistrict(null);
      setSelectedDistrictId("");

      fetchDistricts(selectedCity.id);
    }
  };

  // İlçe seçildiğinde
  const handleDistrictSelect = (selectedDistrict) => {
    // console.log("Seçilen İlçe: ", selectedDistrict);
    setSelectedDistrict(selectedDistrict.label);
    setSelectedDistrictId(selectedDistrict.id);
  };

  // Filtreleri temizle
  const handleClearFilters = () => {
    setDistricts([]);
    setSelectedCityId("");
    setSelectedDistrictId("");
    // setPharmacyData([]);
  };

  // Ara
  const handleSearch = async () => {
    try {
      if (!selectedCityId) {
        Alert.alert("Eksik Seçim", "Lütfen en az bir şehir seçimi yapınız.");
        return;
      }

      const cityName = selectedCity;
      const districtName = selectedDistrict || ""; // Opsiyonel artık

      const response = await API.getPharmaciesByCityAndDistrict(cityName, districtName);

      const responseData = response.data.data;

      if (responseData.length === 0) {
        setErrorMsg("Seçilen bilgilere ait sonuç bulunamamıştır.");
        setTimeout(() => setErrorMsg(null), 3000); // 3 saniye sonra mesajı kaldır
        return;
      }

      setPharmacyData(responseData);
      bottomSheetModalRef.current?.close();
    } catch (error) {
      console.error("Hata:", error.message);
      setPharmacyData([]);
    }
  };

  // İlçe değiştiğinde ilçelere göre eczaneleri getir
  const fetchDistricts = async (cityId) => {
    try {
      const response = await API.getDistricts(cityId);
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
  const handleMarkerPress = async (pharmacy) => {
    try {
      const response = await API.getPharmacyDetail(pharmacy.id);

      if (response.data.isSuccess) {
        const pharmacyDetail = response.data.data;
        // console.log("DEĞERLER: ", pharmacyDetail);

        const index = pharmacyData.findIndex((item) => item.id === pharmacy.id);
        if (index !== -1) {
          _scrollView.current.scrollTo({
            x: index * (CARD_WIDTH + 20),
            animated: true,
          });
        }
      } else {
        Alert.alert("Hata", response.data.errorMessage);
      }
    } catch (error) {
      console.error("Hata:", error.message);
      Alert.alert("Hata", "Bir hata oluştu. Lütfen tekrar deneyin.");
    }
  };

  const openInAppleMaps = (latitude, longitude) => {
    const latLng = `${latitude},${longitude}`;
    url = `http://maps.apple.com/?q=${latLng}`;

    Linking.openURL(url).catch((err) =>
      console.error("Haritaları açarken hata oluştu:", err)
    );
  };

  const openInGoogleMaps = (latitude, longitude) => {
    const latLng = `${latitude},${longitude}`;
    let url = `http://maps.google.com/?q=${latLng}`;

    Linking.openURL(url).catch((err) =>
      console.error("Haritaları açarken hata oluştu:", err)
    );
  };



  const handleDirection = async (pharmacyData) => {
    try {
      const { latitude, longitude } = pharmacyData;

      const options = optionArray;
      const destructiveButtonIndex = 0;
      const cancelButtonIndex = 2;

      showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex,
          destructiveButtonIndex,
        },
        (selectedIndex) => {
          const selectedOption = optionArray[selectedIndex];
          let selectedMapApp = "";

          if (selectedOption === "Apple Haritalar" && Platform.OS === "ios") {
            selectedMapApp = "apple";
          } else if (selectedOption === "Google Haritalar") {
            selectedMapApp = "google";
          }
          if (selectedMapApp === "apple") {
            openInAppleMaps(latitude, longitude);
          } else if (selectedMapApp === "google") {
            openInGoogleMaps(latitude, longitude);
          }
        }
      );
    } catch (error) {
      console.error("Hata:", error);
    }
  };

  const fetchPharmacies = async () => {
    try {
      // Kullanıcının konumunu al
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Konum izni verilmedi");
        return;
      }

      let lastLocation = await Location.getLastKnownPositionAsync();
      let location;
      if (lastLocation) {
        location = lastLocation;
      } else {
        location = await Location.getCurrentPositionAsync();
      }
      // Kullanıcının konumunu al
      const userLatitude = location.coords.latitude;
      const userLongitude = location.coords.longitude;

      // Konuma odaklan
      setRegion({
        latitude: userLatitude,
        longitude: userLongitude,
        latitudeDelta: 0.0122,
        longitudeDelta: 0.0121,
      });

      // Reverse Geocoding to get City/District
      let city = null;
      let district = null;
      try {
        const reverseGeocode = await Location.reverseGeocodeAsync({
          latitude: userLatitude,
          longitude: userLongitude
        });

        if (reverseGeocode && reverseGeocode.length > 0) {
          const address = reverseGeocode[0];
          // console.log("Adres: ", address);

          // In Turkey: region usually is City (e.g. Istanbul), subregion is District (e.g. Besiktas)
          // For Tokat example: region might be "Tokat", subregion might be "Turhal"
          // We trust the reverse geocoding result.
          city = address.region || address.city || address.subregion;
          district = address.subregion || address.district;

          // Fallback if city name is empty but we have coords, we might try to guess or let API handle it? 
          // But API needs city. If it's empty, we might defaults to Istanbul OR ask user to pick.
          if (!city) city = "İstanbul";
        }
      } catch (geoError) {
        console.error("Reverse Geocode Error", geoError);
        // On error, we rely on coords or default. 
        // If we want to show 'current location' results, we need city for this specific API.
        city = "İstanbul";
      }

      // Eczaneleri API'den al (Şehir ve İlçe ile)
      // If we made a successful reverse geocode, use it.
      const response = await API.getPharmacies(userLatitude, userLongitude, city, district);

      // if (!response.ok) handled by axios catch usually, or we check response.status
      if (response.status !== 200) {
        throw new Error("API Error: " + response.statusText);
      }

      const responseData = response.data;

      // const responseData = await response.json(); // API wrapper returns parsed data in axios 'data' prop
      // responseData variable is already set above from response.data

      if (responseData.isSuccess) {
        setPharmacyData(responseData.data);

        // En yakın eczaneyi bul
        let minDistance = Infinity;
        let nearestPharmacyIndex = null;
        if (responseData.data && responseData.data.length > 0) {
          responseData.data.forEach((pharmacy, index) => {
            const distance = calculateDistance(
              userLatitude,
              userLongitude,
              pharmacy.latitude,
              pharmacy.longitude
            );
            if (distance < minDistance) {
              minDistance = distance;
              nearestPharmacyIndex = index;
            }
          });
          // En yakın eczaneyi mavi renkte işaretle
          setSelectedMarkerIndex(nearestPharmacyIndex);
        }
      } else {
        console.error("API Error:", responseData.errorMessage);
        Alert.alert("Hata", responseData.errorMessage || "Veri çekilemedi.");
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      if (error.response && error.response.status === 429) {
        Alert.alert("Hata", "Çok fazla istek gönderildi. Lütfen bir süre bekleyip tekrar deneyin.");
      } else {
        setErrorMsg("Eczane bilgileri alınamadı.");
      }
    }
  };

  // Haversine formülü ile iki nokta arasındaki mesafeyi hesapla
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Yeryüzü'nün ortalama yarıçapı (km)
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Mesafe km cinsinden
    return d;
  };

  const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
  };

  const getUserLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Konum izni verilmedi");
        return;
      }

      let lastLocation = await Location.getLastKnownPositionAsync();
      let location;
      if (lastLocation) {
        location = lastLocation;
      } else {
        location = await Location.getCurrentPositionAsync();
      }
      // Kullanıcının konumunu al
      const { latitude, longitude } = location.coords;
      _map.current.animateToRegion({
        latitude,
        longitude,
        latitudeDelta: 0.0122,
        longitudeDelta: 0.0121,
      });
    } catch (error) {
      console.error("Fetch Error:", error);
    }
  };

  const handleCallPharmacy = (pharmacyData) => {
    if (pharmacyData.phone) {
      const url = `tel:${pharmacyData.phone}`;
      Linking.openURL(url);
    } else {
      Alert.alert("Bilgi", "Bu eczaneye ait telefon numarası bulunmamaktadır.");
    }
  };

  return (
    <>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          {/* LinkHeader removed */}
        </View>
        <MapView
          showsUserLocation
          showsMyLocationButton={true}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          region={region}
          ref={_map}
        >
          {pharmacyData.map((pharmacy, index) => {
            const scaleStyle = {
              transform: [
                {
                  scale: interpolations[index].scale,
                },
              ],
            };

            let markerIcon = marker_icon;
            if (index === selectedMarkerIndex) {
              markerIcon = marker_blue_icon;
            }

            return (
              <Marker
                key={index}
                coordinate={{
                  latitude: pharmacy.latitude,
                  longitude: pharmacy.longitude,
                }}
                title={pharmacy.pharmacyName}
                description={`${pharmacy.address}, ${pharmacy.city}, ${pharmacy.district} `}
                onCalloutPress={() => handleDirection(pharmacy)}
                onPress={() => handleMarkerPress(pharmacy)}
              >
                <Animated.View style={[styles.markerWrap]}>
                  <Animated.Image
                    source={markerIcon}
                    style={[styles.marker, scaleStyle, { width: 40, height: 40 }]}
                    resizeMode="contain"
                  />
                </Animated.View>
                {Platform.OS === "ios" ? (
                  <CustomCallout
                    pharmacy={pharmacy}
                    onPressDirection={handleDirection}
                    onClickPhone={handleCallPharmacy}
                    handleOpenInMaps={() => handleDirection(pharmacy)}
                  />
                ) : null}
              </Marker>
            );
          })}
        </MapView>
        <View style={styles.locationButton}>
          <TouchableOpacity
            onPress={() => {
              getUserLocation();
            }}
          >
            <MaterialCommunityIcons name="crosshairs-gps" size={30} color="#666" />
          </TouchableOpacity>
        </View>
        <Animated.ScrollView
          ref={_scrollView}
          horizontal
          pagingEnabled
          scrollEventThrottle={1}
          showsHorizontalScrollIndicator={false}
          snapToInterval={CARD_WIDTH + 20}
          snapToAlignment="center"
          style={styles.scrollView}
          contentInset={{
            top: 0,
            left: SPACING_FOR_CARD_INSET,
            bottom: 0,
            right: SPACING_FOR_CARD_INSET,
          }}
          contentContainerStyle={{
            paddingHorizontal:
              Platform.OS === "android" ? SPACING_FOR_CARD_INSET : 0,
          }}
          onScroll={handleScroll}
        >
          {pharmacyData.map((pharmacy, index) => (
            <View key={index}>
              <PharmacyCard
                key={pharmacy.id}
                pharmacy={pharmacy}
                onPressDirection={handleDirection}
                onClickPhone={handleCallPharmacy}
              />
            </View>
          ))}
        </Animated.ScrollView>
      </View>

      <View style={styles.tabbar}>
        <TouchableOpacity
          style={styles.tabbarButton}
          onPress={() => {
            fetchPharmacies();
          }}
        >
          <View style={{ flexDirection: "column" }}>
            <MaterialCommunityIcons
              style={styles.icon}
              name={"navigation-variant"}
              size={20}
              color={"#828282"}
            />
            <Text style={styles.tabbarText}>En Yakın</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabbarButton}
          onPress={handlePresentModalPress}
        >
          <View style={{ flexDirection: "column" }}>
            <Ionicons
              style={styles.icon}
              name={"search"}
              size={20}
              color={"#828282"}
            />
            <Text style={styles.tabbarText}>Arama</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabbarButton}
          onPress={() => navigation.navigate("Tüm Nöbetçi Eczaneler")}
        >
          <View style={{ flexDirection: "column" }}>
            <Ionicons
              style={styles.icon}
              name={"list"}
              size={20}
              color={"#828282"}
            />
            <Text style={styles.tabbarText}>Liste</Text>
          </View>
        </TouchableOpacity>
      </View>
      <BottomSheetModal
        ref={bottomSheetModalRef}
        snapPoints={snapPoints}
        enablePanDownToClose
      >
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
          {errorMsg && (
            <Text style={[styles.text, { color: 'red', fontSize: 14, textAlign: 'center', marginVertical: 10 }]}>
              {errorMsg}
            </Text>
          )}
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
      </BottomSheetModal>
    </>
  );
};

export default ClosesPharmacyScreen;
