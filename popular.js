const API = "https://anikoto-api-nine.vercel.app";
const PER_PAGE = 20;

let allPopular = [];
let currentPopular = [];
let currentPage = 1;
let rankSearchTimer = null;

const $ = id => document.getElementById(id);

const popularLoader = $("popularLoader");
const loaderText = $("loaderText");

const menu = $("menu");
const menuBtn = $("menuBtn");

const rankSearch = $("rankSearch");
const rankSearchBtn = $("rankSearchBtn");
const rankSuggestBox = $("rankSuggestBox");

const rankFilter = $("rankFilter");
const rankSort = $("rankSort");

const popularGrid = $("popularGrid");
const popularPagination = $("popularPagination");
const popularLoadingGrid = $("popularLoadingGrid");
const popularEmpty = $("popularEmpty");

const totalPopularCount = $("totalPopularCount");
const currentPopularCount = $("currentPopularCount");
const popularPageCount = $("popularPageCount");
const popularResultCount = $("popularResultCount");

const topRail = $("topRail");

const rankOne = $("rankOne");
const rankTwo = $("rankTwo");
const rankThree = $("rankThree");

const randomRankBtn = $("randomRankBtn");
const refreshPopularBtn = $("refreshPopularBtn");
const shuffleTopBtn = $("shuffleTopBtn");

const toTop = $("toTop");

document.addEventListener("DOMContentLoaded", initPopular);

async function initPopular(){
  bindPopularUI();

  await loadPopularAnime();

  setTimeout(()=>{
    popularLoader.style.opacity = "0";
    popularLoader.style.pointerEvents = "none";
  },800);
}

function bindPopularUI(){

  if(menuBtn && menu){
    menuBtn.onclick = () => {
      menu.classList.toggle("show");
    };
  }

  rankSearch.addEventListener("input",()=>{
    clearTimeout(rankSearchTimer);

    const q = rankSearch.value.trim();

    showRankSuggestions(q);

    rankSearchTimer = setTimeout(()=>{
      if(q.length >= 2){
        searchPopularAnime(q);
      }else{
        applyPopularFilters();
      }
    },450);
  });

  rankSearchBtn.onclick = () => {
    const q = rankSearch.value.trim();

    if(q.length >= 2){
      searchPopularAnime(q);
    }else{
      applyPopularFilters();
    }
  };

  rankFilter.onchange = applyPopularFilters;
  rankSort.onchange = applyPopularFilters;

  randomRankBtn.onclick = randomPopular;
  refreshPopularBtn.onclick = loadPopularAnime;

  shuffleTopBtn.onclick = () => {
    renderTopRail();
  };

  toTop.onclick = () => {
    window.scrollTo({top:0,behavior:"smooth"});
  };

  window.addEventListener("scroll",()=>{
    toTop.style.display = window.scrollY > 500 ? "block" : "none";
  });

  document.addEventListener("click",(e)=>{
    if(!e.target.closest(".rank-search-wrap")){
      rankSuggestBox.style.display = "none";
    }
  });
}

async function apiGet(url){
  const res = await fetch(url);

  if(!res.ok){
    throw new Error("API Error");
  }

  return await res.json();
}

function normalizeArray(json){
  if(Array.isArray(json)) return json;

  return (
    json?.data?.results ||
    json?.data?.anime ||
    json?.data ||
    json?.results ||
    json?.anime ||
    json?.items ||
    []
  );
}

async function loadPopularAnime(){

  try{

    loaderText.innerText = "Loading ranking database...";

    popularLoadingGrid.style.display = "grid";
    popularEmpty.style.display = "none";

    const endpoints = [
      `${API}/api/most-popular`,
      `${API}/api/top-airing`,
      `${API}/api/all-anime?page=1`
    ];

    let raw = [];

    const responses = await Promise.all(
      endpoints.map(url => apiGet(url).catch(()=>null))
    );

    responses.forEach(json=>{
      if(json){
        raw.push(...normalizeArray(json));
      }
    });

    const mapped = raw
      .map(mapPopular)
      .filter(item => item.id);

    allPopular = removeDuplicates(mapped);
    currentPopular = [...allPopular];

    popularLoadingGrid.style.display = "none";

    renderPodium();
    renderTopRail();
    renderPopularGrid();
    renderPagination();
    updatePopularStats();

  }catch(error){

    console.error(error);

    popularLoadingGrid.style.display = "none";
    popularEmpty.style.display = "block";
    popularResultCount.innerText = "API failed";
  }
}

async function searchPopularAnime(query){

  popularGrid.innerHTML = `
    <div style="padding:30px;color:#9fb4c9;">
      Searching "${safeText(query)}"...
    </div>
  `;

  try{

    const json = await apiGet(
      `${API}/api/search?keyword=${encodeURIComponent(query)}`
    );

    const mapped = normalizeArray(json)
      .map(mapPopular)
      .filter(item => item.id);

    currentPopular = removeDuplicates(mapped);

    currentPage = 1;

    renderPopularGrid();
    renderPagination();
    updatePopularStats();

  }catch(error){

    console.error(error);

    popularGrid.innerHTML = "";
    popularEmpty.style.display = "block";
  }
}

function mapPopular(anime){

  const title =
    anime.title ||
    anime.name ||
    anime.jname ||
    anime.animeTitle ||
    "Unknown Anime";

  const id =
    anime.id ||
    anime.slug ||
    anime.animeId ||
    makeSlug(title);

  const image =
    anime.image ||
    anime.poster ||
    anime.cover ||
    anime.thumbnail ||
    anime.banner ||
    "image/default.jpg";

  return {
    id:String(id),
    title:String(title),
    image:String(image),
    banner:anime.banner || image,
    year:anime.year || anime.releaseDate || "",
    type:anime.type || "TV",
    quality:anime.quality || "HD",
    genre:anime.genre || anime.category || "Anime",
    description:
      anime.description ||
      anime.synopsis ||
      "No description available.",
    episodes:
      anime.episodes ||
      anime.sub ||
      anime.dub ||
      "?",
    details:`anime-details.html?id=${encodeURIComponent(id)}`,
    watch:`watch.html?id=${encodeURIComponent(id)}&ep=1`
  };
}

function renderPodium(){

  const top = [...allPopular].slice(0,3);

  if(top[0]){
    setPodium(rankOne,top[0]);
  }

  if(top[1]){
    setPodium(rankTwo,top[1]);
  }

  if(top[2]){
    setPodium(rankThree,top[2]);
  }
}

function setPodium(el,anime){

  const img = el.querySelector("img");
  const title = el.querySelector("h3");

  img.src = anime.image;
  title.innerText = anime.title;

  el.onclick = () => {
    window.location.href = anime.details;
  };
}

function renderTopRail(){

  const picks = [...allPopular]
    .sort(()=>Math.random() - 0.5)
    .slice(0,8);

  topRail.innerHTML = picks.map(anime=>`
    <article class="top-card"
      onclick="window.location.href='${anime.details}'">

      <img src="${anime.image}"
           alt="${safeText(anime.title)}"
           onerror="this.src='image/default.jpg'">

      <h3>${safeText(anime.title)}</h3>
    </article>
  `).join("");
}

function renderPopularGrid(){

  const start = (currentPage - 1) * PER_PAGE;
  const end = start + PER_PAGE;

  const list = currentPopular.slice(start,end);

  popularGrid.innerHTML = list.map((anime,index)=>`
    <article class="rank-card">

      <div class="rank-number">
        #${start + index + 1}
      </div>

      <img src="${anime.image}"
           alt="${safeText(anime.title)}"
           onerror="this.src='image/default.jpg'">

      <div class="rank-info">
        <h2>${safeText(anime.title)}</h2>

        <p>
          ${safeText(anime.description).slice(0,160)}
        </p>
      </div>

      <div class="rank-buttons">
        <a href="${anime.details}">
          Details
        </a>

        <a href="${anime.watch}">
          Watch
        </a>
      </div>

    </article>
  `).join("");

  popularEmpty.style.display = list.length ? "none" : "block";

  popularResultCount.innerText =
    `${currentPopular.length} anime ranked`;

  currentPopularCount.innerText = list.length;
}

function renderPagination(){

  const totalPages =
    Math.ceil(currentPopular.length / PER_PAGE);

  popularPagination.innerHTML = "";

  popularPageCount.innerText = totalPages || 0;

  if(totalPages <= 1) return;

  if(currentPage > 1){
    popularPagination.innerHTML += `
      <a href="javascript:void(0)"
         onclick="goPopularPage(${currentPage - 1})">
        Prev
      </a>
    `;
  }

  const start = Math.max(1,currentPage - 2);
  const end = Math.min(totalPages,currentPage + 2);

  for(let i = start; i <= end; i++){

    popularPagination.innerHTML += `
      <a href="javascript:void(0)"
         onclick="goPopularPage(${i})"
         class="${i === currentPage ? "active-page" : ""}">
        ${i}
      </a>
    `;
  }

  if(currentPage < totalPages){
    popularPagination.innerHTML += `
      <a href="javascript:void(0)"
         onclick="goPopularPage(${currentPage + 1})">
        Next
      </a>
    `;
  }
}

function goPopularPage(page){

  currentPage = page;

  renderPopularGrid();
  renderPagination();

  document
    .getElementById("popularDatabase")
    .scrollIntoView({behavior:"smooth"});
}

function applyPopularFilters(){

  const keyword =
    rankSearch.value.toLowerCase().trim();

  const filter = rankFilter.value;
  const sort = rankSort.value;

  let list = allPopular.filter(anime=>{

    const text = getPopularText(anime);

    return (
      text.includes(keyword) &&
      (filter === "all" || text.includes(filter))
    );
  });

  if(sort === "az"){
    list.sort((a,b)=>
      a.title.localeCompare(b.title)
    );
  }

  if(sort === "za"){
    list.sort((a,b)=>
      b.title.localeCompare(a.title)
    );
  }

  if(sort === "random"){
    list.sort(()=>Math.random() - 0.5);
  }

  currentPopular = list;
  currentPage = 1;

  renderPopularGrid();
  renderPagination();
  updatePopularStats();
}

function showRankSuggestions(query){

  const q = query.toLowerCase().trim();

  if(!q){
    rankSuggestBox.style.display = "none";
    return;
  }

  const filtered = allPopular
    .filter(anime =>
      getPopularText(anime).includes(q)
    )
    .slice(0,8);

  if(!filtered.length){

    rankSuggestBox.innerHTML = `
      <div class="rank-suggest-item">
        No anime found
      </div>
    `;

    rankSuggestBox.style.display = "block";
    return;
  }

  rankSuggestBox.innerHTML = filtered.map(anime=>`
    <div class="rank-suggest-item"
         data-id="${safeAttr(anime.id)}">

      <b>${safeText(anime.title)}</b>
      <span>${safeText(anime.type)}</span>
    </div>
  `).join("");

  rankSuggestBox.style.display = "block";

  rankSuggestBox
    .querySelectorAll(".rank-suggest-item")
    .forEach(item=>{

      item.onclick = () => {

        const anime =
          allPopular.find(
            a => a.id === item.dataset.id
          );

        if(!anime) return;

        window.location.href = anime.details;
      };
    });
}

function updatePopularStats(){

  totalPopularCount.innerText =
    allPopular.length;

  currentPopularCount.innerText =
    Math.min(currentPopular.length,PER_PAGE);

  popularPageCount.innerText =
    Math.ceil(currentPopular.length / PER_PAGE) || 0;
}

function randomPopular(){

  if(!allPopular.length) return;

  const anime =
    allPopular[
      Math.floor(Math.random() * allPopular.length)
    ];

  window.location.href = anime.details;
}

function removeDuplicates(list){

  const map = new Map();

  list.forEach(item=>{

    if(!map.has(item.id)){
      map.set(item.id,item);
    }
  });

  return [...map.values()];
}

function getPopularText(anime){

  return `
    ${anime.title}
    ${anime.genre}
    ${anime.type}
    ${anime.quality}
    ${anime.description}
  `.toLowerCase();
}

function makeSlug(text){

  return String(text)
    .toLowerCase()
    .replace(/[^\w\s-]/g,"")
    .trim()
    .replace(/\s+/g,"-");
}

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