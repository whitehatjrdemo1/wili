import firebase from "firebase";
require("@firebase/firestore");

const firebaseConfig = {
  apiKey: "AIzaSyCZREPjhMAnZpoJpLkqhfu9rNmjA4rzHqI",
  authDomain: "wili-7839c.firebaseapp.com",
  databaseURL: "https://wili-7839c-default-rtdb.firebaseio.com",
  projectId: "wili-7839c",
  storageBucket: "wili-7839c.appspot.com",
  messagingSenderId: "349085458755",
  appId: "1:349085458755:web:327be5e6e4ec1de2434ff6",
};
// Initialize Firebase
// firebase.initializeApp(firebaseConfig);

// export default firebase.firestore();

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
export default firebase.firestore();
