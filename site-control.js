(function(){
  const settings = JSON.parse(localStorage.getItem("shadowSettings")) || {};
  const pages = JSON.parse(localStorage.getItem("shadowPageControl")) || {};
  const features = JSON.parse(localStorage.getItem("shadowFeatureControl")) || {};

  const file = location.pathname.split("/").pop().toLowerCase() || "index.html";

  const pageMap = {
    "index.html":"home",
    "anime.html":"anime",
    "movies.html":"movies",
    "popular.html":"popular",
    "manga.html":"manga",
    "community.html":"community",
    "watchlist.html":"watchlist",
    "policy.html":"policy",
    "profile.html":"profile",
    "notifications.html":"notifications"
  };

  const pageKey = pageMap[file];

  if(features.maintenance === true || pages[pageKey] === false){
    document.documentElement.innerHTML = `
      <head>
        <title>Page Offline</title>
        <style>
          body{
            margin:0;
            min-height:100vh;
            display:grid;
            place-items:center;
            background:#030712;
            color:white;
            font-family:Arial,sans-serif;
            text-align:center;
            padding:30px;
          }
          .box{
            max-width:650px;
            padding:40px;
            border-radius:28px;
            border:1px solid rgba(0,200,255,.35);
            background:rgba(7,18,35,.9);
            box-shadow:0 0 40px rgba(0,200,255,.25);
          }
          h1{color:#00c8ff}
          p{color:#9fb4c9}
          a{
            display:inline-block;
            margin-top:20px;
            padding:13px 20px;
            border-radius:15px;
            background:#00c8ff;
            color:#00111c;
            text-decoration:none;
            font-weight:900;
          }
        </style>
      </head>
      <body>
        <div class="box">
          <h1>SHADOW ANIME</h1>
          <h2>This Page Is Offline</h2>
          <p>Admin has temporarily disabled this page.</p>
          <a href="index.html">Go Home</a>
        </div>
      </body>
    `;
    throw new Error("Page disabled by admin settings");
  }

  document.documentElement.style.setProperty("--shadow-theme", settings.themeColor || "#00c8ff");
  document.documentElement.style.setProperty("--shadow-accent", settings.accentColor || "#8a2cff");

  document.addEventListener("DOMContentLoaded",()=>{
    if(settings.logoText){
      document.querySelectorAll(".logo").forEach(el=>el.innerText=settings.logoText);
    }

    document.body.classList.remove("cards-compact","cards-large","cards-glass","cards-premium");

    const mode = (settings.cardMode || "Premium Cards").toLowerCase();

    if(mode.includes("compact")) document.body.classList.add("cards-compact");
    else if(mode.includes("large")) document.body.classList.add("cards-large");
    else if(mode.includes("glass")) document.body.classList.add("cards-glass");
    else document.body.classList.add("cards-premium");
  });
})();