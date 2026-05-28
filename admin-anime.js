const API = "https://anikoto-api-nine.vercel.app";
const $ = (id) => document.getElementById(id);

const sidebar = $("sidebar");
const menuToggle = $("menuToggle");
const apiStatus = $("apiStatus");

const autoSearch = $("autoSearch");
const autoSearchBtn = $("autoSearchBtn");
const autoResults = $("autoResults");

const animeGrid = $("animeGrid");
const saveAnimeBtn = $("saveAnimeBtn");
const clearFormBtn = $("clearFormBtn");
const exportBtn = $("exportBtn");
const refreshApiBtn = $("refreshApiBtn");

const librarySearch = $("librarySearch");
const filterType = $("filterType");

const fillDemoBtn = $("fillDemoBtn");
const copyJsonBtn = $("copyJsonBtn");

const previewModal = $("previewModal");
const closeModal = $("closeModal");

const apiCount = $("apiCount");
const localCount = $("localCount");

let adminAnime = JSON.parse(localStorage.getItem("shadowAdminAnime")) || [];
let apiAnimeLibrary = [];
let searchApiAnime = [];
let hiddenApiAnime = JSON.parse(localStorage.getItem("hiddenApiAnime")) || [];

document.addEventListener("DOMContentLoaded", () => {
  loadApiAnimeLibrary();
  renderAnimeGrid();
  updateCounts();
  setupPreview();

  if (menuToggle) menuToggle.addEventListener("click", () => sidebar.classList.toggle("open"));

  if (autoSearchBtn) autoSearchBtn.addEventListener("click", searchAnimeAPI);
  if (autoSearch) autoSearch.addEventListener("keypress", e => {
    if (e.key === "Enter") searchAnimeAPI();
  });

  if (librarySearch) {
    librarySearch.addEventListener("keypress", e => {
      if (e.key === "Enter") searchAnimeForCards();
    });

    librarySearch.addEventListener("input", () => {
      if (librarySearch.value.trim().length === 0) {
        searchApiAnime = [];
        renderAnimeGrid();
      }
    });
  }

  if (saveAnimeBtn) saveAnimeBtn.addEventListener("click", saveAnime);
  if (clearFormBtn) clearFormBtn.addEventListener("click", clearForm);
  if (exportBtn) exportBtn.addEventListener("click", exportJSON);
  if (refreshApiBtn) refreshApiBtn.addEventListener("click", loadApiAnimeLibrary);
  if (filterType) filterType.addEventListener("change", renderAnimeGrid);
  if (fillDemoBtn) fillDemoBtn.addEventListener("click", fillDemoData);
  if (copyJsonBtn) copyJsonBtn.addEventListener("click", copyCurrentJSON);
  if (closeModal) closeModal.addEventListener("click", () => previewModal.classList.remove("show"));
});

async function loadApiAnimeLibrary() {
  setAPIStatus("LOADING API...", "checking");

  try {
    const res = await fetch(`${API}/api/all-anime?page=1`);
    if (!res.ok) throw new Error("API failed");

    const data = await res.json();
    apiAnimeLibrary = extractList(data);

    setAPIStatus("API ONLINE", "online");
    updateCounts();
    renderAnimeGrid();
  } catch (err) {
    console.error(err);
    setAPIStatus("API OFFLINE", "offline");
    renderAnimeGrid();
  }
}

async function searchAnimeForCards() {
  const q = librarySearch.value.trim();

  if (!q) {
    searchApiAnime = [];
    renderAnimeGrid();
    return;
  }

  setAPIStatus("SEARCHING API...", "checking");
  animeGrid.innerHTML = `<div class="empty-state">Searching API anime cards...</div>`;

  try {
    const res = await fetch(`${API}/api/search?keyword=${encodeURIComponent(q)}`);
    if (!res.ok) throw new Error("Search failed");

    const data = await res.json();
    searchApiAnime = extractList(data);

    setAPIStatus("API ONLINE", "online");
    renderAnimeGrid(true);
  } catch (err) {
    console.error(err);
    setAPIStatus("API OFFLINE", "offline");
    animeGrid.innerHTML = `<div class="empty-state">Search API failed.</div>`;
  }
}

async function searchAnimeAPI() {
  const query = autoSearch.value.trim();
  if (!query) return;

  setAPIStatus("SEARCHING...", "checking");
  autoResults.innerHTML = `<div class="empty-state">Searching anime...</div>`;

  try {
    const res = await fetch(`${API}/api/search?keyword=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error("Search failed");

    const data = await res.json();
    const list = extractList(data);

    autoResults.innerHTML = list.length
      ? list.map(item => autoResultHTML(normalizeAnimeCard(item, "api"))).join("")
      : `<div class="empty-state">No anime found.</div>`;

    searchApiAnime = list;
    renderAnimeGrid(true);

    setAPIStatus("API ONLINE", "online");
  } catch (err) {
    console.error(err);
    autoResults.innerHTML = `<div class="empty-state">API search failed.</div>`;
    setAPIStatus("API OFFLINE", "offline");
  }
}

function renderAnimeGrid(searchMode = false) {
  if (!animeGrid) return;

  const search = librarySearch ? librarySearch.value.toLowerCase() : "";
  const filter = filterType ? filterType.value : "all";

  const localItems = adminAnime.map(item => ({ ...item, source: "local" }));

  const baseApiList = searchMode || searchApiAnime.length
    ? searchApiAnime
    : apiAnimeLibrary;

  const apiItems = baseApiList
    .filter(item => !hiddenApiAnime.includes(getAnimeKey(item)))
    .map(item => normalizeAnimeCard(item, "api"));

  let allItems = [...localItems, ...apiItems];

  if (!searchApiAnime.length && search) {
    allItems = allItems.filter(anime => anime.title.toLowerCase().includes(search));
  }

  if (filter !== "all") {
    allItems = allItems.filter(anime => {
      if (filter === "featured") return anime.featured;
      if (filter === "trending") return anime.trending;
      if (filter === "popular") return anime.popular;
      if (filter === "movie") return anime.movie;
      return true;
    });
  }

  if (!allItems.length) {
    animeGrid.innerHTML = `<div class="empty-state">No anime found.</div>`;
    return;
  }

  animeGrid.innerHTML = allItems.map(anime => `
    <div class="admin-anime-card">
      <img src="${anime.image || anime.banner || ""}" alt="${escapeHTML(anime.title)}">

      <div class="card-info">
        <span>${anime.source === "api" ? "API ANIME" : escapeHTML(anime.type)}</span>
        <h4>${escapeHTML(anime.title)}</h4>
        <p>${escapeHTML(anime.description || "No description available.")}</p>

        <div class="card-flags">
          ${anime.source === "api" ? `<div class="flag">API</div>` : ""}
          ${anime.featured ? `<div class="flag">FEATURED</div>` : ""}
          ${anime.trending ? `<div class="flag">TRENDING</div>` : ""}
          ${anime.popular ? `<div class="flag">POPULAR</div>` : ""}
          ${anime.movie ? `<div class="flag">MOVIE</div>` : ""}
        </div>

        <div class="card-actions">
          <button onclick="previewAnyAnime('${anime.localId}', '${anime.source}')">Preview</button>
          <button onclick="editAnyAnime('${anime.localId}', '${anime.source}')">Edit</button>
          <button class="delete" onclick="deleteAnyAnime('${anime.localId}', '${anime.source}')">Delete</button>
        </div>
      </div>
    </div>
  `).join("");
}

function extractList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.results)) return data.results;
  if (Array.isArray(data.data)) return data.data;
  if (Array.isArray(data.anime)) return data.anime;
  if (Array.isArray(data.items)) return data.items;
  if (Array.isArray(data.episodes)) return data.episodes;
  return [];
}

function autoResultHTML(anime) {
  return `
    <div class="auto-result">
      <img src="${anime.image || anime.banner || ""}" alt="${escapeHTML(anime.title)}">
      <div>
        <strong>${escapeHTML(anime.title)}</strong>
        <span>${escapeHTML(anime.type)} • ${escapeHTML(anime.year || "?")}</span>
      </div>
      <button onclick="autoFillAnimeById('${anime.localId}')">Fill</button>
    </div>
  `;
}

window.autoFillAnimeById = function (id) {
  const item = [...apiAnimeLibrary, ...searchApiAnime].find(x => getAnimeKey(x) === id);
  if (!item) return;
  fillForm(normalizeAnimeCard(item, "api"));
};

function normalizeAnimeCard(item, source) {
  const key = getAnimeKey(item);

  return {
    localId: key,
    animeId: item.id || item.animeId || item.slug || key,
    title: item.title || item.name || item.animeTitle || "Unknown Anime",
    image: item.image || item.poster || item.cover || "",
    banner: item.banner || item.cover || item.image || item.poster || "",
    type: item.type || item.category || "Anime",
    episodes: item.episodes || item.episode || item.latestEpisode || item.sub || item.dub || "",
    year: item.year || item.releaseDate || "",
    rating: item.rating || item.score || "",
    genre: Array.isArray(item.genre) ? item.genre.join(", ") : (item.genre || item.category || ""),
    studio: item.studio || "",
    watch: `anime-details.html?id=${item.id || item.animeId || item.slug || key}`,
    description: item.description || item.synopsis || "No description available.",
    featured: item.featured || false,
    trending: item.trending || false,
    popular: item.popular || false,
    movie: isMovie(item),
    source
  };
}

function getAnimeKey(item) {
  return String(
    item.localId ||
    item.id ||
    item.animeId ||
    item.slug ||
    item.title ||
    item.name ||
    Date.now()
  );
}

window.editAnyAnime = function (id, source) {
  const anime = findAnimeById(id, source);
  if (!anime) return;

  fillForm(anime);
  window.scrollTo({ top: 0, behavior: "smooth" });
};

window.deleteAnyAnime = function (id, source) {
  if (!confirm("Delete/hide this anime from admin library?")) return;

  if (source === "api") {
    hiddenApiAnime.push(String(id));
    localStorage.setItem("hiddenApiAnime", JSON.stringify(hiddenApiAnime));
  } else {
    adminAnime = adminAnime.filter(anime => anime.localId !== id);
    localStorage.setItem("shadowAdminAnime", JSON.stringify(adminAnime));
  }

  renderAnimeGrid();
  updateCounts();
};

window.previewAnyAnime = function (id, source) {
  const anime = findAnimeById(id, source);
  if (!anime) return;

  $("modalImage").src = anime.banner || anime.image || "";
  $("modalTitle").textContent = anime.title;
  $("modalDesc").textContent = anime.description || "No description available.";

  $("modalMeta").innerHTML = `
    <span>${anime.type || "Anime"}</span>
    <span>${anime.episodes || "?"} EP</span>
    <span>★ ${anime.rating || "?"}</span>
    <span>${anime.year || "Unknown Year"}</span>
  `;

  previewModal.classList.add("show");
};

function findAnimeById(id, source) {
  if (source === "local") {
    return adminAnime.find(item => item.localId === id);
  }

  const raw = [...apiAnimeLibrary, ...searchApiAnime].find(item => getAnimeKey(item) === id);
  return raw ? normalizeAnimeCard(raw, "api") : null;
}

function saveAnime() {
  const anime = collectFormData();
  if (!anime.title.trim()) return alert("Anime title required.");

  const exists = adminAnime.some(item => item.localId === anime.localId);

  if (exists) {
    adminAnime = adminAnime.map(item => item.localId === anime.localId ? anime : item);
  } else {
    adminAnime.unshift(anime);
  }

  localStorage.setItem("shadowAdminAnime", JSON.stringify(adminAnime));

  renderAnimeGrid();
  updateCounts();
  clearForm();

  alert("Anime saved successfully.");
}

function collectFormData() {
  return {
    localId: $("editId").value || `local_${Date.now()}`,
    animeId: $("animeId").value.trim(),
    title: $("animeTitle").value.trim(),
    image: $("animeImage").value.trim(),
    banner: $("animeBanner").value.trim(),
    type: $("animeType").value,
    episodes: $("animeEpisodes").value.trim(),
    year: $("animeYear").value.trim(),
    rating: $("animeRating").value.trim(),
    genre: $("animeGenre").value.trim(),
    studio: $("animeStudio").value.trim(),
    watch: $("animeWatch").value.trim(),
    description: $("animeDescription").value.trim(),
    featured: $("featuredFlag").checked,
    trending: $("trendingFlag").checked,
    popular: $("popularFlag").checked,
    movie: $("movieFlag").checked,
    source: "local"
  };
}

function fillForm(anime) {
  $("editId").value = anime.localId;
  $("animeTitle").value = anime.title || "";
  $("animeId").value = anime.animeId || "";
  $("animeImage").value = anime.image || "";
  $("animeBanner").value = anime.banner || "";
  $("animeType").value = anime.type || "Anime";
  $("animeEpisodes").value = anime.episodes || "";
  $("animeYear").value = anime.year || "";
  $("animeRating").value = anime.rating || "";
  $("animeGenre").value = anime.genre || "";
  $("animeStudio").value = anime.studio || "";
  $("animeWatch").value = anime.watch || "";
  $("animeDescription").value = anime.description || "";

  $("featuredFlag").checked = !!anime.featured;
  $("trendingFlag").checked = !!anime.trending;
  $("popularFlag").checked = !!anime.popular;
  $("movieFlag").checked = !!anime.movie;

  updatePreview();
}

function clearForm() {
  document.querySelectorAll("input, textarea").forEach(el => {
    if (el.type !== "checkbox" && el.type !== "hidden") el.value = "";
  });

  document.querySelectorAll("input[type='checkbox']").forEach(el => {
    el.checked = false;
  });

  $("animeType").value = "Anime";
  $("editId").value = "";
  updatePreview();
}

function setupPreview() {
  [
    "animeTitle", "animeImage", "animeDescription",
    "animeType", "animeEpisodes", "animeRating", "animeYear"
  ].forEach(id => {
    const el = $(id);
    if (el) el.addEventListener("input", updatePreview);
  });

  updatePreview();
}

function updatePreview() {
  $("previewTitle").textContent = $("animeTitle").value || "Anime Title";
  $("previewDesc").textContent = $("animeDescription").value || "Description preview will appear here.";
  $("previewType").textContent = $("animeType").value || "Anime";
  $("previewEpisodes").textContent = `EP ${$("animeEpisodes").value || "?"}`;
  $("previewRating").textContent = `★ ${$("animeRating").value || "?"}`;
  $("previewYear").textContent = $("animeYear").value || "Year";

  const image = $("animeImage").value;

  if (image) {
    $("previewImage").src = image;
    $("previewImage").style.display = "block";
    $("previewFallback").style.display = "none";
  } else {
    $("previewImage").style.display = "none";
    $("previewFallback").style.display = "grid";
  }
}

function exportJSON() {
  const data = JSON.stringify(adminAnime, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "shadow-anime-library.json";
  a.click();

  URL.revokeObjectURL(url);
}

function fillDemoData() {
  fillForm({
    localId: `local_${Date.now()}`,
    animeId: "solo-leveling",
    title: "Solo Leveling",
    image: "https://staticg.sportskeeda.com/editor/2024/01/3b62d-17055153150114-1920.jpg",
    banner: "https://wallpapercave.com/wp/wp12629797.jpg",
    type: "Anime",
    episodes: "12",
    year: "2024",
    rating: "9.3",
    genre: "Action, Fantasy",
    studio: "A-1 Pictures",
    watch: "anime-details.html?id=solo-leveling",
    description: "Humanity fights terrifying monsters through awakened hunters while Sung Jinwoo rises from the weakest to the strongest.",
    featured: true,
    trending: true,
    popular: true,
    movie: false
  });
}

function copyCurrentJSON() {
  const anime = collectFormData();
  navigator.clipboard.writeText(JSON.stringify(anime, null, 2));
  alert("Anime JSON copied.");
}

function updateCounts() {
  if (localCount) localCount.textContent = adminAnime.length;
  if (apiCount) apiCount.textContent = apiAnimeLibrary.length + searchApiAnime.length;
}

function setAPIStatus(text, state) {
  if (!apiStatus) return;

  apiStatus.textContent = text;
  apiStatus.classList.remove("online", "offline", "checking");

  if (state) apiStatus.classList.add(state);
}

function isMovie(item) {
  const text = `
    ${item.title || ""}
    ${item.name || ""}
    ${item.type || ""}
    ${item.category || ""}
    ${item.genre || ""}
  `.toLowerCase();

  return text.includes("movie") || text.includes("film");
}

function escapeHTML(text) {
  return String(text || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}