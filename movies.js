const API = "https://anikoto-api-nine.vercel.app";
const PER_PAGE = 30;

let page = 1;
let allMovies = [];
let currentMovies = [];
let movieSearchTimer = null;
let movieSpotlightTimer = null;

const $ = id => document.getElementById(id);

const movieLoader = $("movieLoader");
const loaderText = $("loaderText");

const menu = $("menu");
const menuBtn = $("menuBtn");

const movieSearch = $("movieSearch");
const movieSearchBtn = $("movieSearchBtn");
const movieSuggestBox = $("movieSuggestBox");
const movieFilter = $("movieFilter");
const movieSort = $("movieSort");
const movieChips = $("movieChips");

const movieGrid = $("movieGrid");
const moviePagination = $("moviePagination");
const movieLoadingGrid = $("movieLoadingGrid");
const movieEmpty = $("movieEmpty");
const movieResultCount = $("movieResultCount");

const totalMovieCount = $("totalMovieCount");
const currentMovieCount = $("currentMovieCount");
const moviePageCount = $("moviePageCount");
const movieTagCount = $("movieTagCount");

const movieSpotlightImg = $("movieSpotlightImg");
const movieSpotlightTitle = $("movieSpotlightTitle");
const movieSpotlightInfo = $("movieSpotlightInfo");
const movieSpotlightLink = $("movieSpotlightLink");

const movieFeaturedGrid = $("movieFeaturedGrid");
const movieLatestGrid = $("movieLatestGrid");

const randomMovieBtn = $("randomMovieBtn");
const shuffleMovieBtn = $("shuffleMovieBtn");
const refreshFeaturedBtn = $("refreshFeaturedBtn");

const moviePreviewModal = $("moviePreviewModal");
const closePreviewBtn = $("closePreviewBtn");
const previewImg = $("previewImg");
const previewTitle = $("previewTitle");
const previewInfo = $("previewInfo");
const previewLink = $("previewLink");
const previewWatchBtn = $("previewWatchBtn");

const toTop = $("toTop");
const allMoviesSection = $("allMoviesSection");

document.addEventListener("DOMContentLoaded", init);

async function init(){
  bindEvents();
  showSkeleton();
  await loadMoviesFromAPI();

  setTimeout(()=>{
    movieLoader.style.opacity = "0";
    movieLoader.style.pointerEvents = "none";
  }, 800);
}

function bindEvents(){
  if(menuBtn && menu){
    menuBtn.onclick = () => menu.classList.toggle("show");
  }

  movieSearch.addEventListener("input",()=>{
    clearTimeout(movieSearchTimer);

    const q = movieSearch.value.trim();

    showMovieSuggestions(q);

    movieSearchTimer = setTimeout(()=>{
      if(q.length >= 2){
        searchMoviesFromAPI(q);
      }else{
        applyMovieFilters();
      }
    },450);
  });

  movieSearchBtn.onclick = () => {
    const q = movieSearch.value.trim();

    if(q.length >= 2){
      searchMoviesFromAPI(q);
    }else{
      applyMovieFilters();
    }
  };

  movieFilter.onchange = applyMovieFilters;
  movieSort.onchange = applyMovieFilters;

  randomMovieBtn.onclick = randomMovie;
  shuffleMovieBtn.onclick = shuffleMovies;
  refreshFeaturedBtn.onclick = renderFeaturedMovies;

  closePreviewBtn.onclick = closeMoviePreview;

  moviePreviewModal.addEventListener("click",(e)=>{
    if(e.target === moviePreviewModal) closeMoviePreview();
  });

  toTop.onclick = () => {
    window.scrollTo({top:0,behavior:"smooth"});
  };

  window.addEventListener("scroll",()=>{
    toTop.style.display = window.scrollY > 500 ? "block" : "none";
  });

  document.addEventListener("click",(e)=>{
    if(!e.target.closest(".movie-search-wrap")){
      movieSuggestBox.style.display = "none";
    }
  });
}

async function apiGet(url){
  const res = await fetch(url);
  if(!res.ok) throw new Error("API Error: " + res.status);
  return await res.json();
}

function normalizeArray(json){
  if(Array.isArray(json)) return json;

  return (
    json?.data?.results ||
    json?.data?.anime ||
    json?.data?.items ||
    json?.data ||
    json?.results ||
    json?.anime ||
    json?.items ||
    []
  );
}

async function loadMoviesFromAPI(){
  loaderText.textContent = "Connecting to movie API...";
  movieResultCount.innerText = "Loading movies from API...";
  movieEmpty.style.display = "none";

  try{
    const endpoints = [
      `${API}/api/search?keyword=movie`,
      `${API}/api/search?keyword=film`,
      `${API}/api/search?keyword=one piece movie`,
      `${API}/api/search?keyword=naruto movie`,
      `${API}/api/search?keyword=dragon ball movie`,
      `${API}/api/all-anime?page=1`
    ];

    let raw = [];

    const responses = await Promise.all(
      endpoints.map(url => apiGet(url).catch(()=>null))
    );

    responses.forEach(json=>{
      if(json) raw.push(...normalizeArray(json));
    });

    const mapped = raw
      .map(mapMovie)
      .filter(movie => movie.id);

    const movieOnly = mapped.filter(isMovieItem);

    allMovies = removeDuplicates(movieOnly.length ? movieOnly : mapped);
    currentMovies = [...allMovies];

    movieLoadingGrid.style.display = "none";

    buildMovieChips();
    renderMovieSpotlight();
    renderFeaturedMovies();
    renderLatestMovies();
    renderMovies();
    createMoviePagination();
    updateMovieStats();

    if(movieSpotlightTimer) clearInterval(movieSpotlightTimer);
    movieSpotlightTimer = setInterval(renderMovieSpotlight, 8000);

  }catch(error){
    console.error("MOVIE API LOAD ERROR:", error);
    movieLoadingGrid.style.display = "none";
    movieEmpty.style.display = "block";
    movieResultCount.innerText = "Movie API failed";
  }
}

async function searchMoviesFromAPI(query){
  movieLoadingGrid.style.display = "none";
  movieEmpty.style.display = "none";
  movieGrid.innerHTML = `<div style="padding:30px;color:#9fb4c9;">Searching movies for "${safeText(query)}"...</div>`;
  movieResultCount.innerText = "Searching API...";

  try{
    const json = await apiGet(`${API}/api/search?keyword=${encodeURIComponent(query)}`);
    const raw = normalizeArray(json);

    let mapped = raw
      .map(mapMovie)
      .filter(movie => movie.id);

    const movieOnly = mapped.filter(isMovieItem);
    mapped = movieOnly.length ? movieOnly : mapped;

    currentMovies = removeDuplicates(mapped);
    allMovies = removeDuplicates([...allMovies, ...currentMovies]);

    page = 1;

    renderMovies();
    createMoviePagination();
    updateMovieStats();

    movieResultCount.innerText = `${currentMovies.length} movies found from API`;

  }catch(error){
    console.error("MOVIE SEARCH ERROR:", error);
    movieGrid.innerHTML = "";
    movieEmpty.style.display = "block";
    movieResultCount.innerText = "Movie search failed";
  }
}

function isMovieItem(item){
  const text = `
    ${item?.type || ""}
    ${item?.category || ""}
    ${item?.genre || ""}
    ${item?.title || ""}
    ${item?.name || ""}
    ${item?.quality || ""}
  `.toLowerCase();

  return text.includes("movie") || text.includes("film");
}

function mapMovie(movie){
  const title =
    movie.title ||
    movie.name ||
    movie.animeTitle ||
    movie.jname ||
    "Unknown Movie";

  const id =
    movie.id ||
    movie.slug ||
    movie.animeId ||
    movie.anime_id ||
    makeSlug(title);

  const image =
    movie.image ||
    movie.poster ||
    movie.cover ||
    movie.thumbnail ||
    movie.imageUrl ||
    movie.banner ||
    "image/default.jpg";

  const genreRaw =
    movie.genre ||
    movie.genres ||
    movie.category ||
    movie.type ||
    "Anime Movie";

  const genre = Array.isArray(genreRaw)
    ? genreRaw.join(", ")
    : String(genreRaw);

  return {
    raw: movie,
    id: String(id),
    title: String(title),
    name: String(title),
    image: String(image),
    banner: movie.banner || image,
    year: movie.year || movie.releaseDate || movie.released || "",
    quality: movie.quality || movie.type || "Movie",
    genre,
    category: movie.category || movie.type || "movie",
    type: movie.type || "movie",
    episodes: movie.episodes || movie.sub || movie.dub || "",
    description: movie.description || movie.synopsis || movie.desc || "No description available.",
    link: `anime-details.html?id=${encodeURIComponent(id)}`
  };
}

function applyMovieFilters(){
  const keyword = movieSearch.value.toLowerCase().trim();
  const filter = movieFilter.value;
  const sort = movieSort.value;

  let list = allMovies.filter(movie=>{
    const text = getMovieText(movie);

    return (
      text.includes(keyword) &&
      (filter === "all" || text.includes(filter))
    );
  });

  if(sort === "az"){
    list.sort((a,b)=>getMovieName(a).localeCompare(getMovieName(b)));
  }

  if(sort === "za"){
    list.sort((a,b)=>getMovieName(b).localeCompare(getMovieName(a)));
  }

  if(sort === "year"){
    list.sort((a,b)=>(Number(b.year)||0) - (Number(a.year)||0));
  }

  if(sort === "random"){
    list.sort(()=>Math.random() - 0.5);
  }

  currentMovies = list;
  page = 1;

  renderMovies();
  createMoviePagination();
  updateMovieStats();
}

function renderMovies(){
  const start = (page - 1) * PER_PAGE;
  const end = start + PER_PAGE;
  const pageItems = currentMovies.slice(start,end);

  movieGrid.innerHTML = pageItems.map((movie,index)=>`
    <article class="movie-card" onclick="openMovieDetails('${safeAttr(movie.id)}')">
      <img loading="lazy" src="${movie.image}" alt="${safeText(movie.title)}" onerror="this.src='image/default.jpg'">

      <div class="movie-overlay">
        <div class="movie-overlay-content">
          <h3>${safeText(movie.title)}</h3>
          <p>${safeText(movie.quality || movie.year || movie.genre || "Anime Movie")}</p>

          <div class="movie-card-buttons">
            <a href="anime-details.html?id=${encodeURIComponent(movie.id)}" onclick="event.stopPropagation()">Details</a>
            <button onclick="event.stopPropagation();openMoviePreview(${start + index})">Preview</button>
          </div>
        </div>
      </div>
    </article>
  `).join("");

  movieEmpty.style.display = pageItems.length ? "none" : "block";
  movieResultCount.innerText = `${currentMovies.length} movies found`;
  currentMovieCount.innerText = pageItems.length;
}

function createMoviePagination(){
  const totalPages = Math.ceil(currentMovies.length / PER_PAGE);

  moviePagination.innerHTML = "";

  moviePageCount.innerText = totalPages || 0;

  if(totalPages <= 1) return;

  if(page > 1){
    moviePagination.innerHTML += `<a href="javascript:void(0)" onclick="goMoviePage(${page - 1})">Prev</a>`;
  }

  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);

  for(let i = start; i <= end; i++){
    moviePagination.innerHTML += `
      <a href="javascript:void(0)"
         onclick="goMoviePage(${i})"
         class="${i === page ? "active-page" : ""}">
        ${i}
      </a>
    `;
  }

  if(page < totalPages){
    moviePagination.innerHTML += `<a href="javascript:void(0)" onclick="goMoviePage(${page + 1})">Next</a>`;
  }
}

function goMoviePage(num){
  page = num;

  renderMovies();
  createMoviePagination();

  allMoviesSection.scrollIntoView({behavior:"smooth"});
}

function buildMovieChips(){
  movieChips.innerHTML = `<button class="active" data-tag="">All</button>`;

  const tags = new Set();
  const defaults = ["movie","action","romance","drama","fantasy","adventure","hd","dub","sub"];

  allMovies.forEach(movie=>{
    const text = `${movie.genre || ""} ${movie.category || ""} ${movie.quality || ""} ${movie.type || ""}`.toLowerCase();

    text.split(/[,/| ]+/).forEach(word=>{
      if(word.length > 2 && tags.size < 14){
        tags.add(word);
      }
    });
  });

  defaults.forEach(tag=>tags.add(tag));

  tags.forEach(tag=>{
    movieChips.innerHTML += `<button data-tag="${safeAttr(tag)}">${safeText(tag)}</button>`;
  });

  movieChips.querySelectorAll("button").forEach(btn=>{
    btn.onclick = () => {
      const tag = btn.dataset.tag || "";

      movieChips.querySelectorAll("button").forEach(b=>b.classList.remove("active"));
      btn.classList.add("active");

      movieSearch.value = tag;

      if(tag && tag.length >= 2){
        searchMoviesFromAPI(tag);
      }else{
        applyMovieFilters();
      }
    };
  });
}

function showMovieSuggestions(query){
  const q = query.trim();

  if(!q){
    movieSuggestBox.style.display = "none";
    return;
  }

  const local = allMovies
    .filter(movie => getMovieText(movie).includes(q.toLowerCase()))
    .slice(0,8);

  if(!local.length){
    movieSuggestBox.innerHTML = `
      <div class="movie-suggest-item">
        <b>Search API for "${safeText(q)}"</b>
        <span>Press Search to find unloaded movies</span>
      </div>
    `;
    movieSuggestBox.style.display = "block";
    return;
  }

  movieSuggestBox.innerHTML = local.map(movie=>`
    <div class="movie-suggest-item" data-id="${safeAttr(movie.id)}">
      <b>${safeText(movie.title)}</b>
      <span>${safeText(movie.year || movie.genre || "Anime Movie")}</span>
    </div>
  `).join("");

  movieSuggestBox.style.display = "block";

  movieSuggestBox.querySelectorAll(".movie-suggest-item").forEach(item=>{
    item.onclick = () => {
      const movie = allMovies.find(m => m.id === item.dataset.id);
      if(!movie) return;

      movieSearch.value = movie.title;
      movieSuggestBox.style.display = "none";

      currentMovies = [movie, ...allMovies.filter(m=>m.id !== movie.id)];
      page = 1;

      renderMovies();
      createMoviePagination();
      updateMovieStats();

      allMoviesSection.scrollIntoView({behavior:"smooth"});
    };
  });
}

function renderMovieSpotlight(){
  if(!allMovies.length) return;

  const movie = allMovies[Math.floor(Math.random() * allMovies.length)];

  movieSpotlightImg.src = movie.banner || movie.image || "";
  movieSpotlightTitle.innerText = movie.title;
  movieSpotlightInfo.innerText = getMovieInfo(movie).slice(0,130);
  movieSpotlightLink.href = movie.link || `anime-details.html?id=${encodeURIComponent(movie.id)}`;
}

function renderFeaturedMovies(){
  if(!allMovies.length) return;

  const picks = [...allMovies]
    .sort(()=>Math.random() - 0.5)
    .slice(0,6);

  movieFeaturedGrid.innerHTML = picks.map(movie=>`
    <article class="mini-card" onclick="openMovieDetails('${safeAttr(movie.id)}')">
      <img loading="lazy" src="${movie.image}" alt="${safeText(movie.title)}" onerror="this.src='image/default.jpg'">
      <h3>${safeText(movie.title)}</h3>
    </article>
  `).join("");
}

function renderLatestMovies(){
  if(!allMovies.length) return;

  const latest = [...allMovies].slice(-6).reverse();

  movieLatestGrid.innerHTML = latest.map(movie=>`
    <article class="mini-card" onclick="openMovieDetails('${safeAttr(movie.id)}')">
      <img loading="lazy" src="${movie.image}" alt="${safeText(movie.title)}" onerror="this.src='image/default.jpg'">
      <h3>${safeText(movie.title)}</h3>
    </article>
  `).join("");
}

function randomMovie(){
  if(!allMovies.length) return;

  renderMovieSpotlight();

  document.querySelector(".spotlight-card")
    .scrollIntoView({behavior:"smooth",block:"center"});
}

function shuffleMovies(){
  movieSort.value = "random";
  applyMovieFilters();
}

function openMovieDetails(id){
  if(id){
    window.location.href = `anime-details.html?id=${encodeURIComponent(id)}`;
  }
}

function openMoviePreview(index){
  const movie = currentMovies[index];
  if(!movie) return;

  previewImg.src = movie.image || "";
  previewTitle.innerText = movie.title;
  previewInfo.innerText = getMovieInfo(movie);
  previewLink.href = movie.link || `anime-details.html?id=${encodeURIComponent(movie.id)}`;

  previewWatchBtn.onclick = () => {
    window.location.href = `watch.html?id=${encodeURIComponent(movie.id)}&ep=1`;
  };

  moviePreviewModal.style.display = "flex";
}

function closeMoviePreview(){
  moviePreviewModal.style.display = "none";
}

function updateMovieStats(){
  totalMovieCount.innerText = allMovies.length;
  currentMovieCount.innerText = Math.min(currentMovies.length, PER_PAGE);
  moviePageCount.innerText = Math.ceil(currentMovies.length / PER_PAGE) || 0;
  movieTagCount.innerText = Math.max(0, movieChips.querySelectorAll("button").length - 1);
}

function showSkeleton(){
  movieLoadingGrid.style.display = "grid";
  movieEmpty.style.display = "none";
}

function removeDuplicates(list){
  const map = new Map();

  list.forEach(movie=>{
    const key = movie.id || movie.title.toLowerCase();

    if(!map.has(key)){
      map.set(key,movie);
    }
  });

  return [...map.values()];
}

function getMovieName(movie){
  return movie.title || movie.name || "Unknown Movie";
}

function getMovieInfo(movie){
  return movie.description || movie.quality || movie.year || movie.genre || movie.category || "Shadow Anime Movie";
}

function getMovieText(movie){
  return `
    ${movie.title || ""}
    ${movie.name || ""}
    ${movie.quality || ""}
    ${movie.year || ""}
    ${movie.genre || ""}
    ${movie.category || ""}
    ${movie.type || ""}
    ${movie.episodes || ""}
    ${movie.description || ""}
  `.toLowerCase();
}

function makeSlug(text){
  return String(text)
    .toLowerCase()
    .replace(/[^\w\s-]/g,"")
    .trim()
    .replace(/\s+/g,"-");
}

function safeText(value){
  return String(value || "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

function safeAttr(value){
  return String(value || "")
    .replaceAll("&","&amp;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}