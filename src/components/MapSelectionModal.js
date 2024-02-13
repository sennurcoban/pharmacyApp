import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const MapSelectionModal = ({ latitude, longitude }) => {
  const [modalVisible, setModalVisible] = useState(false);

  const openInAppleMaps = () => {
    const location = `${latitude},${longitude}`;
    const url = `http://maps.apple.com/?q=${location}`;
    Linking.openURL(url);
    setModalVisible(false);
  };

  const openInGoogleMaps = () => {
    const location = `${latitude},${longitude}`;
    const url = `https://www.google.com/maps/search/?api=1&query=${location}`;
    Linking.openURL(url);
    setModalVisible(false);
  };

  return (
    <View>
      <TouchableOpacity onPress={() => setModalVisible(true)}>
        <Ionicons name="location-sharp" size={24} color="red" />
      </TouchableOpacity>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.optionButton} onPress={openInAppleMaps}>
              <Text style={styles.optionText}>Apple Haritalar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.optionButton} onPress={openInGoogleMaps}>
              <Text style={styles.optionText}>Google Haritalar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelText}>İptal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    elevation: 5,
  },
  optionButton: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  optionText: {
    fontSize: 16,
    color: 'black',
  },
  cancelButton: {
    padding: 10,
    marginTop: 10,
  },
  cancelText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  },
});

export default MapSelectionModal;
