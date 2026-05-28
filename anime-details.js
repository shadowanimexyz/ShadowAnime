const API_BASE = "https://anikoto-api-nine.vercel.app";

const $ = id => document.getElementById(id);

const detailsLoader = $("detailsLoader");
const loaderText = $("loaderText");
const navLinks = $("navLinks");
const menuBtn = $("menuBtn");

const heroBg = $("heroBg");
const animePoster = $("animePoster");
const animeTitle = $("animeTitle");
const animeRating = $("animeRating");
const animeEpisodes = $("animeEpisodes");
const animeYear = $("animeYear");
const animeType = $("animeType");
const animeDesc = $("animeDesc");

const watchBtn = $("watchBtn");
const continueBtn = $("continueBtn");
const saveBtn = $("saveBtn");
const shareBtn = $("shareBtn");

const statusText = $("statusText");
const genreText = $("genreText");
const progressText = $("progressText");
const lastWatchText = $("lastWatchText");

const episodeCountText = $("episodeCountText");
const episodeGrid = $("episodeGrid");
const relatedGrid = $("relatedGrid");

const episodeSearch = $("episodeSearch");
const episodeSort = $("episodeSort");

const backTop = $("backTop");

let currentAnime = null;
let currentEpisodes = [];

document.addEventListener("DOMContentLoaded", init);

async function init(){
  bindEvents();

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if(!id){
    showError("Anime ID missing.");
    return;
  }

  await loadAnime(id);

  setTimeout(()=>{
    detailsLoader.style.opacity = "0";
    detailsLoader.style.pointerEvents = "none";
  },800);
}

async function loadAnime(id){
  loaderText.textContent = "Loading anime details...";

  renderEpisodeSkeleton();
  renderRelatedSkeleton();

  let anime = await fetchDetails(id);

  if(!anime){
    const search = await fetchSearch(id);
    anime = search[0];
  }

  if(!anime){
    showError("Anime not found.");
    return;
  }

  currentAnime = anime;

  renderAnime(anime);
  generateEpisodes(anime);
  await renderRelated(anime);
}

async function fetchDetails(id){
  const endpoints = [
    `${API_BASE}/api/info?id=${encodeURIComponent(id)}`,
    `${API_BASE}/api/details?id=${encodeURIComponent(id)}`,
    `${API_BASE}/api/anime/${encodeURIComponent(id)}`
  ];

  for(const url of endpoints){
    try{
      const res = await fetch(url);
      if(!res.ok) continue;

      const json = await res.json();
      const item = extractObject(json);

      if(item) return normalize(item);

    }catch(err){
      console.warn("Failed:", url);
    }
  }

  return null;
}

async function fetchSearch(keyword){
  try{
    const res = await fetch(`${API_BASE}/api/search?keyword=${encodeURIComponent(keyword)}`);
    if(!res.ok) return [];

    const json = await res.json();
    return extractArray(json).map(normalize);

  }catch{
    return [];
  }
}

function renderAnime(anime){
  document.title = `${anime.title} | Shadow Anime`;

  heroBg.style.backgroundImage = `url("${anime.image}")`;
  animePoster.src = anime.image;

  animeTitle.textContent = anime.title;
  animeRating.textContent = `★ ${anime.rating}`;
  animeEpisodes.textContent = `EP ${anime.episodes}`;
  animeYear.textContent = anime.year;
  animeType.textContent = anime.genre;

  animeDesc.textContent = anime.description;

  statusText.textContent = anime.status;
  genreText.textContent = anime.genre.split(",")[0];

  watchBtn.href = `watch.html?id=${encodeURIComponent(anime.id)}&ep=1`;

  const progress = JSON.parse(localStorage.getItem("shadow-progress") || "{}");
  const last = progress[anime.id];

  if(last){
    continueBtn.href = `watch.html?id=${encodeURIComponent(anime.id)}&ep=${last}`;
    lastWatchText.textContent = `Last watched episode ${last}`;

    const total = parseInt(anime.episodes) || 12;
    const percent = Math.min(100, Math.floor((last / total) * 100));

    progressText.textContent = `${percent}%`;
  }else{
    continueBtn.href = `watch.html?id=${encodeURIComponent(anime.id)}&ep=1`;
    progressText.textContent = `0%`;
    lastWatchText.textContent = `No episode watched`;
  }

  saveBtn.onclick = () => saveAnime(anime);

  shareBtn.onclick = async () => {
    const url = window.location.href;

    if(navigator.share){
      await navigator.share({
        title: anime.title,
        text: `Watch ${anime.title} on Shadow Anime`,
        url
      });
    }else{
      await navigator.clipboard.writeText(url);

      shareBtn.textContent = "Copied";

      setTimeout(()=>{
        shareBtn.textContent = "Share";
      },1500);
    }
  };
}

function generateEpisodes(anime){
  let total = parseInt(anime.episodes);

  if(!Number.isFinite(total) || total <= 0) total = 12;
  if(total > 200) total = 200;

  currentEpisodes = [];

  for(let i = 1; i <= total; i++){
    currentEpisodes.push({
      number:i,
      title:getEpisodeTitle(i)
    });
  }

  renderEpisodes(currentEpisodes);
}

function renderEpisodes(list){
  episodeGrid.innerHTML = "";

  episodeCountText.textContent = `${list.length} episodes available`;

  const progress = JSON.parse(localStorage.getItem("shadow-progress") || "{}");
  const last = progress[currentAnime.id];

  list.forEach(ep=>{
    const card = document.createElement("button");

    card.className = "episode-card";

    if(last == ep.number){
      card.classList.add("active");
    }

    card.innerHTML = `
      <span class="episode-no">Episode ${ep.number}</span>
      <span class="episode-title">${ep.title}</span>
    `;

    card.onclick = () => {
      progress[currentAnime.id] = ep.number;

      localStorage.setItem(
        "shadow-progress",
        JSON.stringify(progress)
      );

      localStorage.setItem(
        "shadowContinueWatching",
        JSON.stringify(currentAnime)
      );

      window.location.href =
        `watch.html?id=${encodeURIComponent(currentAnime.id)}&ep=${ep.number}`;
    };

    episodeGrid.appendChild(card);
  });
}

async function renderRelated(anime){
  relatedGrid.innerHTML = "";

  const keyword =
    anime.genre.split(",")[0] ||
    anime.title.split(" ")[0];

  const related = await fetchSearch(keyword);

  const finalList = related
    .filter(item => item.id !== anime.id)
    .slice(0,12);

  if(!finalList.length){
    relatedGrid.innerHTML = `
      <p style="color:#9fb4c8;">
        No related anime found.
      </p>
    `;
    return;
  }

  finalList.forEach(item=>{
    const card = document.createElement("article");

    card.className = "related-card";

    card.innerHTML = `
      <img src="${item.image}" alt="${safe(item.title)}">
      <h3>${safe(item.title)}</h3>
    `;

    card.onclick = () => {
      window.location.href =
        `anime-details.html?id=${encodeURIComponent(item.id)}`;
    };

    relatedGrid.appendChild(card);
  });
}

function getEpisodeTitle(num){
  const titles = [
    "The Beginning",
    "Shadow Awakens",
    "Into The Darkness",
    "Battle Start",
    "Danger Zone",
    "The Hidden Power",
    "Rise Of Shadow",
    "Enemy Appears",
    "Night Raid",
    "The Final Clash",
    "Dimension Break",
    "Shadow King"
  ];

  if(num <= titles.length){
    return titles[num - 1];
  }

  return `Shadow Episode ${num}`;
}

function renderEpisodeSkeleton(){
  episodeGrid.innerHTML = "";

  for(let i = 0; i < 12; i++){
    const div = document.createElement("div");

    div.className = "skeleton";
    div.style.height = "85px";

    episodeGrid.appendChild(div);
  }
}

function renderRelatedSkeleton(){
  relatedGrid.innerHTML = "";

  for(let i = 0; i < 8; i++){
    const div = document.createElement("div");

    div.className = "skeleton";

    relatedGrid.appendChild(div);
  }
}

function saveAnime(anime){
  const saved =
    JSON.parse(localStorage.getItem("shadowSavedAnime") || "[]");

  if(!saved.some(item => item.id === anime.id)){
    saved.push(anime);

    localStorage.setItem(
      "shadowSavedAnime",
      JSON.stringify(saved)
    );

    saveBtn.textContent = "✓ Saved";

  }else{
    saveBtn.textContent = "Already Saved";
  }
}

function bindEvents(){
  menuBtn.onclick = () => {
    navLinks.classList.toggle("active");
  };

  backTop.onclick = () => {
    window.scrollTo({
      top:0,
      behavior:"smooth"
    });
  };

  episodeSearch.addEventListener("input",()=>{
    const q = episodeSearch.value.toLowerCase();

    const filtered = currentEpisodes.filter(ep=>{
      return (
        ep.title.toLowerCase().includes(q) ||
        String(ep.number).includes(q)
      );
    });

    renderEpisodes(filtered);
  });

  episodeSort.onchange = () => {
    const mode = episodeSort.value;

    const arr = [...currentEpisodes];

    if(mode === "desc"){
      arr.reverse();
    }

    renderEpisodes(arr);
  };
}

function showError(message){
  animeTitle.textContent = "Anime Not Found";
  animeDesc.textContent = message;

  detailsLoader.style.opacity = "0";
  detailsLoader.style.pointerEvents = "none";
}

function extractObject(json){
  if(!json) return null;

  if(json.title || json.name || json.id) return json;

  if(json.data && typeof json.data === "object" && !Array.isArray(json.data)){
    return json.data;
  }

  if(json.results && typeof json.results === "object" && !Array.isArray(json.results)){
    return json.results;
  }

  if(Array.isArray(json.results)) return json.results[0];
  if(Array.isArray(json.data)) return json.data[0];

  return null;
}

function extractArray(json){
  if(Array.isArray(json)) return json;
  if(Array.isArray(json.results)) return json.results;
  if(Array.isArray(json.data)) return json.data;
  if(Array.isArray(json.anime)) return json.anime;
  if(Array.isArray(json.items)) return json.items;
  return [];
}

function normalize(item){
  const title =
    item.title ||
    item.name ||
    item.animeTitle ||
    item.jname ||
    item.id ||
    "Unknown Anime";

  const id =
    item.id ||
    item.slug ||
    makeSlug(title);

  const image =
    item.image ||
    item.img ||
    item.poster ||
    item.cover ||
    item.thumbnail ||
    item.banner ||
    "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80";

  const genreRaw =
    item.genre ||
    item.genres ||
    item.category ||
    item.type ||
    "Anime";

  return {
    id:String(id),
    title:String(title),
    image:String(image),
    genre:Array.isArray(genreRaw)
      ? genreRaw.join(", ")
      : String(genreRaw),
    rating:String(item.rating || item.score || "N/A"),
    episodes:String(item.episodes || item.totalEpisodes || "12"),
    year:String(item.year || item.releaseDate || "Unknown"),
    status:String(item.status || "Online"),
    description:String(
      item.description ||
      item.desc ||
      item.synopsis ||
      "No description available."
    )
  };
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
window.addEventListener("load", () => {
  setTimeout(() => {
    const loader = document.getElementById("detailsLoader");
    if (loader) loader.style.display = "none";
  }, 2500);
});