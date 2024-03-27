import React, { useEffect, useState, useRef } from "react";
import {
  StyleSheet,
  View,
  Platform,
  Linking,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  Image,
  Alert,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetModal } from "@gorhom/bottom-sheet";
import { Dropdown } from "react-native-element-dropdown";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import marker_icon from "../../assets/ic_Pin_big.png";
import axios from "axios";
import { useActionSheet } from "@expo/react-native-action-sheet";
import CustomCallout from "../components/CustomCallout";
import LinkHeader from "../components/LinkHeader";
import PharmacyCard from "../components/PharmacyCard";

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
    // borderTopWidth: 1,
    // borderTopColor: '#ccc',
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 70,
    position: "absolute",
    bottom: 30,
    paddingBottom: 0,
    right: 16,
    left: 16,
    borderRadius: 10,
    backgroundColor: "#333333",
  },
  tabbarButton: {
    padding: 10,
  },
  tabbarText: {
    color: "#828282",
    fontSize: 16,
    width: 100,
    marginLeft: 15,
  },
  icon: {
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 20,
    marginBottom: 5,
  },
  scrollView: {
    position: "absolute",
    bottom: 110,
    left: 0,
    right: 0,
    paddingVertical: 10,
  },
  card: {
    // padding: 10,
    elevation: 2,
    backgroundColor: "#FFF",
    borderRadius: 15,
    marginHorizontal: 10,
    shadowColor: "#000",
    shadowRadius: 5,
    shadowOpacity: 0.3,
    shadowOffset: { x: 2, y: -2 },
    height: CARD_HEIGHT,
    width: CARD_WIDTH,
    overflow: "hidden",
  },
  cardImage: {
    flex: 3,
    width: "100%",
    height: "100%",
    alignSelf: "center",
  },
  textContent: {
    flex: 2,
    padding: 10,
  },
  cardtitle: {
    fontSize: 12,
    // marginTop: 5,
    fontWeight: "bold",
  },
  cardDescription: {
    fontSize: 12,
    color: "#444",
  },
  cardButton: {
    alignItems: "center",
    marginTop: 5,
  },
  signIn: {
    width: "100%",
    padding: 5,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  textSign: {
    fontSize: 14,
    fontWeight: "bold",
  },
  headerContainer: {
    position: "absolute",
    zIndex: 10,
    width: "100%", //google konuma gite tıklanmıyor
    top: 60,
    left: 0,
    // paddingHorizontal: 10,
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
  const [location, setLocation] = useState({});
  const [errorMsg, setErrorMsg] = useState(null);
  const [isCityFocus, setIsCityFocus] = useState(false);
  const [isDistrictFocus, setIsDistrictFocus] = useState(false);
  const [region, setRegion] = useState(null);
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState(null);

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
    fetchPharmacies();
  }, []);

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
      outputRange: [1, 1.5, 1],
      extrapolate: "clamp",
    });

    return { scale };
  });

  const onMarkerPress = (mapEventData) => {
    const markerID = mapEventData._targetInst.return.key;

    let x = markerID * CARD_WIDTH + markerID * 20;
    if (Platform.OS === "ios") {
      x = x - SPACING_FOR_CARD_INSET;
    }

    _scrollView.current.scrollTo({ x: x, y: 0, animated: true });
  };

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
      // console.log("Seçilen Şehir:", selectedCity);
      setSelectedCityId(selectedCity.id);
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
    setPharmacyData([]);
  };

  // Ara
  const handleSearch = async () => {
    try {
      if (!selectedCityId || !selectedDistrictId) {
        alert("Lütfen önce şehir ve ilçe seçimi yapınız.");
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
  const handleMarkerPress = async (pharmacy) => {
    try {
      const response = await axios.get(
        `https://eczaneapi.intimeinfo.net/api/Eczane/GetPharmacyDetail?pharmacyId=${pharmacy.id}`
      );

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

  const handleOpenCompanyWebsite = () => {
    const url = `https://www.intimeinfo.com.tr/`;
    Linking.openURL(url);
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

      const response = await fetch(
        `https://eczaneapi.intimeinfo.net/api/Eczane/GetPharmacyInformation?latitude=${latitude}&longitude=${longitude}`
      );

      // Check if the request was successful (status code 200)
      if (!response.ok) {
        throw new Error("API Error: " + response.statusText);
      }

      const responseData = await response.json();

      if (responseData.isSuccess) {
        setPharmacyData(responseData.data);
      } else {
        console.error("API Error:", responseData.errorMessage);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
    }
  };

  return (
    <>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <LinkHeader onPress={handleOpenCompanyWebsite} />
        </View>
        <MapView
          showsUserLocation
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          region={region}
        >
          {pharmacyData.map((pharmacy, index) => (
            <Marker
              zIndex={index}
              key={pharmacy.id}
              coordinate={{
                latitude: pharmacy.latitude,
                longitude: pharmacy.longitude,
              }}
              title={pharmacy.pharmacyName}
              description={`${pharmacy.address}, ${pharmacy.city}, ${pharmacy.district}`}
              onCalloutPress={() => handleDirection(pharmacy)}
              onPress={() => handleMarkerPress(pharmacy)}
            >
              <Image source={marker_icon} style={{ width: 35, height: 50 }} />
              {Platform.OS === "ios" ? (
                <CustomCallout
                  pharmacy={pharmacy}
                  handleOpenInMaps={() => handleDirection(pharmacy)}
                />
              ) : null}
            </Marker>
          ))}
        </MapView>
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
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: mapAnimation } } }],
            { useNativeDriver: true }
          )}
        >
          {pharmacyData.map((pharmacy) => (
            <PharmacyCard
              key={pharmacy.id}
              pharmacy={pharmacy}
              onPressDirection={handleDirection}
            />
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
        // index={bottomSheetVisible ? 1 : -1}
        snapPoints={["45%", "45%", "70%", "100"]}
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
