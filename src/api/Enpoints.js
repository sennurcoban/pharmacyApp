import axios from "axios";
const API_KEY = "";
const config = {
  headers: {
    'Content-Type': 'application/json',
    'X-Goog-Api-Key': API_KEY,
    'X-Goog-FieldMask':'*'
    // 'X-Goog-FieldMask': [
    //   "places.displayName",
    //   "places.formattedAddress",
    //   "places.location",
    //   "places.photos",
    // ],
  },
};
const BASE_URL =
  "https://eczaneapi.intimeinfo.net/api/Eczane/GetPharmacyInformation";
const GET_PHARMACY_BY_CITY_AND_DISTRICT = `https://eczaneapi.intimeinfo.net/api/Eczane/GetPharmacyInformation?CitiesName=${encodeURIComponent(
  cityName
)}&DistrictName=${encodeURIComponent(districtName)}`;

const GetPharmacies =(data)=> axios.get(BASE_URL,data,config);
export default{
    GetPharmacies
}