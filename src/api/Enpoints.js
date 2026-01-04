import axios from "axios";
import { CITIES, DISTRICTS } from "./turkey_data";

// ==========================================
// CONFIGURATION
// ==========================================
// Get your free API key from https://collectapi.com/tr/api/health/nobetci-eczane-api
const COLLECT_API_KEY = "apikey 5OccvSmV57Yqxmb5nu4KQX:6cMOrdynKxGG3lkw99gWfs"; // Paste your key here, e.g., "apikey 123456:123456"
const USE_MOCK_DATA = false; // Set to false when you have an API key

// ==========================================
// MOCK DATA
// ==========================================
const MOCK_PHARMACIES = [
  {
    name: "Örnek Eczane 1",
    dist: "Merkez",
    address: "Atatürk Cad. No:1 Örnek Mah. İstanbul",
    phone: "0212 123 45 67",
    loc: "41.0082,28.9784" // Istanbul coordinates
  },
  {
    name: "Örnek Eczane 2",
    dist: "Beşiktaş",
    address: "Barbaros Bulvarı No:10 Beşiktaş İstanbul",
    phone: "0212 987 65 43",
    loc: "41.0422,29.0067"
  },
  {
    name: "Örnek Eczane 3",
    dist: "Kadıköy",
    address: "Bağdat Cad. No:100 Kadıköy İstanbul",
    phone: "0216 123 45 67",
    loc: "40.9819,29.0576"
  }
];

// ==========================================
// API CLIENT
// ==========================================

const BASE_URL = "https://api.collectapi.com/health";

const config = {
  headers: {
    'content-type': 'application/json',
    'authorization': COLLECT_API_KEY
  },
};

// Helper to normalize data structure for the app
const normalizePharmacyData = (data) => {
  return data.map((item, index) => {
    const [lat, lon] = item.loc.split(',').map(coord => parseFloat(coord));
    return {
      id: index + 1, // Generate a temporary ID
      pharmacyName: item.name,
      address: item.address,
      phone: item.phone,
      latitude: lat,
      longitude: lon,
      city: "İstanbul", // Default/Calculated
      district: item.dist
    };
  });
};

const getPharmacies = async (latitude, longitude, city, district) => {
  if (USE_MOCK_DATA) {
    console.log("Using Mock Data for Pharmacies");
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return { data: { isSuccess: true, result: normalizePharmacyData(MOCK_PHARMACIES) }, status: 200 };
  }

  // CollectAPI requires city (il) and optional district (ilce)
  // Default to 'istanbul' if not provided (e.g. detailed reverse geocoding failed)
  const citySlug = city ? slugify(city) : 'istanbul';
  let url = `${BASE_URL}/dutyPharmacy?il=${citySlug}`;

  // If district is provided, add it to narrow down results (optional but better)
  if (district) {
    url += `&ilce=${slugify(district)}`;
  }

  return axios.get(url, config)
    .then(response => {
      const normalized = normalizePharmacyData(response.data.result);
      return { data: { isSuccess: true, data: normalized }, status: 200 };
    })
    .catch(err => {
      console.error("API Error", err);
      throw err;
    });
};

const getPharmaciesByCityAndDistrict = async (cityName, districtName) => {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { data: { isSuccess: true, data: normalizePharmacyData(MOCK_PHARMACIES) }, status: 200 };
  }

  // Convert to English characters roughly for API params if needed, but usually query params are URI encoded
  // CollectAPI expects lowercase english names usually (e.g. ?il=istanbul&ilce=kadikoy)
  // We might need a helper to slugify.
  const citySlug = slugify(cityName);
  // Use the label as the slug reference, or the value
  // districtName comes from dropdown, which is the 'label' from ClosesPharmacyScreen 'handleDistrictSelect' setting selectedDistrict to label.
  // So cityName and districtName are the Turkish text. slugify handles it.
  const districtSlug = slugify(districtName);

  return axios.get(`${BASE_URL}/dutyPharmacy?il=${citySlug}&ilce=${districtSlug}`, config)
    .then(response => {
      const normalized = normalizePharmacyData(response.data.result);
      return { data: { isSuccess: true, data: normalized }, status: 200 }; // mapping result to data for compatibility
    });
};

const getCities = async () => {
  if (USE_MOCK_DATA) {
    const cityList = CITIES.map(c => ({ id: c.id, ad: c.label, value: c.value }));
    return { data: { isSuccess: true, data: cityList }, status: 200 };
  }

  // Dynamic Fetch from API
  // Endpoint: /districtList (returns province list if no param)
  return axios.get(`${BASE_URL}/districtList`, config)
    .then(response => {
      // API Response: { success: true, result: [{ text: 'Adana' }, { text: 'Adıyaman' } ...] }
      // We need to map this to our internal structure.
      // Important: We need IDs to match our CITIES list if we want consistent ID usage.
      // We can try to match by name to our static list to preserve IDs.

      const rawList = response.data.result;
      const normalized = rawList.map((item) => {
        // Find matching static city to keep ID consistent (e.g. Adana -> 1)
        const staticCity = CITIES.find(c => c.label.toLowerCase() === item.text.toLowerCase());
        return {
          id: staticCity ? staticCity.id : Math.floor(Math.random() * 1000) + 100, // Fallback ID
          ad: item.text,
          value: slugify(item.text)
        };
      });

      // Sort by ID to keep order
      normalized.sort((a, b) => a.id - b.id);

      return { data: { isSuccess: true, data: normalized }, status: 200 };
    })
    .catch(err => {
      console.error("API GetCities Error", err);
      // Fallback
      const cityList = CITIES.map(c => ({ id: c.id, ad: c.label, value: c.value }));
      return { data: { isSuccess: true, data: cityList }, status: 200 };
    });
}

const getDistricts = async (cityId) => {
  // We need to find the city name corresponding to this ID.
  // ClosesPharmacyScreen selects by ID from CITIES list.
  const city = CITIES.find(c => c.id === cityId);

  if (!city) {
    // Should not happen if ID matches
    return { data: { isSuccess: false, errorMessage: "City not found" }, status: 400 };
  }

  if (USE_MOCK_DATA) {
    let dists = DISTRICTS[cityId];
    if (!dists) {
      dists = [
        { id: 1, label: "Merkez", value: "merkez" },
        { id: 2, label: "Tüm İlçeler (Veri Yok)", value: "all" }
      ];
    }
    const districtList = dists.map(d => ({ id: d.id, ad: d.label, value: d.value }));
    return { data: { isSuccess: true, data: districtList }, status: 200 };
  }

  // Dynamic Fetch from API
  // The API endpoint /districtList?il=CityName returns the districts.
  return axios.get(`${BASE_URL}/districtList?il=${city.label}`, config)
    .then(response => {
      // API Response: { success: true, result: [{ text: 'Almus' }, { text: 'Artova' } ...] }
      const rawList = response.data.result;
      const normalized = rawList.map((item, index) => ({
        id: index + 1, // Artificial ID since API uses names
        ad: item.text,
        value: slugify(item.text)
      }));
      return { data: { isSuccess: true, data: normalized }, status: 200 };
    })
    .catch(err => {
      console.error("API GetDistricts Error", err);
      // Fallback to static list if API fails
      let dists = DISTRICTS[cityId];
      if (!dists) {
        dists = [
          { id: 1, label: "Merkez", value: "merkez" },
          { id: 2, label: "Tüm İlçeler (Veri Yok)", value: "all" }
        ];
      }
      const districtList = dists.map(d => ({ id: d.id, ad: d.label, value: d.value }));
      return { data: { isSuccess: true, data: districtList }, status: 200 };
    });
}

const getPharmacyDetail = async (pharmacyId) => {
  // CollectAPI usually doesn't need a detail call, we get everything in the list.
  // We can just return the data if we have it in the list.
  if (USE_MOCK_DATA) {
    const p = normalizePharmacyData(MOCK_PHARMACIES)[0]; // Just return first one
    return { data: { isSuccess: true, data: p }, status: 200 };
  }
  return { data: { isSuccess: true, data: {} }, status: 200 };
}

const getAllPharmacies = async () => {
  if (USE_MOCK_DATA) {
    return { data: { isSuccess: true, data: normalizePharmacyData(MOCK_PHARMACIES) }, status: 200 };
  }
  return axios.get(`${BASE_URL}/dutyPharmacy?il=istanbul`, config)
    .then(response => {
      const normalized = normalizePharmacyData(response.data.result);
      return { data: { isSuccess: true, data: normalized }, status: 200 };
    });
}

// Simple slugify for Turkish characters (basic version)
const slugify = (text) => {
  if (!text) return "";
  const map = {
    'ç': 'c', 'ğ': 'g', 'ı': 'i', 'İ': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
    'Ç': 'c', 'Ğ': 'g', 'I': 'i', 'Ö': 'o', 'Ş': 's', 'Ü': 'u'
  };
  return text.replace(/[çğıİöşüÇĞIÖŞÜ]/g, (match) => map[match]).toLowerCase();
};

export default {
  getPharmacies,
  getPharmaciesByCityAndDistrict,
  getCities,
  getDistricts,
  getPharmacyDetail,
  getAllPharmacies
}