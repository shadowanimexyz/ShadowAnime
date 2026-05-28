const ADMIN_PASSWORD = "Ajinkyajadhao1769";

if (localStorage.getItem("shadowAdminLogin") !== "true") {
  const pass = prompt("Enter Admin Password:");

  if (pass === ADMIN_PASSWORD) {
    localStorage.setItem("shadowAdminLogin", "true");
  } else {
    alert("Wrong password");
    window.location.href = "index.html";
  }
}

function adminLogout(){
  localStorage.removeItem("shadowAdminLogin");
  window.location.href = "index.html";
}