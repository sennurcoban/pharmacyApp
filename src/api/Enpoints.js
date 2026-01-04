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
    name: "Test Tokat Eczanesi",
    dist: "Turhal",
    address: "Cumhuriyet Cad. Tokat",
    phone: "0356 123 45 67",
    loc: "40.3167,36.55" // Tokat User Location
  },
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

import { db } from "../firebase/config";
import { doc, getDoc, setDoc, collection } from "firebase/firestore";

// Helper to normalize data structure for the app
const normalizePharmacyData = (data) => {
  return data.map((item, index) => {
    // CollectAPI returns "loc": "41.0082,28.9784"
    const [lat, lon] = item.loc ? item.loc.split(',').map(coord => parseFloat(coord)) : [0, 0];
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
    await new Promise(resolve => setTimeout(resolve, 500));
    return { data: { isSuccess: true, data: normalizePharmacyData(MOCK_PHARMACIES) }, status: 200 };
  }

  const citySlug = city ? slugify(city) : 'istanbul';
  const districtSlug = district ? slugify(district) : '';

  // CACHE KEY: "2026-01-04_istanbul_kadikoy"
  const today = new Date().toISOString().split('T')[0];
  const cacheKey = `${today}_${citySlug}_${districtSlug || 'all'}`;

  try {
    // 1. Check Firebase Cache
    const docRef = doc(db, "daily_pharmacies", cacheKey);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      console.log("Data fetched from FIREBASE CACHE! (No API Cost)");
      const cachedData = docSnap.data().data;
      // We store normalized data in Firestore to save processing
      return { data: { isSuccess: true, data: cachedData }, status: 200 };
    }

    console.log("Cache miss. Fetching from API...");

    // 2. Fetch from API
    let url = `${BASE_URL}/dutyPharmacy?il=${citySlug}`;
    if (districtSlug) {
      url += `&ilce=${districtSlug}`;
    }

    const response = await axios.get(url, config);

    // 3. Save to Firebase Cache
    if (response.data && response.data.success && response.data.result) {
      const normalized = normalizePharmacyData(response.data.result);

      await setDoc(docRef, {
        data: normalized,
        updatedAt: new Date(),
        source: 'api'
      });
      console.log("Data saved to FIREBASE CACHE.");

      return { data: { isSuccess: true, data: normalized }, status: 200 };
    } else {
      // API returned error or empty
      return { data: { isSuccess: false, errorMessage: "API'den veri alınamadı" }, status: 200 };
    }

  } catch (err) {
    console.error("Cache/API Error", err);
    throw err;
  }
};

const getPharmaciesByCityAndDistrict = async (cityName, districtName) => {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { data: { isSuccess: true, data: normalizePharmacyData(MOCK_PHARMACIES) }, status: 200 };
  }

  const citySlug = slugify(cityName);
  // districtName might be null/empty, handle gracefully
  const districtSlug = districtName ? slugify(districtName) : null;

  // CACHE KEY: "2026-01-04_istanbul_kadikoy" OR "2026-01-04_istanbul_all"
  const today = new Date().toISOString().split('T')[0];
  const cacheKey = `${today}_${citySlug}_${districtSlug || 'all'}`;

  try {
    // 1. Check Firebase Cache
    const docRef = doc(db, "daily_pharmacies", cacheKey);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      console.log("Data fetched from FIREBASE CACHE! (No API Cost)");
      const cachedData = docSnap.data().data;
      return { data: { isSuccess: true, data: cachedData }, status: 200 };
    }

    console.log("Cache miss. Fetching from API...");

    // 2. Fetch from API
    let url = `${BASE_URL}/dutyPharmacy?il=${citySlug}`;
    if (districtSlug) {
      url += `&ilce=${districtSlug}`;
    }

    const response = await axios.get(url, config);

    // 3. Save to Firebase Cache
    if (response.data && response.data.success && response.data.result) {
      const normalized = normalizePharmacyData(response.data.result);

      await setDoc(docRef, {
        data: normalized,
        updatedAt: new Date(),
        source: 'api'
      });
      console.log("Data saved to FIREBASE CACHE.");

      return { data: { isSuccess: true, data: normalized }, status: 200 }; // mapping result to data for compatibility
    } else {
      // API returned error or empty
      return { data: { isSuccess: false, errorMessage: "API'den veri alınamadı" }, status: 200 };
    }

  } catch (err) {
    console.error("Cache/API Error", err);
    throw err;
  }
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