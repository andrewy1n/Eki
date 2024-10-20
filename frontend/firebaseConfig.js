// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getStorage } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAFLTYEgyHV9dRaR0TcyA-Nk-lqmjwwnLo",
  authDomain: "calha-7b21c.firebaseapp.com",
  databaseURL: "https://calha-7b21c-default-rtdb.firebaseio.com",
  projectId: "calha-7b21c",
  storageBucket: "calha-7b21c.appspot.com",
  messagingSenderId: "883598294712",
  appId: "1:883598294712:web:d5238ce18328ad049d3e4d",
  measurementId: "G-LPMQND7JVH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const storage = getStorage(app);