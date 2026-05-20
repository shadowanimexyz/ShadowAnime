import { auth } from "./firebase-config.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

onAuthStateChanged(auth, user => {
    const loginBtn = document.querySelector(".login-btn");

    if(user && loginBtn){
        loginBtn.innerText = "Logout";
        loginBtn.href = "#";

        loginBtn.onclick = () => {
            signOut(auth).then(() => {
                window.location.href = "login.html";
            });
        };
    }
});