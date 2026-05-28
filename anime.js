const API_BASE = "https://anikoto-api-nine.vercel.app";
const ITEMS_PER_LOAD = 30;

let allAnime = [];
let filteredAnime = [];
let visibleCount = ITEMS_PER_LOAD;
let currentSpot = null;
let spotTimer = null;
let searchTimer = null;
let railTimer = null;
let suggestionController = null;

const $ = (id) => document.getElementById(id);

const loader = $("loader");
const loaderText = $("loaderText");
const navLinks = $("navLinks");
const menuBtn = $("menuBtn");

const miniList = $("miniList");
const spotBg = $("spotBg");
const spotTitle = $("spotTitle");
const spotDesc = $("spotDesc");
const spotRating = $("spotRating");
const spotEp = $("spotEp");
const spotGenre = $("spotGenre");
const spotImg = $("spotImg");
const spotWatch = $("spotWatch");
const spotInfo = $("spotInfo");
const randomBtn = $("randomBtn");

const totalAnime = $("totalAnime");
const continueTitle = $("continueTitle");
const continueText = $("continueText");

const searchInput = $("searchInput");
const clearSearch = $("clearSearch");
const searchBtn = $("searchBtn");
const suggestBox = $("suggestBox");
const genreFilter = $("genreFilter");
const sortFilter = $("sortFilter");
const refreshBtn = $("refreshBtn");

const trendingRail = $("trendingRail");
const randomRail = $("randomRail");
const resultText = $("resultText");
const animeGrid = $("animeGrid");
const emptyState = $("emptyState");
const loadMoreBtn = $("loadMoreBtn");

const modal = $("modal");
const modalOverlay = $("modalOverlay");
const modalClose = $("modalClose");
const modalImg = $("modalImg");
const modalGenre = $("modalGenre");
const modalTitle = $("modalTitle");
const modalRating = $("modalRating");
const modalEp = $("modalEp");
const modalYear = $("modalYear");
const modalDesc = $("modalDesc");
const modalWatch = $("modalWatch");
const modalSave = $("modalSave");
const backTop = $("backTop");

document.addEventListener("DOMContentLoaded", init);

async function init(){
  bindEvents();
  renderSkeleton();
  loadContinue();
  await loadAnime();

  setTimeout(() => {
    loader.style.opacity = "0";
    loader.style.pointerEvents = "none";
  }, 900);
}

async function loadAnime(){
  loaderText.textContent = "Connecting to Shadow API...";
  resultText.textContent = "Loading anime from API...";

  const starterKeywords = ["naruto", "one piece", "dragon", "solo", "jujutsu"];
  let combined = [];

  for(const keyword of starterKeywords){
    const list = await fetchAnimeSearch(keyword);
    combined = [...combined, ...list];
  }

  const extraEndpoints = [
    `${API_BASE}/api/most-popular`,
    `${API_BASE}/api/anime`,
    `anime.json?v=${Date.now()}`
  ];

  for(const url of extraEndpoints){
    try{
      const res = await fetch(url);
      if(!res.ok) continue;
      const json = await res.json();
      combined = [...combined, ...normalize(extractArray(json))];
    }catch(err){
      console.warn("Endpoint failed:", url);
    }
  }

  allAnime = removeDuplicates(combined);
  filteredAnime = [...allAnime];
  visibleCount = ITEMS_PER_LOAD;

  if(!allAnime.length){
    animeGrid.innerHTML = "";
    emptyState.style.display = "block";
    loadMoreBtn.style.display = "none";
    resultText.textContent = "API offline or no anime found.";
    totalAnime.textContent = "0";
    return;
  }

  totalAnime.textContent = allAnime.length;

  buildGenres();
  renderMiniList();
  renderRails();
  setRandomSpot();
  renderGrid();

  if(spotTimer) clearInterval(spotTimer);
  spotTimer = setInterval(setRandomSpot, 7500);

  if(railTimer) clearInterval(railTimer);
  railTimer = setInterval(autoSlideRails, 2500);
}

async function fetchAnimeSearch(keyword, signal){
  try{
    const res = await fetch(
      `${API_BASE}/api/search?keyword=${encodeURIComponent(keyword)}`,
      signal ? { signal } : {}
    );

    if(!res.ok) return [];

    const json = await res.json();
    return normalize(extractArray(json));
  }catch(err){
    return [];
  }
}

function extractArray(json){
  if(Array.isArray(json)) return json;

  const keys = [
    "results",
    "data",
    "anime",
    "items",
    "popular",
    "episodes",
    "list",
    "shows"
  ];

  for(const key of keys){
    if(Array.isArray(json?.[key])) return json[key];
  }

  if(Array.isArray(json?.results?.data)) return json.results.data;
  if(Array.isArray(json?.data?.results)) return json.data.results;
  if(Array.isArray(json?.data?.anime)) return json.data.anime;
  if(Array.isArray(json?.data?.items)) return json.data.items;

  return [];
}

function normalize(list){
  return list.map((item,index)=>{
    const title =
      item.title ||
      item.name ||
      item.animeTitle ||
      item.anime_name ||
      item.jname ||
      item.id ||
      `Anime ${index + 1}`;

    const id =
      item.id ||
      item.animeId ||
      item.anime_id ||
      item.slug ||
      makeSlug(title);

    const possibleImage =
      item.image ||
      item.img ||
      item.poster ||
      item.cover ||
      item.thumbnail ||
      item.imageUrl ||
      item.posterImage ||
      item.coverImage ||
      item.banner;

    const image = validImage(possibleImage)
      ? possibleImage
      : "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=700&q=80";

    const genreRaw =
      item.genre ||
      item.genres ||
      item.category ||
      item.type ||
      item.status ||
      "Anime";

    const genre = Array.isArray(genreRaw)
      ? genreRaw.join(", ")
      : String(genreRaw);

    const rating =
      item.rating ||
      item.score ||
      item.rank ||
      item.imdb ||
      item.malScore ||
      "N/A";

    const episodes =
      item.episodes ||
      item.totalEpisodes ||
      item.episode ||
      item.latestEpisode ||
      item.subOrDub ||
      "N/A";

    const year =
      item.year ||
      item.releaseDate ||
      item.released ||
      item.releaseYear ||
      "Unknown";

    const description =
      item.description ||
      item.desc ||
      item.synopsis ||
      item.overview ||
      "No description available for this anime yet.";

    return {
      raw:item,
      id:String(id),
      title:String(title),
      image:String(image),
      genre:String(genre),
      rating:String(rating),
      episodes:String(episodes),
      year:String(year),
      description:String(description)
    };
  }).filter(anime => anime.title && anime.image);
}

function validImage(url){
  if(!url) return false;
  const u = String(url);

  return (
    u.startsWith("http") ||
    u.startsWith("./") ||
    u.startsWith("/") ||
    u.includes("cdn") ||
    u.includes("image") ||
    u.includes("poster")
  );
}

function removeDuplicates(list){
  const map = new Map();

  list.forEach(anime=>{
    const key = anime.id || anime.title.toLowerCase();
    if(!map.has(key)) map.set(key, anime);
  });

  return [...map.values()];
}

function buildGenres(){
  const set = new Set();

  allAnime.forEach(anime=>{
    anime.genre.split(",").forEach(g=>{
      const clean = g.trim();
      if(clean && clean.length < 25) set.add(clean);
    });
  });

  genreFilter.innerHTML = `<option value="all">All Genres</option>`;

  [...set].sort().slice(0,50).forEach(g=>{
    const option = document.createElement("option");
    option.value = g.toLowerCase();
    option.textContent = g;
    genreFilter.appendChild(option);
  });
}

function renderMiniList(){
  miniList.innerHTML = "";

  allAnime.slice(0,14).forEach(anime=>{
    const div = document.createElement("div");
    div.className = "mini-item";

    div.innerHTML = `
      <img src="${anime.image}" alt="${safe(anime.title)}">
      <div>
        <h4>${safe(anime.title)}</h4>
        <p>${safe(anime.genre)}</p>
      </div>
    `;

    div.onclick = () => setSpot(anime);
    miniList.appendChild(div);
  });
}

function renderRails(){
  const shuffled = [...allAnime].sort(()=>Math.random() - 0.5);

  makeRail(trendingRail, shuffled.slice(0,14));
  makeRail(randomRail, shuffled.slice(14,28));
}

function makeRail(container, list){
  container.innerHTML = "";

  list.forEach(anime=>{
    const card = document.createElement("div");
    card.className = "rail-card";

    card.innerHTML = `
      <img src="${anime.image}" alt="${safe(anime.title)}">
      <span>${safe(anime.title)}</span>
    `;
    card.onclick = () => {
  window.location.href =
    `anime-details.html?id=${encodeURIComponent(anime.id)}`;
};

    container.appendChild(card);
  });
}

function autoSlideRails(){
  document.querySelectorAll(".rail").forEach(rail=>{
    if(rail.scrollWidth <= rail.clientWidth) return;

    rail.scrollLeft += 190;

    if(rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 30){
      rail.scrollLeft = 0;
    }
  });
}

function setRandomSpot(){
  if(!allAnime.length) return;
  const anime = allAnime[Math.floor(Math.random() * allAnime.length)];
  setSpot(anime);
}

function setSpot(anime){
  currentSpot = anime;

  spotBg.style.backgroundImage = `url("${anime.image}")`;
  spotImg.src = anime.image;
  spotTitle.textContent = anime.title;
  spotDesc.textContent = anime.description;
  spotRating.textContent = `★ ${anime.rating}`;
  spotEp.textContent = `EP ${anime.episodes}`;
  spotGenre.textContent = anime.genre;

  spotWatch.onclick = () => {
    saveContinue(anime);
    window.location.href = watchURL(anime);
  };

  spotInfo.onclick = () => {
  window.location.href = `anime-details.html?id=${encodeURIComponent(anime.id)}`;
};
}

async function searchAPI(query){
  const q = query.trim();

  if(q.length < 2){
    applyFilters();
    return;
  }

  resultText.textContent = `Searching "${q}" from full API...`;

  const apiResults = await fetchAnimeSearch(q);

  if(apiResults.length){
    filteredAnime = removeDuplicates(apiResults);
  }else{
    filteredAnime = localSearch(q);
  }

  visibleCount = ITEMS_PER_LOAD;
  sortList();
  renderGrid();

  if(filteredAnime.length){
    setSpot(filteredAnime[0]);
    setTimeout(()=>{
      animeGrid.scrollIntoView({behavior:"smooth",block:"start"});
    },150);
  }
}

function localSearch(query){
  const q = query.toLowerCase();

  return allAnime.filter(anime=>{
    return `${anime.title} ${anime.genre} ${anime.description}`
      .toLowerCase()
      .includes(q);
  });
}

function applyFilters(){
  const q = searchInput.value.trim().toLowerCase();
  const genre = genreFilter.value;

  filteredAnime = allAnime.filter(anime=>{
    const text = `${anime.title} ${anime.genre} ${anime.description}`.toLowerCase();

    const matchText = !q || text.includes(q);
    const matchGenre =
      genre === "all" ||
      anime.genre.toLowerCase().includes(genre);

    return matchText && matchGenre;
  });

  visibleCount = ITEMS_PER_LOAD;
  sortList();
  renderGrid();
}

function sortList(){
  const sort = sortFilter.value;

  if(sort === "az"){
    filteredAnime.sort((a,b)=>a.title.localeCompare(b.title));
  }

  if(sort === "za"){
    filteredAnime.sort((a,b)=>b.title.localeCompare(a.title));
  }

  if(sort === "rating"){
    filteredAnime.sort((a,b)=>(parseFloat(b.rating)||0) - (parseFloat(a.rating)||0));
  }

  if(sort === "latest"){
    filteredAnime.reverse();
  }
}

function renderGrid(){
  animeGrid.innerHTML = "";

  const items = filteredAnime.slice(0, visibleCount);

  emptyState.style.display = items.length ? "none" : "block";

  items.forEach((anime,index)=>{
    const card = document.createElement("article");
    card.className = "anime-card";
    card.dataset.animeId = anime.id;
    card.style.animationDelay = `${index * 0.025}s`;

    card.innerHTML = `
      <img src="${anime.image}" alt="${safe(anime.title)}" loading="lazy">
      <div class="card-shade"></div>

      <div class="card-info">
        <h3>${safe(anime.title)}</h3>
        <p>★ ${safe(anime.rating)} • EP ${safe(anime.episodes)}</p>

        <div class="card-buttons">
          <button class="watch">Watch</button>
          <button class="info">Info</button>
        </div>
      </div>
    `;

    card.querySelector(".watch").onclick = (e) => {
      e.stopPropagation();
      saveContinue(anime);
      window.location.href = watchURL(anime);
    };

    card.querySelector(".info").onclick = (e) => {
      e.stopPropagation();
      window.location.href = `anime-details.html?id=${encodeURIComponent(anime.id)}`;
    };

    card.onclick = () => {
  window.location.href = `anime-details.html?id=${encodeURIComponent(anime.id)}`;
};

    animeGrid.appendChild(card);
  });

  resultText.textContent = `${filteredAnime.length} anime found • Showing ${items.length}`;

  loadMoreBtn.style.display =
    visibleCount < filteredAnime.length ? "inline-flex" : "none";
}

async function showSuggestions(query){
  const q = query.trim();

  if(!q){
    suggestBox.style.display = "none";
    return;
  }

  suggestBox.innerHTML = `
    <div class="suggest-item">
      <div>
        <h4>Searching API...</h4>
        <p>Finding anime from full database</p>
      </div>
    </div>
  `;
  suggestBox.style.display = "block";

  try{
    const res = await fetch(`${API_BASE}/api/search?keyword=${encodeURIComponent(q)}`);
    const json = await res.json();

    const apiAnime = normalize(extractArray(json)).slice(0, 10);

    if(!apiAnime.length){
      suggestBox.innerHTML = `
        <div class="suggest-item">
          <div>
            <h4>No anime found</h4>
            <p>Try another name</p>
          </div>
        </div>
      `;
      return;
    }

    suggestBox.innerHTML = apiAnime.map(anime => `
      <div class="suggest-item" data-id="${safeAttr(anime.id)}">
        <img src="${anime.image}" alt="${safe(anime.title)}">
        <div>
          <h4>${safe(anime.title)}</h4>
          <p>${safe(anime.genre)} • EP ${safe(anime.episodes)}</p>
        </div>
      </div>
    `).join("");

    suggestBox.querySelectorAll(".suggest-item").forEach(item=>{
      item.onclick = () => {
        const anime = apiAnime.find(a => a.id === item.dataset.id);
        if(!anime) return;

        searchInput.value = anime.title;
        suggestBox.style.display = "none";

        filteredAnime = [anime];
        visibleCount = ITEMS_PER_LOAD;
        renderGrid();
        setSpot(anime);

        setTimeout(()=>{
          animeGrid.scrollIntoView({behavior:"smooth"});
        },200);
      };
    });

  }catch(error){
    suggestBox.innerHTML = `
      <div class="suggest-item">
        <div>
          <h4>API search failed</h4>
          <p>Check endpoint or internet</p>
        </div>
      </div>
    `;
  }
}

async function goToBestMatch(query){
  const q = query.trim().toLowerCase();

  let anime =
    allAnime.find(a=>a.title.toLowerCase() === q) ||
    allAnime.find(a=>a.title.toLowerCase().includes(q));

  if(!anime){
    const apiResults = await fetchAnimeSearch(query);
    anime =
      apiResults.find(a=>a.title.toLowerCase() === q) ||
      apiResults.find(a=>a.title.toLowerCase().includes(q));

    if(apiResults.length){
      filteredAnime = removeDuplicates(apiResults);
      visibleCount = ITEMS_PER_LOAD;
      sortList();
      renderGrid();
    }
  }

  if(anime){
    goToAnime(anime);
  }else{
    await searchAPI(query);
  }
}

function goToAnime(anime){
  const existsInAll = allAnime.some(a=>a.id === anime.id);
  if(!existsInAll){
    allAnime.unshift(anime);
    totalAnime.textContent = allAnime.length;
  }

  filteredAnime = [
    anime,
    ...allAnime.filter(a=>a.id !== anime.id)
  ];

  visibleCount = ITEMS_PER_LOAD;

  renderGrid();
  setSpot(anime);

  setTimeout(()=>{
    animeGrid.scrollIntoView({behavior:"smooth",block:"start"});
    highlightAnimeCard(anime);
  },200);
}

function highlightAnimeCard(anime){
  const card = document.querySelector(`[data-anime-id="${cssEscape(anime.id)}"]`);

  if(card){
    card.scrollIntoView({behavior:"smooth",block:"center"});
    card.classList.add("highlight-card");

    setTimeout(()=>{
      card.classList.remove("highlight-card");
    },3000);
  }
}

function openModal(anime){
  modalImg.src = anime.image;
  modalGenre.textContent = anime.genre;
  modalTitle.textContent = anime.title;
  modalRating.textContent = `★ ${anime.rating}`;
  modalEp.textContent = `EP ${anime.episodes}`;
  modalYear.textContent = anime.year;
  modalDesc.textContent = anime.description;

  modalWatch.href = watchURL(anime);
  modalWatch.onclick = () => saveContinue(anime);

  modalSave.textContent = "＋ Save";
  modalSave.onclick = () => saveAnime(anime);

  modal.style.display = "flex";
  document.body.style.overflow = "hidden";
}

function closeModal(){
  modal.style.display = "none";
  document.body.style.overflow = "auto";
}

function saveAnime(anime){
  const saved = JSON.parse(localStorage.getItem("shadowSavedAnime") || "[]");

  if(!saved.some(item=>item.id === anime.id)){
    saved.push(anime);
    localStorage.setItem("shadowSavedAnime",JSON.stringify(saved));
    modalSave.textContent = "✓ Saved";
  }else{
    modalSave.textContent = "Already Saved";
  }
}

function saveContinue(anime){
  localStorage.setItem("shadowContinueWatching",JSON.stringify(anime));
  loadContinue();
}

function loadContinue(){
  const anime = JSON.parse(localStorage.getItem("shadowContinueWatching") || "null");

  if(!anime){
    continueTitle.textContent = "None";
    continueText.textContent = "No anime opened yet";
    return;
  }

  continueTitle.textContent = anime.title;
  continueText.textContent = "Continue from last opened anime";
}

function renderSkeleton(){
  animeGrid.innerHTML = "";

  for(let i = 0; i < 12; i++){
    const div = document.createElement("div");
    div.className = "skeleton";
    animeGrid.appendChild(div);
  }
}

function watchURL(anime){
  return `watch.html?id=${encodeURIComponent(anime.id || anime.title)}`;
}

function makeSlug(text){
  return String(text)
    .toLowerCase()
    .replace(/[^\w\s-]/g,"")
    .trim()
    .replace(/\s+/g,"-");
}

function safe(text){
  return String(text)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

function safeAttr(text){
  return String(text)
    .replaceAll("&","&amp;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

function cssEscape(value){
  if(window.CSS && CSS.escape){
    return CSS.escape(value);
  }

  return String(value).replace(/["\\]/g,"\\$&");
}

function bindEvents(){
  menuBtn.onclick = () => navLinks.classList.toggle("active");

  searchInput.addEventListener("input",()=>{
    clearTimeout(searchTimer);

    const q = searchInput.value.trim();

    searchTimer = setTimeout(()=>{
      showSuggestions(q);
    },250);
  });

  searchInput.addEventListener("keydown",(e)=>{
    if(e.key === "Enter"){
      e.preventDefault();
      const q = searchInput.value.trim();
      if(q) goToBestMatch(q);
    }
  });

  searchBtn.onclick = () => {
    const q = searchInput.value.trim();
    if(!q) return;
    goToBestMatch(q);
  };

  clearSearch.onclick = () => {
    searchInput.value = "";
    suggestBox.style.display = "none";
    filteredAnime = [...allAnime];
    visibleCount = ITEMS_PER_LOAD;
    sortList();
    renderGrid();
  };

  loadMoreBtn.onclick = async () => {
    visibleCount += ITEMS_PER_LOAD;
    renderGrid();
  };

  genreFilter.onchange = applyFilters;

  sortFilter.onchange = () => {
    sortList();
    visibleCount = ITEMS_PER_LOAD;
    renderGrid();
  };

  refreshBtn.onclick = async () => {
    renderSkeleton();
    await loadAnime();
  };

  randomBtn.onclick = setRandomSpot;

  modalClose.onclick = closeModal;
  modalOverlay.onclick = closeModal;

  backTop.onclick = () => window.scrollTo({top:0,behavior:"smooth"});

  document.addEventListener("click",(e)=>{
    if(!e.target.closest(".search-wrap")){
      suggestBox.style.display = "none";
    }
  });

  document.addEventListener("keydown",(e)=>{
    if(e.key === "Escape"){
      closeModal();
      suggestBox.style.display = "none";
    }
  });
}