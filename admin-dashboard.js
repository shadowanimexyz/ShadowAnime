// admin-dashboard.js

const API = "https://anikoto-api-nine.vercel.app";

const $ = (id) => document.getElementById(id);

const apiStatus = $("apiStatus");

const totalAnime = $("totalAnime");
const totalMovies = $("totalMovies");
const totalEpisodes = $("totalEpisodes");
const totalUsers = $("totalUsers");

const latestTable = $("latestTable");
const popularTable = $("popularTable");

const dbHealth = $("dbHealth");
const endpointHealth = $("endpointHealth");

const refreshBtn = $("refreshBtn");
const menuToggle = $("menuToggle");
const sidebar = $("sidebar");

let animeLibrary = [];
let latestEpisodes = [];
let popularAnime = [];

document.addEventListener("DOMContentLoaded", () => {

  initializeDashboard();

  if (refreshBtn) {
    refreshBtn.addEventListener("click", initializeDashboard);
  }

  if (menuToggle) {
    menuToggle.addEventListener("click", () => {
      sidebar.classList.toggle("open");
    });
  }

});

async function initializeDashboard() {

  setAPIStatus("CONNECTING...", "checking");

  try {

    const [
      allAnimeRes,
      latestRes,
      popularRes
    ] = await Promise.allSettled([

      fetchJSON(`${API}/api/all-anime?page=1`),
      fetchJSON(`${API}/api/latest-episodes`),
      fetchJSON(`${API}/api/popular`)

    ]);

    animeLibrary = normalizeData(allAnimeRes);
    latestEpisodes = normalizeData(latestRes);
    popularAnime = normalizeData(popularRes);

    const mergedData = dedupeAnime([
      ...animeLibrary,
      ...latestEpisodes,
      ...popularAnime
    ]);

    updateStats(mergedData);

    renderLatestEpisodes(latestEpisodes.slice(0, 10));
    renderPopularAnime(popularAnime.slice(0, 10));

    setAPIStatus("API ONLINE", "online");

    if (dbHealth) {
      dbHealth.textContent = "Connected";
      dbHealth.style.color = "#39ff9c";
    }

    if (endpointHealth) {
      endpointHealth.textContent = "Stable";
      endpointHealth.style.color = "#39ff9c";
    }

  } catch (error) {

    console.error("Dashboard Error:", error);

    showOfflineState();

  }

}

async function fetchJSON(url) {

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`API Error: ${url}`);
  }

  return await response.json();

}

function normalizeData(result) {

  if (!result || result.status === "rejected") {
    return [];
  }

  const data = result.value;

  if (Array.isArray(data)) return data;

  if (Array.isArray(data.results)) return data.results;
  if (Array.isArray(data.data)) return data.data;
  if (Array.isArray(data.anime)) return data.anime;
  if (Array.isArray(data.items)) return data.items;
  if (Array.isArray(data.episodes)) return data.episodes;

  return [];

}

function dedupeAnime(list) {

  const map = new Map();

  list.forEach(item => {

    const key =
      item.id ||
      item.animeId ||
      item.slug ||
      item.title ||
      item.name;

    if (!key) return;

    if (!map.has(key)) {
      map.set(key, item);
    }

  });

  return [...map.values()];

}

function updateStats(list) {

  const movies = list.filter(isMovie).length;

  const episodeCount =
    latestEpisodes.length ||
    list.reduce((sum, item) => sum + getEpisodeCount(item), 0);

  const users = getUsersCount();

  animateValue(totalAnime, list.length);
  animateValue(totalMovies, movies);
  animateValue(totalEpisodes, episodeCount);
  animateValue(totalUsers, users);

}

function renderLatestEpisodes(data) {

  if (!latestTable) return;

  if (!data.length) {

    latestTable.innerHTML = `
      <tr>
        <td colspan="5">No latest episodes found.</td>
      </tr>
    `;

    return;
  }

  latestTable.innerHTML = data.map((anime, index) => {

    const title = cleanTitle(
      anime.title ||
      anime.name ||
      "Unknown Anime"
    );

    const type =
      anime.type ||
      anime.category ||
      detectType(anime);

    const episode =
      anime.episode ||
      anime.latestEpisode ||
      anime.sub ||
      "-";

    return `
      <tr>
        <td>${index + 1}</td>
        <td>${title}</td>
        <td>${type}</td>
        <td>${episode}</td>
        <td>
          <span class="badge success">LIVE</span>
        </td>
      </tr>
    `;

  }).join("");

}

function renderPopularAnime(data) {

  if (!popularTable) return;

  if (!data.length) {

    popularTable.innerHTML = `
      <tr>
        <td colspan="5">No popular anime found.</td>
      </tr>
    `;

    return;
  }

  popularTable.innerHTML = data.map((anime, index) => {

    const title = cleanTitle(
      anime.title ||
      anime.name ||
      "Unknown Anime"
    );

    const type =
      anime.type ||
      anime.category ||
      detectType(anime);

    const episodes =
      anime.episodes ||
      anime.sub ||
      anime.dub ||
      "-";

    return `
      <tr>
        <td>${index + 1}</td>
        <td>${title}</td>
        <td>${type}</td>
        <td>${episodes}</td>
        <td>
          <span class="badge warning">TRENDING</span>
        </td>
      </tr>
    `;

  }).join("");

}

function detectType(item) {

  if (isMovie(item)) {
    return "Movie";
  }

  return "Anime";

}

function isMovie(item) {

  const text = `
    ${item.title || ""}
    ${item.name || ""}
    ${item.type || ""}
    ${item.category || ""}
    ${item.genre || ""}
  `.toLowerCase();

  return (
    text.includes("movie") ||
    text.includes("film")
  );

}

function getEpisodeCount(item) {

  const value =
    item.episodes ||
    item.episode ||
    item.latestEpisode ||
    item.totalEpisodes ||
    item.sub ||
    item.dub;

  if (Array.isArray(value)) {
    return value.length;
  }

  const num = parseInt(value);

  return Number.isNaN(num) ? 0 : num;

}

function getUsersCount() {

  try {

    const users =
      JSON.parse(localStorage.getItem("shadowUsers")) || [];

    if (Array.isArray(users)) {
      return users.length;
    }

    return Object.keys(users).length;

  } catch {

    return 0;

  }

}

function setAPIStatus(text, state) {

  if (!apiStatus) return;

  apiStatus.textContent = text;

  apiStatus.classList.remove(
    "online",
    "offline",
    "checking"
  );

  if (state) {
    apiStatus.classList.add(state);
  }

}

function cleanTitle(text) {

  return String(text)
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim();

}

function animateValue(element, value) {

  if (!element) return;

  let start = 0;

  const duration = 900;

  const increment = value / (duration / 16);

  const timer = setInterval(() => {

    start += increment;

    if (start >= value) {

      element.textContent = value;
      clearInterval(timer);

    } else {

      element.textContent = Math.floor(start);

    }

  }, 16);

}

function showOfflineState() {

  setAPIStatus("API OFFLINE", "offline");

  if (dbHealth) {
    dbHealth.textContent = "Offline";
    dbHealth.style.color = "#ff4d6d";
  }

  if (endpointHealth) {
    endpointHealth.textContent = "Failed";
    endpointHealth.style.color = "#ff4d6d";
  }

  totalAnime.textContent = "0";
  totalMovies.textContent = "0";
  totalEpisodes.textContent = "0";

  totalUsers.textContent = getUsersCount();

  latestTable.innerHTML = `
    <tr>
      <td colspan="5">
        API endpoint not responding.
      </td>
    </tr>
  `;

  popularTable.innerHTML = `
    <tr>
      <td colspan="5">
        API endpoint not responding.
      </td>
    </tr>
  `;

}