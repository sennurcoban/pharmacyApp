import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import * as Location from "expo-location";
import { Dropdown } from "react-native-element-dropdown";
import datas from "../data/data";
import axios from 'axios'; // Axios kütüphanesini import et


const data = [
  { label: "Item 1", value: "1" },
  { label: "Item 2", value: "2" },
  { label: "Item 3", value: "3" },
  { label: "Item 4", value: "4" },
  { label: "Item 5", value: "5" },
  { label: "Item 6", value: "6" },
  { label: "Item 7", value: "7" },
  { label: "Item 8", value: "8" },
];

// const axios = require('axios');

// // API endpoint URL
// const url = 'https://api.collectapi.com/health/dutyPharmacy?ilce=%C3%87ankaya&il=Ankara';

// // Başlık ayarları
// const headers = {
//   'authorization': 'apikey your_token',
//   'content-type': 'application/json'
// };

// // Axios ile GET isteği gönderme
// axios.get(url, { headers })
//   .then(response => {
//     // İstek başarılıysa, gelen veriyi işleme
//     const cities = response.data.result.map(item => item.il);
//     console.log('Şehirler:', cities);
//   })
//   .catch(error => {
//     // İstek hata ile sonuçlanırsa, hatayı işleme
//     console.error('Hata:', error.message);
//   });

const Login = () => {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [isCityFocus, setIsCityFocus] = useState(false);
  const [isDistrictFocus, setIsDistrictFocus] = useState(false);
  const [cities, setCities] = useState([]);


  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await axios.get('https://api.collectapi.com/health/dutyPharmacy?ilce=%C3%87ankaya&il=Ankara', {
          headers: {
            'authorization': 'apikey ', 
            'content-type': 'application/json'
          }
        });
        const cityNames = response.data.result.map(item => item.name);
        setCities(cityNames);
      } catch (error) {
        console.error('Hata:', error.message);
      }
    };
    fetchCities(); 
  }, []);

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

  return (
    // <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    //   {errorMsg ? <Text>{errorMsg}</Text> : null}
    //   {location ? (
    //     <Text>
    //       Latitude: {location.coords.latitude}, Longitude: {location.coords.longitude}
    //     </Text>
    //   ) : (
    //     <Text>Konum bilgisi yükleniyor...</Text>
    //   )}
    // </View>
    <View style={styles.container}>
      {/* {renderLabel()} */}
      <Dropdown
        style={[styles.dropdown, isCityFocus && { borderColor: "blue" }]}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        inputSearchStyle={styles.inputSearchStyle}
        iconStyle={styles.iconStyle}
        data={cities.map(city => ({ label: city, value: city }))} // Şehirleri Dropdown'a geçir
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
      {/* {selectedCity && (
        <Dropdown
          style={[styles.dropdown, isDistrictFocus && { borderColor: "blue" }]}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          inputSearchStyle={styles.inputSearchStyle}
          iconStyle={styles.iconStyle}
          data={datas
            .find((city) => city.name === selectedCity)
            ?.towns.flatMap((town) =>
              town.districts.map((district) => ({
                label: district.name,
                value: district.name,
              }))
            )}
          search
          maxHeight={300}
          labelField="label"
          valueField="value"
          placeholder={!isDistrictFocus ? "İlçe Seçiniz" : "..."}
          searchPlaceholder="Search..."
          value={selectedDistrict}
          onFocus={() => setIsDistrictFocus(true)}
          onBlur={() => setIsDistrictFocus(false)}
          onChange={(item) => {
            setSelectedDistrict(item.value);
            setIsDistrictFocus(false);
          }}
        />
      )} */}
    </View>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    // flex:1,
    // justifyContent: 'flex-start',
    // alignContent:'center'
  },
  dropdown: {
    height: 50,
    borderColor: "gray",
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
    margin: 10,
  },
  icon: {
    marginRight: 5,
  },
  label: {
    position: "absolute",
    backgroundColor: "white",
    left: 22,
    top: 8,
    zIndex: 999,
    paddingHorizontal: 8,
    fontSize: 14,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
});
