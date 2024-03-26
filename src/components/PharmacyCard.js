import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get("window");
const CARD_HEIGHT = 200;
const CARD_WIDTH = width * 0.8;
const SPACING_FOR_CARD_INSET = width * 0.1 - 10;

const PharmacyCard = ({ pharmacy, onPressDirection }) => {
  const handleDirection = () => {
    onPressDirection(pharmacy.pharmacyID);
  };

  return (
    <View style={styles.card} key={pharmacy.id}>
      <View style={styles.textContent}>
        <View style={{ margin: 10, height: 90 }}>
          <Text style={{ fontWeight: "bold" }}>
            {pharmacy.pharmacyName}
          </Text>
          <Text>{pharmacy.address}</Text>
        </View>
        <View style={styles.cardButton}>
          <TouchableOpacity
            onPress={handleDirection}
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
    </View>
  );
};

export default PharmacyCard;

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
    display:'flex',
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
    width:'100%', //google konuma gite tıklanmıyor 
    top: 60,
    left:0,
    // paddingHorizontal: 10,
  },
})
