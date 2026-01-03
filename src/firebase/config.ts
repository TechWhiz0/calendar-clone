import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD3vkxTx3TqiXkVM8JMun2q9JFBHtpr-YY",
  authDomain: "calender-716f2.firebaseapp.com",
  projectId: "calender-716f2",
  storageBucket: "calender-716f2.firebasestorage.app",
  messagingSenderId: "596890825451",
  appId: "1:596890825451:web:20ea492931ac0285e104ae"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Request Calendar API permissions to create Meet links
googleProvider.addScope('https://www.googleapis.com/auth/calendar.events');
googleProvider.addScope('https://www.googleapis.com/auth/calendar.app.created');

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;

