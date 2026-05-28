const $ = id => document.getElementById(id);

const vaultLoader = $("vaultLoader");

const menu = $("menu");
const menuBtn = $("menuBtn");

const watchlistSearch = $("watchlistSearch");
const watchlistFilter = $("watchlistFilter");

const continueGrid = $("continueGrid");
const watchlistGrid = $("watchlistGrid");

const totalSaved = $("totalSaved");
const continueCount = $("continueCount");
const favoriteCount = $("favoriteCount");

const resultText = $("resultText");

const emptyState = $("emptyState");

const clearAllBtn = $("clearAllBtn");

let watchlist =
  JSON.parse(localStorage.getItem("shadowWatchlist") || "[]");

document.addEventListener("DOMContentLoaded", initWatchlist);

function initWatchlist(){

  bindWatchlistUI();

  renderWatchlist();
  renderContinueWatching();
  updateWatchlistStats();

  setTimeout(()=>{
    vaultLoader.style.opacity = "0";
    vaultLoader.style.pointerEvents = "none";
  },800);
}

function bindWatchlistUI(){

  if(menuBtn && menu){

    menuBtn.onclick = () => {
      menu.classList.toggle("show");
    };
  }

  watchlistSearch.addEventListener("input",()=>{
    renderWatchlist();
  });

  watchlistFilter.addEventListener("change",()=>{
    renderWatchlist();
  });

  clearAllBtn.onclick = () => {

    const ok =
      confirm("Clear complete watchlist?");

    if(!ok) return;

    watchlist = [];

    saveWatchlist();

    renderWatchlist();
    renderContinueWatching();
    updateWatchlistStats();
  };
}

function renderWatchlist(){

  const keyword =
    watchlistSearch.value.toLowerCase().trim();

  const filter =
    watchlistFilter.value;

  const filtered = watchlist.filter(anime=>{

    const text = `
      ${anime.title}
      ${anime.genre}
      ${anime.type}
    `.toLowerCase();

    const matchesSearch =
      text.includes(keyword);

    let matchesFilter = true;

    if(filter === "continue"){
      matchesFilter =
        (anime.progress || 0) > 0 &&
        !anime.watched;
    }

    if(filter === "favorite"){
      matchesFilter =
        anime.favorite === true;
    }

    if(filter === "watched"){
      matchesFilter =
        anime.watched === true;
    }

    return matchesSearch && matchesFilter;
  });

  if(!filtered.length){

    watchlistGrid.innerHTML = "";
    emptyState.style.display = "block";

    resultText.innerText =
      "0 anime";

    return;
  }

  emptyState.style.display = "none";

  watchlistGrid.innerHTML = filtered.map(anime=>`
    <article class="watch-card">

      <img
        src="${anime.image}"
        alt="${safeText(anime.title)}"
        onerror="this.src='image/default.jpg'"
      >

      <div class="watch-overlay">

        <div class="watch-info">

          <h3>
            ${safeText(anime.title)}
          </h3>

          <p>
            ${safeText(anime.genre || anime.type || "Anime")}
          </p>

          <div class="watch-badges">

            ${
              anime.favorite
              ? `<span class="watch-badge">Favorite</span>`
              : ""
            }

            ${
              anime.watched
              ? `<span class="watch-badge">Watched</span>`
              : ""
            }

            ${
              anime.progress
              ? `<span class="watch-badge">
                  ${anime.progress}% Progress
                </span>`
              : ""
            }

          </div>

          <div class="watch-actions">

            <a href="watch.html?id=${encodeURIComponent(anime.id)}&ep=${anime.ep || 1}">
              Watch
            </a>

            <button onclick="toggleFavorite('${safeAttr(anime.id)}')">
              ${
                anime.favorite
                ? "★"
                : "☆"
              }
            </button>

            <button onclick="removeAnime('${safeAttr(anime.id)}')">
              Remove
            </button>

          </div>

        </div>

      </div>

    </article>
  `).join("");

  resultText.innerText =
    `${filtered.length} anime`;
}

function renderContinueWatching(){

  const list = watchlist.filter(anime=>
    (anime.progress || 0) > 0 &&
    !anime.watched
  );

  if(!list.length){

    continueGrid.innerHTML = `
      <div class="empty-state" style="display:block">
        <h2>No continue watching</h2>
        <p>Start watching anime to track progress.</p>
      </div>
    `;

    return;
  }

  continueGrid.innerHTML = list.map(anime=>`
    <article class="continue-card">

      <img
        src="${anime.image}"
        alt="${safeText(anime.title)}"
        onerror="this.src='image/default.jpg'"
      >

      <div class="continue-content">

        <h3>
          ${safeText(anime.title)}
        </h3>

        <p>
          Episode ${anime.ep || 1}
        </p>

        <div class="progress-bar">
          <div class="progress-fill"
               style="width:${anime.progress || 0}%">
          </div>
        </div>

        <div class="continue-actions">

          <a href="watch.html?id=${encodeURIComponent(anime.id)}&ep=${anime.ep || 1}">
            Continue
          </a>

          <button onclick="markWatched('${safeAttr(anime.id)}')">
            Watched
          </button>

        </div>

      </div>

    </article>
  `).join("");
}

function updateWatchlistStats(){

  totalSaved.innerText =
    watchlist.length;

  continueCount.innerText =
    watchlist.filter(anime=>
      (anime.progress || 0) > 0 &&
      !anime.watched
    ).length;

  favoriteCount.innerText =
    watchlist.filter(anime=>
      anime.favorite
    ).length;
}

function toggleFavorite(id){

  const anime =
    watchlist.find(a => a.id === id);

  if(!anime) return;

  anime.favorite =
    !anime.favorite;

  saveWatchlist();

  renderWatchlist();
  updateWatchlistStats();
}

function markWatched(id){

  const anime =
    watchlist.find(a => a.id === id);

  if(!anime) return;

  anime.watched = true;
  anime.progress = 100;

  saveWatchlist();

  renderWatchlist();
  renderContinueWatching();
  updateWatchlistStats();
}

function removeAnime(id){

  watchlist =
    watchlist.filter(a => a.id !== id);

  saveWatchlist();

  renderWatchlist();
  renderContinueWatching();
  updateWatchlistStats();
}

function saveWatchlist(){

  localStorage.setItem(
    "shadowWatchlist",
    JSON.stringify(watchlist)
  );
}

/* AUTO SAVE HELPERS */

function addToWatchlist(data){

  if(!data || !data.id) return;

  const exists =
    watchlist.find(a => a.id === data.id);

  if(exists) return;

  watchlist.unshift({
    id:data.id,
    title:data.title || "Unknown Anime",
    image:data.image || "image/default.jpg",
    genre:data.genre || "Anime",
    type:data.type || "TV",
    ep:data.ep || 1,
    progress:data.progress || 0,
    favorite:false,
    watched:false
  });

  saveWatchlist();

  renderWatchlist();
  renderContinueWatching();
  updateWatchlistStats();
}

function updateWatchProgress(id,progress,ep){

  const anime =
    watchlist.find(a => a.id === id);

  if(!anime) return;

  anime.progress =
    Math.max(0,Math.min(100,progress));

  anime.ep =
    ep || anime.ep;

  saveWatchlist();
}

/* SAFE */

function safeText(text){

  return String(text || "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

function safeAttr(text){

  return String(text || "")
    .replaceAll("&","&amp;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}