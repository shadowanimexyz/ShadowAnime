import { auth } from "./firebase-config.js";

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const email = document.getElementById("email");
const password = document.getElementById("password");
const authMsg = document.getElementById("authMsg");
const signupBtn = document.getElementById("signupBtn");
const loginBtn = document.getElementById("loginBtn");

signupBtn.addEventListener("click", () => {
    authMsg.innerText = "Creating account...";

    createUserWithEmailAndPassword(auth, email.value, password.value)
    .then(() => {
        authMsg.innerText = "Account created successfully!";
        window.location.href = "index.html";
    })
    .catch(error => {
        authMsg.innerText = error.message;
    });
});

loginBtn.addEventListener("click", () => {
    authMsg.innerText = "Signing in...";

    signInWithEmailAndPassword(auth, email.value, password.value)
    .then(() => {
        authMsg.innerText = "Login successful!";
        window.location.href = "index.html";
    })
    .catch(error => {
        authMsg.innerText = error.message;
    });
});