import React,{ useState } from "react";
import { StyleSheet, Text, View, Button, TouchableOpacity, Linking,FlatList, Modal } from "react-native";
import MapView, { Marker } from "react-native-maps";

const dummyData = [
  {
    id: 1,
    pharmacyName: "Eczane Kırmızı",
    distance: 317,
    phoneNumber: 216878799,
    address: "vlkrvrejnvrkejnverv",
    street: "Aydınevler",
    discrit: "Maltepe",
    destination: { latitude: 40.9556001, longitude: 29.1213097 } 
  },
  {
    id: 2,
    pharmacyName: "Vadi Eczane",
    distance: 317,
    phoneNumber: 55555555,
    address: "vlkrvrejnvrkejnverv",
    street: "Aydınevler",
    discrit: "Maltepe",
    destination: { latitude: 41.1074968, longitude: 28.9043128 }
  },
  {
    id: 3,
    pharmacyName: "Kağıthane Eczanesi",
    distance: 317,
    phoneNumber: 216878799,
    address: "vlkrvrejnvrkejnverv",
    street: "Aydınevler",
    discrit: "Maltepe",
    destination: { latitude: 41.0959596, longitude: 28.8972735 } 
  },
  {
    id: 4,
    pharmacyName: "Elif Eczanesi",
    distance: 317,
    phoneNumber: 55555555,
    address: "vlkrvrejnvrkejnverv",
    street: "Aydınevler",
    discrit: "Maltepe",
    destination: { latitude: 41.8781, longitude: -87.6298 }
  },{
    id: 5,
    pharmacyName: "Eczane Mor",
    distance: 317,
    phoneNumber: 216878799,
    address: "vlkrvrejnvrkejnverv",
    street: "Aydınevler",
    discrit: "Maltepe",
    destination: { latitude: 40.9556001, longitude: 29.1213097 } 
  },
  {
    id: 6,
    pharmacyName: "Bizim Eczane",
    distance: 317,
    phoneNumber: 55555555,
    address: "vlkrvrejnvrkejnverv",
    street: "Aydınevler",
    discrit: "Maltepe",
    destination: { latitude: 41.8781, longitude: -87.6298 }
  },
];

const PharmacyListItem = ({ onClose, onPress }) => {
    const [modalVisible, setModalVisible] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState(null);

  const handleOpenInMaps = (destination) => {
    setSelectedDestination(destination);
    setModalVisible(true);
  };

  const openInAppleMaps = () => {
    if (selectedDestination) {
      const location = `${selectedDestination.latitude},${selectedDestination.longitude}`;
      const url = `http://maps.apple.com/?q=${location}`;
      Linking.openURL(url);
    }
  };

  const openInGoogleMaps = () => {
    if (selectedDestination) {
      const location = `${selectedDestination.latitude},${selectedDestination.longitude}`;
      const url = `https://www.google.com/maps/search/?api=1&query=${location}`;
      Linking.openURL(url);
    }
  };

  return (
    <>
    <FlatList
    data={dummyData}
    renderItem={({ item }) => (
      <TouchableOpacity onPress={() => handleOpenInMaps(item.destination)}>
        <View style={styles.pharmacyContainer}>
          <View style={styles.nameContainer}>
            <Text style={styles.text}>{item.pharmacyName}</Text>
            <Text style={styles.text}>{item.distance}</Text>
          </View>
          <Text style={styles.text}>{item.phoneNumber}</Text>
          <Text style={styles.text}>{item.address}</Text>
          <Text style={styles.text}>{item.street}</Text>
          <Text style={styles.text}>{item.discrit}</Text>
          <View style={styles.container}>
            <Text style={styles.title}>Yol Tarifi</Text>
            <Text style={styles.destination}>
              Hedef: {item.destination.latitude}, {item.destination.longitude}
            </Text>
            <Button title="Haritada Görüntüle" onPress={() => handleOpenInMaps(item.destination)} />
            <Button title="Arama Yap" onPress={onClose} />
          </View>
        </View>
      </TouchableOpacity>
    )}
  />
  <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Button title="Apple Haritalar" onPress={openInAppleMaps} />
            <Button title="Google Haritalar" onPress={openInGoogleMaps} />
            <Button title="Kapat" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
      </>
  );
};

export default PharmacyListItem;

const styles = StyleSheet.create({
    pharmacyContainer: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
      },
      nameContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 5,
      },
      text: {
        fontSize: 18,
      },
      centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 22
      },
      modalView: {
        margin: 20,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 35,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
      },
      modalText: {
        marginBottom: 15,
        textAlign: "center"
      }
});
