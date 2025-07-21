// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBTqeXlPiD9T5iQiyPN1bOCt1Ud1bjhJqk",
  authDomain: "futbol-a708b.firebaseapp.com",
  projectId: "futbol-a708b",
  storageBucket: "futbol-a708b.firebasestorage.app",
  messagingSenderId: "190521541115",
  appId: "1:190521541115:web:d69e75ff52dfba68ca4b5e",
  measurementId: "G-MBDXN0NTNQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
