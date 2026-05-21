(function(){

  const ADMIN_PASSWORD = "shadow123"; // change this

  const isAdminPage = location.pathname.toLowerCase().includes("admin-");

  function encryptData(key, value){
    const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(value))));
    localStorage.setItem(key, encoded);
  }

  function decryptData(key){
    try{
      return JSON.parse(decodeURIComponent(escape(atob(localStorage.getItem(key)))));
    }catch{
      return null;
    }
  }

  window.shadowSecureStorage = {
    set: encryptData,
    get: decryptData
  };

  if(isAdminPage){
    const adminLogin = sessionStorage.getItem("shadowAdminLogin");

    if(adminLogin !== "true"){
      const pass = prompt("Enter Admin Password");

      if(pass === ADMIN_PASSWORD){
        sessionStorage.setItem("shadowAdminLogin","true");
      }else{
        document.body.innerHTML = `
          <div style="min-height:100vh;display:grid;place-items:center;background:#030712;color:white;text-align:center;font-family:Arial;padding:30px;">
            <div>
              <h1 style="color:#00c8ff;">Access Denied</h1>
              <p>You are not allowed to open admin panel.</p>
              <a href="index.html" style="color:#00c8ff;">Go Home</a>
            </div>
          </div>
        `;
        throw new Error("Admin blocked");
      }
    }
  }

  let spamClicks = 0;
  let lastClickTime = 0;

  document.addEventListener("click", e => {
    const now = Date.now();

    if(now - lastClickTime < 500){
      spamClicks++;
    }else{
      spamClicks = 0;
    }

    lastClickTime = now;

    if(spamClicks > 8){
      e.preventDefault();
      alert("Too many actions. Please slow down.");
    }
  }, true);

  const forms = document.querySelectorAll("form, textarea, input");

  forms.forEach(el=>{
    el.addEventListener("input",()=>{
      const badWords = ["<script", "javascript:", "onerror=", "onclick="];

      badWords.forEach(word=>{
        if(el.value && el.value.toLowerCase().includes(word)){
          el.value = el.value.replaceAll(word,"");
          alert("Unsafe input removed.");
        }
      });
    });
  });

  document.addEventListener("contextmenu", e => {
    e.preventDefault();
  });

  document.addEventListener("keydown", e => {
    if(
      e.key === "F12" ||
      (e.ctrlKey && e.shiftKey && ["I","J","C"].includes(e.key.toUpperCase())) ||
      (e.ctrlKey && e.key.toUpperCase() === "U")
    ){
      e.preventDefault();
      alert("Inspect is disabled on Shadow Anime.");
    }
  });

})();
