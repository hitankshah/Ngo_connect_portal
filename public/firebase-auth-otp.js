// Import Firebase
import firebase from 'firebase/app';
import 'firebase/auth';

// Initialize Firebase
const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
  measurementId: ""
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Function to send OTP
const sendOtp = (phoneNumber, appVerifier) => {
  firebase.auth().signInWithPhoneNumber(phoneNumber, appVerifier)
    .then((confirmationResult) => {
      // SMS sent. Save the confirmation result to use for verifying the OTP
      window.confirmationResult = confirmationResult;
      console.log('OTP sent');
    }).catch((error) => {
      console.error('Error during OTP send:', error);
    });
};

// Function to verify OTP
const verifyOtp = (otp) => {
  if (window.confirmationResult) {
    window.confirmationResult.confirm(otp)
      .then((result) => {
        // User signed in successfully
        const user = result.user;
        console.log('User signed in:', user);
      }).catch((error) => {
        console.error('Error during OTP verification:', error);
      });
  } else {
    console.error('No confirmation result found. Did you send the OTP?');
  }
};

// Expose functions globally
window.sendOtp = sendOtp;
window.verifyOtp = verifyOtp;
