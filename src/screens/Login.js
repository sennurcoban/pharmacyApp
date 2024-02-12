import { FontAwesome6, Ionicons } from '@expo/vector-icons'; 
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';

import { PixelRatio } from 'react-native';

const widthInDp = PixelRatio.getPixelSizeForLayoutSize(358);
const heightInDp = PixelRatio.getPixelSizeForLayoutSize(57);

const YourComponent = () => {
  const [pharmacies, setPharmacies] = useState([]);

  useEffect(() => {
    fetchPharmacies();
  }, []);

  const fetchPharmacies = async () => {
    try {
      const response = await fetch('https://eczaneapi.intimeinfo.net/api/Eczane/GetPharmacyInformation');
      const data = await response.json();
      if (data.isSuccess) {
        setPharmacies(data.data);
      } else {
        console.error('API Error:', data.errorMessage);
      }
    } catch (error) {
      console.error('Fetch Error:', error);
    }
  };

  const renderPharmacyItem = ({ item }) => (
    <View style={{ paddingVertical: 30, paddingHorizontal:10, borderBottomWidth: 1, borderBottomColor: '#ccc', flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
      <View style={{ flexDirection: "column", width: 200 }}>
        <Text style={{ fontWeight: 'bold' }}>{item.name}</Text>
        <Text>{item.loc}</Text>
      </View>
      <View style={{ flexDirection: "row", justifyContent: "space-around", width: 90 }}>
        <TouchableOpacity style={{backgroundColor:"red", padding:7, borderRadius:20, width:40, height:40,alignItems:"center",justifyContent:"center"}}>
        <Ionicons name="location-sharp" size={24} color="white" />

        </TouchableOpacity>
        <TouchableOpacity style={{backgroundColor:"#4CE5B1",padding:7, borderRadius:20, width:40, height:40,alignItems:"center",justifyContent:"center"}}>

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
      />
    </View>
  );
};

export default YourComponent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 15,

  },
  pharmacies: {
    marginTop: 15,
    with: 671,
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "red",
    justifyContent: "space-around",
    borderRadius: 10,
    padding: 5
  },
  allPharmacies: {
    backgroundColor: "transparent",
    borderRadius: 10,
    padding: 5,
    width: 150,
    alignItems: "center"
  },
  nightPharmacies: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 5,
    width: 150,
    alignItems: "center"
  }
})
