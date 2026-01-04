import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// import { getAnalytics } from "firebase/analytics"; // React Native'de standart web analytics bazen hata verebilir, şimdilik kapattım.

const firebaseConfig = {
    apiKey: "AIzaSyD_lNqLK4IiPFDoOah66r8LOh99pWIpQ9M",
    authDomain: "pharmacyapp-20ce5.firebaseapp.com",
    projectId: "pharmacyapp-20ce5",
    storageBucket: "pharmacyapp-20ce5.firebasestorage.app",
    messagingSenderId: "58526751560",
    appId: "1:58526751560:web:a3c91ef87974f678a5f17d",
    measurementId: "G-ZQJB46T5VG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
