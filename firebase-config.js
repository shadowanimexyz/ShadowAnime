import { initializeApp }
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import { getAuth }
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import { getFirestore }
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {

  apiKey: "AIzaSyBOWTf__8tTzJl01j-P6jNfa_XZjwXAX6E",

  authDomain: "shadow-anime.firebaseapp.com",

  projectId: "shadow-anime",

  storageBucket: "shadow-anime.firebasestorage.app",

  messagingSenderId: "451723011916",

  appId: "1:451723011916:web:f8a6768aadf296426811e9",

  measurementId: "G-W9CWB4GJHL"

};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const db = getFirestore(app);