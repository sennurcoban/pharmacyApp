import { View, Text, StyleSheet } from 'react-native'
import React, { useContext, useState } from 'react'
import { UserLocationContext } from '../context/UserLocationContext'
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";


const CustomMapView = ({ handleGetDirections, handleMarkerPress }) => {
    const { location, setLocation } = useContext(UserLocationContext);
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
    const [bottomSheetVisible, setBottomSheetVisible] = useState(false);

    return location?.latitude && (
        <View>
            <MapView
                showsUserLocation
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                region={region}
            >
                {pharmacyData.map((pharmacy, index) => (
                    <Marker
                        key={pharmacy.id}
                        coordinate={{
                            latitude: pharmacy.latitude,
                            longitude: pharmacy.longitude,
                        }}
                        title={pharmacy.pharmacyName}
                        description={`${pharmacy.address}, ${pharmacy.city}, ${pharmacy.district}`}
                        onCalloutPress={(index) =>
                            handleGetDirections(index)
                        }
                        onPress={() => {
                            // console.log(
                            //     "HANDLE MAKER PRESS---pharmacyName",
                            //     pharmacy.pharmacyName
                            // );
                            // console.log("HANDLE MAKER PRESS---", pharmacy.latitude);
                            handleMarkerPress(pharmacy);
                        }}
                    // // image={marker_icon}
                    >
                        <Image source={marker_icon} style={{ width: 35, height: 50 }} />
                        {Platform.OS === "ios" ? (
                            <CustomCallout
                                pharmacy={pharmacy}
                                handleOpenInMaps={(index) =>
                                    handleGetDirections(index)
                                }
                            />
                        ) : null}
                    </Marker>
                ))}
            </MapView>
        </View>
    )
}

export default CustomMapView

const styles = StyleSheet.create({
    map: {
        width: '100%',
        height: '%100'
    }
})