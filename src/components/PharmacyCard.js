import React from 'react'
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'

const PharmacyCard = ({ pharmacy }) => {
    return (
      <View style={styles.card}>
        <View style={styles.textContent}>
          <Text numberOfLines={1} style={styles.cardtitle}>
            {pharmacy.city}
          </Text>
          <Text numberOfLines={1} style={styles.cardDescription}>
            {pharmacy.district}
          </Text>
          <TouchableOpacity
            onPress={() =>
              handleOpenInMaps(pharmacy.latitude, pharmacy.longitude)
            }
            style={[
              styles.signIn,
              {
                borderColor: "#FF6347",
                borderWidth: 1,
              },
            ]}
          >
            <Text
              style={[
                styles.textSign,
                {
                  color: "#FF6347",
                },
              ]}
            >
              Yol Tarifi Al
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  

export default PharmacyCard

const styles = StyleSheet.create({})