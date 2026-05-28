const API = "https://anikoto-api-nine.vercel.app";
const PROXY = "https://nameless-dust-3ee3.shadowanimexyz.workers.dev/proxy?url=";

const $ = id => document.getElementById(id);

const urlParams = new URLSearchParams(location.search);

const animeId = urlParams.get("id");
const startEpisode = urlParams.get("ep");

const watchLoader = $("watchLoader");
const loaderText = $("loaderText");

const playerBox = $("playerBox");
const watchTitle = $("watchTitle");
const watchMeta = $("watchMeta");
const animeDescription = $("animeDescription");

const serverRow = $("serverRow");
const qualitySelect = $("qualitySelect");
const speedControl = $("speedControl");

const watchEpisodeList = $("watchEpisodeList");
const watchEpisodeSearch = $("watchEpisodeSearch");
const episodeSuggestBox = $("episodeSuggestBox");
const globalAnimeSearch = $("globalAnimeSearch");
const globalAnimeSuggest = $("globalAnimeSuggest");

const prevWatchBtn = $("prevWatchBtn");
const nextWatchBtn = $("nextWatchBtn");

const episodeTotal = $("episodeTotal");
const playerState = $("playerState");
const animeStatus = $("animeStatus");

const episodeAsc = $("episodeAsc");
const episodeDesc = $("episodeDesc");

const menuBtn = $("menuBtn");
const menu = $("menu");

let animeInfo = {};
let episodes = [];

let currentIndex = 0;

let currentType = "dub";
let currentServer = "hd-1";

let hlsInstance = null;
let currentLevels = [];

document.addEventListener("DOMContentLoaded", init);

async function init(){

  bindUI();

  if(!animeId){
    failState("Anime ID not found.");
    return;
  }

  await loadWatchPage();

  setTimeout(()=>{
    watchLoader.style.opacity = "0";
    watchLoader.style.pointerEvents = "none";
  },900);
}

function bindUI(){

  if(menuBtn && menu){
    menuBtn.onclick = () => {
      menu.classList.toggle("show");
    };
  }

  watchEpisodeSearch.addEventListener("input",()=>{
    const q = watchEpisodeSearch.value.toLowerCase().trim();

    if(!q){
      episodeSuggestBox.style.display = "none";
      renderEpisodes(episodes);
      return;
    }

    const filtered = episodes.filter(ep =>
      String(ep.num).includes(q) ||
      String(ep.title || "").toLowerCase().includes(q)
    );

    renderEpisodes(filtered);
    renderEpisodeSuggestions(filtered.slice(0,8));
  });

  let animeSearchTimer;

  globalAnimeSearch.addEventListener("input",()=>{
    clearTimeout(animeSearchTimer);

    const q = globalAnimeSearch.value.trim();

    animeSearchTimer = setTimeout(()=>{
      searchAnimeFromAPI(q);
    },450);
  });

  episodeAsc.onclick = () => {
    renderEpisodes([...episodes]);
  };

  episodeDesc.onclick = () => {
    renderEpisodes([...episodes].reverse());
  };

  prevWatchBtn.onclick = () => {
    if(currentIndex > 0){
      loadEpisode(currentIndex - 1);
    }
  };

  nextWatchBtn.onclick = () => {
    if(currentIndex < episodes.length - 1){
      loadEpisode(currentIndex + 1);
    }
  };
}

async function apiGet(url){
  const res = await fetch(url);

  if(!res.ok){
    throw new Error("API Error " + res.status);
  }

  return await res.json();
}

function cleanText(text){
  return String(text || "")
    .replace(/<[^>]*>/g,"")
    .replace(/\s+/g," ")
    .trim();
}

async function loadWatchPage(){

  try{

    loaderText.textContent = "Loading anime database...";

    animeInfo = { title: animeId };

    watchTitle.innerText = animeId;

    try{

      const infoJson = await apiGet(
        `${API}/api/info?id=${encodeURIComponent(animeId)}`
      );

      animeInfo = infoJson.data || infoJson || animeInfo;

      watchTitle.innerText =
        animeInfo.title ||
        animeInfo.name ||
        animeId;

      animeDescription.innerText =
        cleanText(animeInfo.description || animeInfo.desc) ||
        "No description available.";

    }catch(infoError){

      console.warn(infoError);

      animeDescription.innerText =
        "Anime info unavailable.";
    }

    loaderText.textContent = "Loading episodes...";

    const epJson = await apiGet(
      `${API}/api/episodes/${encodeURIComponent(animeId)}`
    );

    episodes = normalizeEpisodes(
      epJson.data ||
      epJson.episodes ||
      epJson.results ||
      []
    );

    if(!episodes.length){
      failState("No episodes found.");
      return;
    }

    episodeTotal.innerText = episodes.length;

    renderEpisodes();

    let startIndex = 0;

    if(startEpisode){

      const found = episodes.findIndex(ep =>
        String(ep.num) === String(startEpisode) ||
        String(ep.slug) === String(startEpisode)
      );

      if(found !== -1){
        startIndex = found;
      }
    }

    await loadEpisode(startIndex);

  }catch(error){

    console.error(error);

    failState("Failed to load anime.");
  }
}

function normalizeEpisodes(rawEpisodes){

  if(!Array.isArray(rawEpisodes)) return [];

  return rawEpisodes.map((ep,index)=>{

    const num = Number(
      ep?.num ??
      ep?.number ??
      ep?.episode ??
      ep?.ep ??
      ep?.id ??
      index + 1
    );

    return {
      ...ep,
      num,
      slug: ep?.slug || ep?.id || num,
      title:
        ep?.title ||
        ep?.name ||
        getEpisodeTitle(num)
    };

  }).filter(ep => ep.num);
}

function renderEpisodes(list = episodes){

  if(!list.length){

    watchEpisodeList.innerHTML =
      `<div class="player-status">No Episodes</div>`;

    return;
  }

  watchEpisodeList.innerHTML = list.map(ep => {

    const realIndex = episodes.findIndex(
      x => String(x.num) === String(ep.num)
    );

    return `
      <button
        class="episode-btn ${realIndex === currentIndex ? "active" : ""}"
        onclick="loadEpisode(${realIndex})"
        title="${ep.title}">

        EP ${ep.num}

      </button>
    `;

  }).join("");
}

async function loadEpisode(index){

  if(index < 0 || index >= episodes.length) return;

  currentIndex = index;

  const ep = episodes[index];

  history.replaceState(
    null,
    "",
    `watch.html?id=${encodeURIComponent(animeId)}&ep=${ep.num}`
  );

  renderEpisodes();

  watchMeta.innerText =
    `Episode ${ep.num} • ${ep.title}`;

  playerState.innerText =
    `EP ${ep.num} READY`;

  animeStatus.innerText =
    currentType.toUpperCase();

  serverRow.innerHTML = `
    <button class="server-btn active"
      onclick="playStream('hd-1','dub',this)">
      DUB • HD-1
    </button>

    <button class="server-btn"
      onclick="playStream('hd-1','sub',this)">
      SUB • HD-1
    </button>

    <button class="server-btn"
      onclick="playStream('hd-2','dub',this)">
      DUB • HD-2
    </button>

    <button class="server-btn"
      onclick="playStream('hd-2','sub',this)">
      SUB • HD-2
    </button>
  `;

  await playStream(
    currentServer,
    currentType,
    document.querySelector(".server-btn.active")
  );
}

function extractVideoUrl(streamJson){

  return (
    streamJson?.data?.m3u8 ||
    streamJson?.data?.url ||
    streamJson?.data?.stream ||
    streamJson?.data?.link ||
    streamJson?.m3u8 ||
    streamJson?.url ||
    streamJson?.stream ||
    streamJson?.link ||
    null
  );
}

async function playStream(
  serverName = "hd-1",
  type = "dub",
  btn = null
){

  try{

    currentServer = serverName;
    currentType = type;

    animeStatus.innerText =
      type.toUpperCase();

    document
      .querySelectorAll(".server-btn")
      .forEach(b => b.classList.remove("active"));

    if(btn) btn.classList.add("active");

    const ep = episodes[currentIndex];

    playerBox.innerHTML = `
      <div class="player-status">
        <div class="status-orb"></div>
        <h2>Loading Episode ${ep.num}</h2>
        <p>Connecting stream...</p>
      </div>
    `;

    qualitySelect.innerHTML =
      `<option value="auto">Auto Quality</option>`;

    const streamUrl =
      `${API}/api/stream?id=${encodeURIComponent(animeId)}&ep=${encodeURIComponent(ep.num)}&server=${encodeURIComponent(serverName)}&type=${encodeURIComponent(type)}`;

    const streamJson = await apiGet(streamUrl);

    const videoUrl = extractVideoUrl(streamJson);

    if(!videoUrl){

      playerBox.innerHTML =
        `<div class="player-status">
          <h2>Stream unavailable</h2>
          <p>Try another server or SUB/DUB.</p>
        </div>`;

      return;
    }

    if(hlsInstance){
      hlsInstance.destroy();
      hlsInstance = null;
    }

    playerBox.innerHTML = `
      <span class="now-badge">
        ${type.toUpperCase()} • EP ${ep.num}
      </span>

      <video
        id="videoPlayer"
        controls
        autoplay
        playsinline
        muted>
      </video>
    `;

    const video = $("videoPlayer");

    const proxyUrl =
      `${PROXY}${encodeURIComponent(videoUrl)}`;

    speedControl.onchange = () => {
      video.playbackRate =
        Number(speedControl.value);
    };

    video.playbackRate =
      Number(speedControl.value || 1);

    setupProgressSave(video, ep.num);

    setupAutoNext(video);

    setupKeyboard(video);

    restoreSavedProgress(video, ep.num);

    if(window.Hls && Hls.isSupported()){

      hlsInstance = new Hls({
        enableWorker:true,
        lowLatencyMode:true
      });

      hlsInstance.loadSource(proxyUrl);

      hlsInstance.attachMedia(video);

      hlsInstance.on(
        Hls.Events.MANIFEST_PARSED,
        () => {

          setupQualitySelector();

          video.play().catch(()=>{});
        }
      );

    }else{

      video.src = proxyUrl;

      video.play().catch(()=>{});
    }

  }catch(error){

    console.error(error);

    playerBox.innerHTML = `
      <div class="player-status">
        <h2>Playback failed</h2>
        <p>Try another server.</p>
      </div>
    `;
  }
}

function setupQualitySelector(){

  if(!hlsInstance) return;

  currentLevels = hlsInstance.levels || [];

  qualitySelect.innerHTML =
    `<option value="auto">Auto Quality</option>`;

  currentLevels.forEach((level,index)=>{

    const height = level.height || "HD";

    qualitySelect.innerHTML += `
      <option value="${index}">
        ${height}p
      </option>
    `;
  });

  qualitySelect.onchange = () => {

    if(!hlsInstance) return;

    if(qualitySelect.value === "auto"){
      hlsInstance.currentLevel = -1;
    }else{
      hlsInstance.currentLevel =
        Number(qualitySelect.value);
    }
  };
}

function setupProgressSave(video, ep){

  video.addEventListener("timeupdate",()=>{

    if(!video.duration || video.currentTime < 5) return;

    const continueData = {
      id:animeId,
      title:animeInfo.title || animeId,
      episode:ep,
      time:video.currentTime,
      duration:video.duration,
      image:animeInfo.poster || animeInfo.image || ""
    };

    localStorage.setItem(
      "continueWatching_" + animeId,
      JSON.stringify(continueData)
    );
  });
}

function restoreSavedProgress(video, ep){

  try{

    const saved = JSON.parse(
      localStorage.getItem(
        "continueWatching_" + animeId
      )
    );

    if(
      saved &&
      String(saved.episode) === String(ep)
    ){

      video.addEventListener(
        "loadedmetadata",
        ()=>{

          if(
            saved.time > 30 &&
            saved.time < video.duration - 20
          ){
            video.currentTime = saved.time;
          }
        }
      );
    }

  }catch{}
}

function setupAutoNext(video){

  video.addEventListener("ended",()=>{

    if(currentIndex < episodes.length - 1){

      loadEpisode(currentIndex + 1);
    }
  });
}

function setupKeyboard(video){

  document.onkeydown = e => {

    const tag =
      document.activeElement.tagName.toLowerCase();

    if(tag === "input") return;

    if(e.code === "Space"){
      e.preventDefault();
      video.paused ? video.play() : video.pause();
    }

    if(e.code === "ArrowRight"){
      video.currentTime += 10;
    }

    if(e.code === "ArrowLeft"){
      video.currentTime -= 10;
    }

    if(e.key.toLowerCase() === "f"){
      toggleFullscreen();
    }

    if(e.key.toLowerCase() === "t"){
      toggleTheater();
    }
  };
}

function toggleFullscreen(){

  const video = $("videoPlayer");

  if(!video) return;

  if(document.fullscreenElement){
    document.exitFullscreen();
  }else{
    video.requestFullscreen();
  }
}

async function togglePIP(){

  const video = $("videoPlayer");

  if(!video) return;

  try{

    if(document.pictureInPictureElement){
      await document.exitPictureInPicture();
    }else if(document.pictureInPictureEnabled){
      await video.requestPictureInPicture();
    }

  }catch(err){

    console.log(err);
  }
}

function toggleTheater(){
  document.body.classList.toggle("theater-mode");
}

function skipIntro(){

  const video = $("videoPlayer");

  if(video){
    video.currentTime += 90;
  }
}

function saveContinueWatching(showAlert = false){

  const video = $("videoPlayer");

  if(!video) return;

  const ep = episodes[currentIndex] || {};

  const continueData = {
    id:animeId,
    title:animeInfo.title || animeId,
    episode:ep.num || 1,
    time:video.currentTime || 0,
    duration:video.duration || 0,
    image:animeInfo.poster || animeInfo.image || ""
  };

  localStorage.setItem(
    "continueWatching_" + animeId,
    JSON.stringify(continueData)
  );

  if(showAlert){
    alert("Progress Saved");
  }
}

function addWatchlist(){

  const list =
    JSON.parse(localStorage.getItem("watchlist")) || [];

  const ep =
    episodes[currentIndex] || {};

  const item = {
    id:animeId,
    title:animeInfo.title || animeId,
    image:animeInfo.poster || animeInfo.image || "",
    episode:ep.num || 1,
    link:`watch.html?id=${animeId}&ep=${ep.num || 1}`
  };

  const filtered =
    list.filter(x => x.id !== animeId);

  filtered.unshift(item);

  localStorage.setItem(
    "watchlist",
    JSON.stringify(filtered.slice(0,30))
  );

  alert("Added to Watchlist");
}

function goBackDetails(){

  location.href =
    `anime-details.html?id=${animeId}`;
}

function failState(text){

  playerBox.innerHTML = `
    <div class="player-status">
      <h2>${text}</h2>
    </div>
  `;

  watchTitle.innerText =
    "Player Error";
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
function renderEpisodeSuggestions(list){
  if(!list.length){
    episodeSuggestBox.innerHTML = `
      <div class="episode-suggest-item">
        <b>No episode found</b>
        <span>Try episode number like 1, 2, 10...</span>
      </div>
    `;
    episodeSuggestBox.style.display = "block";
    return;
  }

  episodeSuggestBox.innerHTML = list.map(ep => `
    <div class="episode-suggest-item" data-ep="${ep.num}">
      <b>Episode ${ep.num}</b>
      <span>${ep.title || "Untitled episode"}</span>
    </div>
  `).join("");

  episodeSuggestBox.style.display = "block";

  episodeSuggestBox.querySelectorAll(".episode-suggest-item").forEach(item=>{
    item.onclick = () => {
      const epNum = item.dataset.ep;
      const index = episodes.findIndex(ep => String(ep.num) === String(epNum));

      if(index !== -1){
        watchEpisodeSearch.value = "";
        episodeSuggestBox.style.display = "none";
        renderEpisodes(episodes);
        loadEpisode(index);
      }
    };
  });
}

document.addEventListener("click",(e)=>{
  if(!e.target.closest(".watch-search-wrap")){
    episodeSuggestBox.style.display = "none";
  }
});
async function searchAnimeFromAPI(query){
  if(!query){
    globalAnimeSuggest.style.display = "none";
    return;
  }

  globalAnimeSuggest.innerHTML = `
    <div class="episode-suggest-item">
      <b>Searching anime...</b>
      <span>Full API database</span>
    </div>
  `;
  globalAnimeSuggest.style.display = "block";

  try{
    const res = await fetch(`${API}/api/search?keyword=${encodeURIComponent(query)}`);
    const json = await res.json();

    const list =
      json.results ||
      json.data ||
      json.anime ||
      json.items ||
      [];

    if(!Array.isArray(list) || !list.length){
      globalAnimeSuggest.innerHTML = `
        <div class="episode-suggest-item">
          <b>No anime found</b>
          <span>Try another name</span>
        </div>
      `;
      return;
    }

    globalAnimeSuggest.innerHTML = list.slice(0,8).map(anime=>{
      const title =
        anime.title ||
        anime.name ||
        anime.animeTitle ||
        anime.jname ||
        anime.id ||
        "Unknown Anime";

      const id =
        anime.id ||
        anime.slug ||
        anime.animeId ||
        title;

      return `
        <div class="episode-suggest-item global-anime-item" data-id="${safeAttr(id)}">
          <b>${safeText(title)}</b>
          <span>Open watch page</span>
        </div>
      `;
    }).join("");

    globalAnimeSuggest.querySelectorAll(".global-anime-item").forEach(item=>{
      item.onclick = () => {
        const id = item.dataset.id;
        window.location.href = `watch.html?id=${encodeURIComponent(id)}&ep=1`;
      };
    });

  }catch(error){
    globalAnimeSuggest.innerHTML = `
      <div class="episode-suggest-item">
        <b>API search failed</b>
        <span>Check API endpoint</span>
      </div>
    `;
  }
}

function safeText(text){
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